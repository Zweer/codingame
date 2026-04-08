import java.util.*;
class Solution{
    public static void main(String[] a){
        Scanner sc=new Scanner(System.in);int w=sc.nextInt(),h=sc.nextInt();
        int[][] g=new int[h][w];for(int y=0;y<h;y++)for(int x=0;x<w;x++)g[y][x]=sc.nextInt();
        int[] dx={-1,-1,-1,0,0,1,1,1},dy={-1,0,1,-1,1,-1,0,1};
        for(int y=0;y<h;y++)for(int x=0;x<w;x++)if(g[y][x]==0){
            boolean ok=true;
            for(int i=0;i<8;i++){int nx=x+dx[i],ny=y+dy[i];if(nx>=0&&nx<w&&ny>=0&&ny<h&&g[ny][nx]!=1)ok=false;}
            if(ok){System.out.println(x+" "+y);return;}
        }
    }
}
