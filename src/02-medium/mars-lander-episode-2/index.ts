const n = Number(readline());
const land: [number, number][] = [];
for (let i = 0; i < n; i++) {
  const [x, y] = readline().split(' ').map(Number);
  land.push([x, y]);
}

let flatX = 0, flatY = 0, flatLeft = 0, flatRight = 0;
for (let i = 0; i < land.length - 1; i++) {
  if (land[i][1] === land[i + 1][1]) {
    flatLeft = land[i][0];
    flatRight = land[i + 1][0];
    flatX = (flatLeft + flatRight) / 2;
    flatY = land[i][1];
    break;
  }
}

while (true) {
  const [x, y, hs, vs, fuel, rotate, power] = readline().split(' ').map(Number);
  const dx = flatX - x;
  const distToGround = y - flatY;
  const aboveFlat = x >= flatLeft && x <= flatRight;

  let angle = 0, thrust = 4;

  if (!aboveFlat || Math.abs(dx) > 400) {
    const targetHs = Math.max(-50, Math.min(50, dx * 0.15));
    angle = Math.round(Math.max(-60, Math.min(60, -(targetHs - hs) * 1.5)));
  } else if (Math.abs(hs) > 15) {
    angle = Math.round(Math.max(-60, Math.min(60, hs * 2)));
  } else {
    angle = 0;
    const targetVs = -Math.min(40, Math.max(10, distToGround * 0.04));
    thrust = vs < targetVs - 5 ? 4 : vs > targetVs + 5 ? 3 : 3;
  }

  console.log(`${Math.max(-90, Math.min(90, angle))} ${Math.max(0, Math.min(4, thrust))}`);
}
