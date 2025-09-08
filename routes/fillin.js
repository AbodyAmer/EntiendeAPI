const express = require('express');
const { requireVerifiedAuth } = require('../utils/requireVerifiedAuth');
const limiter = require('../utils/limiter');
const Users = require('../models/User');
const Fillin = require('../models/fillin');
const FillinHistory = require('../models/fillinHistory');
const router = express.Router();

router.get('/', requireVerifiedAuth, async (req, res) => {
    try {
        const limit = 10;
        const userId = req.user

        const history = await FillinHistory.find({ userId })
        const sentences = await Fillin.find({ _id: { $nin: history.map(h => h.sentence) },isApproved: true }).limit(limit)
        return res.json(sentences)
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.post('/savehistory', [requireVerifiedAuth], async (req, res) => {
    try {
        const userId = req.user
        const { sentenceId, dialect = 'MSA', isCorrect, isReview = false } = req.body
        const fillin = await Fillin.findById(sentenceId)
        if (!fillin) {
            return res.status(404).json({ message: 'Sentence not found' })
        }

        const history = new FillinHistory({
            userId,
            sentence: sentenceId,
            dialect,
            isCorrect: isCorrect,
            isReview: isReview
        })
        await history.save()
        res.status(200).json({ message: 'Fill-in history saved successfully' })
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
})

module.exports = router;