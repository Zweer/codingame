using System;
using System.Linq;

class Solution
{
    static void Main(string[] args)
    {
        int N = int.Parse(Console.ReadLine());
        int[] horses = new int[N];
        for (int i = 0; i < N; i++)
            horses[i] = int.Parse(Console.ReadLine());

        Array.Sort(horses);
        int min = int.MaxValue;
        for (int i = 1; i < N; i++)
        {
            int diff = horses[i] - horses[i - 1];
            if (diff < min) min = diff;
        }
        Console.WriteLine(min);
    }
}
