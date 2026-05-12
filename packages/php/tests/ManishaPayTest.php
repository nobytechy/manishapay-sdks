<?php
/**
 * ManishaPay PHP SDK — tests.
 *
 * Run with:  ./vendor/bin/phpunit
 *
 * Covers: constructor validation + the full webhook signature
 * verification matrix (valid signed body, tampered body, expired
 * timestamp, default + custom tolerance, malformed header inputs,
 * empty inputs). HTTP transport is tested via the Node SDK + the
 * backend's own integration tests; mocking PHP cURL cleanly would
 * require refactoring the SDK to accept an injected client (planned
 * for v0.2).
 */
declare(strict_types=1);

namespace ManishaPay\Tests;

use ManishaPay\ManishaPay;
use PHPUnit\Framework\TestCase;

final class ManishaPayTest extends TestCase
{
    private const SECRET = 'whsec_test_123';

    // ── helpers ────────────────────────────────────────────────────

    private function signedHeader(string $body, ?int $tsOverride = null): array
    {
        $ts  = $tsOverride ?? time();
        $sig = hash_hmac('sha256', $ts . '.' . $body, self::SECRET);
        return [$ts, $sig, sprintf('t=%d,v1=%s', $ts, $sig)];
    }

    // ── constructor ────────────────────────────────────────────────

    public function testConstructorAcceptsTestKey(): void
    {
        $mp = new ManishaPay('mp_test_abcdef');
        $this->assertInstanceOf(ManishaPay::class, $mp);
    }

    public function testConstructorAcceptsLiveKey(): void
    {
        $mp = new ManishaPay('mp_live_xyz');
        $this->assertInstanceOf(ManishaPay::class, $mp);
    }

    public function testConstructorRejectsEmptyKey(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new ManishaPay('');
    }

    public function testConstructorRejectsMalformedKey(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new ManishaPay('not-a-key');
    }

    public function testConstructorRejectsWrongPrefix(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new ManishaPay('sk_test_oops');
    }

    public function testConstructorRejectsAmbiguousMpPrefix(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new ManishaPay('mp_xxx_foo');  // valid prefix but wrong env segment
    }

    // ── verifyWebhook — happy path ────────────────────────────────

    public function testVerifyWebhookValidSignedBody(): void
    {
        $body = '{"event":"payment.updated","data":{"reference":"order-1"}}';
        [, , $header] = $this->signedHeader($body);
        $this->assertTrue(ManishaPay::verifyWebhook($body, $header, self::SECRET));
    }

    public function testVerifyWebhookRejectsTamperedBody(): void
    {
        $original = '{"event":"payment.updated","data":{"reference":"order-1"}}';
        [, , $header] = $this->signedHeader($original);
        $this->assertFalse(ManishaPay::verifyWebhook('TAMPERED-BODY', $header, self::SECRET));
    }

    public function testVerifyWebhookRejectsBadSecret(): void
    {
        $body = 'x';
        [, , $header] = $this->signedHeader($body);
        $this->assertFalse(ManishaPay::verifyWebhook($body, $header, 'wrong-secret'));
    }

    // ── verifyWebhook — timestamp tolerance ───────────────────────

    public function testVerifyWebhookRejectsExpiredTimestampDefault(): void
    {
        $body = 'irrelevant';
        // 10 minutes old — beyond 300s default tolerance
        [, , $header] = $this->signedHeader($body, time() - 600);
        $this->assertFalse(ManishaPay::verifyWebhook($body, $header, self::SECRET));
    }

    public function testVerifyWebhookAcceptsRecentTimestamp(): void
    {
        $body = 'irrelevant';
        // 2 min ago, within default 300s window
        [, , $header] = $this->signedHeader($body, time() - 120);
        $this->assertTrue(ManishaPay::verifyWebhook($body, $header, self::SECRET));
    }

    public function testVerifyWebhookHonoursCustomTolerance(): void
    {
        $body = 'irrelevant';
        // 2 min ago
        [, , $header] = $this->signedHeader($body, time() - 120);
        // Within 300s default — should accept
        $this->assertTrue(ManishaPay::verifyWebhook($body, $header, self::SECRET, 300));
        // Within 60s strict tolerance — should reject (120s > 60s)
        $this->assertFalse(ManishaPay::verifyWebhook($body, $header, self::SECRET, 60));
    }

    // ── verifyWebhook — bad inputs ────────────────────────────────

    public function testVerifyWebhookRejectsEmptyHeader(): void
    {
        $this->assertFalse(ManishaPay::verifyWebhook('body', '', self::SECRET));
    }

    public function testVerifyWebhookRejectsNullHeader(): void
    {
        $this->assertFalse(ManishaPay::verifyWebhook('body', null, self::SECRET));
    }

    public function testVerifyWebhookRejectsEmptySecret(): void
    {
        $body = 'x';
        [, , $header] = $this->signedHeader($body);
        $this->assertFalse(ManishaPay::verifyWebhook($body, $header, ''));
    }

    public function testVerifyWebhookRejectsHeaderMissingTs(): void
    {
        $this->assertFalse(ManishaPay::verifyWebhook('body', 'v1=abc123', self::SECRET));
    }

    public function testVerifyWebhookRejectsHeaderMissingSig(): void
    {
        $this->assertFalse(ManishaPay::verifyWebhook('body', 't=' . time(), self::SECRET));
    }

    public function testVerifyWebhookRejectsMalformedHeader(): void
    {
        $this->assertFalse(ManishaPay::verifyWebhook('body', 'no-equals-here', self::SECRET));
        $this->assertFalse(ManishaPay::verifyWebhook('body', 't=notanumber,v1=abc', self::SECRET));
        $this->assertFalse(ManishaPay::verifyWebhook('body', 't=' . time() . ',v1=', self::SECRET));
    }
}
