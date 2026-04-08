using System;
class Solution{static void Main(){
    int n=int.Parse(Console.ReadLine()),l=int.Parse(Console.ReadLine());
    var g=new string[n,n];for(int i=0;i<n;i++){var r=Console.ReadLine().Split(' ');for(int j=0;j<n;j++)g[i,j]=r[j];}
    int d=0;
    for(int r=0;r<n;r++)for(int c=0;c<n;c++){bool lit=false;
        for(int r2=0;r2<n&&!lit;r2++)for(int c2=0;c2<n&&!lit;c2++)
            if(g[r2,c2]=="C"&&Math.Max(Math.Abs(r-r2),Math.Abs(c-c2))<l)lit=true;
        if(!lit)d++;}
    Console.WriteLine(d);
}}
