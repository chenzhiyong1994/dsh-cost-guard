# Contributing

Thanks for helping improve `dsh-cost-guard`.

## Before opening a change

- Search existing issues first.
- Keep pull requests focused on one behavior or documentation improvement.
- For compatibility bugs, include the DSH version, profile, operating system, and a minimal reproduction.
- Never commit credentials, DSH session logs, private configuration, or screenshots containing personal information.

## Development loop

1. Edit `host.js` and/or `client.js`.
2. Run `npm run check`.
3. When testing in DSH, update the dynamic package with **both** halves.
4. Run `cordis_inspect_self` and confirm `hasHostHalf` and `hasClientHalf` are both true before activation.
5. Update `CHANGELOG.md` for user-visible behavior changes.

The source files are function-body fragments consumed by `cordis_define`; they are intentionally plain JavaScript without imports, TypeScript, or JSX.

## Pricing changes

Price data changes quickly. Any default-rate update must link to a primary provider source and include the date it was verified. Currency values remain estimates; do not describe them as authoritative billing totals.

## Pull requests

Explain the user-facing problem, the chosen change, the DSH versions tested, and the verification performed. By contributing, you agree that your contribution is licensed under the MIT License.
