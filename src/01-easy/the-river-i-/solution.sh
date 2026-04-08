#!/bin/bash
read r1; read r2
while (( r1 != r2 )); do
  if (( r1 < r2 )); then
    n=$r1; s=0; while (( n > 0 )); do (( s += n % 10, n /= 10 )); done; (( r1 += s ))
  else
    n=$r2; s=0; while (( n > 0 )); do (( s += n % 10, n /= 10 )); done; (( r2 += s ))
  fi
done
echo $r1
