n=int(input());X=[];Y=[]
for _ in[0]*n:x,y=map(int,input().split());X+=[x];Y+=[y]
Y.sort();m=Y[n//2];print(max(X)-min(X)+sum(abs(y-m)for y in Y))