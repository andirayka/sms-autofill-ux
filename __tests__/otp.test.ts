import { buildSms, checkSms, extractCode } from '../src/sms/otp';

const HASH = 'FA+9qCX9VSu';

describe('extractCode', () => {
  it('finds a standalone 6-digit code', () => {
    expect(extractCode(`Your demo code is 482913\n${HASH}`)).toBe('482913');
  });

  it('does not take a digit run longer or shorter than the code length', () => {
    expect(extractCode('Order 1234567 shipped')).toBeNull();
    expect(extractCode('Call 08123456789')).toBeNull();
    expect(extractCode('Code 12345')).toBeNull();
  });

  it('keeps leading zeros', () => {
    expect(extractCode('Code 004217')).toBe('004217');
  });

  it('takes the first standalone code when two appear', () => {
    expect(extractCode('111111 then 222222')).toBe('111111');
  });

  it('returns null for text without digits', () => {
    expect(extractCode('hello')).toBeNull();
  });
});

describe('buildSms / checkSms', () => {
  it('builds a message that ends with the hash and passes the check', () => {
    const sms = buildSms('482913', HASH);
    expect(sms.endsWith(HASH)).toBe(true);
    expect(checkSms(sms, HASH)).toEqual({ ok: true });
  });

  it('rejects a message when the hash is not last', () => {
    expect(checkSms(`${HASH} code 482913`, HASH)).toEqual({
      ok: false,
      reason: 'hash-not-last',
    });
  });

  it('accepts exactly 140 bytes and rejects 141', () => {
    const pad = (n: number) => 'x'.repeat(n);
    const at140 = `${pad(140 - HASH.length)}${HASH}`;
    expect(checkSms(at140, HASH)).toEqual({ ok: true });
    expect(checkSms(`y${at140}`, HASH)).toEqual({
      ok: false,
      reason: 'too-long',
    });
  });

  it('counts bytes, not characters', () => {
    // 36 two-byte characters + the hash is 36 chars but 83 bytes; 70 of them
    // is 140 + hash bytes and must fail although it is under 140 characters.
    const text = `${'é'.repeat(70)}${HASH}`;
    expect(text.length).toBeLessThan(140);
    expect(checkSms(text, HASH)).toEqual({ ok: false, reason: 'too-long' });
  });

  it('rejects a hash that is not 11 base64 characters', () => {
    expect(checkSms('code 1', 'short').ok).toBe(false);
    expect(checkSms(`code ${HASH}!`, `${HASH}!`).ok).toBe(false);
  });
});
