# Release preparation

- GitHub identity: `dev-sergeev`, repository `dev-sergeev/pi-goal-x`, ADMIN permission, unprotected main. npm identity: `dev-sergeev`.
- The upstream unscoped package is owned by `tmonk`; the user-scoped `@dev-sergeev/pi-goal-x` name was not yet published. Selected stable version `0.32.4` and tag `v0.32.4`.
- Updated package/lockfile identity and version, author, repository, homepage, issues, Pi image URL, existing README installation command, and changelog. Preserved contributor attribution, upstream license and existing ranking badges. No new provider/authentication implementation or CI trust configuration.
- Existing publish workflow remains guarded to the upstream repository; documented authenticated local publication for this fork.
- Prior feature verification: 1108 tests passed, typecheck and lint passed, all nine emitted GigaChat functions validated remotely under rules 1.0.6. No runtime behavior changed during release preparation.
- Release metadata consistency checks and a fresh `npm run check` passed.
- Packed `@dev-sergeev/pi-goal-x@0.32.4` once: 72 files, tarball `dev-sergeev-pi-goal-x-0.32.4.tgz`; SHA-1 `b772ba9ec8f1d0084c6fd390e1dd7e6b7083e6a0`; integrity `sha512-mwg2JbDtVMqIIOhOcY80dCTYfevRWVKNSr1gRhGvUTIeuzMrAJB5TrzNCi8xaxRA+hVLihSARD5sm2MfbQ0Lrg==`.
- Extracted that artifact outside the repository. The packed recovery CLI exited successfully; actual extension registration with the installed SDK exposed all eight outer tools and exercised GigaChat continuation/budget projection while preserving locally validated null budgets.
- `npm publish <exact-tarball> --dry-run --access public --tag latest` succeeded. This is packaging evidence only, not evidence of a real registry publication or OIDC authentication.

## Published and verified

- Release source commit `b258588` and annotated tag `v0.32.4` pushed to `dev-sergeev/pi-goal-x`; upstream was not modified.
- Real npm publication authenticated as `dev-sergeev` and succeeded. The registry initially returned 404 while processing the new package; no duplicate publish was attempted. Public availability and `latest` were verified after 347 seconds of bounded propagation checks.
- Public registry metadata confirms `@dev-sergeev/pi-goal-x@0.32.4`, publisher/maintainer `dev-sergeev`, and the fork repository URL. Registry integrity and SHA-1 match the originally packed artifact; the downloaded registry tarball's SHA-512 also matches.
- Published stable GitHub release: https://github.com/dev-sergeev/pi-goal-x/releases/tag/v0.32.4 . API confirms author `dev-sergeev`, non-draft/non-prerelease status, and latest release tag `v0.32.4`.
- Downloaded GitHub release asset `dev-sergeev-pi-goal-x-0.32.4.tgz` and compared it byte-for-byte with the exact npm artifact; they are identical.
- npm package: https://www.npmjs.com/package/@dev-sergeev/pi-goal-x .
- Publication used the local authenticated npm session, not upstream-only GitHub Actions automation or an unconfigured OIDC relationship. No credentials were committed.
