import java.util.*;
class Solution {
    public static void main(String[] args) {
        Scanner s = new Scanner(System.in);
        int n = s.nextInt();
        int[] h = new int[n];
        for (int i = 0; i < n; i++) h[i] = s.nextInt();
        Arrays.sort(h);
        int min = h[1] - h[0];
        for (int i = 1; i < n - 1; i++) min = Math.min(min, h[i+1] - h[i]);
        System.out.println(min);
    }
}
