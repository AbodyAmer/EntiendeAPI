const auth = require('./auth')
const cmsEssay = require('./cms/essay')
const essay = require('./essay')
const userFeedback = require('./userFeedback')
const oneSentence = require('./oneSentence')
const fillin = require('./fillin')
const express = require('express')
const router = express.Router()

router.use('/auth', auth)
router.use('/cms/essay', cmsEssay)
router.use('/essay', essay)
router.use('/one-sentence', oneSentence)
router.use('/user-feedback', userFeedback)
router.use('/fillin', fillin)

module.exports = router
