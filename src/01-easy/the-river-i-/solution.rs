use std::io;
fn ds(mut n:i64)->i64{let mut s=0;while n>0{s+=n%10;n/=10;}s}
fn main(){
    let mut s=String::new();io::stdin().read_line(&mut s).unwrap();
    let mut r1:i64=s.trim().parse().unwrap();
    s.clear();io::stdin().read_line(&mut s).unwrap();
    let mut r2:i64=s.trim().parse().unwrap();
    while r1!=r2{if r1<r2{r1+=ds(r1)}else{r2+=ds(r2)}}
    println!("{}",r1);
}
