require('dotenv').config()
const fs = require('fs')
const bankData = fs.readFileSync('.bank.env');
const bankNum = process.env.BANKNUM
console.log("Number of banks be serviced:", bankNum)
const bank = JSON.parse(bankData).bank.slice(0, bankNum)

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
    BANK: bank.slice(0, bankNum)
}

module.exports = config