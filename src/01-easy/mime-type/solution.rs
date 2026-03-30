use std::collections::HashMap;
use std::io::{self, BufRead, Write, BufWriter};
fn main() {
    let stdin = io::stdin();
    let stdout = io::stdout();
    let mut out = BufWriter::new(stdout.lock());
    let mut lines = stdin.lock().lines();
    let n: usize = lines.next().unwrap().unwrap().trim().parse().unwrap();
    let q: usize = lines.next().unwrap().unwrap().trim().parse().unwrap();
    let mut m = HashMap::new();
    for _ in 0..n {
        let line = lines.next().unwrap().unwrap();
        let mut parts = line.split_whitespace();
        let ext = parts.next().unwrap().to_lowercase();
        let mt = parts.next().unwrap().to_string();
        m.insert(ext, mt);
    }
    for _ in 0..q {
        let f = lines.next().unwrap().unwrap();
        let f = f.trim_end();
        match f.rfind('.') {
            None => writeln!(out, "UNKNOWN").unwrap(),
            Some(dot) => {
                let ext = f[dot+1..].to_lowercase();
                writeln!(out, "{}", m.get(&ext).map(|s| s.as_str()).unwrap_or("UNKNOWN")).unwrap();
            }
        }
    }
}
