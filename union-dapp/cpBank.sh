#!/bin/bash

for ((i=$2; i<$3; i++));
do
    echo bank$i
    cp -r bank$1 bank$i
    cd bank$i
    node -e 'const Crypto = require("./lib/crypto");const crypto = new Crypto();crypto.generateAll();'
    sed -i '' "s/NAME=\"Bank$1\"/NAME=\"Bank$i\"/g" .env
    sed -i '' "s/PORT=\"4$1\"/PORT=\"4$i\"/g" .env
    rm -rf ./node_modules
    rm -rf package-lock.json
    npm install &
    cd ..
done

