#!/bin/bash

## ipfs nodes
if [ "$1" = "ipfs" ]; then
    cd network/ipfs
    ./ipfs.sh
## quorum nodes
elif [ "$1" = "bc" ]; then
    cd network/5-nodes-istanbul-bash
    ./start.sh
## server
else
    ## user server
    cd ./union-dapp/user
    npm run dev >> .log &
    ## union server
    if [ -z "$1" ]; then
        ua=1
    else
        ua=$1
    fi
    if [ -z "$2" ]; then
        ub=1
    else
        ub=$2
    fi
    if [ -z "$3" ]; then
        uc=1
    else
        uc=$3
    fi
    if [ -z "$4" ]; then
        ud=1
    else
        ud=$4
    fi
    cd ../unionA
    BANKNUM=$ua npm run dev >> .log &
    cd ../unionB
    BANKNUM=$ub npm run dev >> .log &
    cd ../unionC
    BANKNUM=$uc npm run dev >> .log &
    cd ../unionD
    BANKNUM=$ud npm run dev >> .log &
    
    cd ../
    ua=$(($ua+100))
    ub=$(($ub+200))
    uc=$(($uc+300))
    ud=$(($ud+400))

    ## bank server
    for ((i=100; i<$ua; i++));
    do
        cd bank$i
        npm run dev >> .log &
        cd ..
    done
    for ((i=200; i<$ub; i++));
    do
        cd bank$i
        npm run dev >> .log &
        cd ..
    done
    for ((i=300; i<$uc; i++));
    do
        cd bank$i
        npm run dev >> .log &
        cd ..
    done
    for ((i=400; i<$ud; i++));
    do
        cd bank$i
        npm run dev >> .log &
        cd ..
    done
fi
