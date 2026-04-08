import java.util.*;
class Solution {
    static int ds(long n){int s=0;while(n>0){s+=(int)(n%10);n/=10;}return s;}
    public static void main(String[] a){
        Scanner sc=new Scanner(System.in);
        long r1=sc.nextLong(),r2=sc.nextLong();
        while(r1!=r2){if(r1<r2)r1+=ds(r1);else r2+=ds(r2);}
        System.out.println(r1);
    }
}
