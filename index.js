// server.js - Simplified and more secure
require('dotenv').config()
const mongoose = require('mongoose')
const routes = require('./routes')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const express = require('express')
const cors = require('cors');
const app = express()
const { clientDetector } = require('./utils/clientDetector')

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err))

// CORS for web only
app.use(cors({ 
  origin: [
    'http://localhost:3000', 
    'https://efhamarabi.com', 
    'https://stories.efhamarabi.com'
  ], 
  credentials: true 
}));

app.use(clientDetector)  // Detect client type

// Log all incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  next()
})

app.use(bodyParser.json())
app.use(cookieParser())

// Mobile routes - NO API KEY NEEDED
// Instead, use different strategies:


// Web routes (protected by CORS)
app.use('/', routes)

const PORT = process.env.PORT || 7070
app.listen(PORT, () => console.log("API is running on port " + PORT))