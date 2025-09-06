const express = require('express');
const { requireVerifiedAuth } = require('../utils/requireVerifiedAuth');
const limiter = require('../utils/limiter');
const Users = require('../models/User');
const Fillin = require('../models/fillin');
const router = express.Router();

router.get('/', requireVerifiedAuth, async (req, res) => {
    try {
        const limit = 20;
        const userId = req.user
        const sentences = await Fillin.find({ isApproved: true }).limit(limit)
        return res.json(sentences)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

module.exports = router;