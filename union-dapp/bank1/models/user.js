const config = require('../lib/config')
const mongoose = require('mongoose')

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

const UserReq = mongoose.model(`${config.NAME}_User_Request_Warrant`, userReqSchema)
const UserShare = mongoose.model(`${config.NAME}_User_Share_Warrant`, userShareSchema)

module.exports = {UserReq, UserShare}