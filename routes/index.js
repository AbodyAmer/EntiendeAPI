const auth = require('./auth')
const game = require('./game')
const payment = require('./payment')
const express = require('express')

const router = express.Router()

router.use('/auth', auth)
router.use('/game', game)
router.use('/payment', payment)

module.exports = router
