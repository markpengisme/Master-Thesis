const crypto = require('crypto')
const fs = require('fs')
const config = require('./config')

class Crypto  {
    constructor() {
        try {
            this.secret = config.SECRET
            this.iv = config.IV
            this.aesKey = fs.readFileSync('./key/aes', 'utf8')
            this.encryptPK = fs.readFileSync('./key/rsa.pub', 'utf8')
            this.decryptSK = fs.readFileSync('./key/rsa', 'utf8')
            this.verifyPK = fs.readFileSync('./key/ecc.pub', 'utf8')
            this.signSK = fs.readFileSync('./key/ecc', 'utf8')
        } catch(e) {
            let dir = './key'
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir)
            }
            console.log("Load key fail!", e)
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
              format: 'der'
            },
            privateKeyEncoding: {
              type: 'pkcs8',
              format: 'der',
              cipher: 'aes-256-cbc',
              passphrase: config.SECRET
            }
        }, (err, publicKey, privateKey) => {
            privateKey = privateKey.toString('hex')
            publicKey = publicKey.toString('hex')
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
              format: 'der'
            },
            privateKeyEncoding: {
              type: 'pkcs8',
              format: 'der',
              cipher: 'aes-256-cbc',
              passphrase: config.SECRET
            }
        }, (err, publicKey, privateKey) => {
            privateKey = privateKey.toString('hex')
            publicKey = publicKey.toString('hex')
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
        let aesKey = Buffer.from(this.aesKey, 'hex')
        let iv = Buffer.from(this.iv, 'hex')
        let cipher = crypto.createCipheriv('aes-256-cbc', aesKey, iv)
        let encrypted = cipher.update(text, 'utf8', 'hex')
        encrypted += cipher.final('hex')
        return encrypted
    }

    aesDec(text) {
        let aesKey = Buffer.from(this.aesKey, 'hex')
        let iv = Buffer.from(this.iv, 'hex')
        let decipher = crypto.createDecipheriv('aes-256-cbc', aesKey, iv)
        let decrypted = decipher.update(text, 'hex', 'utf8')
        decrypted += decipher.final('utf8')
        return decrypted
    }

    rsaEnc(text, encryptPK = this.encryptPK) {
        encryptPK = crypto.createPublicKey({
            'key': Buffer.from(encryptPK, 'hex'),
            'type': 'spki',
            'format': 'der',
        })
        return crypto.publicEncrypt(encryptPK, Buffer.from(text, 'utf-8')).toString('hex')
    }

    rsaDec(text) {
        let decryptSK = Buffer.from(this.decryptSK, 'hex')
        decryptSK = crypto.createPrivateKey({
            'key': Buffer.from(decryptSK, 'hex'),
            'type': 'pkcs8',
            'format': 'der',
            'cipher': 'aes-256-cbc',
            'passphrase': config.SECRET
        })
        return crypto.privateDecrypt(decryptSK, Buffer.from(text, 'hex')).toString('utf-8')
    }

    eccSign(text) {
        let signSK = Buffer.from(this.signSK, 'hex')
        signSK = crypto.createPrivateKey({
            'key': Buffer.from(signSK, 'hex'),
            'type': 'pkcs8',
            'format': 'der',
            'cipher': 'aes-256-cbc',
            'passphrase': config.SECRET
        })
        const s = crypto.createSign('SHA256')
        s.end(text)
        const signature = s.sign(signSK, 'hex')
        return signature
    }
    
    eccVerify(text, signature, verifyPK = this.verifyPK) {
        verifyPK = crypto.createPublicKey({
            'key': Buffer.from(verifyPK, 'hex'),
            'type': 'spki',
            'format': 'der',
        })
        const v = crypto.createVerify('SHA256')
        v.end(text)
        return v.verify(verifyPK, signature, 'hex')
    }

    hash(text) {
        const h = crypto.createHash('sha256')
        h.end(text)
        return h.digest('hex')
    }
    
}

module.exports = Crypto