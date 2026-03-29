#!/bin/bash
read n
if (( n == 0 )); then echo 0; exit; fi
read -a t
r=${t[0]}
for v in "${t[@]}"; do
    av=${v#-}; ar=${r#-}
    if (( av < ar || (av == ar && v > 0) )); then r=$v; fi
done
echo "$r"
