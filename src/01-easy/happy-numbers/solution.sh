#!/bin/bash
read n
for ((i=0;i<n;i++)); do
    read s
    x=0; for ((j=0;j<${#s};j++)); do d=${s:j:1}; ((x+=d*d)); done
    declare -A seen=()
    while [ "$x" -ne 1 ] && [ -z "${seen[$x]}" ]; do
        seen[$x]=1; t=0
        while [ "$x" -gt 0 ]; do ((d=x%10,t+=d*d,x/=10)); done
        x=$t
    done
    unset seen
    [ "$x" -eq 1 ] && echo "$s :)" || echo "$s :("
done
