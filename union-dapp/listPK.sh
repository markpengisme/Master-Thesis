#!/bin/bash

dir=$(ls -d */ | awk '$1=$1' RS="/\n" ORS=" ")

for d in $dir
do
    pub=$(cat ${d}/key/ecc.pub)
    port=$(cat ${d}/.env | grep PORT | cut -d '"' -f 2)
    echo "{"
    echo "\"name\": \"$d\","
    echo "\"pk\": \"$pub\","
    echo "\"url\": \"http://localhost:$port\""
    echo "},"
    echo ""
done