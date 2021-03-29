const fs = require('fs')
const router = require('express').Router()
const axios = require('axios')
const config = require('../lib/config')
const Crypto = require("../lib/crypto")
const Timer = require("../lib/timer")
const RequestWarrant = require("../models/req_warrant")
const ShareWarrant = require('../../unionA/models/share_warrant')
const crypto = new Crypto()
const timer = new Timer()
var t = 0

router.post('/request-warrant', (req, res) => {
    time = Date.now()
    const url = "http://" + config.IP + ":"+ config.PORT
    const {bankUrl, bankPK, unionPK} = req.body
    const requestWarrant = new RequestWarrant()
    requestWarrant.userCreate(bankPK, unionPK)
    
    // timer
    t = Date.now()
    timer.writeTime('./file/start.csv',requestWarrant.reqID, Date.now())

    console.log("Send request warrant to bank")
    timeRecord = Date.now()
    axios.post(`${bankUrl}/request-warrant`, {requestWarrant, url})
    .then( response => {
        console.log(response.data);
        res.send("Send Request Warrant Success!\n")
    })
    .catch( error => {
        console.log(error);
        res.send("Send Request Warrant Fail!\n")
    })  
})

router.post('/share-warrant', async(req, res) => {
    const {bankUrl, filename, bankPK, unionPK} = req.body
    const rawData = fs.readFileSync(filename, 'hex')
    const encFile = crypto.aesEnc(rawData)
    const shareWarrant = new ShareWarrant()
    shareWarrant.userCreate(encFile, bankPK, unionPK)

    console.log("Send Share Warrant")
    
    axios({
        method: 'post',
        url: `${bankUrl}/share-warrant`,
        maxContentLength: Infinity,
        maxBodyLength: Infinity,
        headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
        data: {shareWarrant, encFile}
    })
    .then( response => {
        console.log(response.data);
        res.send("Send Share Warrant Success!\n")
    })
    .catch( error => {
        console.log(error);
        res.send("Send Request Warrant Fail!\n")
    })  
})

router.post('/response-file', (req, res) => {
    console.log("Get Response File")
    res.send("Get Response File Success!")
    const {reqID, encFiles} = req.body
    encFiles.forEach(encFile => {
        kycFile = crypto.aesDec(encFile)
        if (kycFile.length < 10000){
            const buf = Buffer.from(kycFile, 'hex');
            console.log(buf.toString())
        } else {
            const filename = `./file/${Date.now()}.pdf`
            fs.writeFile(filename, kycFile, 'hex', (err) =>{
                if (err)
                    console.log(err)
                else
                    console.log(`Data save to ${filename}.`)
            })
        }
    });

    // timer
    console.log(`[INFO] Spend ${(Date.now() - t)/1000} seconds`)
    timer.writeTime('./file/end.csv', reqID, Date.now())
})




module.exports = router