const express = require('express');
const router = express.Router();

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
module.exports = router;