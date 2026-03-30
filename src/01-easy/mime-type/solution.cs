using System;
using System.Collections.Generic;
class Solution {
    static void Main() {
        int n = int.Parse(Console.ReadLine());
        int q = int.Parse(Console.ReadLine());
        var m = new Dictionary<string,string>();
        for (int i = 0; i < n; i++) {
            var p = Console.ReadLine().Split(' ');
            m[p[0].ToLower()] = p[1];
        }
        for (int i = 0; i < q; i++) {
            var f = Console.ReadLine();
            int dot = f.LastIndexOf('.');
            if (dot == -1) { Console.WriteLine("UNKNOWN"); continue; }
            var ext = f.Substring(dot + 1).ToLower();
            Console.WriteLine(m.ContainsKey(ext) ? m[ext] : "UNKNOWN");
        }
    }
}
