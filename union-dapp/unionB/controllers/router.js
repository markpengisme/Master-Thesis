const fs = require('fs')
const router = require('express').Router()
const config = require('../lib/config')
const Contract = require('../lib/contract');
const Crypto = require("../lib/crypto")
const IPFS = require("../lib/ipfs")
const Tracker = require("../lib/tracker")
const Logger = require('../lib/logger')
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
        const bank = Bank.find(bank => bank.pk === requestWarrant.authorized)
        const url = bank.url

        Logger.log(`Get request warrant from ${bank.name}
                    (${requestWarrant.reqID.substr(0,40)}...),
                    Check signature: ${v1},
                    Check warrant: ${v2}`)
        res.send(`Success(${requestWarrant.reqID.substr(0,40)}...).`)
        const userReq = new UserReq({
            pk: requestWarrant.authorized,
            url: url,
            requestWarrant: requestWarrant
        })

        await userReq.save()
        .then(savedUserReq => Logger.log(`${bank.name} request warrant data save success.`))
        .catch(error => Logger.error(error.toString()))

        Logger.log(`Proxy request warrant(${requestWarrant.reqID.substr(0,40)}...).`)
        Tracker.add(requestWarrant.reqID)
        await contract.proxyRequest(requestWarrant.reqID,
                                    requestWarrant.dataOwner,
                                    requestWarrant.proxy,
                                    requestWarrant.reqValidtime,
                                    requestWarrant.nonce)
    } catch(error) {
        if (!requestWarrant.reqID){
            reqID = requestWarrant.reqID
        } else {
            reqID = "???"
        }
        Logger.error(error.toString())
        res.send(`Fail(${reqID.substr(0,40)}...).`)
    }
})

// get response file from bank
router.post('/response-file', async (req, res) => {
    try {
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
            const bank = Bank.find(bank => bank.pk === shareWarrant.authorized)

            Logger.log(`Get response file from ${bank.name},
                        Check signature: ${v1}
                        Check warrant: ${v2}
                        Check data hash: ${v3}`)
            res.send(`Success(${reqID.substr(0,49)}...)`)

            const userShare = new UserShare({
                pk: shareWarrant.authorized,
                shareWarrant: shareWarrant
            })

            await userShare.save()
            .then(savedUserShare => {
                Logger.log(`${bank.name} share warrant data save success(${shareWarrant.shareID.substr(0,40)}...)`)
                const filename = `./file/${shareWarrant.dataHash}`
                fs.writeFileSync(filename, encFile, 'hex')
            })
            .catch(error => Logger.error(error.toString()))

            const ipfsResult = await ipfs.add(encFile)

            await contract.proxyResponse(shareWarrant.shareID,
                                        reqID,
                                        shareWarrant.dataOwner,
                                        shareWarrant.dataHash,
                                        shareWarrant.proxy,
                                        shareWarrant.shareValidtime,
                                        shareWarrant.nonce,
                                        ipfsResult.path)

           
            Logger.log(`Proxy Response File Success
                    (${reqID.substr(0,40)}... ->
                    ${shareWarrant.shareID.substr(0,40)})`)
        }

        // get all banks response
        Tracker.increament(reqID)
        if (Tracker.Counter[reqID] == Bank.length) {
            await contract.proxyResponseEnd(reqID)
            Logger.log(`Proxy Response End!(${reqID.substr(0,40)}...)`)
        }
    } catch (error) {
        Logger.error(error.toString())
    }    
})

module.exports = router