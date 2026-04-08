// @ts-expect-error — CodinGame global
const rl = readline;

const CP_RADIUS = 600;

const checkpointCount = Number.parseInt(rl(), 10);
const cps: Array<{ x: number; y: number }> = [];
for (let i = 0; i < checkpointCount; i++) {
  const [cx, cy] = rl().split(' ').map(Number);
  cps.push({ x: cx, y: cy });
}

function dist(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt((x1 - x2) ** 2 + (y1 - y2) ** 2);
}

function angleDiff(x: number, y: number, tx: number, ty: number, facing: number): number {
  const target = (Math.atan2(ty - y, tx - x) * 180) / Math.PI;
  let d = target - facing;
  while (d > 180) d -= 360;
  while (d < -180) d += 360;
  return d;
}

while (true) {
  const [cpIndex, x, y, vx, vy, angle] = rl().split(' ').map(Number);

  const cp = cps[cpIndex];
  const nextCp = cps[(cpIndex + 1) % cps.length];

  const d = dist(x, y, cp.x, cp.y);
  const diff = Math.abs(angleDiff(x, y, cp.x, cp.y, angle));

  let aimX = cp.x - vx * 3;
  let aimY = cp.y - vy * 3;

  const futDist = dist(x + vx, y + vy, cp.x, cp.y);
  if (futDist < CP_RADIUS * 3) {
    const t = Math.max(0, 1 - futDist / (CP_RADIUS * 3));
    aimX += (nextCp.x - cp.x + vx * 3) * t;
    aimY += (nextCp.y - cp.y + vy * 3) * t;
  }

  let thrust = 200;
  if (diff > 90) thrust = 30;
  else if (diff > 45) thrust = 130;

  console.log(`${Math.round(aimX)} ${Math.round(aimY)} ${thrust}`);
}
