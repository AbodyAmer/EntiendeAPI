const express = require('express');
const router = express.Router();
const mongoose = require('mongoose')
const { ObjectId } = mongoose.Types

const countArabicWords = require('../../utils/wordcount')
const Essay = require('../../models/Essay')
const EssayContent = require('../../models/EssayContent')

router.post('/postMSAEssay', async (req, res) => {
    try {
        const { titleAr, titleEn, level, contentType, htmlContentTashkeel, htmlContentPlain } = req.body

        const essay = new Essay({
            titleAr,
            titleEn,
            level,
            wordCount: countArabicWords(htmlContentPlain),
            contentType
        })

        const savedEssay = await essay.save()

        const essayContent = new EssayContent({
            essayId: savedEssay._id,
            dialect: "MSA",
            tashkeelContent: htmlContentTashkeel,
            plainContent: htmlContentPlain
        })

        const savedContent = await essayContent.save()
        return res.json({ savedEssay, savedContent })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message })
    }
})

router.post('/postDialectEssay', async (req, res) => {
    try {
        const { essayId, dialect, htmlContentTashkeel, htmlContentPlain } = req.body

        const essay = await Essay.findById(essayId)
        if (!essay) {
            return res.status(404).json({ error: 'Essay not found' })
        }

        const essayContent = new EssayContent({
            essayId: essay._id,
            dialect,
            tashkeelContent: htmlContentTashkeel,
            plainContent: htmlContentPlain
        })

        const savedContent = await essayContent.save()
        return res.json({ savedContent })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message })
    }
})

router.post('/editEssay', async (req, res) => {
    try {
        const { essayId, titleAr, titleEn, level, contentType, htmlContentTashkeel, htmlContentPlain, quiz = [], dialect } = req.body
        

        if (!essayId || !titleAr || !titleEn || !level || !contentType || !dialect) {
            return res.status(400).json({ error: 'Missing required fields' })
        }
        const essay = await Essay.findById(essayId)
        if (!essay) {
            return res.status(404).json({ error: 'Essay not found' })
        }

        essay.titleAr = titleAr
        essay.titleEn = titleEn
        essay.level = level
        essay.contentType = contentType
        essay.wordCount = countArabicWords(htmlContentPlain)

        const savedEssay = await essay.save()
        // now update the essaycontent based on the dialect and essayid coming from the req.body
        const essayContent = await EssayContent.findOne({ essayId: savedEssay._id, dialect })
        if (!essayContent) {
            return res.status(404).json({ error: 'Essay content not found' })
        }
        essayContent.tashkeelContent = htmlContentTashkeel
        essayContent.plainContent = htmlContentPlain
        essayContent.quiz = quiz
        const savedContent = await essayContent.save()
        return res.json({ savedEssay, savedContent })
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message })
    }
})

router.get('/essay', async (req, res) => {
    try {
        const essays = await Essay.aggregate([
            {
                $lookup: {
                    from: 'essaycontents',
                    localField: '_id',
                    foreignField: 'essayId',
                    as: 'contents'
                }
            },
            {
                $addFields: {
                    contents: {
                        $map: {
                            input: '$contents',
                            as: 'content',
                            in: {
                                _id: '$$content._id',
                                dialect: '$$content.dialect',
                                tashkeelContent: '$$content.tashkeelContent',
                                plainContent: '$$content.plainContent',
                                quiz: '$$content.quiz',
                                createdAt: '$$content.createdAt',
                                updatedAt: '$$content.updatedAt'
                            }
                        }
                    }
                }
            }
        ]);
        
        return res.json(essays)
    } catch (error) {
        console.log(error)
        return res.status(500).json({ error: error.message })
    }
})
module.exports = router;