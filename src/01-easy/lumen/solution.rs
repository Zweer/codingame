use std::io::{self,BufRead};
fn main(){
    let stdin=io::stdin();let mut it=stdin.lock().lines();
    let n:usize=it.next().unwrap().unwrap().trim().parse().unwrap();
    let l:i32=it.next().unwrap().unwrap().trim().parse().unwrap();
    let g:Vec<Vec<String>>=(0..n).map(|_|it.next().unwrap().unwrap().split_whitespace().map(String::from).collect()).collect();
    let mut d=0;
    for r in 0..n{for c in 0..n{
        let lit=(0..n).any(|r2|(0..n).any(|c2|g[r2][c2]=="C"&&((r as i32-r2 as i32).abs().max((c as i32-c2 as i32).abs()))<l));
        if!lit{d+=1;}
    }}
    println!("{}",d);
}
