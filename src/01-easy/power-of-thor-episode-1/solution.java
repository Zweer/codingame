import java.util.Scanner;
class Player {
    public static void main(String[] args) {
        Scanner s = new Scanner(System.in);
        int lx = s.nextInt(), ly = s.nextInt(), tx = s.nextInt(), ty = s.nextInt();
        while (true) {
            s.nextInt();
            String dir = "";
            if (ty > ly) { dir += "N"; ty--; }
            else if (ty < ly) { dir += "S"; ty++; }
            if (tx > lx) { dir += "W"; tx--; }
            else if (tx < lx) { dir += "E"; tx++; }
            System.out.println(dir);
        }
    }
}
