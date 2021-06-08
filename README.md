# Double-Blind-KYC-Data-Sharing-on-Blockchain

## TODO

- todo 1~8 banks experiments
- https test
- react frontend

## var name

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

## Role

(http server port / quorum websockets port / ipfs api port)

- user:3001
- audior:5000/23000/7000
- unionA: 5001/23001/7001
    - bank100:4100
    - ...
- unionB: 5002/23002/7002
    - bank200:4200
    - ...
- unionC: 5003/23003/7003
    - bank300:4300
    - ...
- unionD: 5004/23004/7004
    - bank400:4400
    - ...


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



## Experiment

### 24bytes

- 8: 2/2/2/2

```
[Statistics]
Total request 100 times, and 29.73 seconds per request.
Each request takes an average of 14.79 seconds to process.
Lost 0 request(s) in total
```

- 16: 4/4/4/4

```
[Statistics]
Total request 100 times, and 29.73 seconds per request.
Each request takes an average of 15.01 seconds to process.
Lost 0 request(s) in total
```

- 16: 2/2/2/10

```
[Statistics]
Total request 100 times, and 29.73 seconds per request.
Each request takes an average of 15.71 seconds to process.
Lost 0 request(s) in total
```

- 32: 8/8/8/8

```
[Statistics]
Total request 100 times, and 29.73 seconds per request.
Each request takes an average of 15.01 seconds to process.
Lost 0 request(s) in total
```

- 32: 2/2/2/26

```
[Statistics]
Total request 100 times, and 29.71 seconds per request.
Each request takes an average of 25.17 seconds to process.
Lost 0 request(s) in total
```

- 64: 16/16/16/16

```
[Statistics]
Total request 100 times, and 59.45 seconds per request.
Each request takes an average of 20.04 seconds to process.
Lost 0 request(s) in total
```

- 64: 2/2/2/58

```
[Statistics]
Total request 100 times, and 59.43 seconds per request.
Each request takes an average of 41.08 seconds to process.
Lost 0 request(s) in total
```

- 128: 32/32/32/32

```
[Statistics]
Total request 100 times, and 118.84 seconds per request.
Each request takes an average of 35.69 seconds to process.
Lost 0 request(s) in total
```

- 128: 2/2/2/122

```
[Statistics]
Total request 100 times, and 118.85 seconds per request.
Each request takes an average of 81.69 seconds to process.
Lost 0 request(s) in total
```

### 5mb

- 8: 2/2/2/2

```
[Statistics]
Total request 30 times, and 80.03 seconds per request.
Each request takes an average of 23.37 seconds to process.
Lost 0 request(s) in total
```

- 16: 4/4/4/4

```
[Statistics]
Total request 30 times, and 160.05 seconds per request.
Each request takes an average of 32.57 seconds to process.
Lost 0 request(s) in total
```

- 16: 2/2/2/10

```
[Statistics]
Total request 30 times, and 160.04 seconds per request.
Each request takes an average of 35.99 seconds to process.
Lost 0 request(s) in total
```

- 32: 8/8/8/8

```
[Statistics]
Total request 30 times, and 240.05 seconds per request.
Each request takes an average of 55.14 seconds to process.
Lost 0 request(s) in total
```

- 32: 2/2/2/26

```
[Statistics]
Total request 30 times, and 240.04 seconds per request.
Each request takes an average of 66.69 seconds to process.
Lost 0 request(s) in total
```
