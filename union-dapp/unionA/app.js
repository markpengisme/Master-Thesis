const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const config = require('./lib/config')
const router = require('./controllers/router')
const contract = require('./controllers/listner')

contract.startListenReq()
contract.startListenRes()

const app = express()

mongoose.connect(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
.then(result => {
console.log('connected to MongoDB')
})
.catch((error) => {
console.log('error connecting to MongoDB:', error.message)
})

app.use(bodyParser({limit: '50mb'}));
app.use(express.json())
app.use(router)

module.exports = app
