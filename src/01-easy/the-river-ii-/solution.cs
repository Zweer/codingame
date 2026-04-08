using System;
class Solution {
    static int Ds(long n){int s=0;while(n>0){s+=(int)(n%10);n/=10;}return s;}
    static void Main(){
        long r=long.Parse(Console.ReadLine());
        long lo=Math.Max(1,r-45);
        for(long x=lo;x<r;x++)if(x+Ds(x)==r){Console.WriteLine("YES");return;}
        Console.WriteLine("NO");
    }
}
