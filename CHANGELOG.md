# Changelog

## 2.0.0 (2026-11-02)

- Dataset grows from 10 to over 100 philosophers across ancient, medieval, renaissance, early-modern, modern and contemporary eras, including Chinese, Indian, Islamic and Jewish traditions.
- Each entry now has `id`, `born`, `died`, `lifespan`, `era`, `schools`, `region`, `works`, and an optional `quote`.
- New API: `getRandomPhilosophers`, `getRandomQuote`, `getPhilosophers` with filters, `getPhilosopherByName`, `searchPhilosophers`, `getSchools`, `getRegions`, `eras`, `philosophers`, `seededRandom`.
- `getRandomPhilosopher` accepts filters and a `seed` for deterministic output.
- New CLI: `npx random-philosopher`.
- Rewritten in TypeScript with ESM and CommonJS builds and bundled types. Node 18+.
- Tests and CI added.
- Breaking: internal files are no longer importable directly. `getRandomPhilosopher()` output is a superset of 1.x, so normal usage is unaffected.

## 1.1.0 (2024-11-22)

- Initial published version with ten philosophers.
