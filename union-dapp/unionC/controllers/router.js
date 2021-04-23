const fs = require('fs')
const router = require('express').Router()
const config = require('../lib/config')
const Contract = require('../lib/contract')
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
        res.send(`Success from ${config.NAME}(${requestWarrant.reqID.substr(0,40)}...).`)
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
        Logger.error(error.toString())
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
            res.send(`Success from ${config.NAME}(${reqID.substr(0,40)}...)`)

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

            // add proxy request in queue
            Tracker.proxyEnqueue([  shareWarrant.shareID,
                                    reqID,
                                    shareWarrant.dataOwner,
                                    shareWarrant.dataHash,
                                    shareWarrant.proxy,
                                    shareWarrant.shareValidtime,
                                    shareWarrant.nonce,
                                    ipfsResult.path])
        }
    } catch (error) {
        Logger.error(error.toString())
    }    
})

// Do proxy request in sync, avoid nonce repeat problem
const loop = async () => {
    while(1) {
        if (Tracker.task.length !== 0){
            const proxyRes = Tracker.proxyDequeue()
            const shareID = proxyRes[0]
            const reqID = proxyRes[1]
            await contract.proxyResponse(...proxyRes)
            Logger.log(`Proxy Response File Success
                        (${reqID.substr(0,40)}... ->
                            ${shareID.substr(0,40)})`)
        
            Tracker.increament(reqID)
            if (Tracker.Counter[reqID] == Bank.length) {
                await contract.proxyResponseEnd(reqID)
                Logger.log(`Proxy Response End!(${reqID.substr(0,40)}...)`)
            }
        } else {
            await new Promise(resolve => setTimeout(resolve, 1000))
        }
    } 
}
loop()


module.exports = router