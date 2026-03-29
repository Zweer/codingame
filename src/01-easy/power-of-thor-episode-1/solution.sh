#!/bin/bash
read LX LY TX TY
while true; do
    read E
    dir=""
    if (( TY > LY )); then dir+="N"; ((TY--)); fi
    if (( TY < LY )); then dir+="S"; ((TY++)); fi
    if (( TX > LX )); then dir+="W"; ((TX--)); fi
    if (( TX < LX )); then dir+="E"; ((TX++)); fi
    echo "$dir"
done
