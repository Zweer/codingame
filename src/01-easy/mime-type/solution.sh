#!/bin/bash
read N
read Q
declare -A m
for (( i=0; i<N; i++ )); do
    read ext mt
    m[${ext,,}]=$mt
done
for (( i=0; i<Q; i++ )); do
    read f
    if [[ "$f" == *.* ]]; then
        ext="${f##*.}"
        ext="${ext,,}"
        if [[ -n "${m[$ext]+x}" ]]; then
            echo "${m[$ext]}"
        else
            echo "UNKNOWN"
        fi
    else
        echo "UNKNOWN"
    fi
done
