// @ts-expect-error
const rl = readline;

interface FishInfo { color: number; type: number; }

const fishInfo: Record<number, FishInfo> = {};
const monsterIds = new Set<number>();
const N = Number(rl());
for (let i = 0; i < N; i++) {
  const [id, color, type] = rl().split(' ').map(Number);
  if (color === -1) monsterIds.add(id);
  else fishInfo[id] = { color, type };
}

let turnNum = 0;

while (true) {
  turnNum++;
  const myScore = Number(rl());
  const foeScore = Number(rl());

  const myScanCount = Number(rl());
  const mySaved = new Set<number>();
  for (let i = 0; i < myScanCount; i++) mySaved.add(Number(rl()));

  const foeScanCount = Number(rl());
  const foeSaved = new Set<number>();
  for (let i = 0; i < foeScanCount; i++) foeSaved.add(Number(rl()));

  const myDroneCount = Number(rl());
  const myDrones: { id: number; x: number; y: number; emergency: number; battery: number }[] = [];
  for (let i = 0; i < myDroneCount; i++) {
    const [id, x, y, emergency, battery] = rl().split(' ').map(Number);
    myDrones.push({ id, x, y, emergency, battery });
  }

  const foeDroneCount = Number(rl());
  for (let i = 0; i < foeDroneCount; i++) rl();

  const droneScans = new Map<number, Set<number>>();
  const allCarried = new Set<number>();
  const droneScanCount = Number(rl());
  for (let i = 0; i < droneScanCount; i++) {
    const [droneId, fishId] = rl().split(' ').map(Number);
    if (!droneScans.has(droneId)) droneScans.set(droneId, new Set());
    droneScans.get(droneId)!.add(fishId);
    if (myDrones.some(d => d.id === droneId)) allCarried.add(fishId);
  }

  const visibleFish = new Map<number, { x: number; y: number; vx: number; vy: number }>();
  const monsters: { x: number; y: number; vx: number; vy: number }[] = [];
  const visibleCount = Number(rl());
  for (let i = 0; i < visibleCount; i++) {
    const [id, x, y, vx, vy] = rl().split(' ').map(Number);
    if (monsterIds.has(id)) monsters.push({ x, y, vx, vy });
    else visibleFish.set(id, { x, y, vx, vy });
  }

  const radarBlips = new Map<number, { fishId: number; dir: string }[]>();
  const blipCount = Number(rl());
  for (let i = 0; i < blipCount; i++) {
    const parts = rl().split(' ');
    const droneId = Number(parts[0]);
    const fishId = Number(parts[1]);
    const dir = parts[2];
    if (monsterIds.has(fishId)) continue;
    if (!radarBlips.has(droneId)) radarBlips.set(droneId, []);
    radarBlips.get(droneId)!.push({ fishId, dir });
  }

  const sorted = [...myDrones].sort((a, b) => a.x - b.x);
  const targetedThisTurn = new Set<number>();

  for (let di = 0; di < sorted.length; di++) {
    const drone = sorted[di];

    if (drone.emergency) {
      console.log('WAIT 0');
      continue;
    }

    const carried = droneScans.get(drone.id) ?? new Set<number>();
    const allScanned = new Set([...mySaved, ...allCarried]);
    const blips = radarBlips.get(drone.id) ?? [];

    // Monster threat
    let monsterDanger = false;
    let avoidX = 0, avoidY = 0;
    for (const m of monsters) {
      const dx = drone.x - m.x, dy = drone.y - m.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const mx1 = m.x + m.vx, my1 = m.y + m.vy;
      const dx1 = drone.x - mx1, dy1 = drone.y - my1;
      const dist1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
      if (dist < 1800 || dist1 < 1400) {
        monsterDanger = true;
        const len = Math.max(dist, 1);
        avoidX += (dx / len) * 600;
        avoidY += (dy / len) * 600;
      }
    }

    // Fish still needing scan
    const needed = blips
      .filter(b => !allScanned.has(b.fishId) && fishInfo[b.fishId] && !targetedThisTurn.has(b.fishId));

    // Turns to reach surface
    const turnsToSurface = Math.ceil(drone.y / 600);

    // Should surface? More aggressive: surface earlier to beat opponent to first-scan bonuses
    const shouldSurface = (carried.size > 0 && needed.length === 0) ||
      (carried.size >= 3) ||
      (carried.size >= 2 && drone.y <= 4000) ||
      (carried.size >= 1 && drone.y <= 2000);

    if (shouldSurface) {
      console.log(`MOVE ${drone.x} 0 0 UP`);
      continue;
    }

    // If monster danger, flee TOWARD SURFACE if carrying scans, otherwise just dodge
    if (monsterDanger) {
      let fx: number, fy: number;
      if (carried.size > 0) {
        // Flee toward surface — prioritize saving scans
        fx = drone.x + avoidX * 0.3;
        fy = drone.y - 600; // always go up
      } else {
        fx = drone.x + avoidX;
        fy = drone.y + avoidY;
        // Still bias upward slightly to not get stuck deep
        fy = Math.min(fy, drone.y);
      }
      fx = Math.max(0, Math.min(9999, fx));
      fy = Math.max(0, Math.min(9999, fy));
      console.log(`MOVE ${Math.round(fx)} ${Math.round(fy)} 0 FLEE`);
      continue;
    }

    // Score and pick best target
    let bestFish: { fishId: number; dir: string } | null = null;
    let bestScore = -Infinity;
    for (const b of needed) {
      const info = fishInfo[b.fishId];
      if (!info) continue;
      let score = (info.type + 1);
      if (!foeSaved.has(b.fishId)) score *= 2; // first scan bonus
      // Zone preference
      if (sorted.length >= 2) {
        const isLeft = di === 0;
        const vis = visibleFish.get(b.fishId);
        if (vis) {
          if ((isLeft && vis.x > 6000) || (!isLeft && vis.x < 4000)) score *= 0.5;
        } else {
          if ((isLeft && b.dir.includes('R')) || (!isLeft && b.dir.includes('L'))) score *= 0.7;
        }
      }
      if (score > bestScore) { bestScore = score; bestFish = b; }
    }

    if (!bestFish) {
      if (carried.size > 0) {
        console.log(`MOVE ${drone.x} 0 0 SAVE`);
      } else {
        // Only dive again if there are valuable unsaved fish
        const valuableLeft = blips.filter(b =>
          !allScanned.has(b.fishId) && fishInfo[b.fishId] && !foeSaved.has(b.fishId)
        );
        if (valuableLeft.length === 0) {
          console.log('WAIT 0 DONE');
        } else {
          const tx = di === 0 ? 2500 : 7500;
          console.log(`MOVE ${tx} 5000 0 SEEK`);
        }
      }
      continue;
    }

    targetedThisTurn.add(bestFish.fishId);

    let tx: number, ty: number;
    const vis = visibleFish.get(bestFish.fishId);
    if (vis) {
      tx = vis.x + vis.vx;
      ty = vis.y + vis.vy;
    } else {
      const dir = bestFish.dir;
      tx = drone.x + (dir.includes('R') ? 600 : dir.includes('L') ? -600 : 0);
      ty = drone.y + (dir.includes('B') ? 600 : dir.includes('T') ? -600 : 0);
    }

    tx = Math.max(0, Math.min(9999, tx));
    ty = Math.max(0, Math.min(9999, ty));

    // Light: use every other turn to save battery, only when deep enough
    const light = (drone.battery >= 5 && drone.y >= 2500 && turnNum % 2 === 0) ? 1 : 0;
    console.log(`MOVE ${Math.round(tx)} ${Math.round(ty)} ${light} ${bestFish.fishId}`);
  }
}
