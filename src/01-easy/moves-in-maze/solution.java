import java.util.*;
class Solution {
    public static void main(String[] a){
        String C="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        Scanner sc=new Scanner(System.in);
        int w=sc.nextInt(),h=sc.nextInt();
        String[] g=new String[h]; for(int i=0;i<h;i++) g[i]=sc.next();
        int[][] d=new int[h][w]; for(int[] r:d) Arrays.fill(r,-1);
        int sr=0,sc2=0;
        for(int r=0;r<h;r++) for(int c=0;c<w;c++) if(g[r].charAt(c)=='S'){sr=r;sc2=c;}
        d[sr][sc2]=0;
        Queue<int[]> q=new LinkedList<>(); q.add(new int[]{sr,sc2});
        int[] dr={0,0,1,-1},dc={1,-1,0,0};
        while(!q.isEmpty()){
            int[] p=q.poll(); int r=p[0],c=p[1];
            for(int i=0;i<4;i++){
                int nr=(r+dr[i]+h)%h,nc=(c+dc[i]+w)%w;
                if(g[nr].charAt(nc)!='#'&&d[nr][nc]==-1){d[nr][nc]=d[r][c]+1;q.add(new int[]{nr,nc});}
            }
        }
        StringBuilder sb=new StringBuilder();
        for(int r=0;r<h;r++){
            for(int c=0;c<w;c++) sb.append(g[r].charAt(c)=='#'?'#':d[r][c]==-1?'.':C.charAt(d[r][c]));
            sb.append('\n');
        }
        System.out.print(sb);
    }
}
