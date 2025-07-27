require('dotenv').config()
const mongoose = require('mongoose')
const routes = require('./routes')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const express = require('express')
const cors = require('cors');
const app = express()

console.log(process.env)

mongoose.connect(process.env.MONGO_URI).then(() => console.log("MongoDB connected")).catch(err => console.log(err))

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`)
  next()
})
// app.use(cors({ origin: ['http://localhost:3000', 'https://efhamarabi.com', 'https://api.efhamarabi.com'], credentials: true }));
// app.use(bodyParser.json())
// app.use(cookieParser())

// // last
// app.use('/', routes)
// app.listen(7070, () => console.log("API is running"))