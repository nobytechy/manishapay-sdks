# ManishaPay — Public SDKs & Plugins

Open-source clients, drop-in widget, and (soon) platform plugins for **[ManishaPay](https://pay.aizim.co.zw)** — middleware that fixes PayNow Zimbabwe integration headaches at the protocol layer.

> **About this repo.** This is the *public* surface — everything you need to integrate with ManishaPay from your own application. The platform itself (dashboard, backend, billing) is closed-source and lives at [pay.aizim.co.zw](https://pay.aizim.co.zw).

---

## What's in here

| Package | Install | Use case |
|---|---|---|
| [`packages/nodejs`](./packages/nodejs) | `npm install manishapay` | Node.js backend integration |
| [`packages/php`](./packages/php) | `composer require manishapay/manishapay` | PHP / Laravel / WordPress backend integration |
| [`packages/checkout-js`](./packages/checkout-js) | `<script src="https://pay.aizim.co.zw/checkout.js">` | Drop-in checkout button for any HTML page |
| [`plugins/`](./plugins) | — | WordPress, WooCommerce, Shopify connectors *(coming)* |
| [`examples/`](./examples) | — | Worked integrations: Next.js, Laravel, Express *(coming)* |

---

## 60-second quickstart

You'll need a free [ManishaPay account](https://pay.aizim.co.zw/register) and a test API key (`mp_test_…`).

### Node.js

```bash
npm install manishapay
```

```js
const ManishaPay = require('manishapay');
const mp = new ManishaPay(process.env.MANISHAPAY_API_KEY);

const r = await mp.pay({
  reference: 'order-1234',
  amount: '5.00',
  email: 'buyer@example.com',
});

// Redirect the customer:
console.log(r.browser_url);
```

### PHP

```bash
composer require manishapay/manishapay
```

```php
$mp = new ManishaPay\ManishaPay(getenv('MANISHAPAY_API_KEY'));
$r  = $mp->pay([
  'reference' => 'order-1234',
  'amount'    => '5.00',
  'email'     => 'buyer@example.com',
]);
header('Location: ' . $r['browser_url']);
```

### Drop-in widget (any HTML page, no backend SDK needed)

```html
<script src="https://pay.aizim.co.zw/checkout.js"
        data-public-key="mp_pk_xxxxxxxxxxxx"
        data-amount="5.00"
        data-reference="order-1234">
</script>
```

The widget renders a checkout button on the page. Click → modal opens with the ManishaPay simulator (test mode) or real PayNow checkout (live mode).

---

## What ManishaPay actually solves

Every recurring thread on [forums.paynow.co.zw](https://forums.paynow.co.zw/) — *"Invalid Hash. Hash should start with…"*, *"Status not reflecting in DB"*, *"OTP never fires"*, *"The method '' is not recognized"* — is mapped to either a Direct fix, a Plugin fallback, or an honest Account-level boundary.

See the full coverage map: **[pay.aizim.co.zw/forum-coverage](https://pay.aizim.co.zw/forum-coverage)**.

---

## Test mode

Every fresh `mp_test_*` key works in **simulated mode** out of the box — no PayNow account required. The API responds with a `browser_url` pointing at the ManishaPay simulator, where you can click Paid / Cancelled / Timeout to fire signed webhooks at your endpoints. Full lifecycle, end-to-end, before you've even registered with PayNow.

After you add your real PayNow Integration ID + Key in the dashboard, the same code switches transparently to real test or live mode.

---

## Versioning & stability

- All packages follow [Semantic Versioning 2.0](https://semver.org/).
- The HTTP API itself is versioned (`/v1/…`) — breaking changes go to `/v2/`.
- These SDKs target the latest stable API version.

---

## Contributing

Pull requests welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md). High-impact areas right now:
- A native WooCommerce plugin (replaces the buggy stock one)
- WordPress plugin (general-purpose)
- A Shopify connector (Shopify checkout integration)
- More worked examples (Next.js, Laravel, Bubble, Wix)

Security disclosures: see [SECURITY.md](./SECURITY.md).

---

## License

MIT — see [LICENSE](./LICENSE). You're free to use these SDKs in commercial products without restriction.

---

## Maintainer

**Noby Tebulo** · [noby.aizim.co.zw](https://noby.aizim.co.zw) · [nobytechy@gmail.com](mailto:nobytechy@gmail.com)

Built with care for the Zimbabwean developer community.
