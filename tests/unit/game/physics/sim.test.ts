import { describe, expect, it } from 'vitest';
import { WORLD, isOverboard } from '$lib/game/rules';
import {
	MAX_FRAMES,
	advance,
	applyToss,
	bodyPoses,
	createSim,
	newRunState,
	onCollision,
	rebuildFromRest,
	restState,
	spawnCargo
} from '$lib/game/physics/sim';

function runToRest(sim: ReturnType<typeof createSim>) {
	const rs = newRunState();
	advance(sim, rs, MAX_FRAMES);
	return rs;
}

describe('sim', () => {
	it('a dropped crate settles on the deck, not overboard', () => {
		const sim = createSim();
		spawnCargo(sim, 'crate', 270, 200);
		const rs = runToRest(sim);
		expect(rs.done).toBe(true);
		const rest = restState(sim);
		expect(rest[0].y).toBeLessThan(WORLD.deckY);
		expect(isOverboard(rest)).toBe(false);
	});
	it('a crate tossed hard sideways goes overboard', () => {
		const sim = createSim();
		const body = spawnCargo(sim, 'crate', 270, 200);
		applyToss(body, { vx: 18, vy: 0 });
		runToRest(sim);
		expect(isOverboard(restState(sim))).toBe(true);
	});
	it('a spill concludes shortly after the splash, not at the frame cap', () => {
		const sim = createSim();
		const body = spawnCargo(sim, 'crate', 270, 200);
		applyToss(body, { vx: 18, vy: 0 });
		const rs = runToRest(sim);
		expect(rs.done).toBe(true);
		expect(isOverboard(restState(sim))).toBe(true);
		expect(rs.frames).toBeLessThan(300);
	});
	it('the deck lip catches a slowly rolling tire', () => {
		const sim = createSim();
		const body = spawnCargo(sim, 'tire', 270, 200);
		applyToss(body, { vx: 3, vy: 0 });
		const rs = runToRest(sim);
		expect(rs.done).toBe(true);
		expect(isOverboard(restState(sim))).toBe(false);
	});
	it('never exceeds the frame cap even for a bouncy ball', () => {
		const sim = createSim();
		spawnCargo(sim, 'beachball', 270, 160);
		const rs = runToRest(sim);
		expect(rs.frames).toBeLessThanOrEqual(MAX_FRAMES);
		expect(rs.done).toBe(true);
	});
	it('records a monotonic trajectory including every body', () => {
		const sim = createSim();
		spawnCargo(sim, 'crate', 200, 500);
		spawnCargo(sim, 'barrel', 340, 200);
		const rs = runToRest(sim);
		expect(rs.trajectory.length).toBeGreaterThan(3);
		for (let i = 1; i < rs.trajectory.length; i++) {
			expect(rs.trajectory[i].t).toBeGreaterThan(rs.trajectory[i - 1].t);
			expect(rs.trajectory[i].bodies.length).toBe(2);
		}
	});
	it('rebuildFromRest reproduces a stable stack', () => {
		const sim = createSim();
		spawnCargo(sim, 'crate', 270, 400);
		runToRest(sim);
		const rest = restState(sim);
		const sim2 = createSim();
		rebuildFromRest(sim2, rest);
		const rs2 = runToRest(sim2);
		expect(rs2.done).toBe(true);
		expect(isOverboard(restState(sim2))).toBe(false);
		expect(restState(sim2)[0].x).toBeCloseTo(rest[0].x, 0);
	});
	it('bodyPoses reports origin offsets that recover the spawn point at angle 0', () => {
		const sim = createSim();
		spawnCargo(sim, 'bathtub', 300, 400);
		const p = bodyPoses(sim)[0];
		expect(p.x + p.ox).toBeCloseTo(300, 5);
		expect(p.y + p.oy).toBeCloseTo(400, 5);
		const sim2 = createSim();
		spawnCargo(sim2, 'crate', 300, 400);
		const pc = bodyPoses(sim2)[0];
		expect(pc.ox).toBeCloseTo(0, 5);
		expect(pc.oy).toBeCloseTo(0, 5);
	});
	it('onCollision fires when a dropped crate hits the deck', () => {
		const sim = createSim();
		let hits = 0;
		onCollision(sim, () => hits++);
		spawnCargo(sim, 'crate', 270, 200);
		runToRest(sim);
		expect(hits).toBeGreaterThan(0);
	});
	it('a bouncy duck wedged in the bathtub settles instead of vibrating forever', () => {
		const sim = createSim();
		rebuildFromRest(sim, [{ cargoId: 'bathtub', x: 270, y: 735, angle: 0 }]);
		spawnCargo(sim, 'duck', 270, 640);
		const rs = runToRest(sim);
		expect(rs.done).toBe(true);
		expect(rs.frames).toBeLessThan(MAX_FRAMES);
		const rest = restState(sim);
		expect(isOverboard(rest)).toBe(false);
		// re-running the settled stack must not drift it (no perpetual jitter)
		const sim2 = createSim();
		rebuildFromRest(sim2, rest);
		const rs2 = runToRest(sim2);
		expect(rs2.frames).toBeLessThan(MAX_FRAMES);
		expect(restState(sim2)[1].x).toBeCloseTo(rest[1].x, -1);
	});
	it('the bow foredeck is solid — a crate resting on it stays put', () => {
		const sim = createSim();
		// place directly on the shelf (bottom 1px above it) — wide items that
		// straddle the lip may still tumble off; that part is emergent comedy
		rebuildFromRest(sim, [{ cargoId: 'crate', x: 519, y: 729, angle: 0 }]);
		const rs = runToRest(sim);
		expect(rs.done).toBe(true);
		const rest = restState(sim);
		expect(isOverboard(rest)).toBe(false);
		expect(rest[0].x).toBeGreaterThan(WORLD.deckRight);
		expect(rest[0].y).toBeLessThan(WORLD.deckY);
	});
	it('an item past the bow still splashes into the sea', () => {
		const sim = createSim();
		spawnCargo(sim, 'crate', 590, 300);
		runToRest(sim);
		expect(isOverboard(restState(sim))).toBe(true);
	});
	it('an item left of the stern still splashes into the sea', () => {
		const sim = createSim();
		spawnCargo(sim, 'crate', 0, 300);
		runToRest(sim);
		expect(isOverboard(restState(sim))).toBe(true);
	});
	it('rebuildFromRest restores compound bodies at their exact pose', () => {
		const sim = createSim();
		spawnCargo(sim, 'bathtub', 270, 400);
		runToRest(sim);
		const rest = restState(sim);
		const sim2 = createSim();
		rebuildFromRest(sim2, rest);
		// exact pose immediately after rebuild, before any settling drift
		const rebuilt = restState(sim2);
		expect(rebuilt[0].x).toBeCloseTo(rest[0].x, 5);
		expect(rebuilt[0].y).toBeCloseTo(rest[0].y, 5);
		expect(rebuilt[0].angle).toBeCloseTo(rest[0].angle, 5);
	});
});
