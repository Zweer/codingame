const [L, C, N] = readline().split(' ').map(Number);
const groups: number[] = [];
for (let i = 0; i < N; i++) groups.push(Number(readline()));

let total = 0, rides = 0, head = 0;
const memo = new Map<number, [number, number]>();

while (rides < C) {
  if (memo.has(head)) {
    const [prevRides, prevTotal] = memo.get(head)!;
    const cycleLen = rides - prevRides;
    const cycleEarn = total - prevTotal;
    const remaining = C - rides;
    total += Math.floor(remaining / cycleLen) * cycleEarn;
    rides += Math.floor(remaining / cycleLen) * cycleLen;
    break;
  }
  memo.set(head, [rides, total]);

  let cap = L, earned = 0, idx = head;
  for (let i = 0; i < N; i++) {
    if (groups[idx] > cap) break;
    cap -= groups[idx];
    earned += groups[idx];
    idx = (idx + 1) % N;
  }
  total += earned;
  rides++;
  head = idx;
}

while (rides < C) {
  let cap = L, earned = 0, idx = head;
  for (let i = 0; i < N; i++) {
    if (groups[idx] > cap) break;
    cap -= groups[idx];
    earned += groups[idx];
    idx = (idx + 1) % N;
  }
  total += earned;
  rides++;
  head = idx;
}

console.log(total);
