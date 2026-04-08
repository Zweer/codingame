#!/bin/bash
read r1
ds() { local n=$1 s=0; while [ $n -gt 0 ]; do s=$((s+n%10)); n=$((n/10)); done; echo $s; }
res=NO
lo=$((r1>45?r1-45:1))
for ((x=lo;x<r1;x++)); do
  if [ $((x+$(ds $x))) -eq $r1 ]; then res=YES; break; fi
done
echo $res
