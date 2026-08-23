# Dino Math regression tests

The suite uses [Vitest](https://vitest.dev/) and protects the curriculum, number limits, worlds, dino art references, sound behavior, story-only Teacher Maya narration, and module wiring.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm test
```

Other commands:

```bash
npm run test:watch
npm run test:coverage
```

Coverage output is written to `coverage/`.

## Test layout

- `unit/problems.test.js` — 20 Kindergarten challenges, repeated generation, level caps, and answer validation.
- `unit/worlds.test.js` — eight named worlds, dinosaur and grade mappings, story content, and image files.
- `unit/curriculum.test.js` — Kindergarten–Grade 3 curriculum and standards metadata.
- `unit/storage.test.js` — session stars, badges, and round progress. The public static app intentionally does not write child progress to browser persistence; progress resets on reload.
- `unit/audio.test.js` — per-world roar files, volume, fallback synthesis, and interaction-gated playback.
- `unit/tts.test.js` — female voice preference, Teacher Maya speech settings, and story-only usage.
- `unit/app.test.js` — HTML module entrypoint and resolvable JavaScript imports.

GitHub Actions runs `npm install` and `npm test` for every push and pull request to `main`; a failing test fails the workflow.
