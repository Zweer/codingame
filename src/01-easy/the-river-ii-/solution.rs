use std::io;
fn ds(mut n:i64)->i64{let mut s=0;while n>0{s+=n%10;n/=10;}s}
fn main(){
    let mut s=String::new();io::stdin().read_line(&mut s).unwrap();
    let r:i64=s.trim().parse().unwrap();
    let lo=1i64.max(r-45);
    if(lo..r).any(|x|x+ds(x)==r){println!("YES")}else{println!("NO")}
}
