#!/bin/bash
while true; do
    max=-1; idx=0
    for i in $(seq 0 7); do
        read h
        if (( h > max )); then max=$h; idx=$i; fi
    done
    echo $idx
done
