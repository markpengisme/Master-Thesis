const fs = require('fs')
const router = require('express').Router()
const axios = require('axios')
const config = require('../lib/config')
const Crypto = require("../lib/crypto")
const Tracker = require("../lib/tracker")
const Logger = require('../lib/logger')
const RequestWarrant = require("../models/req_warrant")
const ShareWarrant = require('../models/share_warrant')
const crypto = new Crypto()

// send request warrant by call api
router.post('/request-warrant', (req, res, next) => {
    time = Date.now()
    const url = "http://" + config.IP + ":"+ config.PORT
    const {bankName, bankPK, bankUrl, unionPK} = req.body
    const requestWarrant = new RequestWarrant()
    requestWarrant.userCreate(bankPK, unionPK)
    
    // record start time
    Tracker.writeTime('./record/start.csv',requestWarrant.reqID, Date.now())

    Logger.log(`Send request warrant to ${bankName}(${requestWarrant.reqID.substr(0,40)}...)`)
    axios.post(`${bankUrl}/request-warrant`, {requestWarrant, url})
    .then(response => {
        Logger.log(response.data);
        res.send("Send Request Warrant Success!")
    })
    .catch(error => {
        Logger.error(error.toString());
        res.send("Send Request Warrant Fail!")
    })  
})

// send share warrant by call api
router.post('/share-warrant', async(req, res) => {
    const {bankName, bankPK, bankUrl, unionPK, filename} = req.body
    const rawData = fs.readFileSync(`./file/${filename}`, 'hex')
    const encFile = crypto.aesEnc(rawData)
    const shareWarrant = new ShareWarrant()
    shareWarrant.userCreate(encFile, bankPK, unionPK)

    Logger.log(`Send share warrant to ${bankName}(${shareWarrant.reqID.substr(0,40)}...)`)
    
    axios({
        method: 'post',
        url: `${bankUrl}/share-warrant`,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        data: {shareWarrant, encFile}
    })
    .then( response => {
        Logger.log(response.data);
        res.send("Send Share Warrant Success!")
    })
    .catch( error => {
        Logger.error(error.toString());
        res.send("Send Request Warrant Fail!")
    })  
})

// get response file 
router.post('/response-file', (req, res) => {
    const {reqID, encFiles} = req.body
    Logger.log(`Get Response Files(${reqID.substr(0,40)}...)`)
    res.send("User Get Response File Success!")

    let n = 0
    encFiles.forEach((encFile, index) => {
        kycFile = crypto.aesDec(encFile)
        if (kycFile.length < 10000){
            const buf = Buffer.from(kycFile, 'hex');
            Logger.log(`File${index+1}: ${buf.toString()}`)
        } else {
            const filename = `./file/${Date.now()}.pdf`
            fs.writeFile(filename, kycFile, 'hex', (err) =>{
                if (err)
                    Logger.error(error.toString());
                else
                    Logger.log(`File${index+1}: Data save to ${filename}.`)
            })
        }
    })

    // record end time
    Tracker.writeTime('./record/end.csv', reqID, Date.now())
})

module.exports = router