const crypto = require('crypto')
const fs = require('fs')
const config = require('./config')

class Crypto  {
    constructor() {
        try {
            this.aesKey = Buffer.from(fs.readFileSync('./key/aes', 'utf8'), 'hex')
            this.iv = Buffer.from(config.SECRET, 'hex')

            this.encryptPK = crypto.createPublicKey({
                'key': fs.readFileSync('./key/rsa.pub', 'utf8'),
                'type': 'spki',
                'format': 'pem',
            })

            this.decryptSK = crypto.createPrivateKey({
                'key': fs.readFileSync('./key/rsa', 'utf8'),
                'type': 'pkcs8',
                'format': 'pem',
                'cipher': 'aes-256-cbc',
                'passphrase': config.SECRET
            })

            this.verifyPK = crypto.createPublicKey({
                'key': fs.readFileSync('./key/ecc.pub', 'utf8'),
                'type': 'spki',
                'format': 'pem',
            })

            this.signSK = crypto.createPrivateKey({
                'key': fs.readFileSync('./key/ecc', 'utf8'),
                'type': 'pkcs8',
                'format': 'pem',
                'cipher': 'aes-256-cbc',
                'passphrase': config.SECRET
            })
        } catch(e) {
            let dir = './key'
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir)
            }
            console.log("Load key fail!")
        }
        
    }

    generateAll() {
        this.generateRSA()
        this.generateECC()
        this.generateAES()
    }

    generateRSA() {
        crypto.generateKeyPair('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
              type: 'spki',
              format: 'pem'
            },
            privateKeyEncoding: {
              type: 'pkcs8',
              format: 'pem',
              cipher: 'aes-256-cbc',
              passphrase: config.SECRET
            }
        }, (err, publicKey, privateKey) => {
            fs.writeFile('./key/rsa.pub', publicKey, function (err) {
                if (err)
                    console.log(err)
                else
                    console.log('Write RSA PK complete.')
            })

            fs.writeFile('./key/rsa', privateKey, function (err) {
                if (err)
                    console.log(err)
                else
                    console.log('Write RSA SK complete.')
            })
        })
    }

    generateECC() {
        crypto.generateKeyPair('ec', {
            namedCurve: 'secp256k1',
            publicKeyEncoding: {
              type: 'spki',
              format: 'pem'
            },
            privateKeyEncoding: {
              type: 'pkcs8',
              format: 'pem',
              cipher: 'aes-256-cbc',
              passphrase: config.SECRET
            }
        }, (err, publicKey, privateKey) => {
            fs.writeFile('./key/ecc.pub', publicKey, function (err) {
                if (err)
                    console.log(err)
                else
                    console.log('Write ECC PK complete.')
            })
            fs.writeFile('./key/ecc', privateKey, function (err) {
                if (err)
                    console.log(err)
                else
                    console.log('Write ECC SK complete.')
            })
        })
    }

    generateAES() {
        const privateKey = crypto.randomBytes(32).toString('hex')        
        fs.writeFile('./key/aes', privateKey, function (err) {
            if (err)
                console.log(err)
            else
                console.log('Write AES key complete.')
        })
    }
    
    aesEnc(text) {
        let cipher = crypto.createCipheriv('aes-256-cbc', this.aesKey, this.iv)
        let encrypted = cipher.update(text, 'utf8', 'hex')
        encrypted += cipher.final('hex')
        return encrypted
    }

    aesDec(text) {
        let decipher = crypto.createDecipheriv('aes-256-cbc', this.aesKey, this.iv)
        let decrypted = decipher.update(text, 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        return decrypted
    }

    rsaEnc(text) {
        return crypto.publicEncrypt(this.encryptPK, Buffer.from(text, 'utf-8')).toString('hex')
    }

    rsaDec(text) {
        return crypto.privateDecrypt(this.decryptSK, Buffer.from(text, 'hex')).toString('utf-8')
    }

    sign(text) {
        const s = crypto.createSign('SHA256')
        s.end(text)
        const signature = s.sign(this.signSK, 'hex')
        return signature
    }
    
    verify(text, signature) {
        const v = crypto.createVerify('SHA256')
        v.end(text)
        return v.verify(this.verifyPK, signature, 'hex')
    }

    hash(text) {
        const h = crypto.createHash('sha256')
        h.end(text)
        return h.digest('hex')
    }
    
}

module.exports = Crypto