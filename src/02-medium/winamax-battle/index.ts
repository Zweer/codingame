const ORDER: Record<string, number> = { '2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10,'J':11,'Q':12,'K':13,'A':14 };
const val = (card: string): number => ORDER[card.slice(0, -1)];

const n1 = Number(readline());
const d1: string[] = [];
for (let i = 0; i < n1; i++) d1.push(readline());
const n2 = Number(readline());
const d2: string[] = [];
for (let i = 0; i < n2; i++) d2.push(readline());

let rounds = 0;
while (d1.length > 0 && d2.length > 0) {
  const pile1: string[] = [], pile2: string[] = [];
  let resolved = false;
  while (!resolved) {
    if (d1.length === 0 || d2.length === 0) { console.log('PAT'); process.exit(); }
    const c1 = d1.shift()!, c2 = d2.shift()!;
    pile1.push(c1); pile2.push(c2);
    if (val(c1) > val(c2)) {
      d1.push(...pile1, ...pile2);
      resolved = true;
    } else if (val(c2) > val(c1)) {
      d2.push(...pile1, ...pile2);
      resolved = true;
    } else {
      for (let i = 0; i < 3; i++) {
        if (d1.length === 0 || d2.length === 0) { console.log('PAT'); process.exit(); }
        pile1.push(d1.shift()!);
        pile2.push(d2.shift()!);
      }
    }
  }
  rounds++;
}
console.log(`${d1.length > 0 ? 1 : 2} ${rounds}`);
