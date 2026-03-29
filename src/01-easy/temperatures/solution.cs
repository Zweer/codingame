using System;
using System.Linq;
class Solution {
    static void Main() {
        int n = int.Parse(Console.ReadLine());
        if (n == 0) { Console.WriteLine(0); return; }
        var t = Console.ReadLine().Split(' ').Select(int.Parse).ToArray();
        int r = t[0];
        foreach (var v in t)
            if (Math.Abs(v) < Math.Abs(r) || (Math.Abs(v) == Math.Abs(r) && v > 0)) r = v;
        Console.WriteLine(r);
    }
}
