using System;
class Solution {
    static void Main() {
        while (true) {
            int max = -1, idx = 0;
            for (int i = 0; i < 8; i++) {
                int h = int.Parse(Console.ReadLine());
                if (h > max) { max = h; idx = i; }
            }
            Console.WriteLine(idx);
        }
    }
}
