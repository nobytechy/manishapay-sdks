# Security policy

## Reporting a vulnerability

If you've found a security issue in any package in this repo, please **don't open a public GitHub issue**. Instead, email the maintainer directly:

**Noby Tebulo** — [nobytechy@gmail.com](mailto:nobytechy@gmail.com) · WhatsApp: +263 774 603 865

Use the subject line `[SECURITY] manishapay-sdks: <short summary>` and include:

1. A description of the vulnerability
2. Steps to reproduce
3. Affected package(s) and version(s)
4. Any proof-of-concept code (PoC)
5. Your name / handle for credit (optional)

You'll get a reply within **48 hours** acknowledging receipt and a target timeline for a fix.

## What we'll do

| Severity | Initial response | Fix target |
|---|---|---|
| **Critical** (RCE, key exposure, auth bypass) | < 24h | Patch + release within 7 days |
| **High** (timing-attack on signature verification, etc.) | < 48h | Patch + release within 14 days |
| **Medium / Low** (information disclosure with limited blast radius) | < 1 week | Next regular release |

## Coordinated disclosure

We'll work with you on a disclosure timeline that lets users update before public details are released. Default: 90 days from initial report, or sooner if a fix is shipped.

## Scope

In scope:
- Anything in `packages/nodejs`, `packages/php`, `packages/checkout-js`, `plugins/*`, `examples/*`
- Documentation that misleads users into insecure patterns

Out of scope:
- Issues in the closed-source ManishaPay platform (dashboard, API, backend) — report those to [nobytechy@gmail.com](mailto:nobytechy@gmail.com) directly with `[PLATFORM SECURITY]` in the subject
- Issues in third-party PayNow integrations not maintained here

## Credit

Reporters who follow this policy will be credited (by name or pseudonym, your choice) in the changelog of the release that fixes the issue.
