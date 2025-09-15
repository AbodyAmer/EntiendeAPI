// routes/auth.js
const express = require('express');
const argon2 = require('argon2');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const uuid = require('uuid').v4;
const ms = require('ms');
const { OAuth2Client } = require('google-auth-library');
const trustedDomains = require('../utils/trustedDomains')
const requireAuth = require('../utils/requireAuth')
const { refreshToken } = require('../utils/requireVerifiedAuth')
const Users = require('../models/User');
const Refresh = require('../models/Refresh');
const limiter = require('../utils/limiter');
const {
    generateAccessToken,
    generateRefreshToken,
    parseRefreshToken,
    setRefreshCookie,
    setTokenCookie
} = require('../utils/tokens');
const {
    sendVerificationEmail,
    sendPasswordResetEmail,
    sendWelcomeEmail
} = require('../utils/resend');
const VerificationCodes = require('../models/verificationcodes');

const router = express.Router();

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);


router.post('/refresh-token', refreshToken)

router.post('/verify-email', requireAuth, async (req, res) => {
    try {
        const { code } = req.body;

        console.log(`Verifying email for user ${req.user} with code ${code}`);
        const verificationCodeDoc = await VerificationCodes.findOne({ code, userId: req.user });
        if (!verificationCodeDoc) {
            return res.status(404).json({ message: 'Invalid verification code' });
        }

        await Users.findByIdAndUpdate(req.user, { emailVerified: true });
        await VerificationCodes.deleteOne({ code, userId: req.user });

        res.json({ message: 'Email verified successfully', success: true });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
})
router.post('/resend-verification', requireAuth, async (req, res) => {
    try {
        const user = await Users.findById(req.user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let verificationCode = null;
        // check if user has a verification code
        const verificationCodeDoc = await VerificationCodes.findOne({ userId: user._id });

        const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
        if (verificationCodeDoc && verificationCodeDoc.createdAt > tenMinutesAgo) {
            // Code is too recent, delete old one and create new
            verificationCode = verificationCodeDoc.code;
        } else {
            // No existing code, create new one
            verificationCode = Math.floor(100000 + Math.random() * 900000);
            await VerificationCodes.create({
                userId: user._id,
                code: verificationCode,
            });
        }

        await sendVerificationEmail(user.email, verificationCode);
        res.json({ message: 'Verification email sent successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message })
    }
})

router.post(
    '/register',
    limiter, // e.g. 20 requests / 15 min
    [
        body('email').isEmail().custom(email => {
            const domain = email.split('@')[1].toLowerCase();
            if (!trustedDomains.includes(domain)) {
                throw new Error("Please use your personal email");
            }
            return true;
        }),
        body('password').isStrongPassword({
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        }),
        body('name').trim().isLength({ min: 1, max: 50 })
    ],
    async (req, res) => {
        try {
            // 1. Validate inputs
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                if (errors.array()[0]?.path === 'password') {
                    return res.status(400).json({ message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one symbol' });
                }
                return res.status(400).json({ message: errors.array()[0]?.msg, path: errors.array()[0]?.path });
            }

            const { email, password, name } = req.body;

            // 2. Prevent duplicate signup
            if (await Users.findOne({ email })) {
                return res.status(409).json({ message: 'Email already registered' });
            }

            // 3. Hash password
            const hash = await argon2.hash(password, {
                type: argon2.argon2id,
                memoryCost: 2 ** 16, // 64 MB
                timeCost: 3,
                parallelism: 1
            });

            // 4. Create user record
            const user = await Users.create({
                email: email.toLowerCase(),
                name,
                hash,
                emailVerified: false
            });

            // 5. Generate verification token
            const verificationCode = Math.floor(100000 + Math.random() * 900000);

            // 6. Store verification token
            await VerificationCodes.create({
                userId: user._id,
                code: verificationCode,
            });

            // 7. Send verification email
            try {
                await sendVerificationEmail(email, verificationCode, name);
            } catch (emailError) {
                console.error('Failed to send verification email:', emailError);
                // Don't fail registration if email fails, but log it
            }

            // 8. Generate tokens
            const jti = uuid()
            const accessToken = generateAccessToken(user._id, jti);
            const refreshToken = generateRefreshToken();
            const { tokenId, tokenSecret } = parseRefreshToken(refreshToken);

            // 6. Store hashed refresh token with tokenId for efficient lookup
            await Refresh.insertOne({
                userId: user._id,
                tokenId, // Store unhashed for efficient lookup
                tokenHash: await argon2.hash(tokenSecret), // Only hash the secret part
                jti,
                expires: new Date(Date.now() + ms(process.env.REFRESH_TTL)),
                createdByIp: req.ip
            });

            // 7. Send refresh token in HttpOnly Secure cookie
            setRefreshCookie(res, refreshToken);
            setTokenCookie(res, accessToken)

            // 8. Respond with access token (in-memory on client)
            res.status(201).json({ accessToken });
        } catch (error) {
            console.log(error)
            res.status(500).json({ message: error.message })
        }
    }
);

router.post(
    '/passwordlogin',
    limiter, // e.g. 20 requests per 15 minutes
    [
        body('email')
            .isEmail().withMessage('Must be a valid email'),
        body('password')
            .notEmpty().withMessage('Password is required')
    ],
    async function (req, res) {
        try {
            // 1. Validate input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            // 2. Look up user
            const user = await Users.findOne({ email: email.toLowerCase() });
            if (!user) {
                return res.status(401).json({ error: 'Email not found' });
            }


            // 4. Verify password
            const valid = await argon2.verify(user.hash, password);
            if (!valid) {
                return res.status(401).json({ error: 'Invalid password' });
            }

            // 5. Generate tokens
            const jti = uuid()
            const accessToken = generateAccessToken(user._id, jti);
            const refreshToken = generateRefreshToken();
            const { tokenId, tokenSecret } = parseRefreshToken(refreshToken);

            // 6. Persist hashed refresh token with tokenId for efficient lookup
            await Refresh.insertOne({
                userId: user._id,
                tokenId, // Store unhashed for efficient lookup
                tokenHash: await argon2.hash(tokenSecret), // Only hash the secret part
                jti,
                expires: new Date(Date.now() + ms(process.env.REFRESH_TTL)),
                createdAt: new Date(),
                createdByIp: req.ip,
                deviceInfo: {
                    clientType: req.clientType,
                    isNativeApp: req.clientInfo.isNativeApp,
                    deviceType: req.clientInfo.deviceType,
                    deviceModel: req.clientInfo.deviceModel,
                    deviceVendor: req.clientInfo.deviceVendor,
                    osName: req.clientInfo.osName,
                    osVersion: req.clientInfo.osVersion,
                    userAgent: req.clientInfo.userAgent
                }
            });

            // 7. Send refresh token in HttpOnly Secure cookie
            setRefreshCookie(res, refreshToken);
            setTokenCookie(res, accessToken)

            // 8. Return access token (client holds in memory)
            return res.json({
                accessToken,
                refreshToken,
                user: {
                    id: user._id,
                    email: user.email,
                    name: user.name,
                    emailVerified: user.emailVerified,
                    createdAt: user.createdAt,
                    level: user.level,
                    defaultDialect: user.defaultDialect,
                }
            });

        } catch (err) {
            console.error('Error in /auth/login:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
);

router.post('/device-login', limiter, async (req, res) => {
    try {
        const { deviceId } = req.body;
        if (!deviceId) {
            return res.status(400).json({ error: 'Device ID is required' });
        }
        
        let user = await Users.findOne({ deviceId, isGuest: true });
        if (!user) {
            user = await Users.create({
                deviceId,
                isGuest: true,
                name: 'Guest'
            });
        }

        const jti = uuid();
        const accessToken = generateAccessToken(user._id, jti);
        const refreshToken = generateRefreshToken();
        const { tokenId, tokenSecret } = parseRefreshToken(refreshToken);

        await Refresh.insertOne({
            userId: user._id,
            tokenId,
            tokenHash: await argon2.hash(tokenSecret),
            jti,
            expires: new Date(Date.now() + ms(process.env.REFRESH_TTL)),
            createdByIp: req.ip,
            authProvider: 'device',
            deviceInfo: {
                clientType: req.clientType,
                isNativeApp: req.clientInfo.isNativeApp,
                deviceType: req.clientInfo.deviceType,
                deviceModel: req.clientInfo.deviceModel,
                deviceVendor: req.clientInfo.deviceVendor,
                osName: req.clientInfo.osName,
                osVersion: req.clientInfo.osVersion,
                userAgent: req.clientInfo.userAgent
            }
        });

        return res.status(200).json({
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt,
                level: user.level,
                defaultDialect: user.defaultDialect,
                isGuest: user.isGuest
            }
        });
    } catch (err) {
        console.error('Error in /auth/device-login:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
})

router.get('/me', requireAuth, async function (req, res) {
    try {
        // req.user was set by requireAuth (the user ID)
        const userId = req.user;

        // Fetch user, excluding sensitive fields
        const user = await Users.findById(userId)
            .select('-hash')                // remove password hash
            .lean();

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Return profile info
        return res.json({
            success: true,
            user: {
            id: user._id,
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
            level: user.level,
            defaultDialect: user.defaultDialect,
        }
        });

    } catch (err) {
        console.error('Error in GET /user/me:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/logout', requireAuth, limiter, async (req, res) => {
    try {
        // Get the JTI from the current access token to revoke the session
        let token;
        if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (token) {
            try {
                const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
                    audience: 'api.efham.com',
                    issuer: 'https://api.efham.com'
                });

                // Revoke the current refresh token session
                if (payload.jti) {
                    await Refresh.findOneAndUpdate(
                        { jti: payload.jti },
                        {
                            revoked: {
                                time: new Date(),
                                reason: 'logout'
                            }
                        }
                    );
                }
            } catch (tokenError) {
                // Token might be expired, but we still want to clear cookies
                console.log('Token verification failed during logout:', tokenError.message);
            }
        }

        // Clear the cookies
        res.clearCookie('rt', {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === 'true',
            sameSite: 'Strict',
            domain: process.env.COOKIE_DOMAIN || '.efham.com',
            path: '/'
        });

        res.clearCookie('token', {
            secure: process.env.COOKIE_SECURE === 'true',
            sameSite: 'Strict',
            domain: process.env.COOKIE_DOMAIN || '.efham.com',
            path: '/'
        });

        return res.status(200).json({ message: 'Logged out successfully' });
    } catch (err) {
        console.error('Error in POST /auth/logout:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/level', limiter, requireAuth, async (req, res) => {
    try {
        const { level } = req.body
        const user = await Users.findByIdAndUpdate(req.user, {
            level
        }, {
            new: true,
            runValidators: true
        }).select('-hash').lean();
        return res.json({ level })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
})

// Email verification route
router.get('/verify-email/:token', async (req, res) => {
    try {
        const { token } = req.params;

        // Find user with this verification token
        const user = await Users.findOne({
            verificationToken: token,
            verificationExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({
                message: 'Invalid or expired verification token'
            });
        }

        // Mark email as verified and clear tokens
        await Users.findByIdAndUpdate(user._id, {
            emailVerified: true,
            verificationToken: null,
            verificationExpires: null
        });

        // Send welcome email
        try {
            await sendWelcomeEmail(user.email, user.name);
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
        }

        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Email verification error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Resend verification email
router.post('/resend-verification', limiter, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await Users.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ message: 'Email is already verified' });
        }

        // Generate new verification token
        const verificationToken = uuid();
        const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await Users.findByIdAndUpdate(user._id, {
            verificationToken,
            verificationExpires
        });

        // Send verification email
        await sendVerificationEmail(user.email, verificationToken, user.name);

        res.json({ message: 'Verification email sent successfully' });
    } catch (error) {
        console.error('Resend verification error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Request password reset
router.post('/forgot-password', limiter, async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await Users.findOne({ email: email.toLowerCase() });

        if (!user) {
            // Don't reveal if user exists or not
            return res.json({ message: 'If an account with that email exists, a password reset link has been sent' });
        }

        // Generate reset token
        const resetToken = uuid();
        const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

        await Users.findByIdAndUpdate(user._id, {
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetExpires
        });

        // Send password reset email
        try {
            await sendPasswordResetEmail(user.email, resetToken, user.name);
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
            return res.status(500).json({ message: 'Failed to send password reset email' });
        }

        res.json({ message: 'If an account with that email exists, a password reset link has been sent' });
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Reset password
router.post('/reset-password', limiter, async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ message: 'Token and password are required' });
        }

        // Validate password strength
        const passwordValidation = body('password').isStrongPassword({
            minLength: 6,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1
        });

        const passwordError = passwordValidation.run({ password });
        if (passwordError.errors.length > 0) {
            return res.status(400).json({
                message: 'Password must contain at least one lowercase letter, one uppercase letter, one number, and one symbol'
            });
        }

        // Find user with valid reset token
        const user = await Users.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Hash new password
        const hash = await argon2.hash(password, {
            type: argon2.argon2id,
            memoryCost: 2 ** 16,
            timeCost: 3,
            parallelism: 1
        });

        // Update password and clear reset tokens
        await Users.findByIdAndUpdate(user._id, {
            hash,
            resetPasswordToken: null,
            resetPasswordExpires: null
        });

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

router.get('/google', (req, res) => {
    const authorizeUrl = googleClient.generateAuthUrl({
        access_type: 'offline',
        scope: ['profile', 'email'],
        prompt: 'consent'
    });
    res.json({ url: authorizeUrl });
});

router.get('/google/callback', limiter, async (req, res) => {
    try {
        const { code } = req.query;

        if (!code) {
            return res.status(400).json({ message: 'Authorization code is required' });
        }

        const { tokens } = await googleClient.getToken(code);
        googleClient.setCredentials(tokens);

        const ticket = await googleClient.verifyIdToken({
            idToken: tokens.id_token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        const { email, name, sub: googleId, email_verified } = payload;

        let user = await Users.findOne({ email: email.toLowerCase() });

        if (!user) {
            user = await Users.create({
                email: email.toLowerCase(),
                name,
                googleId,
                emailVerified: true,
                authProvider: 'google'
            });

        } else {
            if (!user.googleId) {
                await Users.findByIdAndUpdate(user._id, {
                    googleId
                });
            }
        }

        const jti = uuid();
        const accessToken = generateAccessToken(user._id, jti);
        const refreshToken = generateRefreshToken();
        const { tokenId, tokenSecret } = parseRefreshToken(refreshToken);

        await Refresh.insertOne({
            userId: user._id,
            tokenId,
            tokenHash: await argon2.hash(tokenSecret),
            jti,
            expires: new Date(Date.now() + ms(process.env.REFRESH_TTL)),
            createdByIp: req.ip,
            authProvider: 'google',
            deviceInfo: {
                clientType: req.clientType,
                isNativeApp: req.clientInfo.isNativeApp,
                deviceType: req.clientInfo.deviceType,
                deviceModel: req.clientInfo.deviceModel,
                deviceVendor: req.clientInfo.deviceVendor,
                osName: req.clientInfo.osName,
                osVersion: req.clientInfo.osVersion,
                userAgent: req.clientInfo.userAgent
            }
        });

        setRefreshCookie(res, refreshToken);
        setTokenCookie(res, accessToken);

        // Redirect to mobile app with tokens
        const userData = {
            id: user._id,
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
            level: user.level,
            defaultDialect: user.defaultDialect,
        };

        const redirectUrl = `efhammobile://auth?accessToken=${accessToken}&refreshToken=${refreshToken}&user=${encodeURIComponent(JSON.stringify(userData))}`;
        res.redirect(redirectUrl);
    } catch (error) {
        console.error('Google auth error:', error);
        res.status(500).json({ message: 'Authentication failed' });
    }
});

// Apple Sign-In endpoint
router.post('/apple', limiter, async (req, res) => {
    try {
        const { identityToken, user } = req.body;

        console.log(req.body);

        if (!identityToken) {
            return res.status(400).json({ message: 'Identity token is required' });
        }

        // Decode JWT without verification for now (you should verify in production)
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(identityToken);

        if (!decoded || !decoded.email) {
            return res.status(400).json({ message: 'Invalid identity token' });
        }

        const { email, email_verified } = decoded;
        let name = 'Apple User'; // Default name as Apple might not provide it

        // If user data is provided on first sign-in
        if (user && user.name) {
            name = `${user.name.firstName || ''} ${user.name.lastName || ''}`.trim();
        }

        let existingUser = await Users.findOne({
            $or: [
                { email: email.toLowerCase() },
                { appleId: decoded.sub }
            ]
        });

        if (!existingUser) {
            existingUser = await Users.create({
                email: email.toLowerCase(),
                name,
                appleId: decoded.sub,
                emailVerified: email_verified || true,
                authProvider: 'apple'
            });
        } else {
            if (!existingUser.appleId) {
                await Users.findByIdAndUpdate(existingUser._id, {
                    appleId: decoded.sub
                });
            }
        }

        const jti = uuid();
        const accessToken = generateAccessToken(existingUser._id, jti);
        const refreshToken = generateRefreshToken();
        const { tokenId, tokenSecret } = parseRefreshToken(refreshToken);

        await Refresh.insertOne({
            userId: existingUser._id,
            tokenId,
            tokenHash: await argon2.hash(tokenSecret),
            jti,
            expires: new Date(Date.now() + ms(process.env.REFRESH_TTL)),
            createdByIp: req.ip,
            authProvider: 'apple',
            deviceInfo: {
                clientType: req.clientType,
                isNativeApp: req.clientInfo.isNativeApp,
                deviceType: req.clientInfo.deviceType,
                deviceModel: req.clientInfo.deviceModel,
                deviceVendor: req.clientInfo.deviceVendor,
                osName: req.clientInfo.osName,
                osVersion: req.clientInfo.osVersion,
                userAgent: req.clientInfo.userAgent
            }
        });

        setRefreshCookie(res, refreshToken);
        setTokenCookie(res, accessToken);

        res.status(200).json({
            accessToken,
            refreshToken,
            user: {
                id: existingUser._id,
                email: existingUser.email,
                name: existingUser.name,
                emailVerified: existingUser.emailVerified,
                createdAt: existingUser.createdAt,
                level: existingUser.level,
                defaultDialect: existingUser.defaultDialect,
            }
        });
    } catch (error) {
        console.error('Apple auth error:', error);
        res.status(500).json({ message: 'Authentication failed' });
    }
});

// Delete account endpoint
router.delete('/delete-account', requireAuth, async (req, res) => {
    try {
        const userId = req.user; // Set by requireAuth middleware

        // Remove all refresh tokens for this user
        await Refresh.deleteMany({ userId: userId });

        // Remove the user document
        const deletedUser = await Users.findByIdAndDelete(userId);

        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Clear any cookies
        res.clearCookie('refreshToken');
        res.clearCookie('accessToken');

        return res.json({
            success: true,
            message: 'Account deleted successfully'
        });

    } catch (err) {
        console.error('Error in /auth/delete-account:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;