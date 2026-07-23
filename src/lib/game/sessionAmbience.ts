import { mulberry32 } from '$engine/rng';
import { rollAmbience, TODS, WXS, type Ambience } from './ambience';

// Shared-session ambience (guide 02): the first scene to ask rolls the sky,
// every later scene (title, gameplay) reuses the same roll; re-rolled on the
// next app launch. URL params ?tod= &wx= override for QA.
let session: Ambience | undefined;

export function sessionAmbience(search: string): Ambience {
	session ??= rollAmbience(mulberry32((Math.random() * 4294967296) >>> 0));
	const p = new URLSearchParams(search);
	return {
		tod: (TODS as readonly string[]).includes(p.get('tod') ?? '')
			? (p.get('tod') as Ambience['tod'])
			: session.tod,
		wx: (WXS as readonly string[]).includes(p.get('wx') ?? '')
			? (p.get('wx') as Ambience['wx'])
			: session.wx
	};
}
