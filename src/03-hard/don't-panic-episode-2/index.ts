const [nbFloors, width, , exitFloor, exitPos, , nbAdd, nbElev] = readline().split(' ').map(Number);

// elevators per floor
const elev: Set<number>[] = Array.from({ length: nbFloors }, () => new Set());
for (let i = 0; i < nbElev; i++) {
  const [f, p] = readline().split(' ').map(Number);
  elev[f].add(p);
}

// Dijkstra to find optimal path.
// State: (floor, pos, dir, additionalElevatorsLeft)
// dir: 0 = RIGHT, 1 = LEFT
//
// Transitions (each costs 1 game turn unless noted):
//   At elevator position → go up: (f+1, pos, dir, el), cost 1, action WAIT
//   Not at elevator:
//     WAIT: move forward → (f, pos±1, dir, el), cost 1
//     BLOCK: clone sacrificed, next clone will arrive here going opposite dir after 3 turns
//            → (f, pos, 1-dir, el), cost 3, action BLOCK
//     ELEVATOR (if el>0): build elevator, clone sacrificed, next clone goes up after 3 turns
//            → (f+1, pos, dir, el-1), cost 3, action ELEVATOR
//
// The cost of BLOCK/ELEVATOR = 3 because:
//   Turn 0: action taken (clone destroyed)
//   Turns 1-2: no leading clone (WAIT)
//   Turn 3: new clone appears at generator... but it needs to walk to this position.
//
// Actually, the 3-turn penalty is an approximation. The real cost depends on how far the
// generator is. But the classic approach that works for this puzzle:
// - Model BLOCK as: stay at same position, flip direction, cost = 3
// - Model ELEVATOR as: go up one floor, same direction, cost = 3
// This works because blocked clones act as walls, so subsequent clones follow the same path
// and the 3-turn delay is the clone generation interval.

type State = [cost: number, floor: number, pos: number, dir: number, el: number];

function solve(startPos: number): Map<string, string> {
  const dist = new Map<string, number>();
  const prev = new Map<string, [string, string]>();
  const key = (f: number, p: number, d: number, e: number): string => `${f},${p},${d},${e}`;

  const s0 = key(0, startPos, 0, nbAdd);
  dist.set(s0, 0);
  const pq: State[] = [[0, 0, startPos, 0, nbAdd]];

  const relax = (c: number, f: number, p: number, d: number, e: number, pk: string, act: string): void => {
    if (p < 0 || p >= width || f >= nbFloors) return;
    const k = key(f, p, d, e);
    if (c < (dist.get(k) ?? 1e9)) {
      dist.set(k, c);
      prev.set(k, [pk, act]);
      pq.push([c, f, p, d, e]);
    }
  };

  while (pq.length > 0) {
    let mi = 0;
    for (let i = 1; i < pq.length; i++) if (pq[i][0] < pq[mi][0]) mi = i;
    const [c, f, p, d, e] = pq[mi];
    pq[mi] = pq[pq.length - 1];
    pq.pop();

    const k = key(f, p, d, e);
    if (c > (dist.get(k) ?? 1e9)) continue;

    if (f === exitFloor && p === exitPos) {
      // Reconstruct action map
      const actions = new Map<string, string>();
      let cur = k;
      while (prev.has(cur)) {
        const [pk, act] = prev.get(cur)!;
        actions.set(pk, act);
        cur = pk;
      }
      return actions;
    }

    // At elevator → go up (automatic)
    if (elev[f].has(p)) {
      relax(c + 1, f + 1, p, d, e, k, 'WAIT');
      continue;
    }

    // WAIT: move in current direction
    relax(c + 1, f, d === 0 ? p + 1 : p - 1, d, e, k, 'WAIT');

    // BLOCK: flip direction, cost 3
    relax(c + 3, f, p, 1 - d, e, k, 'BLOCK');

    // ELEVATOR: go up, cost 3
    if (e > 0) {
      relax(c + 3, f + 1, p, d, e - 1, k, 'ELEVATOR');
    }
  }

  return new Map();
}

let actions: Map<string, string> | null = null;
let el = nbAdd;

while (true) {
  const parts = readline().split(' ');
  const cf = Number(parts[0]);
  const cp = Number(parts[1]);
  const cd = parts[2];

  if (cf === -1) {
    console.log('WAIT');
    continue;
  }

  if (!actions) actions = solve(cp);

  const d = cd === 'RIGHT' ? 0 : 1;
  const k = `${cf},${cp},${d},${el}`;
  const act = actions.get(k) ?? 'WAIT';

  if (act === 'ELEVATOR') {
    elev[cf].add(cp);
    el--;
  }

  console.log(act);
}
