// Regenerates every raster brand asset from the master SVG (static/brand/icon.svg).
// Uses Playwright with the SYSTEM browser (channel chrome/msedge) so there is no
// browser download or native image tooling to install.
//
//   node scripts/generate-icons.mjs
//
// Outputs:
//   static/brand/icon-maskable.svg     derived full-bleed variant (safe-zone padding)
//   static/favicon.png                 64x64
//   static/icons/icon-192.png          PWA, purpose "any"
//   static/icons/icon-512.png          PWA, purpose "any"
//   static/icons/icon-512-maskable.png PWA, purpose "maskable"

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const brandDir = join(root, 'static', 'brand');

// Master SVG knobs (see icon.svg):
//   <rect id="bg" ... rx="115" ...>                       corner radius
//   <g id="badge" transform="translate(x y) scale(s)">    badge placement
const BG_RE = /(<rect id="bg"[^>]*rx=")[\d.]+(")/;
const BADGE_RE = /(<g id="badge" transform=")[^"]+(")/;

function variant(master, { rx, transform } = {}) {
	let svg = master;
	if (rx !== undefined) svg = svg.replace(BG_RE, `$1${rx}$2`);
	if (transform) svg = svg.replace(BADGE_RE, `$1${transform}$2`);
	return svg;
}

async function launch() {
	for (const channel of ['chrome', 'msedge', undefined]) {
		try {
			return await chromium.launch(channel ? { channel } : {});
		} catch {
			// try the next channel
		}
	}
	throw new Error('no chromium-compatible browser found');
}

async function render(page, svg, size, outPath, { transparent = false } = {}) {
	await page.setContent(
		`<!doctype html><html><head><style>
			html, body { margin: 0; padding: 0; background: transparent; }
			#wrap { width: ${size}px; height: ${size}px; }
			#wrap svg { display: block; width: ${size}px; height: ${size}px; }
		</style></head><body><div id="wrap">${svg}</div></body></html>`
	);
	await page.screenshot({
		path: outPath,
		omitBackground: transparent,
		clip: { x: 0, y: 0, width: size, height: size }
	});
	console.log(`  ${outPath.slice(root.length + 1)} (${size}x${size})`);
}

const master = await readFile(join(brandDir, 'icon.svg'), 'utf8');

// Full-bleed square with the badge inside the maskable safe zone (80% circle).
const maskable = variant(master, { rx: 0, transform: 'translate(256 259) scale(0.78)' });
await writeFile(join(brandDir, 'icon-maskable.svg'), maskable);

const browser = await launch();
const page = await browser.newPage({
	viewport: { width: 1200, height: 1200 },
	deviceScaleFactor: 1
});

console.log('Web:');
await mkdir(join(root, 'static', 'icons'), { recursive: true });
await render(page, master, 64, join(root, 'static', 'favicon.png'), { transparent: true });
await render(page, master, 192, join(root, 'static', 'icons', 'icon-192.png'), { transparent: true });
await render(page, master, 512, join(root, 'static', 'icons', 'icon-512.png'), { transparent: true });
await render(page, maskable, 512, join(root, 'static', 'icons', 'icon-512-maskable.png'));

await browser.close();
console.log('Done.');
