const abbr: Record<string, string> = { sp: ' ', bS: '\\', sQ: "'", nl: '\n' };
const s = readline();
let out = '';
for (const chunk of s.split(' ')) {
    const last2 = chunk.slice(-2);
    let ch: string, num: string;
    if (abbr[last2]) { ch = abbr[last2]; num = chunk.slice(0, -2); }
    else { ch = chunk.slice(-1); num = chunk.slice(0, -1); }
    out += ch.repeat(parseInt(num) || 1);
}
console.log(out);
