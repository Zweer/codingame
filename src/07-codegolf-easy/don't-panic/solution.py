h=input().split();e={h[3]:h[4]}
exec("f,p=input().split();e[f]=p\n"*int(h[7]))
while 1:f,p,d=input().split();t=e.get(f,p);print("WAIT"if f<"0"or(d>"N")==(int(p)<int(t))or p==t else"BLOCK")