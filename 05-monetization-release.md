# 05 — Monetization & Release Pipeline

The industry-standard loadout: AdMob interstitial + rewarded, one $0.99
remove-ads non-consumable, native in-app review prompt. All verified on
device before launch. This guide is the order of operations + every gotcha.

## Ads (AdMob via @capacitor-community/admob)

**Design:** interstitial on *leaving* game over (user-initiated moment),
every 2nd game over, ≥90s gap, **never on a new-best run** (that moment
belongs to the rating prompt). Rewarded = optional "continue" revive, once
per run, only offered when an ad is actually preloaded; dismissing early
withdraws the offer. Remove-ads IAP kills interstitials but **keeps** the
opt-in rewarded (genre standard — paid users still want revives).

**Code:** boot once from layout: initialize → UMP consent (own try/catch!) →
preload both units; re-prepare after every show. Pure frequency gate,
unit-tested. Dev builds ALWAYS use Google's public test units
(`import.meta.env.DEV` switch) — clicking real ads in dev flags your account.

**Console sequencing (why ads "never work on day one" — do weeks early):**
1. Create AdMob app + units immediately (units warm up hours→days).
2. Verify the payments profile; check Policy center is clean.
3. **Publish consent messages** (Privacy & messaging → GDPR + US states).
   UNSENT MESSAGES = `requestConsentInfo` throws "no form(s) configured" and,
   if your init isn't isolated, kills all ads. This was the one real outage.
   Messages require a privacy policy URL on the app. Reject-button in all
   countries; skip the "Close (do not consent)" X; add all free translations.
4. Register your phone as a test device (+ shake ad-inspector).
5. App→Play **linking only works once the app is public** (internal/closed
   tracks are invisible to the store search). Park it; finish post-launch.
6. `app-ads.txt` on the developer website listed on the Play listing:
   `google.com, pub-XXXX, DIRECT, f08c47fec0942fa0`. No website on the
   listing = verification can never run.
7. Post-launch: link app, verify app-ads.txt, turn OFF "Programmatic limited
   ads", expect a few days of ramp after linking.

## IAP (cordova-plugin-purchase / Play Billing)

Non-consumable, product id hardcoded (`remove_ads`), entitlement in the
versioned save, granted on `finished` AND on `owned` (auto-restore on
reinstall — no restore button needed). Title-screen buy button shows only
when native + product loaded + not owned, label uses live store pricing.

Gotchas: billing library forces `minSdk 23+`; the Play product can only be
created AFTER an AAB containing the billing permission is uploaded to any
track; product must be **Activated** (classic silent failure); purchase type
"Buy", one purchase option (`buy`), no tags needed; License testing (account
settings) makes your own purchases free/refundable test transactions.

## Rating prompt (@capacitor-community/in-app-review)

Native Play sheet at the happiest moment: game over with a NEW BEST, ≥2 games
played, 5-game cooldown, fired 1.5s after the screen lands. Google throttles
display — mark the save on every *attempt* so quota isn't burned by retrying.
Verifiable only on a device with the app installed from a Play track.

## Signing & versioning

- Upload keystore OUTSIDE the repo; credentials in gitignored
  `android/keystore.properties` (FORWARD slashes in the path — Java
  Properties eats backslashes). Gradle signingConfig reads it if present so
  CI/other machines still build unsigned. Back both files up immediately.
- Release name format: `versionCode(versionName)stage` e.g. `7(0.4.1)`.
  **versionCodes are burned on upload, even rejected ones** — always bump.
- Build: `npm run build && npx cap sync android && cd android &&
  ./gradlew bundleRelease` (pin JAVA_HOME to JDK 17).
- Target SDK: Play enforces recent API levels (hit: had to move 34→35
  mid-release; needed `android.suppressUnsupportedCompileSdk` for older AGP
  + a `values-v35` style opting out of forced edge-to-edge).

## Store console answer key (as of this shipping)

- **Sign in details / App access:** "No part restricted" if everything is
  reachable without accounts/payment (remove-ads doesn't count as gating).
- **IARC:** answer content honestly — weapons-as-objects with no violent acts
  = violence NO; contraband drug items = Controlled Substance YES → "Illegal
  or Recreational Drugs" (reference-only). Digital purchases YES; loot boxes
  NO; player trading NO. Deadpan satire ≠ crude humor.
- **Data safety:** collect+share = YES via AdMob → exactly two types (Device
  or other IDs; App interactions), purpose "Advertising or marketing" only,
  required, encrypted in transit. Play-Billing purchases are not
  developer-collected. Keep a cheat sheet in docs/.
- **Advertising ID declaration:** YES (SDK merges AD_ID permission), purpose
  = Advertising or marketing only.
- **Target audience:** 13+ groups only — any under-13 group triggers the
  Families program your ad setup isn't certified for. Keep consistent with
  the privacy policy's "not directed at children under 13".
- **Account-name/brand risks:** if the title touches a real org's name, put a
  "parody — not affiliated" disclaimer as the last paragraph of the full
  description AND mirror it on the video/site.
- **Countries:** all; uniform pricing (also auto-satisfies EU geo-blocking
  notice). Managed publishing OFF = approval auto-publishes.

## Privacy infrastructure

One canonical privacy policy page on the company domain (state entity,
local-only saves, AdMob disclosure with links, IAP via Play, children,
contact). The SAME URL feeds: Play listing, Data safety, AdMob consent
messages. In-app "Privacy options" entry (shown only where a consent form
exists) reopens the UMP form — required by consent-message ad-unit
deployment mode. Keep company/personal identity separation absolute: company
name + company emails in everything public-facing.
