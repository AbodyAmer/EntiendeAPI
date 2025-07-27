const express = require('express');
const requireAuth = require('../utils/requireAuth')
const limiter = require('../utils/limiter');
const Users = require('../models/User');
const ReadHistory = require('../models/ReadHistory');
const Essay = require('../models/Essay');
const { adjustLevel} = require('../utils/leveladjustment');
const EssayContent = require('../models/EssayContent'); // added missing require statement
const router = express.Router();
const jsonToHtml = require('../utils/jsonToHtml');


router.get('/', requireAuth, async (req, res) => {
    try {
        const userId = req.user
        const user = await Users.findById(userId)
            .select('-hash')                // remove password hash
            .lean();
        const histories = await ReadHistory.find({ userId, level: user.level })
            .populate('essayId')
            .sort({ _id: -1 })
            .lean();

        const history = histories.find(history => history.ended === false)
        if (!user.emailVerified) {
            return res.status(401).json({ error: 'Email not verified' })
        }
        if (!history) {
            const ids = histories.map(history => history.essayId._id)
            // get random essay by user level
            const count = await Essay.countDocuments({ level: user.level, _id: { $nin: ids } });
            if (count === 0) {
                return res.status(404).json({ message: 'No essay found for this level.' });
            }
            const random = Math.floor(Math.random() * count);
            const essay = await Essay.findOne({ level: user.level, _id: { $nin: ids } }).skip(random);
            if (!essay) {
                return res.status(404).json({ message: 'No essay found for this level.' });
            }

            // Determine dialect: query > user > fallback to 'MSA'
            let selectedDialect = req.query.dialect || user.defaultDialect || 'MSA';
            let essayContents = await EssayContent.find({ essayId: essay._id });
            if (!essayContents) {
                return res.status(404).json({ message: 'Essay content not found for any dialect.' });
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
                content: jsonToHtml(selectedContent.plainContent),
                tashkeelContent: jsonToHtml(selectedContent.tashkeelContent),
                quiz: selectedContent.quiz,
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
                content: jsonToHtml(selectedContent?.plainContent),
                tashkeelContent: jsonToHtml(selectedContent?.tashkeelContent),
                quiz: selectedContent?.quiz,
                availableDialects: essayContents.map(content => content.dialect)
            });
        }

    } catch (error) {
        console.log(error)
        return res.status(500).json({ message: error.message })
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
            content: jsonToHtml(selectedContent?.plainContent),
            tashkeelContent: jsonToHtml(selectedContent?.tashkeelContent),
            quiz: selectedContent?.quiz,
            availableDialects: essayContents.map(content => content.dialect)
        })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message })
    }
})

router.post('/reaction', limiter, requireAuth, async (req, res) => {
    try {
        const { essayId, reaction } = req.body
        const user = await Users.findById(req.user)
            .select('-hash')                // remove password hash
            .lean();
        const readHistory = await ReadHistory.findOne({ userId: user._id, essayId })
        if (!readHistory) {
            return res.status(404).json({ error: 'Read history not found' })
        }
        if (reaction === 'like') {
            readHistory.dislike = false
            readHistory.like = true
        } else {
            readHistory.like = false
            readHistory.dislike = true
        }
        await readHistory.save()
        return res.json({ readHistory })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message })
    }
})

router.post('/finish', limiter, requireAuth, async (req, res) => {
    try {
        const { essayId, answers } = req.body
        const user = await Users.findById(req.user)
            .select('-hash')                // remove password hash
            .lean();
        const readHistory = await ReadHistory.findOne({ userId: user._id, essayId, ended: false })
        if (!readHistory) {
            return res.status(404).json({ error: 'Read history not found' })
        }
        readHistory.ended = true
        if (answers) {
            // add quiz history & if pass, update user level
            readHistory.answers = answers
            adjustLevel(req.user)
        }
        await readHistory.save()

        // add event for level achievement
        
        return res.json({ readHistory })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message })
    }
})

module.exports = router;
