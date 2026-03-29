export interface State {
  W: number;
  H: number;
  cx: number;
  cy: number;
  px: number;
  py: number;
  xLo: number;
  xHi: number;
  yLo: number;
  yHi: number;
  doingX: boolean;
}

export function initState(W: number, H: number, x0: number, y0: number): State {
  return { W, H, cx: x0, cy: y0, px: x0, py: y0, xLo: 0, xHi: W - 1, yLo: 0, yHi: H - 1, doingX: true };
}

export function step(s: State, hint: string): [number, number] {
  if (hint !== 'UNKNOWN') {
    if (s.doingX && s.cy === s.py) update(s, 'x', hint);
    else if (!s.doingX && s.cx === s.px) update(s, 'y', hint);
  }

  const wasDoingX = s.doingX;
  if (s.xLo >= s.xHi) s.doingX = false;

  s.px = s.cx; s.py = s.cy;

  if (s.doingX) {
    s.cx = pick(s.cx, s.xLo, s.xHi);
  } else if (wasDoingX && s.cx !== s.xLo) {
    s.cx = s.xLo;
  } else {
    s.cx = s.xLo;
    s.cy = pick(s.cy, s.yLo, s.yHi);
  }
  return [s.cx, s.cy];
}

function update(s: State, axis: 'x' | 'y', hint: string): void {
  const prev = axis === 'x' ? s.px : s.py;
  const cur = axis === 'x' ? s.cx : s.cy;
  const mid = (prev + cur) / 2;
  if (hint === 'SAME') {
    if (axis === 'x') s.xLo = s.xHi = Math.round(mid);
    else s.yLo = s.yHi = Math.round(mid);
    return;
  }
  const above = (hint === 'WARMER' && cur > prev) || (hint === 'COLDER' && cur < prev);
  if (above) {
    if (axis === 'x') s.xLo = Math.max(s.xLo, Math.floor(mid) + 1);
    else s.yLo = Math.max(s.yLo, Math.floor(mid) + 1);
  } else {
    if (axis === 'x') s.xHi = Math.min(s.xHi, Math.ceil(mid) - 1);
    else s.yHi = Math.min(s.yHi, Math.ceil(mid) - 1);
  }
}

function pick(cur: number, lo: number, hi: number): number {
  if (lo === hi) return lo;
  const m = Math.round((lo + hi) / 2);
  if (m !== cur) return m;
  return cur === lo ? hi : lo;
}
