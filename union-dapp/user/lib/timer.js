const fs = require('fs')

class Timer {
    writeTime(filename, reqID, time) {
        const text = reqID + ","+ time + "\n"
        fs.appendFileSync(filename, text)
    }
}

module.exports = Timer