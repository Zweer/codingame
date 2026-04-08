#!/bin/bash
read w; read h
declare -a g
for ((y=0;y<h;y++)); do read -a g_$y; done
dx=(-1 -1 -1 0 0 1 1 1); dy=(-1 0 1 -1 1 -1 0 1)
for ((y=0;y<h;y++)); do for ((x=0;x<w;x++)); do
    eval "v=\${g_${y}[$x]}"
    if [ "$v" = "0" ]; then
        ok=1
        for ((i=0;i<8;i++)); do
            nx=$((x+dx[i])); ny=$((y+dy[i]))
            if ((nx>=0 && nx<w && ny>=0 && ny<h)); then
                eval "nv=\${g_${ny}[$nx]}"
                [ "$nv" != "1" ] && ok=0
            fi
        done
        [ $ok -eq 1 ] && echo "$x $y" && exit
    fi
done; done
