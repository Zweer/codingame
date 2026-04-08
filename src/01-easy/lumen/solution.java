import java.util.*;
class Solution{public static void main(String[] a){
    Scanner sc=new Scanner(System.in);int n=sc.nextInt(),l=sc.nextInt();
    String[][] g=new String[n][n];for(int i=0;i<n;i++)for(int j=0;j<n;j++)g[i][j]=sc.next();
    int d=0;
    for(int r=0;r<n;r++)for(int c=0;c<n;c++){boolean lit=false;
        for(int r2=0;r2<n&&!lit;r2++)for(int c2=0;c2<n&&!lit;c2++)
            if(g[r2][c2].equals("C")&&Math.max(Math.abs(r-r2),Math.abs(c-c2))<l)lit=true;
        if(!lit)d++;}
    System.out.println(d);
}}
