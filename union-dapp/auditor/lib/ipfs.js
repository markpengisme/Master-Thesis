const ipfsClient = require('ipfs-http-client')
const config = require('./config')

class IPFS {
    constructor() {
        this.ipfs = ipfsClient(config.IPFS_API)
    }

    async add(data) {
        return await this.ipfs.add(data)
    }

    async get(cid) {
        const content = []
        if (cid) {
            for await (const file of this.ipfs.get(cid)) {
                if (file.content){
                    for await (const chunk of file.content) {
                        content.push(chunk)
                    }
                }
            }  
        }  
        return content.join('')
    }
}

module.exports = IPFS