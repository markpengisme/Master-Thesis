const axios = require('axios')
const config = require('../lib/config')
const Contract = require('../lib/contract');
const Crypto = require("../lib/crypto")
const IPFS = require("../lib/ipfs")
const Tracker = require("../lib/tracker")
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
        console.log("Get Proxy Request from blockchain.")
        const reqID = result.returnValues.reqID
        if (reqID == "test") { return }// test
        const req = await contract.retrieveReq(reqID)
        const requestWarrant = new RequestWarrant(req.dataOwner,
                                            "",
                                            req.proxy,
                                            req.reqValidtime,
                                            req.nonce,
                                            req.reqID,
                                            "")

        const v1 = requestWarrant.checkID()
        console.log("Check reqID:", v1)
        
        
        Bank.map(bank => {
            console.log(`Send request file to ${bank.name}.`)
            const sendTime = Date.now()
            const unionSign = crypto.eccSign(requestWarrant.reqID + sendTime)
            axios.post(`${bank.url}/request-file`,{requestWarrant, sendTime, unionSign})
            .then( response => {
                console.log(response.data)
            })
            .catch( error => {
                console.log(error);
            })
        });
       
    })
    .on('error', (error) => {
        console.log(error)
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


        console.log("Get Proxy Response from blockchain.")
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

            console.log("Check shareID:", v1)
            console.log("Check data hash:", v2)
            files.push({shareWarrant, encFile})
        }

        console.log("==============files:", files.length,"==============") // test
        if (files.length !== 0 ) {
            Tracker.remove(reqID)
            const sendTime = Date.now()
            const text = JSON.stringify(files) + reqID + sendTime
            const unionSign = crypto.eccSign(text)
    
            console.log(`Send all response file to ${bank.name}.`)
            axios({
                method: 'post',
                url: `${bank.url}/response-file`,
                maxContentLength: Infinity,
                maxBodyLength: Infinity,
                headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' },
                data: {reqID, files, sendTime, unionSign}
            })
            .then( response => {
                console.log(response.data)
            })
            .catch( error => {
                console.error(error);
            })
        } else {
            console.log(`Send no file to ${bank.name}.`)  
            axios.post(`${bank.url}/response-file`, {reqID})
            .then( response => {
                console.log(response.data)
            })
            .catch( error => {
                console.error(error);
            })
        }
    }) 
    .on('error', (error) => {
        console.log(error)
    })
}

module.exports = contract