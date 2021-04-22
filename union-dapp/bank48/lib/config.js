require('dotenv').config()

const config = {
    NAME: process.env.NAME,
    PORT: process.env.PORT || 4001,
    MONGODB_URI: process.env.MONGODB_URI,
    SECRET: process.env.SECRET,
    IV: process.env.IV,
    userUrl: process.env.userUrl,
    unionUrl: process.env.unionUrl,
    unionPK: process.env.unionPK
}

module.exports = config