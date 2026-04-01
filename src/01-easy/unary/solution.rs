use std::io;
fn main() {
    let mut msg = String::new();
    io::stdin().read_line(&mut msg).unwrap();
    let msg = msg.trim();
    let bin: String = msg.chars().map(|c| format!("{:07b}", c as u32)).collect();
    let bytes = bin.as_bytes();
    let mut parts: Vec<String> = Vec::new();
    let mut i = 0;
    while i < bytes.len() {
        let cur = bytes[i];
        let mut count = 0;
        while i < bytes.len() && bytes[i] == cur { count += 1; i += 1; }
        parts.push(format!("{} {}", if cur == b'1' { "0" } else { "00" }, "0".repeat(count)));
    }
    println!("{}", parts.join(" "));
}
