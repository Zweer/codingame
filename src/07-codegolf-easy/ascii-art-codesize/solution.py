l=int(input());h=int(input());t=input().upper();r=[input()for _ in[0]*h]
for x in r:print("".join(x[([26,ord(c)-65]["@"<c<"["])*l:][:l]for c in t))