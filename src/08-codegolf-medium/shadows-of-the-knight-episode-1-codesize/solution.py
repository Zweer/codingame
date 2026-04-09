w,h=map(int,input().split());input();x,y=map(int,input().split());a,b,c,d=0,0,w-1,h-1
while 1:
 s=input()
 if"U"in s:d=y-1
 if"D"in s:b=y+1
 if"L"in s:c=x-1
 if"R"in s:a=x+1
 x=(a+c)//2;y=(b+d)//2;print(x,y)