const fs = require('fs')
const router = require('express').Router()
const axios = require('axios')
const config = require('../lib/config')
const Crypto = require("../lib/crypto")
const Tracker = require("../lib/tracker")
const RequestWarrant = require("../models/req_warrant")
const ShareWarrant = require("../models/share_warrant")
const {UserReq, UserShare} = require("../models/user")
const crypto = new Crypto()

// get request warrant from user
router.post('/request-warrant', async (req, res) => {
    console.log("Get request warrant from user.")
    res.send("Success.")
    let {requestWarrant, url} = req.body
    
    requestWarrant = new RequestWarrant(requestWarrant.dataOwner,
                                        requestWarrant.authorized,
                                        requestWarrant.proxy,
                                        requestWarrant.reqValidtime,
                                        requestWarrant.nonce,
                                        requestWarrant.reqID,
                                        requestWarrant.userSign)

    const v1 = requestWarrant.checkWarrant()
    console.log("Check warrant:", v1)
    const userReq = new UserReq({
      pk: requestWarrant.dataOwner,
      url: url,
      requestWarrant: requestWarrant
    })
  
    await userReq.save()
    .then(savedUserReq => console.log("User request warant data save success."))
    .catch(error => console.log(error))

    const sendTime = Date.now()
    const bankSign = crypto.eccSign(requestWarrant.userSign + sendTime)
    
    axios.post(`${config.unionUrl}/request-warrant`,{requestWarrant, sendTime, bankSign})
    .then( response => {
        console.log(response.data);
    })
    .catch( error => {
        console.log(error);
    })
})

// get share warrant from user
router.post('/share-warrant', async (req, res) => {
    console.log("Get share warrant from user.")
    res.send("Success.")
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
    console.log("Check warrant:", v1)
    console.log("Check data hash:", v2)


    const userShare = new UserShare({
        pk: shareWarrant.dataOwner,
        shareWarrant: shareWarrant
    })
    
    await userShare.save()
    .then(savedUserShare => {
        console.log("User share warant data save success")
        const filename = `./file/${shareWarrant.dataHash}`
        fs.writeFileSync(filename, encFile, 'hex')
    })
    .catch(error => console.log(error))
      
})

// get file request from union
router.post('/request-file', async (req, res) => {
    console.log("Get file request from union.")
    res.send("Success.")

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
    console.log("Check signature:", v1)
    console.log("Check reqID:", v2)
  
    // share file
    const reqID = requestWarrant.reqID
    let userShare = await UserShare.findOne({pk: requestWarrant.dataOwner}).sort({ "shareWarrant.shareValidtime": 'desc'})
    console.log("Send response file to union.")

    if (userShare !== null ){
      userShare = userShare.toJSON()
      const shareWarrant = userShare.shareWarrant
      const filename = `./file/${shareWarrant.dataHash}`
      const encFile = fs.readFileSync(filename, 'hex')
      sendTime = Date.now()
      const bankSign = crypto.eccSign(shareWarrant.userSign + sendTime)
      
      axios({
        method: 'post',
        url: `${config.unionUrl}/response-file`,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        data: {reqID, shareWarrant, sendTime, bankSign, encFile}
      })
      .then( response => {
          console.log(response.data);
      })
      .catch( error => {
          console.log(error);
      })
    } else {
        axios.post(`${config.unionUrl}/response-file`,{reqID})
        .then( response => {
            console.log(response.data);
        })
        .catch( error => {
            console.log(error);
        })
    }
  
})

// get response files from union
router.post('/response-file', async (req, res) => {
    console.log("Get response file from union.")
    res.send("Success.")

    const {reqID, files, sendTime, unionSign} = req.body
    const text = JSON.stringify(files) + reqID + sendTime
    const v1 = crypto.eccVerify(text, unionSign, config.unionPK)
    console.log("Check signature:", v1)

    let encFiles = []
    for (file of files) {
        
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
      console.log("Check shareID:", v2)
      console.log("Check data hash:", v3)
      encFiles.push(encFile)
    }

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
    .then( response => {
        console.log(response.data);     
    })
    .catch( error => {
        console.log(error);
    })
})


module.exports = router