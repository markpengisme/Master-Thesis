const Web3 = require("web3")
const fs = require('fs')
const config = require('./config')
const Logger = require('./logger')

class Contract {
    constructor() {
        this.ADDRESS = config.ADDRESS
        this.GASLIMIT = 1000000
        this.PROVIDER = config.PROVIDER
        this.CONTRACT_ADDRESS = config.CONTRACT_ADDRESS
        this.CONTRACT_PATH = config.CONTRACT_PATH
        this.provider = new Web3.providers.WebsocketProvider(this.PROVIDER)
        this.web3 = new Web3(this.provider)
        this.artifact = JSON.parse(fs.readFileSync(this.CONTRACT_PATH, 'utf8'));
        this.contract = new this.web3.eth.Contract(this.artifact.abi, this.CONTRACT_ADDRESS); 
    }

    async proxyRequest(reqID, dataOwner, proxy, reqValidtime, nonce) {
        let req = await this.contract.methods.proxyRequest(reqID, dataOwner, proxy, reqValidtime, nonce).send({from: this.ADDRESS , gas: this.GASLIMIT})
        return req
    }

    async proxyResponse (shareID, reqID, dataOwner, dataHash, proxy, shareValidtime, nonce, ipfsHash) {
        let res = await this.contract.methods.proxyResponse(shareID, reqID, dataOwner, dataHash, proxy, shareValidtime, nonce, ipfsHash).send({from: this.ADDRESS , gas: this.GASLIMIT})
        return res
    }

    async proxyResponseEnd (reqID) {
        let res = await this.contract.methods.proxyResponseEnd(reqID).send({from: this.ADDRESS , gas: this.GASLIMIT})
        return res
    }

    async proxyResponses (reqID, resData) {
        // response 10 at most at a time
        // resData type is string[8][] memory
        let res = await this.contract.methods.proxyResponses(reqID, resData).send({from: this.ADDRESS , gas: this.GASLIMIT * 100})
        return res
    }

    async retreiveShareIDList(reqID) {
        let shareIDList = await this.contract.methods.retreiveShareIDList(reqID).call({from: this.ADDRESS })
        return shareIDList
    }
    
    async retrieveReq(reqID) {
        let req = await this.contract.methods.retrieveReq(reqID).call({from: this.ADDRESS })
        return req
    }

    async retrieveRes(resID) {
        let res = await this.contract.methods.retrieveRes(resID).call({from: this.ADDRESS })
        let data = await this.contract.methods.retrieveData(resID).call({from: this.ADDRESS })
        return {res, data}
    }
}

module.exports = Contract
