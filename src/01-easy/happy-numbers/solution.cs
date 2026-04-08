using System;
using System.Collections.Generic;
using System.Linq;
class Solution {
    static int Dss(int n){int s=0;while(n>0){int d=n%10;s+=d*d;n/=10;}return s;}
    static void Main(){
        int n=int.Parse(Console.ReadLine());
        while(n-->0){
            string s=Console.ReadLine().Trim();
            int x=s.Sum(c=>(c-'0')*(c-'0'));
            var seen=new HashSet<int>();
            while(x!=1&&seen.Add(x)) x=Dss(x);
            Console.WriteLine($"{s} {(x==1?":)":":(")}" );
        }
    }
}
