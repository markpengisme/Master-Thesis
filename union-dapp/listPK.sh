#!/bin/bash

dir=$(ls -d */ | awk '$1=$1' RS="/\n" ORS=" ")

for d in $dir
do
    pub=$(cat ${d}/key/ecc.pub)
    printf "[$d/key/ecc.pub]\n"${pub}"\n\n"
done