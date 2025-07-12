const express = require('express');
const router = express.Router();
const Admin = require('../models/Admin');
const argon2 = require('argon2');
const limiter = require('../utils/limiter');

router.post('/register', limiter,async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });
        if (admin) {
            return res.status(409).json({ error: 'Admin already exists' });
        }
        const hash = await argon2.hash(password);
        const newAdmin = await Admin.create({ email, hash });
        res.status(201).json({ message: 'Admin created successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const valid = await argon2.verify(admin.hash, password);
        if (!valid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const accessToken = generateAccessToken(admin._id);
        const refreshToken = generateRefreshToken();
        res.status(200).json({ accessToken });
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: error.message })
    }
})

module.exports = router;
