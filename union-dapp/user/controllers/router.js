const router = require('express').Router()
const axios = require('axios')
const Crypto = require("../lib/crypto")
const RequestWarrant = require("../models/req_warrant")
const ShareWarrant = require('../../unionA/models/share_warrant')
const crypto = new Crypto()

router.get('/request-warrant', (req, res) => {
    const requestWarrant = new RequestWarrant()
    requestWarrant.userCreate(req.query.bankPK, req.query.unionPK)

    console.log("Send Request Warrant")
    axios.post(`${req.query. bankUrl}/request-warrant`, {requestWarrant})
    .then( response => {
        console.log(response.data);
        res.send("Send Request Warrant Success!")
    })
    .catch( error => {
        console.log(error);
        res.send("Send Request Warrant Fail!")
    })  
})

router.get('/share-warrant', (req, res) => {
    const encFile = crypto.aesEnc(req.query.rawData)
    const shareWarrant = new ShareWarrant()
    shareWarrant.userCreate(encFile, req.query.bankPK, req.query.unionPK)


    console.log("Send Share Warrant")
    axios.post(`${req.query. bankUrl}/share-warrant`, {shareWarrant, encFile})
    .then( response => {
        console.log(response.data);
        res.send("Send Share Warrant Success!")
    })
    .catch( error => {
        console.log(error);
        res.send("Send Request Warrant Fail!")
    })  
})

router.post('/response-file', (req, res) => {
    console.log("Get Response File")
    res.send("Get Response File Success!")
    const {encFile} = req.body
    const kycFile = crypto.aesDec(encFile)
    console.log(kycFile)
})

module.exports = router