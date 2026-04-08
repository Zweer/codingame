use std::io::{self,BufRead};
fn main(){
    let stdin=io::stdin();let mut it=stdin.lock().lines();
    let w:usize=it.next().unwrap().unwrap().trim().parse().unwrap();
    let h:usize=it.next().unwrap().unwrap().trim().parse().unwrap();
    let g:Vec<Vec<i32>>=(0..h).map(|_|it.next().unwrap().unwrap().split_whitespace().map(|x|x.parse().unwrap()).collect()).collect();
    let dirs:[i32;8]=[-1,-1,-1,0,0,1,1,1];let dys:[i32;8]=[-1,0,1,-1,1,-1,0,1];
    for y in 0..h{for x in 0..w{if g[y][x]==0{
        let ok=(0..8).all(|i|{let nx=x as i32+dirs[i];let ny=y as i32+dys[i];
            !(nx>=0&&nx<w as i32&&ny>=0&&ny<h as i32)||g[ny as usize][nx as usize]==1});
        if ok{println!("{} {}",x,y);return;}
    }}}
}
