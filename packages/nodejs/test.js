/**
 * ManishaPay Node SDK — tests.
 *
 * Run with:  npm test  (uses Node's built-in test runner, no deps)
 *
 * Covers: constructor validation, webhook signature verification
 * (positive, tampered body, expired timestamp, custom tolerance),
 * and HTTP request shape via injected fetch.
 */
'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');

const ManishaPay = require('./index');
const { ManishaPayError } = require('./index');

// ─── Helpers ────────────────────────────────────────────────────
function signWebhook(body, secret, ts = Math.floor(Date.now() / 1000)) {
  const sig = crypto.createHmac('sha256', secret).update(`${ts}.${body}`).digest('hex');
  return { ts, sig, header: `t=${ts},v1=${sig}` };
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ─── Constructor ────────────────────────────────────────────────

test('constructor rejects missing or malformed API keys', () => {
  assert.throws(() => new ManishaPay(undefined));
  assert.throws(() => new ManishaPay(null));
  assert.throws(() => new ManishaPay(''));
  assert.throws(() => new ManishaPay('not-a-key'));
  assert.throws(() => new ManishaPay('mp_xxx_foo'));
  assert.throws(() => new ManishaPay('sk_test_oops'));
});

test('constructor accepts mp_test_ and mp_live_ keys', () => {
  assert.doesNotThrow(() => new ManishaPay('mp_test_abcdef', { fetch: () => {} }));
  assert.doesNotThrow(() => new ManishaPay('mp_live_xyz', { fetch: () => {} }));
});

test('constructor honours options.baseUrl and strips trailing slashes', () => {
  const mp = new ManishaPay('mp_test_abc', { baseUrl: 'https://x.example.com/api/', fetch: () => {} });
  assert.equal(mp.baseUrl, 'https://x.example.com/api');
});

// ─── Webhook signature verification ────────────────────────────

test('verifyWebhook returns false for missing inputs', () => {
  assert.equal(ManishaPay.verifyWebhook('body', '', 'secret'), false);
  assert.equal(ManishaPay.verifyWebhook('body', null, 'secret'), false);
  assert.equal(ManishaPay.verifyWebhook('body', 't=1,v1=abc', ''), false);
});

test('verifyWebhook validates a correctly-signed body', () => {
  const secret = 'whsec_test_123';
  const body = '{"event":"payment.updated","data":{"reference":"order-1"}}';
  const { header } = signWebhook(body, secret);
  assert.equal(ManishaPay.verifyWebhook(body, header, secret), true);
});

test('verifyWebhook rejects a tampered body', () => {
  const secret = 'whsec_test_123';
  const body = '{"event":"payment.updated","data":{"reference":"order-1"}}';
  const { header } = signWebhook(body, secret);
  assert.equal(ManishaPay.verifyWebhook('TAMPERED-BODY', header, secret), false);
});

test('verifyWebhook rejects timestamps outside the default tolerance', () => {
  const secret = 'whsec_test_123';
  const body = 'irrelevant';
  // 10 minutes old — beyond 300s default tolerance
  const oldTs = Math.floor(Date.now() / 1000) - 600;
  const { header } = signWebhook(body, secret, oldTs);
  assert.equal(ManishaPay.verifyWebhook(body, header, secret), false);
});

test('verifyWebhook honours a custom toleranceSeconds', () => {
  const secret = 'whsec_test_123';
  const body = 'irrelevant';
  const ts120sAgo = Math.floor(Date.now() / 1000) - 120;
  const { header } = signWebhook(body, secret, ts120sAgo);
  // Default 300s window — accepts
  assert.equal(ManishaPay.verifyWebhook(body, header, secret), true);
  // Strict 60s window — rejects
  assert.equal(ManishaPay.verifyWebhook(body, header, secret, { toleranceSeconds: 60 }), false);
});

test('verifyWebhook rejects malformed signature header', () => {
  const secret = 'whsec_test_123';
  const body = 'x';
  assert.equal(ManishaPay.verifyWebhook(body, 'no-equals-sign-here', secret), false);
  assert.equal(ManishaPay.verifyWebhook(body, 't=notanumber,v1=abc', secret), false);
  assert.equal(ManishaPay.verifyWebhook(body, 't=1234,v1=', secret), false);
});

test('verifyWebhook accepts a Buffer body (raw bytes)', () => {
  const secret = 'whsec_test_123';
  const bodyStr = '{"x":1}';
  const { header } = signWebhook(bodyStr, secret);
  assert.equal(ManishaPay.verifyWebhook(Buffer.from(bodyStr, 'utf8'), header, secret), true);
});

// ─── HTTP request shape (with injected fetch) ──────────────────

test('pay() POSTs JSON to /v1/pay with bearer auth and unwraps {data}', async () => {
  const fakeFetch = async (url, opts) => {
    assert.match(url, /\/v1\/pay$/);
    assert.equal(opts.method, 'POST');
    assert.equal(opts.headers.Authorization, 'Bearer mp_test_abc');
    assert.equal(opts.headers['Content-Type'], 'application/json');
    assert.match(opts.headers['X-Request-Id'], /^node-/);
    assert.deepEqual(JSON.parse(opts.body), { reference: 'order-1', amount: '5.00' });
    return jsonResponse({
      data: { tracker: 'mp_xxx', browser_url: 'https://example.com/sim/mp_xxx', mode: 'simulated' },
      requestId: 'rid-server',
    }, 201);
  };
  const mp = new ManishaPay('mp_test_abc', { fetch: fakeFetch });
  const r = await mp.pay({ reference: 'order-1', amount: '5.00' });
  assert.equal(r.tracker, 'mp_xxx');
  assert.equal(r.mode, 'simulated');
  assert.equal(r.browser_url, 'https://example.com/sim/mp_xxx');
});

test('status() GETs /v1/pay/:reference/status with URL-encoded reference', async () => {
  const fakeFetch = async (url, opts) => {
    assert.match(url, /\/v1\/pay\/order%20with%20space\/status$/);
    assert.equal(opts.method, 'GET');
    return jsonResponse({
      data: { reference: 'order with space', status: 'Paid', status_normalized: 'paid' },
    });
  };
  const mp = new ManishaPay('mp_test_abc', { fetch: fakeFetch });
  const r = await mp.status('order with space');
  assert.equal(r.status, 'Paid');
  assert.equal(r.status_normalized, 'paid');
});

test('non-2xx response throws ManishaPayError with code, status, requestId', async () => {
  const fakeFetch = async () => jsonResponse({
    error: { code: 'INVALID_API_KEY', message: 'API key revoked' },
    requestId: 'rid-test',
  }, 401);
  const mp = new ManishaPay('mp_test_abc', { fetch: fakeFetch });
  await assert.rejects(
    mp.pay({ reference: 'x', amount: '1' }),
    (err) => {
      assert.ok(err instanceof ManishaPayError);
      assert.equal(err.code, 'INVALID_API_KEY');
      assert.equal(err.status, 401);
      assert.equal(err.requestId, 'rid-test');
      assert.equal(err.message, 'API key revoked');
      return true;
    },
  );
});

test('non-JSON error body falls back to NETWORK code', async () => {
  const fakeFetch = async () => new Response('502 Bad Gateway', { status: 502 });
  const mp = new ManishaPay('mp_test_abc', { fetch: fakeFetch });
  await assert.rejects(
    mp.pay({ reference: 'x', amount: '1' }),
    (err) => {
      assert.equal(err.code, 'NETWORK');
      assert.equal(err.status, 502);
      return true;
    },
  );
});
