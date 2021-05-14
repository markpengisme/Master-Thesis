require('dotenv').config()
const fs = require('fs')
const unionData = fs.readFileSync('.union.env');
const union = JSON.parse(unionData).union

const config = {
    NAME: process.env.NAME,
    PORT: process.env.PORT || 3000,
    MONGODB_URI: process.env.MONGODB_URI,
    ADDRESS: process.env.ADDRESS,
    PROVIDER: process.env.PROVIDER,
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
    CONTRACT_PATH: process.env.CONTRACT_PATH,
    SECRET: process.env.SECRET,
    IV: process.env.IV,
    IPFS_API: process.env.IPFS_API,
    UNION: union
}

module.exports = config