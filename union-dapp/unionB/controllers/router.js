const fs = require('fs')
const router = require('express').Router()
const config = require('../lib/config')
const Contract = require('../lib/contract');
const Crypto = require("../lib/crypto")
const IPFS = require("../lib/ipfs")
const Tracker = require("../lib/tracker")
const RequestWarrant = require("../models/req_warrant")
const ShareWarrant = require("../models/share_warrant")
const {UserReq, UserShare} = require("../models/user")

const Bank = config.BANK
const ipfs = new IPFS()
const crypto = new Crypto()
const contract = new Contract()

// get request warrant from bank
router.post('/request-warrant', async (req, res) => {
    try {
        console.log("Get request warrant from bank.")
        res.send("Success.")

        let {requestWarrant, sendTime, bankSign} = req.body
        const text = requestWarrant.userSign + sendTime
        const v1 = crypto.eccVerify(text, bankSign, requestWarrant.authorized)

        requestWarrant = new RequestWarrant(requestWarrant.dataOwner,
            requestWarrant.authorized,
            requestWarrant.proxy,
            requestWarrant.reqValidtime,
            requestWarrant.nonce,
            requestWarrant.reqID,
            requestWarrant.userSign)
        const v2 = requestWarrant.checkWarrant()

        console.log("Check signature:", v1)
        console.log("Check warrant:", v2)

        const bank = Bank.find(bank => bank.pk === requestWarrant.authorized)
        const url = bank.url
        const userReq = new UserReq({
            pk: requestWarrant.authorized,
            url: url,
            requestWarrant: requestWarrant
        })

        await userReq.save()
            .then(savedUserReq => console.log(`${bank.name} request warant data save success.`))
            .catch(error => console.log(error))

        console.log("Proxy request warrant.")
        Tracker.add(requestWarrant.reqID)
        await contract.proxyRequest(requestWarrant.reqID,
            requestWarrant.dataOwner,
            requestWarrant.proxy,
            requestWarrant.reqValidtime,
            requestWarrant.nonce)
    } catch(error) {
        console.log(error)
        res.send("Fail.")
    }
})

// get response file from bank
router.post('/response-file', async (req, res) => {
    try {
        console.log("Get response file from bank.")
        res.send("Success.")

        let {reqID, shareWarrant, sendTime, bankSign, encFile} = req.body
        if (shareWarrant !== undefined) {
            const text = shareWarrant.userSign + sendTime
            const v1 = crypto.eccVerify(text, bankSign, shareWarrant.authorized)
            shareWarrant = new ShareWarrant(shareWarrant.dataOwner,
                                            shareWarrant.dataHash,
                                            shareWarrant.authorized,
                                            shareWarrant.proxy,
                                            shareWarrant.shareValidtime,
                                            shareWarrant.nonce,
                                            shareWarrant.shareID,
                                            shareWarrant.userSign)
            const v2 = shareWarrant.checkWarrant()
            const v3 = crypto.hash(encFile) === shareWarrant.dataHash
            console.log("Check signature:", v1)
            console.log("Check warrant:", v2)
            console.log("Check data hash:", v3)

            const bank = Bank.find(bank => bank.pk === shareWarrant.authorized)
            const userShare = new UserShare({
                pk: shareWarrant.authorized,
                shareWarrant: shareWarrant
            })

            await userShare.save()
            .then(savedUserShare => {
                console.log(`${bank.name} share warant data save success`)
                const filename = `./file/${shareWarrant.dataHash}`
                fs.writeFileSync(filename, encFile, 'hex')
            })
            .catch(error => console.log(error))

            const ipfsResult = await ipfs.add(encFile)

            await contract.proxyResponse(shareWarrant.shareID,
                                        reqID,
                                        shareWarrant.dataOwner,
                                        shareWarrant.dataHash,
                                        shareWarrant.proxy,
                                        shareWarrant.shareValidtime,
                                        shareWarrant.nonce,
                                        ipfsResult.path)

           
            console.log("Proxy Response File Success.")
        }

        // get all banks response
        Tracker.increament(reqID)
        if (Tracker.Counter[reqID] == Bank.length) {
            await contract.proxyResponseEnd(reqID)
            console.log("Proxy Response End!")
        }
    } catch (error) {
        console.log(error.message)
    }    
})

module.exports = router