# Analytics change validation

Verified 2026-10-21 against the existing locked dependency graph, without upgrading dependencies.

- Dependency restore: `pnpm install --frozen-lockfile` passed using environment pnpm 11.25.0 and writable temporary cache/store directories. The project remains pinned to pnpm 12.14.0; that version was installed separately and used for all subsequent scripts. Its install step hit an environment-level read-only store operation lock; this is not reported as a successful pnpm 12 install.
- `pnpm format:check`: passed.
- `pnpm lint`: passed.
- `pnpm typecheck`: passed across six workspace packages/apps.
- `pnpm test`: 28 tests passed, including five analytics tests and all pre-existing editor/content tests.
- `pnpm build`: both Next.js production builds passed. `/analytics/[slug]` is dynamic request-time rendering.
- `pnpm test:http`: 34 production HTTP checks passed, including three analytics states, missing analytics 404, charts MDX and prior projects/APIs. See `http-declarative.json` for actual check timestamps.

Coverage includes source-owned titles/order/removal/slots, exact row-to-point/table/goal mapping, nonmutating transforms, zero preservation, empty results, registered Renderer SSR SVG/table/progress, unknown columns, invalid numeric values, invalid binding references and duplicate inspector identifiers. Tests exercise real components and the existing official renderer, not documentation string assertions.

No live database is connected. Mock fixtures simulate query rows. Deployment and browser visual inspection are separate evidence; a successful build/HTTP test does not claim either. A local headless Chromium capture was blocked by environment socket restrictions, so no screenshot result is claimed here.
