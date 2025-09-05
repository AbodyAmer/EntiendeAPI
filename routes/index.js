const auth = require('./auth')
const cmsEssay = require('./cms/essay')
const essay = require('./essay')
const userFeedback = require('./userFeedback')
const oneSentence = require('./oneSentence')
const fillin = require('./fillin')
const publicmobile = require('./mobile/public')
const express = require('express')
const router = express.Router()

router.use('/auth', auth)
router.use('/cms/essay', cmsEssay)
router.use('/essay', essay)
router.use('/one-sentence', oneSentence)
router.use('/user-feedback', userFeedback)
router.use('/fillin', fillin)

router.use('/mobile/public', publicmobile);  // No auth required
// router.use('/mobile/auth', mobileRoutes.auth);      // User auth required

module.exports = router
