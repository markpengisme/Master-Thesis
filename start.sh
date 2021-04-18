#!/bin/bash

## ipfs nodes
cd network/ipfs
./ipfs.sh

## quorum nodes
cd ../../
cd network/4-nodes-istanbul-bash
./start.sh

## user server
cd ../../
cd union-dapp/user
npm run dev >> .log &

## bank server
cd ../bank1
npm run dev >> .log &
cd ../bank2
npm run dev >> .log &
cd ../bank3
npm run dev >> .log &

## union server
cd ../unionA
npm run bank_x1 >> .log &
cd ../unionB
npm run bank_x2 >> .log &