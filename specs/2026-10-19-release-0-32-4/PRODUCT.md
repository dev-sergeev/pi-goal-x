# User-owned GigaChat-compatible release

Publish the completed GigaChat compatibility changes as a stable release in the user's existing GitHub fork and npm namespace.

- GitHub account/repository: `dev-sergeev/pi-goal-x` (authenticated user has ADMIN access).
- npm account: `dev-sergeev`; package: `@dev-sergeev/pi-goal-x` (not yet published).
- Version/tag: `0.32.4` / `v0.32.4`, continuing the upstream version history.
- Package author: Alexandr Sergeev; retain original contributor attribution and the unchanged upstream MIT license.
- Update repository/homepage/issues/image metadata and the existing README install example. Preserve README layout and automated ranking badges.
- Include all completed GigaChat changes and their regression tests. Do not publish the user's changes to the upstream repository or the upstream-owned unscoped npm package.
- Publish an exact locally packed and smoke-checked tarball using the authenticated npm account. Existing GitHub publication automation is upstream-only and intentionally remains guarded; do not claim it publishes this fork or add new CI trust without a separate request.
- Create a GitHub release and attach the exact npm tarball; verify public registry version, owner, repository, tarball integrity, and the release asset.
- Do not store or publish credentials, npm authentication configuration, or temporary verification artifacts.
