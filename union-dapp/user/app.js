const express = require('express')
const bodyParser = require('body-parser')
const router = require('./controllers/router')

const app = express()

app.use(bodyParser({limit: '50mb'}));
app.use(express.json())
app.use(router)

module.exports = app
