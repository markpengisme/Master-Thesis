const { timeStamp } = require('console')
const fs = require('fs')

class Tracker {
    static TX = new Map()
    static resCounter = {}
    static resDatas = {}

    static writeTime(filename, reqID, time) {
        const text = reqID + ","+ time + "\n"
        fs.appendFileSync(filename, text)
    }

    static add(reqID) {
        this.TX.set(reqID, Date.now())
    }

    static remove(reqID) {
        this.TX.delete(reqID)
    }

    static increamentCounter(reqID) {
        if (this.resCounter[reqID] === undefined) {
            this.resCounter[reqID] = 1
        } else {
            this.resCounter[reqID] += 1
        }
        return this.resCounter[reqID]
    }
    static addResDatas(reqID, resData) {
        if (this.resDatas[reqID] === undefined) {
            this.resDatas[reqID] = [resData]
        } else {
            this.resDatas[reqID].push(resData)
        }
    } 
}

module.exports = Tracker