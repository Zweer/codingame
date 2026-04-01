const msg = readline();
const bin = [...msg].map(c => c.charCodeAt(0).toString(2).padStart(7, '0')).join('');
const parts: string[] = [];
let i = 0;
while (i < bin.length) {
    const cur = bin[i];
    let count = 0;
    while (i < bin.length && bin[i] === cur) { count++; i++; }
    parts.push(`${cur === '1' ? '0' : '00'} ${'0'.repeat(count)}`);
}
console.log(parts.join(' '));
