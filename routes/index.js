const auth = require('./auth')
const game = require('./game')
const express = require('express')
const router = express.Router()

router.use('/auth', auth)
router.use('/game', game)

module.exports = router
