const express = require('express');
const requireAuth = require('../utils/requireAuth')
const requireVerifiedAuth = require('../utils/requireVerifiedAuth')
const limiter = require('../utils/limiter');
const DialectVote = require('../models/dialectVote');
const ContentNotify = require('../models/contentnotify');
const router = express.Router();

router.post('/voteDialect', [limiter, requireVerifiedAuth], async (req, res) => {
    try {
        const userId = req.user
        const { dialect } = req.body
        const vote = new DialectVote({ userId, dialect })
        await vote.save()
        res.status(200).json({ message: 'Vote submitted successfully' })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

router.post('/notifyLevel', [limiter, requireVerifiedAuth], async (req, res) => {
    try {
        const userId = req.user
        const { level } = req.body
        const notify = new ContentNotify({ userId, level })
        await notify.save()
        res.status(200).json({ message: 'Notify submitted successfully' })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})
module.exports = router;
