const config = require('../lib/config')
const Logger = require('../lib/logger')
const mongoose = require('mongoose')
const conn = mongoose.createConnection(config.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
conn.on("connected", function(){
  Logger.log('connected to MongoDB')
})

const requestWarrantSchema = new mongoose.Schema({
  dataOwner: String,
  authorized: String,
  proxy: String,
  reqValidtime: String,
  nonce: String,
  reqID: String,
  userSign: String
})

const shareWarrantSchema = new mongoose.Schema({
    dataOwner: String,
    dataHash: String,
    authorized: String,
    proxy: String,
    shareValidtime: String,
    nonce: String,
    shareID: String,
    userSign: String
})

const userReqSchema = new mongoose.Schema({
  pk: String,
  url: String,
  requestWarrant: requestWarrantSchema
})

const userShareSchema = new mongoose.Schema({
  pk: String,
  shareWarrant: shareWarrantSchema
})

userReqSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject._id
    delete returnedObject.requestWarrant._id
    delete returnedObject.__v
  }
})

userShareSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    delete returnedObject._id
    delete returnedObject.shareWarrant._id
    delete returnedObject.__v
  }
})

const UserReq = conn.model(`${config.NAME}_User_Request_Warrant`, userReqSchema)
const UserShare = conn.model(`${config.NAME}_User_Share_Warrant`, userShareSchema)

module.exports = {UserReq, UserShare}