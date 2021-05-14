const axios = require('axios')
const config = require('../lib/config')
const Contract = require('../lib/contract')
const Crypto = require('../lib/crypto')
const IPFS = require('../lib/ipfs')
const Logger = require('../lib/logger')
const RequestWarrant = require('../models/req_warrant')
const ShareWarrant = require('../models/share_warrant')

const Union = config.UNION
const crypto = new Crypto()
const contract = new Contract()
const ipfs = new IPFS()

contract.startListenReq = function () {
    this.contract.events.reqEvent()
        .on('data', async (result) => {
            // sample audit
            try {
                const reqID = result.returnValues.reqID
                const num = parseInt('0x' + reqID)
                if (num % 10 != 0) {
                    return
                }
                const req = await contract.retrieveReq(reqID)
                const requestWarrant = new RequestWarrant(
                    req.dataOwner,
                    '',
                    req.proxy,
                    req.reqValidtime,
                    req.nonce,
                    req.reqID,
                    ''
                )
                const union = Union.find(
                    (union) => union.pk === requestWarrant.proxy
                )
                axios
                    .post(`${union.url}/audit-rw`, { reqID })
                    .then((response) => {
                        let rw = response.data
                        rw = new RequestWarrant(
                            rw.dataOwner,
                            rw.authorized,
                            rw.proxy,
                            rw.reqValidtime,
                            rw.nonce,
                            rw.reqID,
                            rw.userSign
                        )
                        const v1 = requestWarrant.reqID === rw.reqID
                        const v2 = rw.checkUserSign()
                        Logger.log(`Audit RW ${reqID.substr(0, 40)}...),
                        Check same id: ${v1}
                        Check RW sig: ${v2}`)
                    })
            } catch (error) {
                Logger.error(error.stack)
            }
        })
        .on('error', (error) => {
            Logger.error(error.stack)
        })
}

contract.startListenRes = function () {
    this.contract.events.resEvent()
        .on('data', async (result) => {
            // sample audit
            try {
                const { shareID, reqID } = result.returnValues
                const num = parseInt('0x' + shareID)
                if (num % 10 != 0) {
                    return
                }
                const resID = shareID + reqID
                const { res, data } = await contract.retrieveRes(resID)
                const shareWarrant = new ShareWarrant(
                    res.dataOwner,
                    data.dataHash,
                    '',
                    res.proxy,
                    res.shareValidtime,
                    res.nonce,
                    res.shareID,
                    ''
                )
                const encFile = await ipfs.get(data.ipfsHash)
                const union = Union.find(
                    (union) => union.pk === shareWarrant.proxy
                )
                axios
                    .post(`${union.url}/audit-sw`, { shareID })
                    .then((response) => {
                        let sw = response.data
                        sw = new ShareWarrant(
                            sw.dataOwner,
                            sw.dataHash,
                            sw.authorized,
                            sw.proxy,
                            sw.shareValidtime,
                            sw.nonce,
                            sw.shareID,
                            sw.userSign
                        )
                        const v1 = shareWarrant.reqID === sw.reqID
                        const v2 = crypto.hash(encFile) === sw.dataHash
                        const v3 = sw.checkWarrant()
                        Logger.log(`Audit SW ${reqID.substr(0, 40)}...),
                                Check same id: ${v1}
                                Check datahash: ${v2}
                                Check SW sig: ${v3}`)
                    })
            } catch (error) {
                Logger.error(error.stack)
            }
        })
        .on('error', (error) => {
            Logger.error(error.stack)
        })
}

module.exports = contract
