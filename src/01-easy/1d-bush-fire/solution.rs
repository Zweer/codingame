use std::io;
fn main(){
    let mut buf=String::new();
    io::stdin().read_line(&mut buf).unwrap();
    let n:usize=buf.trim().parse().unwrap();
    for _ in 0..n{
        let mut s=String::new();io::stdin().read_line(&mut s).unwrap();
        let s=s.trim().as_bytes();let mut d=0;let mut j=0;
        while j<s.len(){if s[j]==b'f'{d+=1;j+=3;}else{j+=1;}}
        println!("{}",d);
    }
}
