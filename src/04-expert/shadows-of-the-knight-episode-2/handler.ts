export interface State {
  W: number;
  H: number;
  cx: number;
  cy: number;
  px: number;
  py: number;
  candidates: [number, number][];
  scale: number;
  refined: boolean;
}

export function initState(W: number, H: number, x0: number, y0: number): State {
  let scale = 1;
  while (Math.ceil(W / scale) * Math.ceil(H / scale) > 10000) scale *= 2;

  const candidates: [number, number][] = [];
  for (let y = 0; y < H; y += scale) {
    for (let x = 0; x < W; x += scale) {
      // Use center of each cell
      candidates.push([
        Math.min(x + Math.floor(scale / 2), W - 1),
        Math.min(y + Math.floor(scale / 2), H - 1),
      ]);
    }
  }

  return { W, H, cx: x0, cy: y0, px: x0, py: y0, candidates, scale, refined: scale === 1 };
}

export function step(s: State, hint: string): [number, number] {
  if (hint === 'WARMER' || hint === 'COLDER' || hint === 'SAME') {
    const { px, py, cx, cy } = s;

    s.candidates = s.candidates.filter(([bx, by]) => {
      const dPrev = (bx - px) ** 2 + (by - py) ** 2;
      const dCur = (bx - cx) ** 2 + (by - cy) ** 2;
      if (hint === 'WARMER') return dCur < dPrev;
      if (hint === 'COLDER') return dCur > dPrev;
      return dCur === dPrev;
    });

    // Refine when few super-windows remain
    if (!s.refined && s.candidates.length <= 4) {
      const newCandidates: [number, number][] = [];
      const half = Math.ceil(s.scale / 2);
      for (const [sx, sy] of s.candidates) {
        for (let dy = -half; dy <= half; dy++) {
          for (let dx = -half; dx <= half; dx++) {
            const nx = sx + dx, ny = sy + dy;
            if (nx >= 0 && nx < s.W && ny >= 0 && ny < s.H) {
              const dPrev = (nx - px) ** 2 + (ny - py) ** 2;
              const dCur = (nx - cx) ** 2 + (ny - cy) ** 2;
              const ok = hint === 'WARMER' ? dCur < dPrev : hint === 'COLDER' ? dCur > dPrev : dCur === dPrev;
              if (ok) newCandidates.push([nx, ny]);
            }
          }
        }
      }
      // Deduplicate
      const seen = new Set<string>();
      s.candidates = newCandidates.filter(([x, y]) => {
        const k = `${x},${y}`;
        if (seen.has(k)) return false;
        seen.add(k);
        return true;
      });
      s.refined = true;
    }
  }

  s.px = s.cx; s.py = s.cy;

  if (s.candidates.length <= 1) {
    if (s.candidates.length === 1) [s.cx, s.cy] = s.candidates[0];
    return [s.cx, s.cy];
  }

  // Jump to centroid
  let sumX = 0, sumY = 0;
  for (const [x, y] of s.candidates) { sumX += x; sumY += y; }
  let nx = Math.round(sumX / s.candidates.length);
  let ny = Math.round(sumY / s.candidates.length);

  if (nx === s.cx && ny === s.cy) {
    // Find furthest candidate
    let maxD = -1;
    for (const [x, y] of s.candidates) {
      const d = (x - nx) ** 2 + (y - ny) ** 2;
      if (d > maxD) { maxD = d; nx = x; ny = y; }
    }
  }

  s.cx = Math.max(0, Math.min(s.W - 1, nx));
  s.cy = Math.max(0, Math.min(s.H - 1, ny));
  return [s.cx, s.cy];
}
