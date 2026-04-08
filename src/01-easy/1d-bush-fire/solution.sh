#!/bin/bash
read n
for ((i=0;i<n;i++)); do
    read s; d=0; j=0
    while [ $j -lt ${#s} ]; do
        if [ "${s:j:1}" = "f" ]; then ((d++)); ((j+=3)); else ((j++)); fi
    done
    echo $d
done
