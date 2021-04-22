const Crypto = require("../lib/crypto")
const crypto = new Crypto();

class ShareWarrant {

    constructor(dataOwner="", dataHash="", authorized="", proxy="", shareValidtime="", nonce="", shareID="", userSign="") {
        this.dataOwner = dataOwner
        this.dataHash = dataHash
        this.authorized = authorized
        this.proxy = proxy
        this.shareValidtime = shareValidtime
        this.nonce = nonce
        this.shareID = shareID
        this.userSign = userSign
    }

    userCreate(encFile, authorized, proxy) {
        this.dataOwner = crypto.verifyPK
        this.dataHash = crypto.hash(encFile)
        this.authorized = authorized
        this.proxy = proxy
        this.shareValidtime = String(Date.now() + 365 * 86400 * 1000)
        this.nonce = crypto.nonce()
        this.shareID = crypto.eccSign(
            this.dataOwner +
            this.dataHash +
            this.proxy +
            this.shareValidtime+
            this.nonce
        )
        this.userSign = crypto.eccSign(
            this.shareID+
            this.authorized
        )
    }

    checkID() {
        const shareID = this.dataOwner +
                        this.dataHash +
                        this.proxy +
                        this.shareValidtime+
                        this.nonce
        const result = crypto.eccVerify(shareID, this.shareID, this.dataOwner)
        return result
    }

    checkUserSign() {
        const userSign = this.shareID + this.authorized
        const result = crypto.eccVerify(userSign, this.userSign, this.dataOwner)
        return result
    }
    
    checkWarrant() {
        try{
            const r1 = this.checkID()
            const r2 = this.checkUserSign()
            return r1 && r2
        } catch(e) {
            console.log(e)
            return false
        }
    }
}

module.exports = ShareWarrant