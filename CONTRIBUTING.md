# Contributing to ManishaPay SDKs

Pull requests are very welcome. This repo is the *public* surface of ManishaPay — SDKs, the drop-in widget, and (soon) platform plugins. Anything that improves how developers integrate with ManishaPay belongs here.

## Quick rules

1. **One package per PR.** If your change touches `packages/nodejs` and `plugins/woocommerce`, open two PRs — easier to review and revert if needed.
2. **No breaking changes without a major version bump.** Both `manishapay` (npm) and `manishapay/manishapay` (composer) are SemVer.
3. **Tests required for behaviour changes.** Each package has its own test setup; see the package README.
4. **No dependencies in the SDKs.** The Node SDK uses built-in `fetch` and `crypto`. The PHP SDK uses `ext-curl`. Don't add new deps without discussion.
5. **No secrets in commits.** API keys, integration IDs, or webhook secrets — never. The repo's `.gitignore` excludes the common offenders, but check `git diff` before pushing.

## Setup

```bash
git clone https://github.com/nobytechy/manishapay-sdks.git
cd manishapay-sdks
```

There's no monorepo build tool — each package is independent. Work in the relevant subdirectory:

```bash
# Node SDK
cd packages/nodejs
npm test

# PHP SDK
cd packages/php
composer install
./vendor/bin/phpunit
```

## What to work on

High-impact areas, ordered by demand from [forums.paynow.co.zw](https://forums.paynow.co.zw/):

1. **WooCommerce plugin** (`plugins/woocommerce/`) — the official PayNow WC plugin has a long tail of bugs; a clean plugin built on top of ManishaPay would be a meaningful contribution.
2. **WordPress plugin** (`plugins/wordpress/`) — same idea for non-Woo WP sites.
3. **Shopify app** (`plugins/shopify/`) — the Shopify integration story is the weakest of the lot.
4. **Worked examples** (`examples/`) — Next.js, Laravel, Express, Bubble, Wix. Real, deployable, with a README.

## Before opening a PR

- [ ] Tests pass (`npm test` / `phpunit` in the touched package)
- [ ] Linting / formatter clean
- [ ] README updated if the public API changed
- [ ] PR description names the forum thread (or use case) the change addresses

## Release process

Maintainers publish to npm + Packagist after merging to `main`. You don't need to bump versions in your PR — leave that to the merger.

## Questions?

Open a [Discussion](https://github.com/nobytechy/manishapay-sdks/discussions), or email [nobytechy@gmail.com](mailto:nobytechy@gmail.com).
