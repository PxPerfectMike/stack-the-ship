export type CargoPart =
	| { kind: 'rect'; x: number; y: number; w: number; h: number }
	| { kind: 'circle'; x: number; y: number; r: number }
	// Convex polygon in def-local coordinates (validated convex by the cargo
	// test suite). Lets silhouettes match the art: wedges, tapers, blobs.
	| { kind: 'poly'; verts: { x: number; y: number }[] };

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
const poly = (...pts: [number, number][]): CargoPart => ({
	kind: 'poly',
	verts: pts.map(([x, y]) => ({ x, y }))
});

const RAW: RawDef[] = [
	{ id: 'crate', name: 'Crate', w: 60, h: 60, density: 0.001, restitution: 0.05, friction: 0.6, parts: [rect(0, 0, 60, 60)] },
	{ id: 'barrel', name: 'Barrel', w: 50, h: 66, density: 0.0012, restitution: 0.1, friction: 0.45, parts: [rect(0, 0, 50, 66)] },
	{ id: 'tire', name: 'Tire', w: 56, h: 56, density: 0.0008, restitution: 0.5, friction: 0.8, rarity: 0.3, minTurn: 2, parts: [{ kind: 'circle', x: 0, y: 0, r: 28 }] },
	{ id: 'plank', name: 'Long Plank', w: 160, h: 18, density: 0.0009, restitution: 0.05, friction: 0.6, parts: [rect(0, 0, 160, 18)] },
	{ id: 'piano', name: 'Grand Piano', w: 120, h: 90, density: 0.003, restitution: 0.05, friction: 0.55, scale: 1.1, parts: [rect(0, -15, 120, 60), rect(-50, 30, 12, 30), rect(50, 30, 12, 30)] },
	// topknot is a rounded crown, not a box — stray items roll off the sides
	{ id: 'moai', name: 'Moai Head', w: 70, h: 100, density: 0.004, restitution: 0.02, friction: 0.7, parts: [rect(0, 10, 70, 80), poly([-25, -30], [-25, -42], [-16, -50], [16, -50], [25, -42], [25, -30])] },
	{ id: 'bathtub', name: 'Bathtub', w: 110, h: 50, density: 0.0015, restitution: 0.08, friction: 0.5, parts: [rect(0, 17, 110, 16), rect(-49, -5, 12, 40), rect(49, -5, 12, 40)] },
	{ id: 'wardrobe', name: 'Wardrobe', w: 70, h: 130, density: 0.0011, restitution: 0.05, friction: 0.6, parts: [rect(0, 0, 70, 130)] },
	// real horn taper + flared base to match the art
	{ id: 'anvil', name: 'Anvil', w: 90, h: 64, density: 0.013, restitution: 0.005, friction: 0.9, scale: 0.8, parts: [rect(18.5, -22, 53, 20), poly([-8, -32], [-43, -27], [-43, -22], [-8, -12]), rect(0, 0, 34, 24), poly([-26, 12], [26, 12], [32, 22], [32, 32], [-32, 32], [-32, 22])] },
	{ id: 'beachball', name: 'Beach Ball', w: 52, h: 52, density: 0.0002, restitution: 0.8, friction: 0.2, rarity: 0.3, minTurn: 2, parts: [{ kind: 'circle', x: 0, y: 0, r: 26 }] },
	// rounded blob body — no invisible square corners to balance on
	{ id: 'pig', name: 'Anxious Pig', w: 84, h: 60, density: 0.001, restitution: 0.15, friction: 0.7, parts: [poly([-40, 16], [-40, -6], [-30, -18], [14, -18], [24, -8], [24, 14], [14, 26], [-30, 26]), rect(30, -8, 24, 26)] },
	{ id: 'sink', name: 'Kitchen Sink', w: 76, h: 46, density: 0.0014, restitution: 0.05, friction: 0.5, scale: 0.85, parts: [rect(0, 12, 76, 20), rect(-30, -10, 14, 26), rect(30, -10, 14, 26)] },
	// the hat is an actual cone — landings glance off it
	{ id: 'gnome', name: 'Garden Gnome', w: 46, h: 88, density: 0.0015, restitution: 0.05, friction: 0.6, scale: 0.85, parts: [rect(0, 14, 46, 60), poly([-13, -14], [-3, -43], [3, -43], [13, -14])] },
	// rounded body blob + head — matches the art's silhouette closely
	{ id: 'duck', name: 'Giant Rubber Duck', w: 90, h: 78, density: 0.0004, restitution: 0.6, friction: 0.4, parts: [poly([-45, 8], [-38, -9], [-23, -13], [23, -13], [38, -9], [45, 8], [38, 32], [23, 39], [-23, 39], [-38, 32]), { kind: 'circle', x: 22, y: -24, r: 15 }] },
	// a real trapezoid — things slide down the slopes instead of perching
	{ id: 'cone', name: 'Traffic Cone', w: 60, h: 70, density: 0.0008, restitution: 0.1, friction: 0.7, parts: [poly([-9, -35], [9, -35], [17, 21], [-17, 21]), rect(0, 28, 60, 14)] },
	{ id: 'washer', name: 'Washing Machine', w: 70, h: 82, density: 0.0025, restitution: 0.03, friction: 0.6, parts: [rect(0, 0, 70, 82)] },
	{ id: 'sofa', name: 'Sofa', w: 140, h: 62, density: 0.0009, restitution: 0.12, friction: 0.7, parts: [rect(0, 0, 140, 62)] },
	{ id: 'safe', name: 'Bank Safe', w: 70, h: 74, density: 0.012, restitution: 0.01, friction: 0.9, parts: [rect(0, 0, 70, 74)] },
	// real wedge profile (cabin + nose) rolling on two actual wheels
	{ id: 'delorean', name: 'Time Machine', w: 130, h: 36, density: 0.002, restitution: 0.1, friction: 0.5, scale: 1.3, parts: [poly([-65, -8], [-36, -16], [4, -16], [24, -8], [24, 6], [-65, 6]), poly([24, -8], [65, -3], [65, 6], [24, 6]), { kind: 'circle', x: -38, y: 10, r: 8 }, { kind: 'circle', x: 38, y: 10, r: 8 }] },
	{ id: 'cake', name: 'Wedding Cake', w: 90, h: 86, density: 0.0007, restitution: 0.05, friction: 0.5, scale: 0.85, parts: [rect(0, 30, 90, 26), rect(0, 4, 64, 26), rect(0, -20, 40, 22), rect(0, -37, 16, 12)] },
	{ id: 'potty', name: 'Porta-Potty', w: 64, h: 110, density: 0.0008, restitution: 0.1, friction: 0.5, parts: [rect(0, 0, 64, 110)] },
	{ id: 'bball', name: 'Basketball', w: 50, h: 50, density: 0.0006, restitution: 0.65, friction: 0.6, rarity: 0.3, minTurn: 2, parts: [{ kind: 'circle', x: 0, y: 0, r: 25 }] }
];

const scalePart = (p: CargoPart, s: number): CargoPart => {
	if (p.kind === 'circle') return { kind: 'circle', x: p.x * s, y: p.y * s, r: p.r * s };
	if (p.kind === 'rect') return { kind: 'rect', x: p.x * s, y: p.y * s, w: p.w * s, h: p.h * s };
	return { kind: 'poly', verts: p.verts.map((v) => ({ x: v.x * s, y: v.y * s })) };
};

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
