const N = parseInt(readline());
const Q = parseInt(readline());
const mimes = {};
for (let i = 0; i < N; i++) {
    const [ext, mt] = readline().split(' ');
    mimes[ext.toLowerCase()] = mt;
}
for (let i = 0; i < Q; i++) {
    const fname = readline();
    const dotIdx = fname.lastIndexOf('.');
    if (dotIdx === -1 || dotIdx === fname.length - 1) {
        console.log('UNKNOWN');
    } else {
        const ext = fname.substring(dotIdx + 1).toLowerCase();
        console.log(mimes[ext] || 'UNKNOWN');
    }
}
