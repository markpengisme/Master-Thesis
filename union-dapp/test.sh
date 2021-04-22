#!/bin/bash
if [ -z "$1" ]; then
    t=0
else
    t=$1
fi

if [ -z "$2" ]; then
    n=100
else
    n=$2
fi


echo "interval $t sec, $n times"

echo -n  > ./user/record/start.csv
echo -n  > ./user/record/end.csv
for ((i=0; i<$n; i++));
do  
    curl -X POST http://localhost:3001/request-warrant \
    -H "Content-Type: application/json" \
    -d '{ 
            "bankName": "bank1",
            "bankPK": "3056301006072a8648ce3d020106052b8104000a034200043f7e77a1ef39b79db54539f8cc406bec080fa23b3101a262c4beea2e7a8b882659b01c70c646ac0ed3dd91c2e89db48cabf2df439993e86da59e9ba637a51c5d",
            "bankUrl": "http://localhost:4001",
            "unionPK": "3056301006072a8648ce3d020106052b8104000a034200042b8e46ce5f1601ef349d59966ab36fc29c72f540034ce36c729aa08420a643138abea8ef2a7701f6650873695324344039377c645f398f306018f1e234a6ac45"
        }'
    sleep $t
done

sleep 60;before=0

while true
do
    after=$(cat ./user/record/end.csv | wc -l)
    echo $before $after
    if [ $before -eq $after ]; then
       break
    else
        before=$after
        sleep 30
    fi
done

python ./user/record/cal_avg.py



