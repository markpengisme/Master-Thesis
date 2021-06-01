const fs = require('fs')
const router = require('express').Router()
const config = require('../lib/config')
const Contract = require('../lib/contract')
const Crypto = require('../lib/crypto')
const IPFS = require('../lib/ipfs')
const Tracker = require('../lib/tracker')
const Logger = require('../lib/logger')
const RequestWarrant = require('../models/req_warrant')
const ShareWarrant = require('../models/share_warrant')
const { UserReq, UserShare } = require('../models/user')

const Bank = config.BANK
const ipfs = new IPFS()
const crypto = new Crypto()
const contract = new Contract()

// get request warrant from bank
router.post('/request-warrant', async (req, res) => {
    try {
        let { requestWarrant, sendTime, bankSign } = req.body
        const text = requestWarrant.userSign + sendTime
        const v1 = crypto.eccVerify(text, bankSign, requestWarrant.authorized)
        requestWarrant = new RequestWarrant(
            requestWarrant.dataOwner,
            requestWarrant.authorized,
            requestWarrant.proxy,
            requestWarrant.reqValidtime,
            requestWarrant.nonce,
            requestWarrant.reqID,
            requestWarrant.userSign
        )
        const v2 = requestWarrant.checkWarrant()
        const bank = Bank.find((bank) => bank.pk === requestWarrant.authorized)
        const url = bank.url

        Logger.log(`Get request warrant from ${bank.name}
                    (${requestWarrant.reqID.substr(0, 40)}...),
                    Check signature: ${v1},
                    Check warrant: ${v2}`)
        res.send(
            `Success from ${config.NAME}(${requestWarrant.reqID.substr(
                0,
                40
            )}...).`
        )
        const userReq = new UserReq({
            pk: requestWarrant.authorized,
            url: url,
            requestWarrant: requestWarrant,
        })

        await userReq
            .save()
            .then((savedUserReq) =>
                Logger.log(`${bank.name} request warrant data save success.`)
            )
            .catch((error) => Logger.error(error.stack))

        Logger.log(
            `Proxy request warrant(${requestWarrant.reqID.substr(0, 40)}...).`
        )
        Tracker.add(requestWarrant.reqID)
        await contract.proxyRequest(
            requestWarrant.reqID,
            requestWarrant.dataOwner,
            requestWarrant.proxy,
            requestWarrant.reqValidtime,
            requestWarrant.nonce
        )
    } catch (error) {
        Logger.error(error.stack)
    }
})

// get response file from bank
router.post('/response-file', async (req, res) => {
    try {
        let { reqID, shareWarrant, sendTime, bankSign, encFile } = req.body

        if (shareWarrant !== undefined) {
            const text = shareWarrant.userSign + sendTime
            const v1 = crypto.eccVerify(text, bankSign, shareWarrant.authorized)
            shareWarrant = new ShareWarrant(
                shareWarrant.dataOwner,
                shareWarrant.dataHash,
                shareWarrant.authorized,
                shareWarrant.proxy,
                shareWarrant.shareValidtime,
                shareWarrant.nonce,
                shareWarrant.shareID,
                shareWarrant.userSign
            )
            const v2 = shareWarrant.checkWarrant()
            const v3 = crypto.hash(encFile) === shareWarrant.dataHash
            const bank = Bank.find(
                (bank) => bank.pk === shareWarrant.authorized
            )

            Logger.log(`Get response file from ${bank.name},
                        Check signature: ${v1}
                        Check warrant: ${v2}
                        Check data hash: ${v3}`)
            res.send(`Success from ${config.NAME}(${reqID.substr(0, 40)}...)`)

            const userShare = new UserShare({
                pk: shareWarrant.authorized,
                shareWarrant: shareWarrant,
            })

            await userShare
                .save()
                .then((savedUserShare) => {
                    Logger.log(
                        `${
                            bank.name
                        } share warrant data save success(${shareWarrant.shareID.substr(
                            0,
                            40
                        )}...)`
                    )
                    const filename = `./file/${shareWarrant.dataHash}`
                    fs.writeFileSync(filename, encFile, 'hex')
                })
                .catch((error) => Logger.error(error.stack))

            const ipfsResult = await ipfs.add(encFile)

            // add proxy request in array, and wait for all responses
            Tracker.addResDatas(reqID, [
                shareWarrant.shareID,
                reqID,
                shareWarrant.dataOwner,
                shareWarrant.dataHash,
                shareWarrant.proxy,
                shareWarrant.shareValidtime,
                shareWarrant.nonce,
                ipfsResult.path,
            ])
        }

        if (reqID !== undefined) {
            const now = Tracker.increamentCounter(reqID);
            const resDatas = Tracker.resDatas[reqID]
            // get all bank responses
            if (now === Bank.length ) {
                // response 10 at most at a time
                if (resDatas !== undefined) {
                    const times = Math.ceil(resDatas.length / 10)
                    for (var i = 0; i < times; i++) {
                        Logger.log(
                            "Proxy response length:",
                            resDatas.slice(i * 10, (i + 1) * 10).length
                        );
                        await contract.proxyResponses(
                            reqID,
                            resDatas.slice(i * 10, (i + 1) * 10)
                        );
                    }
                }
                await contract.proxyResponseEnd(reqID);
                Logger.log(`Proxy Response End!(${reqID.substr(0, 40)}...)`);
            }
        }
    } catch (error) {
        Logger.error(error.stack)
    }
})

router.post('/audit-rw', async (req, res) => {
    try {
        let { reqID } = req.body
        const userReq = await UserReq.findOne({ "requestWarrant.reqID": reqID })
        res.send(userReq.requestWarrant)
    } catch (error) {
        Logger.error(error.stack)
    }
})

router.post('/audit-sw', async (req, res) => {
    try {
        let { shareID } = req.body
        const userShare = await UserShare.findOne({ "shareWarrant.shareID": shareID })
        res.send(userShare.shareWarrant)
    } catch (error) {
        Logger.error(error.stack)
    }
})

module.exports = router
