require('dotenv').config()

const config = {
    PORT: process.env.PORT || 3001,
    SECRET: process.env.SECRET,
    IV: process.env.IV,
}

module.exports = config