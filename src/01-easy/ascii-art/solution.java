import java.util.*;
class Solution {
    public static void main(String[] a){
        Scanner sc=new Scanner(System.in);
        int L=sc.nextInt(),H=sc.nextInt();sc.nextLine();
        String T=sc.nextLine().toUpperCase();
        String[] rows=new String[H];
        for(int i=0;i<H;i++)rows[i]=sc.nextLine();
        for(int i=0;i<H;i++){
            StringBuilder sb=new StringBuilder();
            for(char c:T.toCharArray()){
                int idx=c-'A';if(idx<0||idx>25)idx=26;
                sb.append(rows[i],idx*L,idx*L+L);
            }
            System.out.println(sb);
        }
    }
}
