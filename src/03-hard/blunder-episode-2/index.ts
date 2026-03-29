const n = Number(readline());
const rooms = new Map<number, { money: number; exits: (number | 'E')[] }>();

for (let i = 0; i < n; i++) {
  const parts = readline().split(' ');
  const num = Number(parts[0]);
  const money = Number(parts[1]);
  const exits = parts.slice(2).map(e => e === 'E' ? 'E' as const : Number(e));
  rooms.set(num, { money, exits });
}

const memo = new Map<number, number>();

function maxMoney(room: number): number {
  if (memo.has(room)) return memo.get(room)!;
  const r = rooms.get(room)!;
  let best = -Infinity;
  for (const exit of r.exits) {
    if (exit === 'E') best = Math.max(best, 0);
    else best = Math.max(best, maxMoney(exit));
  }
  const result = best === -Infinity ? -Infinity : r.money + best;
  memo.set(room, result);
  return result;
}

console.log(maxMoney(0));
