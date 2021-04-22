const Crypto = require("../lib/crypto")
const crypto = new Crypto();

class RequestWarrant {

    constructor(dataOwner="", authorized="", proxy="", reqValidtime="", nonce="", reqID="", userSign="") {
        this.dataOwner = dataOwner
        this.authorized = authorized
        this.proxy = proxy
        this.reqValidtime = reqValidtime
        this.nonce = nonce
        this.reqID = reqID
        this.userSign = userSign
    }

    userCreate(authorized, proxy) {
        this.dataOwner = crypto.verifyPK
        this.authorized = authorized
        this.proxy = proxy
        this.reqValidtime = String(Date.now() + 5 * 60 * 1000)
        this.nonce = crypto.nonce()
        this.reqID = crypto.eccSign(
            this.dataOwner +
            this.proxy +
            this.reqValidtime+
            this.nonce
        )
        this.userSign = crypto.eccSign(
            this.reqID+
            this.authorized
        )
    }

    checkID() {
        const reqID = this.dataOwner +
                      this.proxy +
                      this.reqValidtime +
                      this.nonce
        const result = crypto.eccVerify(reqID, this.reqID, this.dataOwner)
        return result
    }
    checkUserSign() {
        const userSign = this.reqID + this.authorized
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

module.exports = RequestWarrant