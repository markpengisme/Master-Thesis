const fs = require('fs')
const router = require('express').Router()
const axios = require('axios')
const config = require('../lib/config')
const Crypto = require("../lib/crypto")
const Tracker = require("../lib/tracker")
const Logger = require('../lib/logger')
const RequestWarrant = require("../models/req_warrant")
const ShareWarrant = require("../models/share_warrant")
const {UserReq, UserShare} = require("../models/user")
const crypto = new Crypto()

// get request warrant from user
router.post('/request-warrant', async (req, res) => {
    let {requestWarrant, url} = req.body 
    requestWarrant = new RequestWarrant(requestWarrant.dataOwner,
                                        requestWarrant.authorized,
                                        requestWarrant.proxy,
                                        requestWarrant.reqValidtime,
                                        requestWarrant.nonce,
                                        requestWarrant.reqID,
                                        requestWarrant.userSign)
    const v1 = requestWarrant.checkWarrant()
    const reqID = requestWarrant.reqID
    Logger.log(`Get request warrant from user
                (${reqID.substr(0,40)}...),
                Check warrant: ${v1}`)
    res.send(`Success from ${config.NAME}(${reqID.substr(0,40)}...).`)

    const userReq = new UserReq({
      pk: requestWarrant.dataOwner,
      url: url,
      requestWarrant: requestWarrant
    })
  
    await userReq.save()
    .then(savedUserReq => Logger.log(`User request warrant data save success.(${reqID.substr(0,40)}...)`))
    .catch(error => Logger.error(error.toString()))

    const sendTime = Date.now()
    const bankSign = crypto.eccSign(requestWarrant.userSign + sendTime)
    
    axios.post(`${config.unionUrl}/request-warrant`,{requestWarrant, sendTime, bankSign})
    .then(response => Logger.log(response.data))
    .catch(error => Logger.error(error.toString()))
})

// get share warrant from user
router.post('/share-warrant', async (req, res) => {
    let {shareWarrant, encFile} = req.body
    shareWarrant = new ShareWarrant(shareWarrant.dataOwner,
                                    shareWarrant.dataHash,
                                    shareWarrant.authorized,
                                    shareWarrant.proxy,
                                    shareWarrant.shareValidtime,
                                    shareWarrant.nonce,
                                    shareWarrant.shareID,
                                    shareWarrant.userSign)
    const v1 = shareWarrant.checkWarrant()
    const v2 = crypto.hash(encFile) === shareWarrant.dataHash
    const shareID = shareWarrant.shareID
    Logger.log(`Get share warrant from user
                (${shareID.substr(0,40)}...),
                Check warrant: ${v1},
                Check data hash: ${v2}`)
    res.send(`Success from ${config.NAME}(${shareID.substr(0,40)}...).`)


    const userShare = new UserShare({
        pk: shareWarrant.dataOwner,
        shareWarrant: shareWarrant
    })
    
    await userShare.save()
    .then(savedUserShare => {
        Logger.log(`User share warrant data save success(${shareID.substr(0,40)}...)`)
        const filename = `./file/${shareWarrant.dataHash}`
        fs.writeFileSync(filename, encFile, 'hex')
    })
    .catch(error => Logger.error(error.toString()))
      
})

// get file request from union
router.post('/request-file', async (req, res) => {
    let {requestWarrant, sendTime, unionSign} = req.body
    const text = requestWarrant.reqID + sendTime
    const v1 = crypto.eccVerify(text, unionSign, config.unionPK)
    requestWarrant = new RequestWarrant(requestWarrant.dataOwner,
                                        "",
                                        requestWarrant.proxy,
                                        requestWarrant.reqValidtime,
                                        requestWarrant.nonce,
                                        requestWarrant.reqID,
                                        "")
    const v2 = requestWarrant.checkID()
    const reqID = requestWarrant.reqID

    Logger.log(`Get file request from union(${reqID.substr(0,40)}),
                Check signature: ${v1},
                Check reqID: ${v2}`)
    res.send(`Success from ${config.NAME}(${reqID.substr(0,40)}...).`)
  
    // share file
    let userShare = await UserShare.findOne({pk: requestWarrant.dataOwner}).sort({ "shareWarrant.shareValidtime": 'desc'})
    
    if (userShare !== null ){
      userShare = userShare.toJSON()
      const shareWarrant = userShare.shareWarrant
      const filename = `./file/${shareWarrant.dataHash}`
      const encFile = fs.readFileSync(filename, 'hex')
      sendTime = Date.now()
      const bankSign = crypto.eccSign(shareWarrant.userSign + sendTime)
      Logger.log(`Send response file to union(${reqID.substr(0,40)}).`)

      axios({
        method: 'post',
        url: `${config.unionUrl}/response-file`,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        data: {reqID, shareWarrant, sendTime, bankSign, encFile}
      })
      .then(response => Logger.log(response.data))
      .catch(error => Logger.error(error.toString()))

    } else {
        Logger.log(`Send empty response to union(${reqID.substr(0,40)}).`)
        axios.post(`${config.unionUrl}/response-file`,{reqID})
        .then(response => Logger.log(response.data))
        .catch(error => Logger.error(error.toString()))
    }
  
})

// get response files from union
router.post('/response-file', async (req, res) => {
    const {reqID, files, sendTime, unionSign} = req.body
    const text = JSON.stringify(files) + reqID + sendTime
    const v1 = crypto.eccVerify(text, unionSign, config.unionPK)
    Logger.log(`Get response file from union(${reqID.substr(0,40)}...),
                Check signature: ${v1})`)
    res.send(`Success from ${config.NAME}(${reqID.substr(0,40)}...))`)

    let encFiles = []
    files.forEach((file, index) => {
      let {shareWarrant, encFile} = file
      shareWarrant = new ShareWarrant(shareWarrant.dataOwner,
                                      shareWarrant.dataHash,
                                      "",
                                      shareWarrant.proxy,
                                      shareWarrant.shareValidtime,
                                      shareWarrant.nonce,
                                      shareWarrant.shareID,
                                      "")
      const v2 = shareWarrant.checkID()
      const v3 = crypto.hash(encFile) === shareWarrant.dataHash
      Logger.log(`[File${index+1}]
                  Check shareID:${v2},
                  Check data hash:${v3}`)
      encFiles.push(encFile)
    })

    let userReq = await UserReq.findOne({"requestWarrant.reqID": reqID})
        
    // send back to user
    axios({
        method: 'post',
        url: `${userReq.url}/response-file`,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        data: {reqID, encFiles}
    })
    .then(response => Logger.log(response.data))
    .catch(error => Logger.error(error.toString()))
})


module.exports = router