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
    if (s.doingX && s.cy === s.py) {
      const mid = (s.px + s.cx) / 2;
      if (hint === 'SAME') {
        s.xLo = s.xHi = Math.round(mid);
      } else if ((hint === 'WARMER' && s.cx > s.px) || (hint === 'COLDER' && s.cx < s.px)) {
        s.xLo = Math.max(s.xLo, Math.floor(mid) + 1);
      } else {
        s.xHi = Math.min(s.xHi, Math.ceil(mid) - 1);
      }
    } else if (!s.doingX && s.cx === s.px) {
      const mid = (s.py + s.cy) / 2;
      if (hint === 'SAME') {
        s.yLo = s.yHi = Math.round(mid);
      } else if ((hint === 'WARMER' && s.cy > s.py) || (hint === 'COLDER' && s.cy < s.py)) {
        s.yLo = Math.max(s.yLo, Math.floor(mid) + 1);
      } else {
        s.yHi = Math.min(s.yHi, Math.ceil(mid) - 1);
      }
    }
  }

  if (s.xLo >= s.xHi) s.doingX = false;

  s.px = s.cx; s.py = s.cy;

  if (s.doingX) {
    const mid = Math.round((s.xLo + s.xHi) / 2);
    if (mid !== s.cx) s.cx = mid;
    else if (s.cx < s.xHi) s.cx = s.xHi;
    else s.cx = s.xLo;
  } else {
    s.cx = s.xLo;
    const mid = Math.round((s.yLo + s.yHi) / 2);
    if (mid !== s.cy) s.cy = mid;
    else if (s.cy < s.yHi) s.cy = s.yHi;
    else s.cy = s.yLo;
  }

  return [s.cx, s.cy];
}
