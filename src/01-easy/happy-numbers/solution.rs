use std::io;
use std::collections::HashSet;
fn dss(mut n:i64)->i64{let mut s=0;while n>0{let d=n%10;s+=d*d;n/=10;}s}
fn main(){
    let mut buf=String::new();
    io::stdin().read_line(&mut buf).unwrap();
    let n:usize=buf.trim().parse().unwrap();
    for _ in 0..n{
        let mut s=String::new();
        io::stdin().read_line(&mut s).unwrap();
        let s=s.trim();
        let mut x:i64=s.chars().map(|c|{let d=(c as i64)-48;d*d}).sum();
        let mut seen=HashSet::new();
        while x!=1&&seen.insert(x){x=dss(x);}
        println!("{} {}",s,if x==1{":)"}else{":("}); 
    }
}
