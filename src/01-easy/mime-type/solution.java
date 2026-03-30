import java.util.*;
class Solution {
    public static void main(String[] args) {
        Scanner s = new Scanner(System.in);
        int n = s.nextInt(), q = s.nextInt(); s.nextLine();
        Map<String,String> m = new HashMap<>();
        for (int i = 0; i < n; i++) {
            String ext = s.next().toLowerCase(), mt = s.next();
            m.put(ext, mt);
        }
        if (s.hasNextLine()) s.nextLine();
        for (int i = 0; i < q; i++) {
            String f = s.nextLine();
            int dot = f.lastIndexOf('.');
            if (dot == -1) { System.out.println("UNKNOWN"); continue; }
            String ext = f.substring(dot + 1).toLowerCase();
            System.out.println(m.getOrDefault(ext, "UNKNOWN"));
        }
    }
}
