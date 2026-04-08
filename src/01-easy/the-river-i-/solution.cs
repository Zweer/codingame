using System;
class Solution {
    static int Ds(long n){int s=0;while(n>0){s+=(int)(n%10);n/=10;}return s;}
    static void Main(){
        long r1=long.Parse(Console.ReadLine()),r2=long.Parse(Console.ReadLine());
        while(r1!=r2){if(r1<r2)r1+=Ds(r1);else r2+=Ds(r2);}
        Console.WriteLine(r1);
    }
}
