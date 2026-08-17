# Security Policy

## Supported version

Security fixes target the latest release.

## Reporting a vulnerability

Please use GitHub's private vulnerability reporting or a private security advisory when available. If neither option is available, contact the maintainer through the GitHub profile without publishing exploit details.

Include the affected version, DSH version, impact, reproduction steps, and any suggested mitigation. Please do not include real API keys, session logs, or personal data.

## Data boundary

`dsh-cost-guard` is designed to run locally. It observes DSH usage events, replays persisted session events to rebuild totals, and stores configuration through the dynamic plugin runtime. It does not intentionally send telemetry, call external endpoints, read credentials, or store API keys.

The plugin relies on internal DSH services and UI slots. Review source changes before updating because those interfaces are not guaranteed stable.
