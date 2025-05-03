// routes/auth.js
const express = require('express');
const argon2 = require('argon2');
const { body, validationResult } = require('express-validator');
const jwt     = require('jsonwebtoken');
const uuid = require('uuid').v4;
const ms = require('ms');
const trustedDomains = require('../utils/trustedDomains')
const requireAuth = require('../utils/requireAuth')
const Users = require('../models/User');
const Refresh = require('../models/Refresh');
const limiter = require('../utils/limiter');
const {
    generateAccessToken,
    generateRefreshToken,
    setRefreshCookie
} = require('../utils/tokens');

const router = express.Router();

router.post(
    '/register',
    limiter, // e.g. 20 requests / 15 min
    [
        body('email').isEmail().normalizeEmail().custom(email => {
            const domain = email.split('@')[1].toLowerCase();
            if (!trustedDomains.includes(domain)) {
                throw new Error("Please use your personal email");
            }
            return true;
        }),
        body('password').isStrongPassword({
            minLength: 10,
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

                return res.status(400).json({ message: errors.array()[0]?.msg });
            }

            const { email, password, name } = req.body;

            // 2. Prevent duplicate signup
            if (await Users.findOne({ email })) {
                return res.status(409).json({ error: 'Email already registered' });
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
                email,
                name,
                hash,
                emailVerified: false
            });

            // 5. Generate tokens
            const accessToken = generateAccessToken(user._id);
            const refreshToken = generateRefreshToken();

            // 6. Store hashed refresh token
            await Refresh.insertOne({
                userId: user._id,
                tokenHash: await argon2.hash(refreshToken),
                jti: uuid(),
                expires: new Date(Date.now() + ms(process.env.REFRESH_TTL)),
                createdByIp: req.ip
            });

            // 7. Send refresh token in HttpOnly Secure cookie
            setRefreshCookie(res, refreshToken);

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
            .isEmail().withMessage('Must be a valid email')
            .normalizeEmail(),
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
            const user = await Users.findOne({ email });
            if (!user) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // 3. (Optional) enforce email verification
            // if (!user.emailVerified) {
            //   return res.status(403).json({ error: 'Please verify your email first' });
            // }

            // 4. Verify password
            const valid = await argon2.verify(user.hash, password);
            if (!valid) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // 5. Generate tokens
            const jti = uuid()
            const accessToken = generateAccessToken(user._id, jti);
            const refreshToken = generateRefreshToken();

            // 6. Persist hashed refresh token
            await Refresh.insertOne({
                userId: user._id,
                tokenHash: await argon2.hash(refreshToken),
                jti,
                expires: new Date(Date.now() + ms(process.env.REFRESH_TTL)),
                createdAt: new Date(),
                createdByIp: req.ip
            });

            // 7. Send refresh token in HttpOnly Secure cookie
            setRefreshCookie(res, refreshToken);

            // 8. Return access token (client holds in memory)
            return res.json({ accessToken });

        } catch (err) {
            console.error('Error in /auth/login:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
);

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
            id: user._id,
            email: user.email,
            name: user.name,
            emailVerified: user.emailVerified,
            createdAt: user.createdAt,
            level: user.level,
            defaultDialect: user.defaultDialect,
            dialectPreferences: user.dialectPreferences,
            subscriptionTier: user.subscriptionTier,
            subscriptionExpires: user.subscriptionExpires,
            settings: user.settings,
            lastLogin: user.lastLogin,
            stats: user.stats
        });

    } catch (err) {
        console.error('Error in GET /user/me:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/logout', limiter, async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'Authorization header missing or malformed' });
        }
    
        const token = authHeader.split(' ')[1];
        const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET, {
          audience: 'api.efham.com',
          issuer: 'https://api.efham.com'
        });
    
        // Ensure the session behind this token is still active
        // (requires that generateAccessToken embedded the refresh-session JTI as payload.sid)
        const session = await Refresh.updateOne({
          jti:           payload.jti,
          'revoked.time': { $exists: false },
          expires:       { $gt: new Date() }
        }, {
            revoked: {
                time: new Date(),
                reason: 'logout'
            }
        });
        // if (token) {
        //     // Find all non-revoked sessions for this user
        //     const sessions = await Refresh.find({
        //         userId: req.user,
        //         'revoked.time': { $exists: false }
        //     });
        //     // Locate the session matching our cookie and revoke it
        //     for (const session of sessions) {
        //         if (await argon2.verify(session.tokenHash, token)) {
        //             console.log('revoke')
        //             session.revoked = {
        //                 time: new Date(),
        //                 reason: 'logout'
        //             };
        //             await session.save();
        //             break;
        //         }
        //     }
        // }

        // Clear the cookie on the client
        res.clearCookie('rt', {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === 'true',
            sameSite: 'Strict',
            domain: process.env.COOKIE_DOMAIN || '.efham.com',
            path: '/auth/refresh-token'
        });

        return res.sendStatus(204);
    } catch (err) {
        console.error('Error in POST /auth/logout:', err);
        return res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;