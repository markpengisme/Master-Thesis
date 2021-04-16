
const Crypto = require('../lib/crypto')
const crypto = new Crypto()

describe('crypto', () => {
  test('AES', async () => {
    randomString = Date()
    cipher = crypto.aesEnc(randomString)
    result = crypto.aesDec(cipher)
    expect(result).toBe(randomString)
  })

  test('RSA', async () => {
    randomString = Date()
    cipher1 = crypto.rsaEnc(randomString)
    cipher2 = crypto.rsaEnc(randomString, crypto.encryptPK)
    result1 = crypto.rsaDec(cipher1)
    result2 = crypto.rsaDec(cipher2)
    expect(result1).toBe(randomString)
    expect(result2).toBe(randomString)
  })

  test('ECC', async () => {
    randomString = Date()
    signature = crypto.eccSign(randomString)
    result1 = crypto.eccVerify(randomString, signature)
    result2 = crypto.eccVerify(randomString, signature, crypto.verifyPK) 
    expect(result1).toBe(true)
    expect(result2).toBe(true)
  })

  test('hash', async () => {
    string = "M10709122"
    expectResult = "f7ed0b51bec49aa01e6a35bb3ec5bff9749c88e630483f6b0bb1f80b2b530cfc"
    result = crypto.hash(string)
    expect(result).toBe(expectResult)
  })
})