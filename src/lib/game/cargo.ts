export type CargoPart =
	| { kind: 'rect'; x: number; y: number; w: number; h: number }
	| { kind: 'circle'; x: number; y: number; r: number };

export interface CargoDef {
	id: string;
	name: string;
	w: number;
	h: number;
	density: number;
	restitution: number;
	friction: number;
	parts: CargoPart[];
	rarity?: number; // deal weight, default 1 (smaller = rarer)
	minTurn?: number; // earliest turn this item may be dealt, default 0
	artScale: number; // authored-art → world multiplier (CargoArt wraps in scale())
}

// Authored defs. `scale` uniformly resizes an item's physics footprint AND its
// art (CargoArt applies artScale) — the one-number knob for size tuning.
// Mass follows automatically since Matter derives it from density × area.
type RawDef = Omit<CargoDef, 'artScale'> & { scale?: number };

const rect = (x: number, y: number, w: number, h: number): CargoPart => ({ kind: 'rect', x, y, w, h });

const RAW: RawDef[] = [
	{ id: 'crate', name: 'Crate', w: 60, h: 60, density: 0.001, restitution: 0.05, friction: 0.6, parts: [rect(0, 0, 60, 60)] },
	{ id: 'barrel', name: 'Barrel', w: 50, h: 66, density: 0.0012, restitution: 0.1, friction: 0.45, parts: [rect(0, 0, 50, 66)] },
	{ id: 'tire', name: 'Tire', w: 56, h: 56, density: 0.0008, restitution: 0.5, friction: 0.8, rarity: 0.3, minTurn: 2, parts: [{ kind: 'circle', x: 0, y: 0, r: 28 }] },
	{ id: 'plank', name: 'Long Plank', w: 160, h: 18, density: 0.0009, restitution: 0.05, friction: 0.6, parts: [rect(0, 0, 160, 18)] },
	{ id: 'piano', name: 'Grand Piano', w: 120, h: 90, density: 0.003, restitution: 0.05, friction: 0.55, scale: 1.1, parts: [rect(0, -15, 120, 60), rect(-50, 30, 12, 30), rect(50, 30, 12, 30)] },
	{ id: 'moai', name: 'Moai Head', w: 70, h: 100, density: 0.004, restitution: 0.02, friction: 0.7, parts: [rect(0, 10, 70, 80), rect(0, -40, 50, 20)] },
	{ id: 'bathtub', name: 'Bathtub', w: 110, h: 50, density: 0.0015, restitution: 0.08, friction: 0.5, parts: [rect(0, 17, 110, 16), rect(-49, -5, 12, 40), rect(49, -5, 12, 40)] },
	{ id: 'wardrobe', name: 'Wardrobe', w: 70, h: 130, density: 0.0011, restitution: 0.05, friction: 0.6, parts: [rect(0, 0, 70, 130)] },
	{ id: 'anvil', name: 'Anvil', w: 90, h: 64, density: 0.013, restitution: 0.005, friction: 0.9, scale: 0.8, parts: [rect(5, -22, 80, 20), rect(0, 0, 34, 24), rect(0, 22, 64, 20)] },
	{ id: 'beachball', name: 'Beach Ball', w: 52, h: 52, density: 0.0002, restitution: 0.8, friction: 0.2, rarity: 0.3, minTurn: 2, parts: [{ kind: 'circle', x: 0, y: 0, r: 26 }] },
	{ id: 'pig', name: 'Anxious Pig', w: 84, h: 60, density: 0.001, restitution: 0.15, friction: 0.7, parts: [rect(-8, 4, 64, 44), rect(30, -8, 24, 26)] },
	{ id: 'sink', name: 'Kitchen Sink', w: 76, h: 46, density: 0.0014, restitution: 0.05, friction: 0.5, scale: 0.85, parts: [rect(0, 12, 76, 20), rect(-30, -10, 14, 26), rect(30, -10, 14, 26)] },
	{ id: 'gnome', name: 'Garden Gnome', w: 46, h: 88, density: 0.0015, restitution: 0.05, friction: 0.6, scale: 0.85, parts: [rect(0, 14, 46, 60), rect(0, -29, 26, 30)] },
	{ id: 'duck', name: 'Giant Rubber Duck', w: 90, h: 78, density: 0.0004, restitution: 0.6, friction: 0.4, parts: [rect(0, 13, 90, 52), { kind: 'circle', x: 22, y: -24, r: 15 }] },
	{ id: 'cone', name: 'Traffic Cone', w: 60, h: 70, density: 0.0008, restitution: 0.1, friction: 0.7, parts: [rect(0, 28, 60, 14), rect(0, -7, 22, 56)] },
	{ id: 'washer', name: 'Washing Machine', w: 70, h: 82, density: 0.0025, restitution: 0.03, friction: 0.6, parts: [rect(0, 0, 70, 82)] },
	{ id: 'sofa', name: 'Sofa', w: 140, h: 62, density: 0.0009, restitution: 0.12, friction: 0.7, parts: [rect(0, 0, 140, 62)] },
	{ id: 'safe', name: 'Bank Safe', w: 70, h: 74, density: 0.012, restitution: 0.01, friction: 0.9, parts: [rect(0, 0, 70, 74)] },
	{ id: 'delorean', name: 'Time Machine', w: 130, h: 36, density: 0.002, restitution: 0.1, friction: 0.5, scale: 1.3, parts: [rect(0, 0, 130, 36)] },
	{ id: 'cake', name: 'Wedding Cake', w: 90, h: 86, density: 0.0007, restitution: 0.05, friction: 0.5, scale: 0.85, parts: [rect(0, 30, 90, 26), rect(0, 4, 64, 26), rect(0, -20, 40, 22), rect(0, -37, 16, 12)] },
	{ id: 'potty', name: 'Porta-Potty', w: 64, h: 110, density: 0.0008, restitution: 0.1, friction: 0.5, parts: [rect(0, 0, 64, 110)] },
	{ id: 'bball', name: 'Basketball', w: 50, h: 50, density: 0.0006, restitution: 0.65, friction: 0.6, rarity: 0.3, minTurn: 2, parts: [{ kind: 'circle', x: 0, y: 0, r: 25 }] }
];

const scalePart = (p: CargoPart, s: number): CargoPart =>
	p.kind === 'circle'
		? { kind: 'circle', x: p.x * s, y: p.y * s, r: p.r * s }
		: { kind: 'rect', x: p.x * s, y: p.y * s, w: p.w * s, h: p.h * s };

export const CARGO: CargoDef[] = RAW.map(({ scale, ...d }) => {
	const s = scale ?? 1;
	return { ...d, w: d.w * s, h: d.h * s, artScale: s, parts: d.parts.map((p) => scalePart(p, s)) };
});

export const ALL_IDS: string[] = CARGO.map((c) => c.id);

export function getCargo(id: string): CargoDef {
	const def = CARGO.find((c) => c.id === id);
	if (!def) throw new Error(`unknown cargo id: ${id}`);
	return def;
}
