import java.util.*;
class Solution {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        String msg = sc.nextLine();
        StringBuilder bin = new StringBuilder();
        for (char c : msg.toCharArray())
            bin.append(String.format("%7s", Integer.toBinaryString(c)).replace(' ', '0'));
        String s = bin.toString();
        StringBuilder out = new StringBuilder();
        int i = 0;
        while (i < s.length()) {
            char cur = s.charAt(i);
            int count = 0;
            while (i < s.length() && s.charAt(i) == cur) { count++; i++; }
            if (out.length() > 0) out.append(' ');
            out.append(cur == '1' ? "0" : "00").append(' ').append("0".repeat(count));
        }
        System.out.println(out);
    }
}
