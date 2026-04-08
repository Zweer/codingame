use std::io::{self,BufRead};
fn main(){
    let stdin=io::stdin();let mut lines=stdin.lock().lines();
    let l:usize=lines.next().unwrap().unwrap().trim().parse().unwrap();
    let h:usize=lines.next().unwrap().unwrap().trim().parse().unwrap();
    let t:Vec<usize>=lines.next().unwrap().unwrap().to_uppercase().bytes()
        .map(|b|{let i=(b as i32)-65;if i<0||i>25{26}else{i as usize}}).collect();
    let rows:Vec<String>=(0..h).map(|_|lines.next().unwrap().unwrap()).collect();
    for row in &rows{
        let mut out=String::new();
        for &idx in &t{out.push_str(&row[idx*l..idx*l+l]);}
        println!("{}",out);
    }
}
