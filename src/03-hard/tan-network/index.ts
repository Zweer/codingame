interface Stop {
  id: string;
  name: string;
  lat: number; // radians
  lon: number; // radians
}

const startId = readline();
const endId = readline();
const N = Number(readline());

const stops = new Map<string, Stop>();
for (let i = 0; i < N; i++) {
  const parts = readline().split(',');
  stops.set(parts[0], {
    id: parts[0],
    name: parts[1].slice(1, -1),
    lat: Number(parts[3]) * Math.PI / 180,
    lon: Number(parts[4]) * Math.PI / 180,
  });
}

const M = Number(readline());
const adj = new Map<string, [string, number][]>();
for (const id of stops.keys()) adj.set(id, []);

for (let i = 0; i < M; i++) {
  const [a, b] = readline().split(' ');
  const sa = stops.get(a)!, sb = stops.get(b)!;
  const x = (sb.lon - sa.lon) * Math.cos((sa.lat + sb.lat) / 2);
  const y = sb.lat - sa.lat;
  adj.get(a)!.push([b, Math.sqrt(x * x + y * y) * 6371]);
}

// Dijkstra
const dist = new Map<string, number>();
const prev = new Map<string, string>();
dist.set(startId, 0);

// Simple priority queue with array (N is small for this puzzle)
const pq: [number, string][] = [[0, startId]];
let found = false;

while (pq.length > 0) {
  let mi = 0;
  for (let i = 1; i < pq.length; i++) if (pq[i][0] < pq[mi][0]) mi = i;
  const [d, u] = pq[mi];
  pq[mi] = pq[pq.length - 1];
  pq.pop();

  if (d > (dist.get(u) ?? Infinity)) continue;
  if (u === endId) { found = true; break; }

  for (const [v, w] of adj.get(u)!) {
    const nd = d + w;
    if (nd < (dist.get(v) ?? Infinity)) {
      dist.set(v, nd);
      prev.set(v, u);
      pq.push([nd, v]);
    }
  }
}

if (!found) {
  console.log('IMPOSSIBLE');
} else {
  const path: string[] = [];
  for (let cur: string | undefined = endId; cur !== undefined; cur = prev.get(cur)) {
    path.push(stops.get(cur)!.name);
  }
  console.log(path.reverse().join('\n'));
}
