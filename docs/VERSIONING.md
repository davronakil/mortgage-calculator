# Versioning Guide

This project uses Semantic Versioning (`MAJOR.MINOR.PATCH`) with lightweight release notes in `CHANGELOG.md`.

## Rules

- **PATCH** (`x.y.Z`): bug fixes, styling fixes, small non-breaking improvements.
- **MINOR** (`x.Y.z`): new features and tooling that remain backward compatible.
- **MAJOR** (`X.y.z`): breaking changes to behavior, assumptions, or public interfaces.

## Release checklist

1. Update `package.json` version.
2. Update `CHANGELOG.md` with the new version section and date.
3. Keep the in-app footer version in `src/app/page.tsx` aligned (or set `NEXT_PUBLIC_APP_VERSION`).
4. Run `npm run build`.
5. Commit with a release-oriented message.
6. Push to `main` to deploy.

## Current version

- `0.2.0`
