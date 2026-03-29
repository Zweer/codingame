import java.util.Scanner;
class Solution {
    public static void main(String[] a) {
        Scanner s = new Scanner(System.in);
        int n = s.nextInt();
        if (n == 0) { System.out.println(0); return; }
        int r = s.nextInt();
        for (int i = 1; i < n; i++) {
            int v = s.nextInt();
            if (Math.abs(v) < Math.abs(r) || (Math.abs(v) == Math.abs(r) && v > 0)) r = v;
        }
        System.out.println(r);
    }
}
