# Publishing releases

This fork is published by npm account `dev-sergeev` as `@dev-sergeev/pi-goal-x`, from GitHub repository `dev-sergeev/pi-goal-x`. The unscoped `pi-goal-x` package belongs to the upstream maintainer and must not be used for fork releases. Preserve the upstream MIT license and contributor attribution.

## Authenticated local publication

1. Confirm `gh api user` and `npm whoami` identify the intended publisher. Never commit npm credentials or an authentication `.npmrc`.
2. Update `package.json` and both root version/name entries in `package-lock.json` together. Add the stable version to `CHANGELOG.md` and update the existing README installation example if the package name changes.
3. Run the relevant validation and pack once into a temporary release directory:

   ```sh
   npm pack --json --pack-destination /path/to/release-directory
   ```

4. Extract that tarball outside the repository; smoke-test the recovery CLI and extension registration with the supported host SDK. Check packaged metadata and file contents before publishing.
5. Commit the release and completed implementation to the fork's `main`, create an annotated `vX.Y.Z` tag, and push the branch and tag to `origin`. Never push this release to `upstream`.
6. Publish the exact checked tarball:

   ```sh
   npm publish /path/to/dev-sergeev-pi-goal-x-X.Y.Z.tgz --access public --tag latest
   ```

   Complete npm's interactive authorization/2FA challenge if requested. Do not disable account 2FA. Local publication does not claim GitHub Actions provenance.
7. Verify the public registry's package version, owner, `latest`, repository and `dist.integrity` against the packed artifact. If a publish command times out, inspect registry state before retrying: published versions are immutable.
8. Create the GitHub release in `dev-sergeev/pi-goal-x` from the pushed tag, with release notes and the same tarball attached. Publish a draft only after registry verification.

## Existing upstream automation

`.github/workflows/publish.yml` remains explicitly restricted to `tmonk/pi-goal-x`. It does not publish this fork. Its npm trust relationship and release-ranking job belong to the upstream package; they are not automatically transferred by forking.

Trusted publishing for this scoped package would require a separately configured workflow and npm trust relationship. It is not enabled by local publication. Existing ranking observations and automated badges are preserved rather than claimed as a new download ranking for the scoped package.
