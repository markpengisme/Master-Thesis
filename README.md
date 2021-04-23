# Double-Blind-KYC-Data-Sharing-on-Blockchain

## Todo

- Scale experiment(5kb)
    - `2222`
    - `3333` vs `6222`
    - `4444` vs `10222`
    - `5555` vs `14222`
    - `6666` vs `18222`
    - `7777` vs `22222`
    - `8888` vs `26222`
    - `9999` vs `30222`
    - `10101010` vs`34222`

    ```txt
    [Statistics - 2222]
    Total request 100 times, and 29.73 seconds per request.
    Each request takes an average of 20.75 seconds to process.
    Lost 0 request(s) in total
    ```

- auditor features

## 變數名稱

- requestWarrant
    - dataOwner
    - authorized
    - proxy
    - reqValidtime
    - nonce
    - reqID
    - userSign
- shareWarrant
    - dataOwner
    - dataHash
    - authorized
    - proxy
    - shareValidtime
    - nonce
    - shareID
    - userSign
- sendTime
- bankSign
- unionSign
- bankUrl
- unionUrl
- bankPK
- unionPK

## 單位

- XXXX(http server port / quorum websockets port / ipfs api port)
- user:3001
- bank1:4001
- bank2:4002
- bank3:4003
- audior:5000/23000/7000
- unionA: 5001/23001/7001
- unionB: 5002/23002/7002

## Debug

- Error: ENFILE: file table overflow
    - Reason: MAC default setting too low.
    - Solution：`sudo sysctl -w kern.maxfiles=65536`, `sudo sysctl -w kern.maxfilesperproc=65536`
- Error: replacement transaction underpriced
    - Reason: Send too fast, so nonce repeat.
    - Solution1: Now temporarily use the queue to process transactions
    - Solution2: Try to change to batch transactions in the future

- Error: out of gas
    - Reason: quorum([ref](https://github.com/ConsenSys/quorum/issues/1081))
    - Solution: Specify a high gaslimit`send({from: ADDRESS , gas: GASLIMIT}`)

## cheat sheets

- generate bank

```sh
for ((i=2; i<71; i++));
do
    cp -r bank1 bank$i
done

```

- generate bank key

```sh
for ((i=0; i<71; i++));
do
    cd bank$i
    node -e 'const Crypto = require("./lib/crypto");const crypto = new Crypto();crypto.generateAll();'
    cd ..
done
```

- reinstall bank npm pkg

```sh
for ((i=1; i<71; i++));
do
    cd bank$i
    rm package-lock.json
    rm -rf node_modules
    npm install 
    cd ..
done
```

- create accounts(truffle consile)

```js
(async () => {for (var i = 0; i < 99; i++) {console.log(i);await web3.eth.personal.newAccount()}})()
web3.eth.personal.getAccounts().then(r=>r.length)
```
