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
  history: { px: number; py: number; cx: number; cy: number; hint: string }[];
}

export function initState(W: number, H: number, x0: number, y0: number): State {
  let scale = 1;
  while (Math.ceil(W / scale) * Math.ceil(H / scale) > 62500) scale *= 2;
  const candidates: [number, number][] = [];
  for (let y = 0; y < H; y += scale) {
    for (let x = 0; x < W; x += scale) {
      candidates.push([Math.min(x + (scale >> 1), W - 1), Math.min(y + (scale >> 1), H - 1)]);
    }
  }
  return {
    W,
    H,
    cx: x0,
    cy: y0,
    px: x0,
    py: y0,
    candidates,
    scale,
    refined: scale === 1,
    history: [],
  };
}

function filt(
  c: [number, number][],
  px: number,
  py: number,
  cx: number,
  cy: number,
  h: string,
  scale = 1,
): [number, number][] {
  return c.filter(([bx, by]) => {
    const dp = (bx - px) ** 2 + (by - py) ** 2;
    const dc = (bx - cx) ** 2 + (by - cy) ** 2;
    if (h === 'WARMER') return dc < dp;
    if (h === 'COLDER') return dc > dp;
    // SAME: only filter at pixel level
    return scale <= 1 ? dc === dp : true;
  });
}

function splitScore(
  candidates: [number, number][],
  cx: number,
  cy: number,
  tx: number,
  ty: number,
): number {
  let w = 0,
    c = 0;
  for (const [bx, by] of candidates) {
    const dp = (bx - cx) ** 2 + (by - cy) ** 2;
    const dt = (bx - tx) ** 2 + (by - ty) ** 2;
    if (dt < dp) w++;
    else if (dt > dp) c++;
  }
  return Math.abs(w - c);
}

export function step(s: State, hint: string): [number, number] {
  if (hint === 'WARMER' || hint === 'COLDER' || hint === 'SAME') {
    s.history.push({ px: s.px, py: s.py, cx: s.cx, cy: s.cy, hint });
    s.candidates = filt(s.candidates, s.px, s.py, s.cx, s.cy, hint, s.scale);

    if (!s.refined && s.candidates.length <= 3) {
      const half = s.scale;
      const seen = new Set<string>();
      let exp: [number, number][] = [];
      for (const [sx, sy] of s.candidates) {
        for (let ny = sy - half; ny <= sy + half; ny++) {
          for (let nx = sx - half; nx <= sx + half; nx++) {
            const px2 = Math.max(0, Math.min(s.W - 1, nx));
            const py2 = Math.max(0, Math.min(s.H - 1, ny));
            const k = `${px2},${py2}`;
            if (!seen.has(k)) {
              seen.add(k);
              exp.push([px2, py2]);
            }
          }
        }
      }
      for (const h of s.history) exp = filt(exp, h.px, h.py, h.cx, h.cy, h.hint);
      s.candidates = exp;
      s.scale = 1;
      s.refined = true;
    }
  }

  s.px = s.cx;
  s.py = s.cy;

  if (s.candidates.length <= 1) {
    if (s.candidates.length === 1) [s.cx, s.cy] = s.candidates[0];
    return [s.cx, s.cy];
  }

  // Centroid
  let sx = 0,
    sy = 0;
  for (const [x, y] of s.candidates) {
    sx += x;
    sy += y;
  }
  let nx = Math.round(sx / s.candidates.length);
  let ny = Math.round(sy / s.candidates.length);

  if (s.candidates.length <= 80) {
    let bestScore = Infinity;
    for (const [tx, ty] of s.candidates) {
      if (tx === s.cx && ty === s.cy) continue;
      const score = splitScore(s.candidates, s.cx, s.cy, tx, ty);
      if (score < bestScore) {
        bestScore = score;
        nx = tx;
        ny = ty;
      }
    }
  }
  // For large sets, centroid is used as-is

  if (nx === s.cx && ny === s.cy) {
    let md = -1;
    for (const [x, y] of s.candidates) {
      const d = (x - nx) ** 2 + (y - ny) ** 2;
      if (d > md) {
        md = d;
        nx = x;
        ny = y;
      }
    }
  }

  s.cx = nx;
  s.cy = ny;
  return [s.cx, s.cy];
}
