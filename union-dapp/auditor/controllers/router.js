const router = require('express').Router()
const Contract = require('../lib/contract.js');
const Crypto = require("../lib/crypto")
const RequestWarrant = require("../models/req_warrant")

const crypto = new Crypto()
const contract = new Contract()

contract.start()

router.get('/:id', async (req, res) => {
  try {
    let a = "test"
    if (req.params.id === 'reqID') {
      a = await contract.retrieveReq(req.params.id)
    } else if (req.params.id === 'shareID') {
      a = await contract.retrieveRes(req.params.id)
    }
    res.send(a)
  } catch(e) {
    console.log(e)
    res.send("Error")
  }
})

router.post('/request-warrant', async (req, res) => {
  let {requestWarrant, sendTime, bankSign} = req.body
  // console.log({requestWarrant, sendTime, bankSign})
  const text = crypto.hash(JSON.stringify(requestWarrant) + sendTime)
  const v1 = crypto.eccVerify(text, bankSign, requestWarrant.authorized)
  requestWarrant = new RequestWarrant(requestWarrant.dataOwner,
                                      requestWarrant.authorized,
                                      requestWarrant.proxy,
                                      requestWarrant.reqValidtime,
                                      requestWarrant.nonce,
                                      requestWarrant.reqID,
                                      requestWarrant.userSign)
  const v2 = requestWarrant.checkWarrant()
                                      
  console.log(v1, v2)
  try{
    let a = await contract.proxyRequest(requestWarrant.reqID,
                                        requestWarrant.dataOwner,
                                        requestWarrant.proxy,
                                        requestWarrant.reqValidtime,
                                        requestWarrant.nonce)
    console.log("Proxy Request Warrant Success!")
    res.send("Send Request Warrant Success!")
  } catch(e) {
    console.log(e)
    res.send("Send Request Warrant Fail!")
  }
})

router.post('/res', async (req, res) => {
  const {reqID, shareWarrant, sendTime, bankSign, encFile} = req.body
  ipfsHash = "ipfsHash"
  try {
    let a = await contract.proxyResponse(
      shareWarrant.shareID,
      reqID,
      shareWarrant.dataOwner,
      shareWarrant.dataHash,
      shareWarrant.proxy,
      shareWarrant.shareValidtime,
      shareWarrant.nonce,
      ipfsHash)
    res.send(a)
  } catch(e) {
    console.log(e)
    res.send("Error")
  }
  
})

module.exports = router