using System;
class Player {
    static void Main() {
        var s = Console.ReadLine().Split(' ');
        int lx = int.Parse(s[0]), ly = int.Parse(s[1]);
        int tx = int.Parse(s[2]), ty = int.Parse(s[3]);
        while (true) {
            Console.ReadLine();
            string dir = "";
            if (ty > ly) { dir += "N"; ty--; }
            else if (ty < ly) { dir += "S"; ty++; }
            if (tx > lx) { dir += "W"; tx--; }
            else if (tx < lx) { dir += "E"; tx++; }
            Console.WriteLine(dir);
        }
    }
}
