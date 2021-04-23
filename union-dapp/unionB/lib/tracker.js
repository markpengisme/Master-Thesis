const fs = require('fs')

class Tracker {
    static TX = new Map()
    static Counter = {}
    static task = []

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

    static increament(reqID) {
        if (this.Counter[reqID] === undefined) {
            this.Counter[reqID] = 1
        } else {
            this.Counter[reqID] += 1
        }
    }
    
    static proxyEnqueue(proxyRes) {
        this.task.push(proxyRes)
    }

    static proxyDequeue() {
        return this.task.shift()
    }
    
}

module.exports = Tracker