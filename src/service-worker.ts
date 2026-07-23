/// <reference types="@sveltejs/kit" />
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

// Offline-first app shell: cache the build + static files on install,
// cache-first for same-origin GETs, and fall back to the SPA shell for
// navigations when offline. Version-keyed cache means every deploy swaps
// cleanly. (Also completes PWA installability across browsers.)
import { base, build, files, version } from '$service-worker';

const sw = self as unknown as ServiceWorkerGlobalScope;

const CACHE = `stack-the-ship-${version}`;
const SHELL = `${base}/index.html`;
const ASSETS = [...build, ...files, SHELL];

sw.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE)
			.then((cache) => cache.addAll(ASSETS))
			.then(() => sw.skipWaiting())
	);
});

sw.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
			.then(() => sw.clients.claim())
	);
});

sw.addEventListener('fetch', (event) => {
	if (event.request.method !== 'GET') return;
	event.respondWith(
		(async () => {
			const cached = await caches.match(event.request);
			if (cached) return cached;
			try {
				const res = await fetch(event.request);
				if (res.ok && new URL(event.request.url).origin === sw.location.origin) {
					const cache = await caches.open(CACHE);
					cache.put(event.request, res.clone());
				}
				return res;
			} catch (err) {
				if (event.request.mode === 'navigate') {
					const shell = await caches.match(SHELL);
					if (shell) return shell;
				}
				throw err;
			}
		})()
	);
});
