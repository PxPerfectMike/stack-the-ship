export interface Ambience {
	tod: 'day' | 'dusk' | 'night';
	wx: 'clear' | 'rain';
}

const TODS = ['day', 'dusk', 'night'] as const;
const WXS = ['clear', 'rain'] as const;

// day 45% / dusk 30% / night 25%; rain 25%
export function rollAmbience(rng: () => number): Ambience {
	const t = rng();
	const tod = t < 0.45 ? 'day' : t < 0.75 ? 'dusk' : 'night';
	const wx = rng() < 0.25 ? 'rain' : 'clear';
	return { tod, wx };
}

export function resolveAmbience(search: string, rng: () => number): Ambience {
	const rolled = rollAmbience(rng);
	const params = new URLSearchParams(search);
	const tod = params.get('tod');
	const wx = params.get('wx');
	return {
		tod: TODS.includes(tod as Ambience['tod']) ? (tod as Ambience['tod']) : rolled.tod,
		wx: WXS.includes(wx as Ambience['wx']) ? (wx as Ambience['wx']) : rolled.wx
	};
}
