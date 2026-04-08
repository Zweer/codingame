import java.util.*;
class Solution {
    public static void main(String[] a){
        Scanner sc=new Scanner(System.in);
        int n=sc.nextInt();
        while(n-->0){
            String s=sc.next(); int d=0,j=0;
            while(j<s.length()){if(s.charAt(j)=='f'){d++;j+=3;}else j++;}
            System.out.println(d);
        }
    }
}
