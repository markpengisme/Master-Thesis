#!/bin/bash

## user send share warrant to 40 banks
for ((i=1; i<81; i++));
do
    cd bank$i
    bankName=$(cat .env | grep NAME | cut -d '"' -f 2)
    bankPK=$(cat key/ecc.pub)
    bankUrl="http://localhost:"$(cat .env | grep PORT | cut -d '"' -f 2)
    unionPK=$(cat .env | grep unionPK | cut -d '"' -f 2)
    rawData="Hello World(from:$bankName)"

    curl -X POST http://localhost:3001/share-warrant \
    -H "Content-Type: application/json" \
    -d "{ 
        \"bankName\": \"$bankName\",
        \"bankPK\": \"$bankPK\",
        \"bankUrl\": \"$bankUrl\",
        \"unionPK\": \"$unionPK\",
        \"rawData\": \"$rawData\"
    }"
    cd ..
    echo ""
    sleep 1
done

