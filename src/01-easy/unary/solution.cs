using System;
using System.Text;
class Solution {
    static void Main() {
        string msg = Console.ReadLine();
        var bin = new StringBuilder();
        foreach (char c in msg)
            bin.Append(Convert.ToString(c, 2).PadLeft(7, '0'));
        var sb = new StringBuilder();
        string s = bin.ToString();
        int i = 0;
        while (i < s.Length) {
            char cur = s[i];
            int count = 0;
            while (i < s.Length && s[i] == cur) { count++; i++; }
            if (sb.Length > 0) sb.Append(' ');
            sb.Append(cur == '1' ? "0" : "00");
            sb.Append(' ');
            sb.Append(new string('0', count));
        }
        Console.WriteLine(sb);
    }
}
