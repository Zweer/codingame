#!/bin/bash
C="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"
read w h
declare -a g
for ((i=0;i<h;i++)); do read g[$i]; done
declare -A d
sr=0; sc=0
for ((r=0;r<h;r++)); do for ((c=0;c<w;c++)); do
    ch="${g[$r]:c:1}"
    d[$r,$c]=-1
    [ "$ch" = "S" ] && sr=$r && sc=$c
done; done
d[$sr,$sc]=0
qr=($sr); qc=($sc); qi=0
while [ $qi -lt ${#qr[@]} ]; do
    r=${qr[$qi]}; c=${qc[$qi]}; ((qi++))
    for dir in "0 1" "0 -1" "1 0" "-1 0"; do
        read dr dc <<< "$dir"
        nr=$(( (r+dr+h)%h )); nc=$(( (c+dc+w)%w ))
        ch="${g[$nr]:nc:1}"
        if [ "$ch" != "#" ] && [ "${d[$nr,$nc]}" = "-1" ]; then
            d[$nr,$nc]=$(( d[$r,$c]+1 ))
            qr+=($nr); qc+=($nc)
        fi
    done
done
for ((r=0;r<h;r++)); do
    line=""
    for ((c=0;c<w;c++)); do
        ch="${g[$r]:c:1}"
        if [ "$ch" = "#" ]; then line+="#"
        elif [ "${d[$r,$c]}" = "-1" ]; then line+="."
        else line+="${C:${d[$r,$c]}:1}"; fi
    done
    echo "$line"
done
