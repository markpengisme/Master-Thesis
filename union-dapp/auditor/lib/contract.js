const Web3 = require("web3")
const fs = require('fs')
const config = require('./config')

class Contract {
    constructor() {
        this.ADDRESS = config.ADDRESS
        this.PROVIDER = config.PROVIDER
        this.CONTRACT_ADDRESS = config.CONTRACT_ADDRESS
        this.CONTRACT_PATH = config.CONTRACT_PATH
        this.provider = new Web3.providers.WebsocketProvider(this.PROVIDER)
        this.web3 = new Web3(this.provider)
        this.artifact = JSON.parse(fs.readFileSync(this.CONTRACT_PATH, 'utf8'));
        this.contract = new this.web3.eth.Contract(this.artifact.abi, this.CONTRACT_ADDRESS); 
    }

    async proxyRequest(reqID, dataOwner, proxy, reqValidtime, nonce) {
        let req = await this.contract.methods.proxyRequest(reqID, dataOwner, proxy, reqValidtime, nonce).send({from: this.ADDRESS})
        // console.log(req)
        return req
    }

    async proxyResponse (shareID, reqID, dataOwner, dataHash, proxy, shareValidtime, nonce, ipfsHash) {
        let res = await this.contract.methods.proxyResponse(shareID, reqID, dataOwner, dataHash, proxy, shareValidtime, nonce, ipfsHash).send({from: this.ADDRESS})
        // console.log(res)
        return res
    }

    async retrieveReq(reqID) {
        let req = await this.contract.methods.retrieveReq(reqID).call({from: this.ADDRESS})
        // console.log(req)
        return req
    }

    async retrieveRes(shareID) {
        let res = await this.contract.methods.retrieveRes(shareID).call({from: this.ADDRESS})
        let data = await this.contract.methods.retrieveData(shareID).call({from: this.ADDRESS})
        // console.log(res, data)
        return {res, data}
    }
}

module.exports = Contract
