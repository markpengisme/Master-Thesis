const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const config = require('./lib/config')
const Logger = require('./lib/logger')
const router = require('./controllers/router')

const app = express()

app.use(bodyParser.json({limit: '50mb'}))

app.use(express.json())
app.use(router)

module.exports = app
