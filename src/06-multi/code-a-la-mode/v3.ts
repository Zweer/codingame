declare function readline(): string;

interface Pos { x: number; y: number }
interface TableItem { pos: Pos; item: string[] }
interface Order { item: string[]; award: number }

const grid: string[] = [];
const eq: Record<string, Pos> = {};

const numCust = +readline();
const allOrders: Order[] = [];
for (let i = 0; i < numCust; i++) {
  const p = readline().split(' ');
  allOrders.push({ item: p[0].split('-'), award: +p[1] });
}
for (let y = 0; y < 7; y++) {
  const row = readline();
  grid.push(row);
  for (let x = 0; x < 11; x++) {
    const ch = row[x];
    if (ch === 'D') eq['DISH'] = { x, y };
    if (ch === 'W') eq['WINDOW'] = { x, y };
    if (ch === 'O') eq['OVEN'] = { x, y };
    if (ch === 'C') eq['CHOP'] = { x, y };
    if (ch === 'B') eq['BLUEBERRIES'] = { x, y };
    if (ch === 'I') eq['ICE_CREAM'] = { x, y };
    if (ch === 'S') eq['STRAWBERRIES'] = { x, y };
    if (ch === 'H') eq['DOUGH'] = { x, y };
  }
}

function walkable(x: number, y: number): boolean {
  const ch = grid[y]?.[x];
  return ch === '.' || ch === '0' || ch === '1';
}

function dist(from: Pos, to: Pos, block: Pos | null): number {
  if (Math.abs(from.x - to.x) <= 1 && Math.abs(from.y - to.y) <= 1 &&
      !(from.x === to.x && from.y === to.y)) return 0;
  const d = new Int16Array(77).fill(-1);
  d[from.y * 11 + from.x] = 0;
  const q: Pos[] = [from];
  let qi = 0;
  while (qi < q.length) {
    const c = q[qi++];
    const cd = d[c.y * 11 + c.x];
    for (const [dx, dy] of [[-1,0],[1,0],[0,-1],[0,1]] as const) {
      const nx = c.x + dx, ny = c.y + dy;
      if (nx < 0 || nx >= 11 || ny < 0 || ny >= 7) continue;
      if (!walkable(nx, ny)) continue;
      if (block && nx === block.x && ny === block.y) continue;
      const k = ny * 11 + nx;
      if (d[k] >= 0) continue;
      d[k] = cd + 1;
      if (Math.abs(nx - to.x) <= 1 && Math.abs(ny - to.y) <= 1) return Math.ceil(d[k] / 4);
      q.push({ x: nx, y: ny });
    }
  }
  return 999;
}

let me: Pos & { items: string[] };
let partner: Pos & { items: string[] };
let tables: TableItem[];
let oven: string[];
let ovenTimer: number;
let queue: Order[];
let turnsLeft: number;

const has = (a: string[], p: string) => a.includes(p);
const empty = (a: string[]) => a.length === 0 || (a.length === 1 && a[0] === 'NONE');
const findTable = (p: string) => tables.find(t => t.item.length === 1 && t.item[0] === p);

function findEmpty(): Pos | null {
  const occ = new Set(tables.map(t => t.pos.y * 11 + t.pos.x));
  let best: Pos | null = null, bd = 999;
  for (let y = 0; y < 7; y++)
    for (let x = 0; x < 11; x++) {
      if (grid[y][x] !== '#') continue;
      if (occ.has(y * 11 + x)) continue;
      const d = dist(me, { x, y }, partner);
      if (d < bd) { bd = d; best = { x, y }; }
    }
  return best;
}

function findDish(order: string[]): TableItem | null {
  let best: TableItem | null = null, bl = 0;
  for (const t of tables) {
    if (!has(t.item, 'DISH')) continue;
    if (t.item.every(p => order.includes(p)) && t.item.length > bl) { best = t; bl = t.item.length; }
  }
  return best;
}

function use(p: Pos, m = '') { console.log(`USE ${p.x} ${p.y}${m ? '; ' + m : ''}`); }

function cost(order: string[]): number {
  const need = order.filter(p => p !== 'DISH');
  let c = 0;
  for (const p of need) {
    if (has(me.items, p)) continue;
    const t = findTable(p);
    if (t) { c += dist(me, t.pos, partner) + 1; continue; }
    if (p === 'BLUEBERRIES' || p === 'ICE_CREAM') { c += dist(me, eq[p], partner) + 1; continue; }
    if (p === 'CROISSANT') {
      if (has(oven, 'CROISSANT')) { c += dist(me, eq['OVEN'], partner) + 1; continue; }
      if (has(oven, 'DOUGH')) { c += Math.ceil(ovenTimer / 4) + 1; continue; }
      c += 10; continue;
    }
    if (p === 'TART') {
      if (has(oven, 'TART')) { c += dist(me, eq['OVEN'], partner) + 1; continue; }
      if (has(oven, 'RAW_TART')) { c += Math.ceil(ovenTimer / 4) + 1; continue; }
      c += 14; continue;
    }
    if (p === 'CHOPPED_STRAWBERRIES') { c += 5; continue; }
    c += 3;
  }
  if (!has(me.items, 'DISH')) c += 2;
  c += 2;
  return c;
}

let target: string[] | null = null;

function choose(): Order | null {
  if (!queue.length) return null;
  let best: Order | null = null, bs = -1;
  for (const o of queue) {
    const c = cost(o.item);
    // Don't pick orders we can't finish in time
    if (c * 2 > turnsLeft) continue;
    const s = Math.max(0, o.award - c) / Math.max(1, c);
    if (s > bs) { bs = s; best = o; }
  }
  return best || queue.reduce((a, b) => cost(a.item) < cost(b.item) ? a : b);
}

function turn() {
  const my = me.items;

  if (target) {
    const ok = queue.some(o => o.item.length === target!.length && o.item.every(p => target!.includes(p)));
    if (!ok) target = null;
  }
  if (!target) {
    const c = choose();
    if (!c) { console.log('WAIT'); return; }
    target = c.item;
  }

  const order = target;
  const need = order.filter(p => p !== 'DISH');

  // If we have everything, deliver
  if (has(my, 'DISH') && need.every(p => has(my, p)))
    return use(eq['WINDOW'], 'deliver');

  // Carrying a dish
  if (has(my, 'DISH')) {
    // Wrong items? Dishwash
    if (my.some(p => p !== 'DISH' && !need.includes(p)))
      return use(eq['DISH'], 'dishwash');

    for (const p of need) {
      if (has(my, p)) continue;
      if (p === 'BLUEBERRIES') return use(eq['BLUEBERRIES'], 'grab blueberries');
      if (p === 'ICE_CREAM') return use(eq['ICE_CREAM'], 'grab ice cream');
      if ((p === 'CROISSANT' && has(oven, 'CROISSANT')) || (p === 'TART' && has(oven, 'TART')))
        return use(eq['OVEN'], `grab ${p} from oven`);
      const t = findTable(p);
      if (t) return use(t.pos, `grab ${p}`);
      // Need to process - drop dish
      const e = findEmpty();
      if (e) return use(e, 'drop dish');
      console.log('WAIT'); return;
    }
    return use(eq['WINDOW'], 'deliver');
  }

  // Not carrying dish - check what needs processing
  function avail(p: string): boolean {
    if (!['CHOPPED_STRAWBERRIES', 'CROISSANT', 'TART'].includes(p)) return true;
    if (findTable(p)) return true;
    if (p === 'CROISSANT' && (has(oven, 'CROISSANT') || has(oven, 'DOUGH'))) return true;
    if (p === 'TART' && (has(oven, 'TART') || has(oven, 'RAW_TART'))) return true;
    return false;
  }

  const missing = need.filter(p => !avail(p) && !has(my, p));

  if (missing.length > 0) {
    const p = missing[0];

    if (p === 'CHOPPED_STRAWBERRIES') {
      if (has(my, 'CHOPPED_STRAWBERRIES')) { const e = findEmpty(); if (e) return use(e, 'store'); }
      if (has(my, 'STRAWBERRIES')) return use(eq['CHOP'], 'chop');
      if (!empty(my)) { const e = findEmpty(); if (e) return use(e, 'drop'); }
      return use(eq['STRAWBERRIES'], 'get strawberries');
    }

    if (p === 'CROISSANT') {
      if (has(my, 'CROISSANT')) { const e = findEmpty(); if (e) return use(e, 'store'); }
      if (has(my, 'DOUGH')) {
        // Only bake if oven is free
        if (oven[0] === 'NONE') return use(eq['OVEN'], 'bake croissant');
        // Oven busy - store dough and do something else
        const e = findEmpty();
        if (e) return use(e, 'store dough');
        console.log('WAIT'); return;
      }
      if (!empty(my)) { const e = findEmpty(); if (e) return use(e, 'drop'); }
      return use(eq['DOUGH'], 'get dough');
    }

    if (p === 'TART') {
      if (has(my, 'TART')) { const e = findEmpty(); if (e) return use(e, 'store'); }
      if (has(my, 'RAW_TART')) {
        if (oven[0] === 'NONE') return use(eq['OVEN'], 'bake tart');
        const e = findEmpty();
        if (e) return use(e, 'store raw tart');
        console.log('WAIT'); return;
      }
      if (has(my, 'CHOPPED_DOUGH')) return use(eq['BLUEBERRIES'], 'make raw tart');
      if (has(my, 'DOUGH')) return use(eq['CHOP'], 'chop dough');
      // Check intermediates on tables
      for (const inter of ['RAW_TART', 'CHOPPED_DOUGH']) {
        const t = findTable(inter);
        if (t && empty(my)) return use(t.pos, `pickup ${inter}`);
      }
      if (!empty(my)) { const e = findEmpty(); if (e) return use(e, 'drop'); }
      return use(eq['DOUGH'], 'get dough');
    }
  }

  // All ready - get a dish
  if (empty(my)) {
    const d = findDish(order);
    if (d && d.item.length > 1) return use(d.pos, 'pickup dish');
    return use(eq['DISH'], 'get dish');
  }

  // Carrying a finished dessert - get dish with it
  if (my.length === 1 && ['BLUEBERRIES','ICE_CREAM','CHOPPED_STRAWBERRIES','CROISSANT','TART'].includes(my[0]))
    return use(eq['DISH'], 'dish+item');

  // Drop whatever
  const e = findEmpty();
  if (e) return use(e, 'drop');
  console.log('WAIT');
}

while (true) {
  turnsLeft = +readline();
  const pl = readline().split(' ');
  me = { x: +pl[0], y: +pl[1], items: pl[2].split('-') };
  const pa = readline().split(' ');
  partner = { x: +pa[0], y: +pa[1], items: pa[2].split('-') };
  tables = [];
  const nt = +readline();
  for (let i = 0; i < nt; i++) {
    const t = readline().split(' ');
    tables.push({ pos: { x: +t[0], y: +t[1] }, item: t[2].split('-') });
  }
  const ol = readline().split(' ');
  oven = ol[0].split('-');
  ovenTimer = +ol[1];
  queue = [];
  const nq = +readline();
  for (let i = 0; i < nq; i++) {
    const q = readline().split(' ');
    queue.push({ item: q[0].split('-'), award: +q[1] });
  }
  turn();
}
