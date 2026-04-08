use std::io;
use std::collections::HashMap;
fn main(){
    let ab:HashMap<&str,char>=[("sp",' '),("bS",'\\'),("sQ",'\''),("nl",'\n')].into();
    let mut line=String::new(); io::stdin().read_line(&mut line).unwrap();
    let mut out=String::new();
    for tok in line.trim().split(' '){
        let (ch,num)=if tok.len()>=2{
            let l2=&tok[tok.len()-2..];
            if let Some(&c)=ab.get(l2){(c,&tok[..tok.len()-2])}
            else{(tok.chars().last().unwrap(),&tok[..tok.len()-1])}
        }else{(tok.chars().last().unwrap(),"")};
        let n:usize=if num.is_empty(){1}else{num.parse().unwrap_or(1)};
        for _ in 0..n{out.push(ch);}
    }
    println!("{}",out);
}
