const express = require('express');
const requireAuth = require('../utils/requireAuth')
const limiter = require('../utils/limiter');
const Users = require('../models/User');
const OneSentenceHistory = require('../models/OneSentenceHistory');
const OneSentenceChallenge = require('../models/OneSentenceChallenge');
const router = express.Router();


router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user
        const history = await OneSentenceHistory.find({ userId, isCorrect: true }, { sentence: 1  })
        
        console.log(history.length)
        console.log(JSON.stringify({ _id: { $nin: history.map(h => h.sentence) }, isActive: true }))
        const sentences = await OneSentenceChallenge.find({ _id: { $nin: history.map(h => h.sentence) }, isActive: true })
        console.log(sentences.length)
        res.json(sentences)
    } catch(error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.post('/savehistory', requireAuth, async (req, res) => {
    try {
        const userId = req.user
        const { sentenceId, isCorrect } = req.body
        await OneSentenceHistory.create({ userId, sentence: sentenceId, isCorrect })
        res.end()
    } catch(error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

module.exports = router;
