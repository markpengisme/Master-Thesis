require('dotenv').config()

const config = {
    NAME: process.env.NAME,
    IP: process.env.IP || "127.0.0.1",
    PORT: process.env.PORT || 3001,
    SECRET: process.env.SECRET,
    IV: process.env.IV,
}

module.exports = config