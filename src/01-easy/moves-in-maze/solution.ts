const C = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const [, h] = readline().split(' ').map(Number);
const g: string[] = [];
for (let i = 0; i < h; i++) g.push(readline());
const w = g[0].length;
const d: number[][] = Array.from({length: h}, () => Array(w).fill(-1));
let sr = 0, sc = 0;
for (let r = 0; r < h; r++) for (let c = 0; c < w; c++) if (g[r][c] === 'S') { sr = r; sc = c; }
d[sr][sc] = 0;
const q: [number, number][] = [[sr, sc]];
while (q.length) {
    const [r, c] = q.shift()!;
    for (const [dr, dc] of [[0,1],[0,-1],[1,0],[-1,0]]) {
        const nr = (r+dr+h)%h, nc = (c+dc+w)%w;
        if (g[nr][nc] !== '#' && d[nr][nc] === -1) { d[nr][nc] = d[r][c]+1; q.push([nr, nc]); }
    }
}
console.log(d.map((row, r) => row.map((v, c) => g[r][c]==='#'?'#':v===-1?'.':C[v]).join('')).join('\n'));
