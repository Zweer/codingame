using System;
class Solution {
    static void Main(){
        int n=int.Parse(Console.ReadLine());
        while(n-->0){
            string s=Console.ReadLine().Trim(); int d=0,j=0;
            while(j<s.Length){if(s[j]=='f'){d++;j+=3;}else j++;}
            Console.WriteLine(d);
        }
    }
}
