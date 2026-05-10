# `manishapay-checkout-js`

The drop-in checkout widget for ManishaPay. Renders a checkout button on any HTML page; clicking it opens a modal-iframe with the ManishaPay simulator (test mode) or real PayNow checkout (live mode). Receives a `postMessage` when the customer completes / cancels / times out.

**~7 KB, no dependencies.** Works in every modern browser.

## Hosted (recommended)

The widget is served from ManishaPay's CDN — most users should just include it from there:

```html
<script src="https://pay.aizim.co.zw/checkout.js"></script>
```

The hosted version is auto-updated when we ship improvements. Pinning to the bundled copy in this repo is fine if you need version stability.

## Usage — declarative

The simplest integration: drop a `<script>` tag on the page where you want a checkout button to appear.

```html
<script
  src="https://pay.aizim.co.zw/checkout.js"
  data-public-key="mp_pk_xxxxxxxxxxxx"
  data-amount="5.00"
  data-reference="order-1234"
  data-description="Pro plan — annual"
  data-email="buyer@example.com"
  data-button-text="Pay $5"
></script>
```

The widget renders a styled button at the script's location and handles everything else.

## Usage — programmatic

For SPAs (React, Vue, Svelte) where you need to control when checkout opens:

```js
window.ManishaPay.open({
  publicKey: 'mp_pk_xxxxxxxxxxxx',
  amount: '5.00',
  reference: 'order-1234',
  description: 'Pro plan — annual',
  email: 'buyer@example.com',
  onComplete: (txn) => {
    console.log('paid', txn);
    // Update UI / navigate to thank-you page
  },
  onCancel: () => console.log('user cancelled'),
});
```

Load the script once on app boot; call `ManishaPay.open(...)` whenever needed.

## Postmessage events

The iframe posts to `window.parent` on outcome:

```js
{
  source: 'manishapay',
  type:   'payment.completed' | 'payment.cancelled',
  data:   { tracker, outcome, status }
}
```

Listen with `window.addEventListener('message', ...)` if you need fine-grained control beyond the `onComplete` callback.

## Test mode

When the public key is `mp_pk_test_*`, the widget loads the ManishaPay simulator — three buttons (Paid / Cancelled / Timeout) on a fake checkout page. Useful for end-to-end tests in CI / Cypress / Playwright.

## License

MIT
