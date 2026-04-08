import java.util.*;
class Solution {
    public static void main(String[] a){
        Map<String,Character> ab=Map.of("sp",' ',"bS",'\\',"sQ",'\'',"nl",'\n');
        String line=new Scanner(System.in).nextLine();
        StringBuilder sb=new StringBuilder();
        for(String tok:line.split(" ")){
            char ch; String num;
            String l2=tok.length()>=2?tok.substring(tok.length()-2):"";
            if(ab.containsKey(l2)){ch=ab.get(l2);num=tok.substring(0,tok.length()-2);}
            else{ch=tok.charAt(tok.length()-1);num=tok.substring(0,tok.length()-1);}
            int n=num.isEmpty()?1:Integer.parseInt(num);
            sb.append(String.valueOf(ch).repeat(Math.max(1,n)));
        }
        System.out.println(sb);
    }
}
