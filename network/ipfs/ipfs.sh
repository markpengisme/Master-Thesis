#!/bin/bash

# $1 = folder name
# $2 = swarm port
# $3 = api port
# $4 = gateway port

## example
if [ "$1" = "eg" ]; then
    echo "./ipfs.sh auditor 6000 7000 8000"
    echo "./ipfs.sh unionA 6001 7001 8001"
    echo "./ipfs.sh unionB 6002 7002 8002"
    exit 0
## init
elif [ "$1" ] && [ "$2" ] && [ "$3" ] && [ "$4" ]; then
    echo $1 $2 $3 $4
    IPFS_PATH=./$1 ipfs init
    cp swarm.key ./$1
    sed -i '' "s/4001/${2}/g" ./$1/config
    sed -i '' "s/5001/${3}/g" ./$1/config
    sed -i '' "s/8080/${4}/g" ./$1/config
## bootstrap + start
elif [ "$1" = "bootstrap" ]; then
    killall ipfs
    time sleep 10

    dir=$(ls -d */ | awk '$1=$1' RS="/\n" ORS=" ")
    for d1 in $dir
    do
        IPFS_PATH=./$d1 ipfs bootstrap rm --all
        for d2 in $dir
        do 
            if [ $d1 != $d2 ]; then
                ID=$(IPFS_PATH=./$d2 ipfs id | grep ID | awk '$1=$1' | awk '{split($0, a, "\"")}{print a[4]}')
                PORT=$(IPFS_PATH=./$d2 ipfs config show | grep "/ip4/0.0.0.0/tcp" | sed -e 's/"//g' -e 's/,//g' | awk '$1=$1' | awk '{split($0, a, "\/")}{print a[5]}')
                IPFS_PATH=./$d1 ipfs bootstrap add "/ip4/127.0.0.1/tcp/$PORT/ipfs/$ID"
                time sleep 1
            fi
        done
    done

    for d in $dir
    do
        IPFS_PATH=./$d ipfs daemon &
        time sleep 1
    done

        time sleep 5

    for d in $dir
    do
        echo "$d"
        IPFS_PATH=./$d ipfs stats bitswap
    done
## start
else
    dir=$(ls -d */ | awk '$1=$1' RS="/\n" ORS=" ")
    for d in $dir
    do
        IPFS_PATH=./$d ipfs daemon &
        time sleep 1
    done

        time sleep 15

    for d in $dir
    do
        echo "$d"
        IPFS_PATH=./$d ipfs stats bitswap
    done
fi
