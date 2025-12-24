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

const router = express.Router();

const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);


router.post('/refresh-token', refreshToken)

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
            appleId: user.appleId,
            googleId: user.googleId,
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

        console.log(req.query);

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
        const { identityToken, deviceId } = req.body;

        console.log('Apple login request:', req.body);

        if (!identityToken) {
            return res.status(400).json({ message: 'Identity token is required' });
        }

        // Decode JWT without verification for now (you should verify in production)
        const jwt = require('jsonwebtoken');
        const decoded = jwt.decode(identityToken);

        if (!decoded || !decoded.email) {
            return res.status(400).json({ message: 'Invalid identity token' });
        }

        const { email, email_verified, sub: appleId } = decoded;
        let name = 'Apple User'; // Default name as Apple might not provide it

        // 1. FIRST: Check if user with this email/appleId already exists (highest priority)
        let user = await Users.findOne({
            $or: [
                { email: email.toLowerCase() },
                { appleId: appleId }
            ]
        });

        if (user) {
            // Existing user found - use it (ignore any guest data)
            if (!user.appleId) {
                user.appleId = appleId;
                await user.save();
            }
            console.log('Using existing user account');
        } else if (deviceId) {
            // 2. SECOND: No email user found, check for guest to upgrade
            const guestUser = await Users.findOne({ deviceId, isGuest: true });
            if (guestUser) {
                // Upgrade guest to Apple account
                guestUser.email = email.toLowerCase();
                guestUser.name = name;
                guestUser.appleId = appleId;
                guestUser.isGuest = false;
                guestUser.authProvider = 'apple';
                guestUser.emailVerified = email_verified || true;
                await guestUser.save();
                user = guestUser;
                console.log('Upgraded guest account to Apple account');
            }
        }

        // 3. THIRD: Create new user if neither found
        if (!user) {
            user = await Users.create({
                email: email.toLowerCase(),
                name,
                appleId: appleId,
                emailVerified: email_verified || true,
                authProvider: 'apple'
            });
            console.log('Created new Apple user account');
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