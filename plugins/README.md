# Platform plugins (roadmap)

Native plugins for the platforms that surface most often on [forums.paynow.co.zw](https://forums.paynow.co.zw/). Each one will be a clean replacement for the buggy stock PayNow plugin, built on top of ManishaPay's API + signed webhook contract.

| Plugin | Status | Replaces / addresses |
|---|---|---|
| `wordpress/` | 🟡 Planned | "PayNow WordPress plugin not completing transaction" *(Jan 2025)* |
| `woocommerce/` | 🟡 Planned | "Please select PayNow payment channel" *(WC 9.x recurring)* |
| `shopify/` | 🟡 Planned | "Shopify orders not reflecting", "no return callback" |
| `easy-digital-downloads/` | 🟡 Evaluating | "WhatsApp Ecocash Online Payment Integration" |
| `moodle/` | 🟡 Evaluating | "Moodle paynow plugin" |
| `gravity-forms/` | 🟡 Evaluating | "Test failing (gravity forms simple donation)" |

## Want one prioritised?

Open a [Discussion](https://github.com/nobytechy/manishapay-sdks/discussions/categories/plugin-requests) or email [nobytechy@gmail.com](mailto:nobytechy@gmail.com). Sponsorships welcome — first commercial user typically subsidises the build.

## Contributing a plugin

Each plugin lives in its own subdirectory with:
- `README.md` — install + config
- Source code
- A self-contained test suite (or worked example)
- A platform-specific `LICENSE` if it must differ from the repo MIT (rare)

See [CONTRIBUTING.md](../CONTRIBUTING.md) at the repo root.
