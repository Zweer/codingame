using System;
using System.Linq;
class Solution {
    static void Main() {
        int n = int.Parse(Console.ReadLine());
        int[] h = new int[n];
        for (int i = 0; i < n; i++) h[i] = int.Parse(Console.ReadLine());
        Array.Sort(h);
        int min = h[1] - h[0];
        for (int i = 1; i < n - 1; i++) min = Math.Min(min, h[i+1] - h[i]);
        Console.WriteLine(min);
    }
}
