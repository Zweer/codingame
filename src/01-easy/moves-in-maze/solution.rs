use std::io::{self,BufRead};
use std::collections::VecDeque;
fn main(){
    let c=b"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let stdin=io::stdin();
    let mut lines=stdin.lock().lines();
    let first=lines.next().unwrap().unwrap();
    let mut it=first.split_whitespace();
    let w:usize=it.next().unwrap().parse().unwrap();
    let h:usize=it.next().unwrap().parse().unwrap();
    let g:Vec<Vec<u8>>=(0..h).map(|_|lines.next().unwrap().unwrap().bytes().collect()).collect();
    let mut d=vec![vec![-1i32;w];h];
    let(mut sr,mut sc)=(0,0);
    for r in 0..h{for c2 in 0..w{if g[r][c2]==b'S'{sr=r;sc=c2;}}}
    d[sr][sc]=0;
    let mut q=VecDeque::new();q.push_back((sr,sc));
    let dirs=[(0,1),(0usize.wrapping_sub(1)),(1,0),(usize::MAX,0)];
    while let Some((r,c2))=q.pop_front(){
        for &(dr,dc) in &[(0,1),(0,w-1),(1,0),(h-1,0)]{
            let nr=(r+dr)%h;let nc=(c2+dc)%w;
            if g[nr][nc]!=b'#'&&d[nr][nc]==-1{d[nr][nc]=d[r][c2]+1;q.push_back((nr,nc));}
        }
    }
    for r in 0..h{
        let s:String=(0..w).map(|c2|if g[r][c2]==b'#'{'#'}else if d[r][c2]==-1{'.'}else{c[d[r][c2]as usize]as char}).collect();
        println!("{}",s);
    }
}
