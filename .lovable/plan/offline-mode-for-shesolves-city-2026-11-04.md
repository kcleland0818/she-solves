# Offline Mode for SheSolves City

Goal: once a learner has opened the published app one time with internet, it keeps working with no connection: town map, all three shops, practice mode, themes, and saved progress.

Note: offline works only in the **published app** (she-solves.lovable.app), not in the editor preview.

## What the learner gets
- The app opens and plays fully without internet after one online visit.
- It can be added to a phone or tablet home screen with its own icon.
- A small "You're offline — everything still works" note appears when the connection drops.
- New versions install themselves the next time the learner is online.

## Steps
1. **Bundle the font locally**: Nunito currently loads from Google. Ship it with the app so text looks right offline.
2. **Turn on offline caching** of the app, its images (town map, avatars), and lesson content.
3. **Make it installable**: app name, colors, and home-screen icons (generated from the SheSolves style).
4. **Offline indicator**: a small, screen-reader-friendly status note when the connection is lost or comes back.
5. **Check it**: build, then use a test browser with the network switched off to confirm every shop still loads. Re-run the accessibility suite.

Progress and settings are already saved on the device, so they already work offline.

## Technical details
- Add `vite-plugin-pwa` (`generateSW`, `registerType: "autoUpdate"`, `injectRegister: null`, `devOptions.enabled: false`, filename `sw.js`). Precache all built JS/CSS/images/fonts; navigations `NetworkFirst`; `/~oauth` in the navigation denylist.
- Single registration module `src/lib/registerSW.ts`, called from `main.tsx`. Refuses to register in dev, in iframes, on Lovable preview hosts (`id-preview--*`/`preview--*` on lovable.app, gpt-eng.com, gptengineer.run; `*.lovableproject.com`, `*.lovableproject-dev.com`, `*.beta.lovable.dev`) and with `?sw=off`, unregistering any `/sw.js` in those cases.
- Self-host Nunito via `@fontsource/nunito` (400/600/700/800); remove the Google Fonts links in `index.html`.
- Manifest + icons (192, 512, maskable, apple-touch-icon) in `public/`, with theme-color meta tags.
- `OfflineIndicator` component using `navigator.onLine` + online/offline events, `role="status"`/`aria-live="polite"`, token colors.
- Record the offline/registration rule in `AGENTS.md`.
