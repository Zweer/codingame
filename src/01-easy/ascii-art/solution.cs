using System;
class Solution {
    static void Main(){
        int L=int.Parse(Console.ReadLine()),H=int.Parse(Console.ReadLine());
        string T=Console.ReadLine().ToUpper();
        string[] rows=new string[H];
        for(int i=0;i<H;i++)rows[i]=Console.ReadLine();
        for(int i=0;i<H;i++){
            string line="";
            foreach(char c in T){
                int idx=c-'A';if(idx<0||idx>25)idx=26;
                line+=rows[i].Substring(idx*L,L);
            }
            Console.WriteLine(line);
        }
    }
}
