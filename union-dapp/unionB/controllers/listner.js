const axios = require('axios')
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
const crypto = new Crypto()
const contract = new Contract()
const ipfs = new IPFS()

contract.startListenReq = function() {
    // broadcast request
    this.contract.events.reqEvent()
    .on('data', async (result) => {
        const reqID = result.returnValues.reqID
        const req = await contract.retrieveReq(reqID)
        const requestWarrant = new RequestWarrant(req.dataOwner,
                                                "",
                                                req.proxy,
                                                req.reqValidtime,
                                                req.nonce,
                                                req.reqID,
                                                "")

        const v1 = requestWarrant.checkID()
        Logger.log(`Get Proxy Request from blockchain
                    (${reqID.substr(0,40)}...),
                    Check reqID: ${v1}`)
        
        Bank.map(bank => {
            Logger.log(`Send request file to ${bank.name}(${reqID.substr(0,40)}...).`)
            const sendTime = Date.now()
            const unionSign = crypto.eccSign(requestWarrant.reqID + sendTime)
            axios.post(`${bank.url}/request-file`,{requestWarrant, sendTime, unionSign})
            .then(response => Logger.log(response.data))
            .catch(error => Logger.error(error.stack))
        })
        
        if (Bank.length === 0) {
            await contract.proxyResponseEnd(reqID)
            Logger.log(`Proxy Response End!(${reqID.substr(0,40)}...)`)
        }
    })
    .on('error', (error) => {
        Logger.error(error.stack)
    })
}

contract.startListenRes = function() {
    this.contract.events.resEvent()
    .on('data', async (result) => {
        const proxy = result.returnValues.proxy
        if (proxy !== crypto.verifyPK) { return }

        const reqID = result.returnValues.reqID
        const userReq = await UserReq.findOne({"requestWarrant.reqID": reqID})
        const bank = Bank.find(bank => bank.pk === userReq.pk)


        Logger.log(`Get Proxy Response from blockchain.(${reqID.substr(0,40)}...)`)
        const shareIDList = await contract.retreiveShareIDList(reqID)
        const files = []
        for (shareID of shareIDList) {
            const resID = shareID + reqID
            const {res, data} = await contract.retrieveRes(resID)
            const shareWarrant = new ShareWarrant(res.dataOwner,
                                                data.dataHash,
                                                "",
                                                res.proxy,
                                                res.shareValidtime,
                                                res.nonce,
                                                res.shareID,
                                                "")
            const v1 = shareWarrant.checkID()
            const encFile = await ipfs.get(data.ipfsHash)     
            const v2 = crypto.hash(encFile) === shareWarrant.dataHash
            

            Logger.log(`[File${files.length+1}]
                        Check shareID:${v1},
                        Check data hash: ${v2}`)
            files.push({shareWarrant, encFile})
        }

        Logger.log(`Total files: ${files.length}(${reqID.substr(0,40)}...)`)
        if (files.length !== 0 ) {
            Tracker.remove(reqID)
            const sendTime = Date.now()
            const text = JSON.stringify(files) + reqID + sendTime
            const unionSign = crypto.eccSign(text)
    
            Logger.log(`Send all response file to ${bank.name}.`)
            axios({
                method: 'post',
                url: `${bank.url}/response-file`,
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                data: {reqID, files, sendTime, unionSign}
            })
            .then(response => Logger.log(response.data))
            .catch(error => Logger.error(error.stack))
        } else {
            console.log(`Send no file to ${bank.name}.`)  
            axios.post(`${bank.url}/response-file`, {reqID})
            .then(response => Logger.log(response.data))
            .catch(error => Logger.error(error.stack))
        }
    }) 
    .on('error', (error) => {
        Logger.error(error.stack)
    })
}

module.exports = contract