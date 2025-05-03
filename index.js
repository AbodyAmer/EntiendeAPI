require('dotenv').config()
const mongoose = require('mongoose')
const routes = require('./routes')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const express = require('express')
const app = express()

mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB connected")).catch(err => console.log(err))

app.use(bodyParser.json())
app.use(cookieParser())

// last
app.use('/', routes)
app.listen(3000, () => console.log("API is running"))