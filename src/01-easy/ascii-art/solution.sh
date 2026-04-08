#!/bin/bash
read L; read H; read T
T=$(echo "$T" | tr 'a-z' 'A-Z')
ROWS=()
for ((i=0;i<H;i++)); do IFS= read -r line; ROWS+=("$line"); done
for ((i=0;i<H;i++)); do
  out=""
  for ((j=0;j<${#T};j++)); do
    c="${T:$j:1}"
    idx=$(printf '%d' "'$c")
    idx=$((idx-65))
    if [ $idx -lt 0 ] || [ $idx -gt 25 ]; then idx=26; fi
    start=$((idx*L))
    out+="${ROWS[$i]:$start:$L}"
  done
  echo "$out"
done
