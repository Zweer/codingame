import java.util.*;
class Solution {
    static int ds(long n){int s=0;while(n>0){s+=(int)(n%10);n/=10;}return s;}
    public static void main(String[] a){
        long r=new Scanner(System.in).nextLong();
        for(long x=Math.max(1,r-45);x<r;x++)if(x+ds(x)==r){System.out.println("YES");return;}
        System.out.println("NO");
    }
}
