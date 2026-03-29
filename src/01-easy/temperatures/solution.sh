#!/bin/bash
read n
read -a temps
if (( n == 0 )); then
    echo 0
else
    closest=${temps[0]}
    for t in "${temps[@]}"; do
        abs_t=${t#-}
        abs_c=${closest#-}
        if (( abs_t < abs_c )) || (( abs_t == abs_c && t > 0 )); then
            closest=$t
        fi
    done
    echo "$closest"
fi
