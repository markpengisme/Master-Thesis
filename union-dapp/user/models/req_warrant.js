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

    checkWarrant() {
        try{
            const reqID = this.dataOwner +
                          this.proxy +
                          this.reqValidtime +
                          this.nonce
            const userSign = this.reqID+
                             this.authorized
            const r1 = crypto.eccVerify(reqID, this.reqID, this.dataOwner)
            const r2 = crypto.eccVerify(userSign, this.userSign, this.dataOwner)
            return r1 && r2
        } catch(e) {
            console.log(e)
            return false
        }
    }
}

module.exports = RequestWarrant