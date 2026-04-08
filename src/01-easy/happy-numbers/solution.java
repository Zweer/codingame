import java.util.*;
class Solution {
    static int dss(int n){int s=0;while(n>0){int d=n%10;s+=d*d;n/=10;}return s;}
    public static void main(String[] args){
        Scanner sc=new Scanner(System.in);
        int n=sc.nextInt();
        while(n-->0){
            String s=sc.next();
            int x=0; for(char c:s.toCharArray()){int d=c-'0';x+=d*d;}
            Set<Integer> seen=new HashSet<>();
            while(x!=1&&seen.add(x)) x=dss(x);
            System.out.println(s+(x==1?" :)":" :("));
        }
    }
}
