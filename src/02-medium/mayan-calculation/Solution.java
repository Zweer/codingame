import java.util.*;

class Solution {
    public static void main(String[] args) {
        Scanner in = new Scanner(System.in);
        int L = in.nextInt(), H = in.nextInt(); in.nextLine();
        String[][] glyphs = new String[20][H];
        Map<String, Integer> map = new HashMap<>();
        for (int i = 0; i < H; i++) {
            String row = in.nextLine();
            for (int j = 0; j < 20; j++)
                glyphs[j][i] = row.substring(j * L, (j + 1) * L);
        }
        for (int i = 0; i < 20; i++)
            map.put(String.join("\n", glyphs[i]), i);

        long a = readMayan(in, H, map);
        long b = readMayan(in, H, map);
        String op = in.nextLine();
        long r = op.equals("+") ? a+b : op.equals("-") ? a-b : op.equals("*") ? a*b : a/b;

        List<Integer> digits = new ArrayList<>();
        if (r == 0) digits.add(0);
        else while (r > 0) { digits.add((int)(r % 20)); r /= 20; }
        Collections.reverse(digits);
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < digits.size(); i++) {
            if (i > 0) sb.append("\n");
            sb.append(String.join("\n", glyphs[digits.get(i)]));
        }
        System.out.println(sb);
    }

    static long readMayan(Scanner in, int H, Map<String, Integer> map) {
        int s = Integer.parseInt(in.nextLine());
        String[] lines = new String[s];
        for (int i = 0; i < s; i++) lines[i] = in.nextLine();
        long val = 0;
        for (int i = 0; i < s / H; i++) {
            String[] sub = Arrays.copyOfRange(lines, i * H, (i + 1) * H);
            val = val * 20 + map.get(String.join("\n", sub));
        }
        return val;
    }
}
