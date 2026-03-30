a,b,x,y=map(int,input().split())
while 1:input();v=(y>b)-(y<b);h=(x>a)-(x<a);y-=v;x-=h;print((" NS"[v]+" WE"[h]).strip())