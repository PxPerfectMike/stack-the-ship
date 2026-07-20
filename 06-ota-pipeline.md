# 06 — Self-Hosted OTA Updates

Web-bundle hot updates with zero vendor cost: `@capgo/capacitor-updater` in
manual mode + bundles published by the existing CI to static hosting. Every
push to main = site deploy AND an OTA release. Native changes (new plugins,
manifest, SDK) still require a store release — everything else ships in
minutes.

## Client flow (boot, fire-and-forget)

1. `CapacitorUpdater.notifyAppReady()` — ALWAYS FIRST, unconditional. A
   freshly-applied bundle that never reaches this call is auto-rolled-back by
   the plugin. This is the anti-brick guarantee; never gate it.
2. Fetch `manifest.json` (cache-busted): `{ buildId, url, minVersionCode }`.
3. Pure gate `shouldApplyOta` (unit-tested):
   - `nativeVersionCode >= minVersionCode` (bundle must not need native bits
     the installed shell lacks);
   - `manifest.buildId > runningBuildId` (string compare — see IDs below).
     Also blocks downgrading a fresher store install.
4. `download({url, version})` then `next({id})` — applies on the **next cold
   start**, never mid-session. All wrapped; any failure = retry next boot.

## Build identity

`__OTA_BUILD_ID__` injected via Vite `define`: UTC stamp `YYYY.MM.DD-HHMMSS`
(lexicographically ordered, filename-safe). CI sets one `OTA_BUILD_ID` env
for the whole run so manifest and bundle agree; local builds self-stamp.
The running bundle always knows its own id — comparisons are self-consistent
whether builtin or OTA. Bonus: render the id in a corner of the UI (tiny
credit line) — it doubles as a visible "which bundle is this device on"
support tool and updates with every OTA.

## CI publishing (added to the existing deploy workflow)

```yaml
- Set OTA_BUILD_ID env (date -u +%Y.%m.%d-%H%M%S)
- npm run build            # native flavor, no base path
- zip build/* -> bundle.zip  (index.html at zip ROOT)
- npm run build            # site flavor (BASE_PATH set)  ← two builds!
- write build/ota/manifest.json + bundle-$ID.zip  (minVersionCode read
  from a repo file, e.g. ota.config.json)
- deploy to Pages as usual
```

Key detail: the native app needs base-path-less assets while the hosted site
uses a subpath — hence two builds. Old bundle zips vanish on each deploy;
a stale manifest pointing at a gone zip just fails the download harmlessly.

## Operational rules

- **`minVersionCode` bumps in the SAME COMMIT** as any web code that starts
  requiring new native capability. This is the one manual discipline; put a
  loud comment in the config file.
- Cadence: stage-on-this-boot, apply-on-next-boot. Users perceive nothing;
  rapid successive pushes queue one launch behind each other. Don't "fix"
  this with mid-session reloads — the lag is the feature.
- SvelteKit + static hosting: any deep-link page you need served (privacy
  policy, etc.) must be `prerender = true` → a real .html file. SPA fallback
  only covers the root.
- Live-fire test for the pipeline: ship a visible marker change, cold-start
  twice, watch it arrive. Then ship the revert the same way.
- New-plugin releases: OTA infra itself rides the store build that introduces
  it — plan one release whose only job is carrying the updater.
