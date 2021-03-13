#!/bin/bash

num=$(ls network/*/qdata/dd*/keystore/key | wc -l | awk '$1=$1')

for n in $(seq 1 $num)
do
    ip=$(cat network/*/config.json | \
        grep ip | awk '$1=$1' | sed -n ${n}p)
    wsport=$(cat network/*/config.json | \
        grep wsPort | awk '$1=$1' | sed -n ${n}p)
    key=$(cat network/*/qdata/dd${n}/keystore/key | \
        awk '{split($0, a, "\"")}{print a[2]":0x"a[4]}')
    echo $ip $wsport $key
done