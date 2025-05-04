const auth = require('./auth')
const cmsEssay = require('./cms/essay')
const express = require('express')
const router = express.Router()

router.use('/auth', auth)
router.use('/cms/essay', cmsEssay)
module.exports = router
