const N = parseInt(readline());
const Q = parseInt(readline());
const m: Record<string, string> = {};
for (let i = 0; i < N; i++) {
    const [ext, mt] = readline().split(' ');
    m[ext.toLowerCase()] = mt;
}
for (let i = 0; i < Q; i++) {
    const f = readline();
    const dot = f.lastIndexOf('.');
    if (dot === -1) { console.log('UNKNOWN'); continue; }
    const ext = f.substring(dot + 1).toLowerCase();
    console.log(m[ext] || 'UNKNOWN');
}
