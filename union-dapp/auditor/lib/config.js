require('dotenv').config()

const config = {
    PORT: process.env.PORT || 3000,
    UNION_PK: process.env.UNION_PK,
    PROVIDER: process.env.PROVIDER,
    CONTRACT_ADDRESS: process.env.CONTRACT_ADDRESS,
    CONTRACT_PATH: process.env.CONTRACT_PATH,
    SECRET: process.env.SECRET,
    IV: process.env.IV,
    IPFS_API: process.env.IPFS_API
}

module.exports = config