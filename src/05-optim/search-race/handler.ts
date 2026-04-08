const CP_RADIUS = 600;

interface Checkpoint {
  x: number;
  y: number;
}

export function solve(
  checkpoints: Checkpoint[],
  cpIndex: number,
  x: number,
  y: number,
  vx: number,
  vy: number,
  angle: number,
): string {
  const cp = checkpoints[cpIndex];
  const nextCpIndex = (cpIndex + 1) % checkpoints.length;
  const nextCp = checkpoints[nextCpIndex];

  // Vector to checkpoint
  const dx = cp.x - x;
  const dy = cp.y - y;
  const dist = Math.sqrt(dx * dx + dy * dy);

  // Angle to checkpoint
  const targetAngle = (Math.atan2(dy, dx) * 180) / Math.PI;
  let angleDiff = targetAngle - angle;
  // Normalize to [-180, 180]
  while (angleDiff > 180) angleDiff -= 360;
  while (angleDiff < -180) angleDiff += 360;

  // Predict position after applying current velocity
  const futureX = x + vx;
  const futureY = y + vy;
  const futureDx = cp.x - futureX;
  const futureDy = cp.y - futureY;
  const futureDist = Math.sqrt(futureDx * futureDx + futureDy * futureDy);

  // Aim point: when close to checkpoint, start aiming at next one
  let aimX = cp.x;
  let aimY = cp.y;

  if (futureDist < CP_RADIUS * 3) {
    // Blend toward next checkpoint as we approach current one
    const blend = Math.max(0, 1 - futureDist / (CP_RADIUS * 3));
    aimX = cp.x + (nextCp.x - cp.x) * blend;
    aimY = cp.y + (nextCp.y - cp.y) * blend;
  }

  // Thrust: full speed when aligned, slow down for sharp turns
  const absAngle = Math.abs(angleDiff);
  let thrust: number;

  if (absAngle > 90) {
    thrust = 20;
  } else if (absAngle > 45) {
    thrust = Math.round(100 - absAngle);
  } else {
    thrust = 200;
  }

  // Slow down when approaching checkpoint at high speed to avoid overshooting
  const speed = Math.sqrt(vx * vx + vy * vy);
  if (dist < CP_RADIUS * 4 && speed > 200) {
    thrust = Math.min(thrust, Math.round((dist / (CP_RADIUS * 4)) * 200));
  }

  return `${Math.round(aimX)} ${Math.round(aimY)} ${thrust}`;
}
