read MSG
bin=""
for (( i=0; i<${#MSG}; i++ )); do
    printf -v dec '%d' "'${MSG:$i:1}"
    printf -v b '%07d' "$(echo "obase=2;$dec" | bc)"
    bin+="$b"
done
out=""
i=0
while (( i < ${#bin} )); do
    cur=${bin:$i:1}
    count=0
    while (( i < ${#bin} )) && [ "${bin:$i:1}" = "$cur" ]; do
        (( count++ ))
        (( i++ ))
    done
    [ -n "$out" ] && out+=" "
    [ "$cur" = "1" ] && out+="0" || out+="00"
    out+=" "
    for (( j=0; j<count; j++ )); do out+="0"; done
done
echo "$out"
