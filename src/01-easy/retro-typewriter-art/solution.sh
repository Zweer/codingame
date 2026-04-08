#!/bin/bash
read -r line
out=""
for tok in $line; do
    l=${#tok}
    l2="${tok:l-2:2}"
    case "$l2" in
        sp) ch=" "; num="${tok:0:l-2}" ;;
        bS) ch='\\'; num="${tok:0:l-2}" ;;
        sQ) ch="'"; num="${tok:0:l-2}" ;;
        nl) ch=$'\n'; num="${tok:0:l-2}" ;;
        *) ch="${tok:l-1:1}"; num="${tok:0:l-1}" ;;
    esac
    [ -z "$num" ] && num=1
    for ((i=0;i<num;i++)); do out+="$ch"; done
done
printf '%s\n' "$out"
