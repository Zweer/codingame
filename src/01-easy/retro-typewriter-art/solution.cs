using System;
using System.Collections.Generic;
class Solution {
    static void Main(){
        var ab=new Dictionary<string,char>{{"sp",' '},{"bS",'\\'},{"sQ",'\''},{"nl",'\n'}};
        var line=Console.ReadLine();
        var sb=new System.Text.StringBuilder();
        foreach(var tok in line.Split(' ')){
            char ch; string num;
            var l2=tok.Length>=2?tok.Substring(tok.Length-2):"";
            if(ab.ContainsKey(l2)){ch=ab[l2];num=tok.Substring(0,tok.Length-2);}
            else{ch=tok[tok.Length-1];num=tok.Substring(0,tok.Length-1);}
            int n=num.Length>0?int.Parse(num):1;
            sb.Append(new string(ch,Math.Max(1,n)));
        }
        Console.WriteLine(sb);
    }
}
