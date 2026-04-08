using System;
using System.Collections.Generic;
using System.Text;
class Solution {
    static void Main(){
        string C="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        var p=Console.ReadLine().Split(' ');int w=int.Parse(p[0]),h=int.Parse(p[1]);
        var g=new string[h];for(int i=0;i<h;i++) g[i]=Console.ReadLine();
        var d=new int[h,w];for(int r=0;r<h;r++)for(int c=0;c<w;c++)d[r,c]=-1;
        int sr=0,sc=0;
        for(int r=0;r<h;r++)for(int c=0;c<w;c++)if(g[r][c]=='S'){sr=r;sc=c;}
        d[sr,sc]=0;
        var q=new Queue<(int,int)>();q.Enqueue((sr,sc));
        int[] dr={0,0,1,-1},dc={1,-1,0,0};
        while(q.Count>0){var(r,c)=q.Dequeue();for(int i=0;i<4;i++){int nr=(r+dr[i]+h)%h,nc=(c+dc[i]+w)%w;if(g[nr][nc]!='#'&&d[nr,nc]==-1){d[nr,nc]=d[r,c]+1;q.Enqueue((nr,nc));}}}
        var sb=new StringBuilder();
        for(int r=0;r<h;r++){for(int c=0;c<w;c++)sb.Append(g[r][c]=='#'?'#':d[r,c]==-1?'.':C[d[r,c]]);sb.AppendLine();}
        Console.Write(sb);
    }
}
