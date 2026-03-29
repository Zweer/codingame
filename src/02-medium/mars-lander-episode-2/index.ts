const n = Number(readline());
const land: [number, number][] = [];
for (let i = 0; i < n; i++) {
  const [x, y] = readline().split(' ').map(Number);
  land.push([x, y]);
}

let flatL = 0, flatR = 0, flatY = 0;
for (let i = 0; i < land.length - 1; i++) {
  if (land[i][1] === land[i + 1][1]) {
    flatL = land[i][0]; flatR = land[i + 1][0]; flatY = land[i][1];
    break;
  }
}
const flatX = (flatL + flatR) / 2;

while (true) {
  const [x, y, hs, vs, fuel, rot, pow] = readline().split(' ').map(Number);
  const dx = flatX - x;
  const dy = y - flatY;
  const aboveFlat = x > flatL + 50 && x < flatR - 50;

  let angle: number, thrust: number;

  if (!aboveFlat) {
    // Phase 1: fly toward flat zone
    const desiredHs = Math.max(-60, Math.min(60, dx * 0.3));
    const hsErr = desiredHs - hs;
    angle = Math.round(-hsErr * 0.7);
    angle = Math.max(-45, Math.min(45, angle));
    // Keep altitude
    thrust = vs < -20 ? 4 : 3;
  } else if (Math.abs(hs) > 20) {
    // Phase 2: kill horizontal speed
    angle = Math.round(Math.max(-45, Math.min(45, hs * 1.2)));
    thrust = 4;
  } else {
    // Phase 3: vertical descent
    angle = Math.round(Math.max(-15, Math.min(15, hs * 0.5)));
    // Desired vertical speed based on altitude
    const desiredVs = -3 - Math.sqrt(Math.max(0, dy - 20)) * 0.6;
    const clampedDesiredVs = Math.max(-40, desiredVs);
    if (vs < clampedDesiredVs - 3) thrust = 4;
    else if (vs > clampedDesiredVs + 3) thrust = 2;
    else thrust = 3;
  }

  angle = Math.max(-90, Math.min(90, angle));
  thrust = Math.max(0, Math.min(4, thrust));
  console.log(`${angle} ${thrust}`);
}
