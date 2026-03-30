// Validates physics simulation against real game data from stderr logs
// Full sim: 4 pods, collisions (Magus formula), checkpoint passing
// Usage: npx tsx src/06-multi/mad-pod-racing/validate-sim.ts <file>

import { readFileSync } from 'node:fs';

interface Pod {
	x: number;
	y: number;
	vx: number;
	vy: number;
	a: number;
	ncp: number;
	shield: number; // countdown
}

interface TurnData {
	pods: Record<string, Pod>;
	moves: Record<string, string>;
}

function parseLogs(text: string): { turns: Map<number, TurnData>; cps: [number, number][] } {
	const cps: [number, number][] = [];
	const turns = new Map<number, TurnData>();
	for (const line of text.split('\n')) {
		const cpM = line.match(/^CP(\d+): (\d+) (\d+)/);
		if (cpM) {
			cps[+cpM[1]] = [+cpM[2], +cpM[3]];
			continue;
		}
		const sM = line.match(
			/^T(\d+) (M\d|E\d): x=(-?\d+) y=(-?\d+) vx=(-?\d+) vy=(-?\d+) a=(-?\d+) ncp=(\d+)/,
		);
		if (sM) {
			const t = +sM[1];
			if (!turns.has(t)) turns.set(t, { pods: {}, moves: {} });
			turns.get(t)!.pods[sM[2]] = {
				x: +sM[3], y: +sM[4], vx: +sM[5], vy: +sM[6], a: +sM[7], ncp: +sM[8], shield: 0,
			};
			continue;
		}
		const mM = line.match(/^T(\d+) (M\d) \w+: (.+)/);
		if (mM) {
			const t = +mM[1];
			if (!turns.has(t)) turns.set(t, { pods: {}, moves: {} });
			turns.get(t)!.moves[mM[2]] = mM[3];
		}
	}
	return { turns, cps };
}

// --- Physics ---

function toRad(deg: number): number {
	return (deg * Math.PI) / 180;
}
function toDeg(rad: number): number {
	return ((rad * 180) / Math.PI + 360) % 360;
}

function rotate(pod: Pod, tx: number, ty: number): void {
	if (pod.a === -1) {
		pod.a = Math.round(toDeg(Math.atan2(ty - pod.y, tx - pod.x)));
		return;
	}
	const want = toDeg(Math.atan2(ty - pod.y, tx - pod.x));
	let diff = want - pod.a;
	while (diff > 180) diff -= 360;
	while (diff < -180) diff += 360;
	if (diff > 18) diff = 18;
	if (diff < -18) diff = -18;
	pod.a = Math.round(((pod.a + diff) % 360 + 360) % 360);
}

function applyThrust(pod: Pod, thrust: number): void {
	const rad = toRad(pod.a);
	pod.vx += Math.cos(rad) * thrust;
	pod.vy += Math.sin(rad) * thrust;
}

function colTime(p1: Pod, p2: Pod, sr2: number): number {
	// Relative position and velocity
	const dx = p1.x - p2.x;
	const dy = p1.y - p2.y;
	const dvx = p1.vx - p2.vx;
	const dvy = p1.vy - p2.vy;

	const a = dvx * dvx + dvy * dvy;
	if (a < 1e-10) return 2.0;
	const b = 2 * (dx * dvx + dy * dvy);
	const c = dx * dx + dy * dy - sr2;

	const disc = b * b - 4 * a * c;
	if (disc < 0) return 2.0;

	const t = (-b - Math.sqrt(disc)) / (2 * a);
	if (t < 1e-6 || t > 1.0) return 2.0;
	return t;
}

function bounce(p1: Pod, p2: Pod): void {
	const m1 = p1.shield > 0 ? 10 : 1;
	const m2 = p2.shield > 0 ? 10 : 1;

	const dx = p1.x - p2.x;
	const dy = p1.y - p2.y;
	const d2 = dx * dx + dy * dy;
	if (d2 < 1) return;

	const dvx = p1.vx - p2.vx;
	const dvy = p1.vy - p2.vy;
	const dot = dx * dvx + dy * dvy;

	const f1 = (m2 * dot) / ((m1 + m2) * d2);
	const f2 = (m1 * dot) / ((m1 + m2) * d2);

	p1.vx -= f1 * dx;
	p1.vy -= f1 * dy;
	p2.vx += f2 * dx;
	p2.vy += f2 * dy;

	// Min impulse 120
	const impulse = Math.sqrt((f1 * dx) ** 2 + (f1 * dy) ** 2) * m1;
	if (impulse < 120) {
		const scale = 120 / (impulse || 1);
		const nf1 = f1 * scale;
		const nf2 = f2 * scale;
		// Undo old, apply new
		p1.vx += f1 * dx - nf1 * dx;
		p1.vy += f1 * dy - nf1 * dy;
		p2.vx -= f2 * dx - nf2 * dx;
		p2.vy -= f2 * dy - nf2 * dy;
	}
}

function endTurn(pod: Pod): void {
	pod.x = Math.round(pod.x);
	pod.y = Math.round(pod.y);
	pod.vx = Math.trunc(pod.vx * 0.85);
	pod.vy = Math.trunc(pod.vy * 0.85);
}

interface SimPod extends Pod {
	id: string;
}

function simFullTurn(
	pods: SimPod[],
	moves: Record<string, { tx: number; ty: number; thrust: number; shield: boolean }>,
	cps: [number, number][],
): void {
	// 1. Rotate + thrust
	for (const p of pods) {
		const m = moves[p.id];
		if (!m) continue; // enemy: we'll use their actual next state
		if (m.shield) p.shield = 4;
		rotate(p, m.tx, m.ty);
		if (p.shield <= 0) {
			applyThrust(p, m.thrust);
		}
	}

	// 2. Move with collisions
	let t = 0;
	for (let iter = 0; iter < 20 && t < 1.0 - 1e-6; iter++) {
		let firstT = 1.0 - t;
		let firstI = -1;
		let firstJ = -1;

		for (let i = 0; i < pods.length; i++) {
			for (let j = i + 1; j < pods.length; j++) {
				const ct = colTime(pods[i], pods[j], 640000);
				if (ct > 0 && ct < firstT) {
					firstT = ct;
					firstI = i;
					firstJ = j;
				}
			}
		}

		for (const p of pods) {
			p.x += p.vx * firstT;
			p.y += p.vy * firstT;
		}
		t += firstT;

		if (firstI >= 0) {
			bounce(pods[firstI], pods[firstJ]);
		} else {
			break;
		}
	}

	// 3. End: friction, round, checkpoint check
	for (const p of pods) {
		// Checkpoint
		const cp = cps[p.ncp];
		if (cp) {
			const dx = p.x - cp[0];
			const dy = p.y - cp[1];
			if (dx * dx + dy * dy < 360000) {
				// 600^2
				p.ncp = (p.ncp + 1) % cps.length;
			}
		}
		endTurn(p);
		if (p.shield > 0) p.shield--;
	}
}

function parseMove(s: string): { tx: number; ty: number; thrust: number; shield: boolean } {
	const p = s.split(' ');
	const tx = +p[0];
	const ty = +p[1];
	if (p[2] === 'BOOST') return { tx, ty, thrust: 650, shield: false };
	if (p[2] === 'SHIELD') return { tx, ty, thrust: 0, shield: true };
	return { tx, ty, thrust: +p[2], shield: false };
}

// --- Main ---

const file = process.argv[2];
if (!file) {
	console.error('Usage: npx tsx validate-sim.ts <stderr-log-file>');
	process.exit(1);
}

const text = readFileSync(file, 'utf-8');
const { turns, cps } = parseLogs(text);
const cpCount = cps.length;

console.log(`CPs: ${cps.map((c, i) => `${i}(${c[0]},${c[1]})`).join(' ')}`);
console.log(`Turns: ${turns.size}\n`);

const sortedTurns = [...turns.keys()].sort((a, b) => a - b);
const IDS = ['M0', 'M1', 'E0', 'E1'];

let totalErr = 0;
let count = 0;
let maxErr = 0;
let maxErrLabel = '';

for (let i = 0; i < sortedTurns.length - 1; i++) {
	const t = sortedTurns[i];
	if (t + 1 !== sortedTurns[i + 1]) continue;

	const cur = turns.get(t)!;
	const next = turns.get(t + 1)!;

	// Need all 4 pods
	if (IDS.some((id) => !cur.pods[id])) continue;
	// Skip if any pod has a=-1 (first turn)
	if (IDS.some((id) => cur.pods[id].a === -1)) continue;

	// Build sim pods
	const pods: SimPod[] = IDS.map((id) => ({ ...cur.pods[id], id, shield: 0 }));

	// Moves: for M0/M1 use logged moves, for E0/E1 use actual next state to infer
	// Actually, enemies: we know their state at T and T+1, so we can reverse-engineer their move
	// But simpler: for enemies, compute what move would produce their T+1 state
	// Simplest: use their actual velocity change to infer thrust direction+amount
	// Even simpler: just aim at their next CP with thrust 100 (rough approximation)
	const moves: Record<string, { tx: number; ty: number; thrust: number; shield: boolean }> = {};

	for (const id of ['M0', 'M1']) {
		if (cur.moves[id]) {
			moves[id] = parseMove(cur.moves[id]);
		}
	}

	// For enemies: reverse-engineer their actual thrust from state change
	// After rotate+thrust: vx' = vx + cos(a')*thrust, then move, then friction
	// We know vx_next = trunc((vx + cos(a')*thrust + ...) * 0.85)
	// Approximate: use actual next-turn angle to get thrust direction
	for (const id of ['E0', 'E1']) {
		const ep = cur.pods[id];
		const enp = next.pods[id];
		if (!enp) continue;

		// The game rotates first, then thrusts. enp.a is the angle AFTER rotation at T+1,
		// but we need the angle AFTER rotation at T (which becomes the thrust direction).
		// That angle is what the enemy had when they thrust. We can infer it:
		// After friction: vx_after = trunc(vx_before_friction * 0.85)
		// vx_before_friction = vx_after_move = ep.vx + cos(angle_after_rotate)*thrust
		// But we don't know thrust... Use the next turn's state to back-calculate.
		// Simpler: just use their actual next angle as approximation of their thrust angle
		// (it's the angle after their NEXT rotation, off by up to 18 degrees)
		// Best we can do without more info: aim at their CP
		const ecp = cps[ep.ncp];
		if (ecp) {
			moves[id] = { tx: ecp[0], ty: ecp[1], thrust: 100, shield: false };
		} else {
			moves[id] = { tx: ep.x + ep.vx, ty: ep.y + ep.vy, thrust: 100, shield: false };
		}
	}

	simFullTurn(pods, moves, cps);

	// Compare M0 and M1 only (enemies have approximate moves)
	for (const id of ['M0', 'M1']) {
		const pred = pods.find((p) => p.id === id)!;
		const actual = next.pods[id];
		if (!actual) continue;

		const dx = pred.x - actual.x;
		const dy = pred.y - actual.y;
		const dvx = pred.vx - actual.vx;
		const dvy = pred.vy - actual.vy;
		const da = pred.a - actual.a;
		const posErr = Math.sqrt(dx * dx + dy * dy);
		const velErr = Math.sqrt(dvx * dvx + dvy * dvy);

		totalErr += posErr;
		count++;
		const label = `T${t} ${id}`;
		if (posErr > maxErr) {
			maxErr = posErr;
			maxErrLabel = label;
		}

		if (posErr > 3 || velErr > 3 || Math.abs(da) > 1) {
			// Find min distance to any other pod at start of turn
			const me = cur.pods[id];
			let minDist = 99999;
			let nearId = '';
			for (const oid of IDS) {
				if (oid === id) continue;
				const o = cur.pods[oid];
				if (!o) continue;
				const d = Math.sqrt((me.x - o.x) ** 2 + (me.y - o.y) ** 2);
				if (d < minDist) { minDist = d; nearId = oid; }
			}
			console.log(
				`${label}: pos=${posErr.toFixed(1)} vel=${velErr.toFixed(1)} da=${da}` +
					`  near=${nearId}@${minDist.toFixed(0)}` +
					`  pred=(${pred.x},${pred.y},${pred.vx},${pred.vy})` +
					`  actual=(${actual.x},${actual.y},${actual.vx},${actual.vy})`,
			);
		}
	}
}

console.log(`\nSamples: ${count}, Avg pos err: ${(totalErr / count).toFixed(2)}, Max: ${maxErr.toFixed(1)} at ${maxErrLabel}`);
