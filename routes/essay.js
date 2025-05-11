const express = require('express');
const requireAuth = require('../utils/requireAuth')
const limiter = require('../utils/limiter');
const Users = require('../models/User');
const ReadHistory = require('../models/ReadHistory');
const Essay = require('../models/Essay');
const EssayContent = require('../models/EssayContent'); // added missing require statement
const router = express.Router();


router.get('/', limiter, requireAuth, async (req, res) => {
    try {
        const userId = req.user
        const user = await Users.findById(userId)
            .select('-hash')                // remove password hash
            .lean();
        const history = await ReadHistory.findOne({ userId, ended: false, level: user.level })
            .populate('essayId')
            .sort({ _id: -1 })
            .lean();
        if (!user.emailVerified) {
            return res.status(401).json({ error: 'Email not verified' })
        }
        if (!history) {
            // get random essay by user level
            const count = await Essay.countDocuments({ level: user.level });
            if (count === 0) {
                return res.status(404).json({ error: 'No essay found for this level.' });
            }
            const random = Math.floor(Math.random() * count);
            console.log(random)
            const essay = await Essay.findOne({ level: user.level }).skip(random);
            if (!essay) {
                return res.status(404).json({ error: 'No essay found for this level.' });
            }

            // Determine dialect: query > user > fallback to 'MSA'
            let selectedDialect = req.query.dialect || user.defaultDialect || 'MSA';
            let essayContents = await EssayContent.find({ essayId: essay._id });
            if (!essayContents) {
                return res.status(404).json({ error: 'Essay content not found for any dialect.' });
            }

            // add to read history
            ReadHistory.create({
                userId,
                essayId: essay._id,
                readAt: new Date(),
                level: essay.level
            })
            const selectedContent = essayContents.find(content => content.dialect === selectedDialect) || essayContents[0];
            return res.json({
                essayId: essay._id,
                titleAr: essay.titleAr,
                titleEn: essay.titleEn,
                wordCount: essay.wordCount,
                level: essay.level,
                dialect: selectedContent.dialect,
                content: selectedContent.plainContent,
                tashkeelContent: selectedContent.tashkeelContent,
                availableDialects: essayContents.map(content => content.dialect)
            });
        } else {
            // return current story
            let selectedDialect = req.query.dialect || user.defaultDialect || 'MSA';
            let essayContents = await EssayContent.find({ essayId: history.essayId._id });
            if (!essayContents) {
                return res.status(404).json({ error: 'Essay content not found for any dialect.' });
            }
            // res.json(history)
            const selectedContent = essayContents.find(content => content.dialect === selectedDialect) || essayContents[0];
            return res.json({
                essayId: history.essayId._id,
                titleAr: history.essayId.titleAr,
                titleEn: history.essayId.titleEn,
                wordCount: history.essayId.wordCount,
                level: history.essayId.level,
                dialect: selectedContent.dialect,
                content: selectedContent?.plainContent,
                tashkeelContent: selectedContent?.tashkeelContent,
                availableDialects: essayContents.map(content => content.dialect)
            });
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message })
    }
});

router.get('/:id', limiter, requireAuth, async (req, res) => {
    try {
        const { id } = req.params
        const { dialect = "MSA" } = req.query
        const essay = await Essay.findById(id)
        if (!essay) {
            return res.status(404).json({ error: 'Essay not found' })
        }
        const essayContents = await EssayContent.find({ essayId: essay._id })
        if (!essayContents) {
            return res.status(404).json({ error: 'Essay content not found for any dialect.' })
        }
        const selectedContent = essayContents.find(content => content.dialect === dialect) || essayContents[0];
        return res.json({
            essayId: essay._id,
            titleAr: essay.titleAr,
            titleEn: essay.titleEn,
            wordCount: essay.wordCount,
            level: essay.level,
            dialect: selectedContent.dialect,
            content: selectedContent?.plainContent,
            tashkeelContent: selectedContent?.tashkeelContent,
            availableDialects: essayContents.map(content => content.dialect)
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message })
    }
})

module.exports = router;
