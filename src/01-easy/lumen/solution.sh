#!/bin/bash
read n; read l
declare -a g
for ((i=0;i<n;i++)); do read -a row; for ((j=0;j<n;j++)); do g[$((i*n+j))]="${row[$j]}"; done; done
d=0
for ((r=0;r<n;r++)); do for ((c=0;c<n;c++)); do
    lit=0
    for ((r2=0;r2<n;r2++)); do for ((c2=0;c2<n;c2++)); do
        if [ "${g[$((r2*n+c2))]}" = "C" ]; then
            dr=$((r-r2)); [ $dr -lt 0 ] && dr=$((-dr))
            dc=$((c-c2)); [ $dc -lt 0 ] && dc=$((-dc))
            mx=$dr; [ $dc -gt $mx ] && mx=$dc
            [ $mx -lt $l ] && lit=1
        fi
    done; done
    [ $lit -eq 0 ] && ((d++))
done; done
echo $d
