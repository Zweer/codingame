import java.util.Scanner;
class Player {
    public static void main(String[] args) {
        Scanner s = new Scanner(System.in);
        while (true) {
            int max = -1, idx = 0;
            for (int i = 0; i < 8; i++) {
                int h = s.nextInt();
                if (h > max) { max = h; idx = i; }
            }
            System.out.println(idx);
        }
    }
}
