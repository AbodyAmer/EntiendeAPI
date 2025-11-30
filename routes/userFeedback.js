const express = require('express');
const { requireVerifiedAuth } = require('../utils/requireVerifiedAuth')
const limiter = require('../utils/limiter');
const DialectVote = require('../models/dialectVote');
const Subscriber = require('../models/subscribers'); 
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



router.post('/subscribe', async (req, res) => {
    try {
        const { email } = req.body;
        const subscriber = new Subscriber({ email });
        await subscriber.save();
        return res.status(201).json({ message: 'Subscription successful' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
});
module.exports = router;
