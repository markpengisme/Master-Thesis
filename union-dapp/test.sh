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
            "bankUrl": "http://localhost:4001",
            "bankPK": "3056301006072a8648ce3d020106052b8104000a03420004863e61f8170aebc12f0c1506acec50ffb4f7c6b57a1df7f36d36d1e8c7e7dc696c0c606ce66486eca7adb4829d60db110ea6b474e6a28e51f1fa6a641dc58302",
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



