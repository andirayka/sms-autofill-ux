import { APP_HASH_LENGTH, CODE_LENGTH, SMS_MAX_BYTES } from '../constants/sms';

const byteLength = (text: string) => new TextEncoder().encode(text).length;

/**
 * First standalone run of exactly `length` digits. A longer run (an order
 * number, a phone number) must not be mistaken for the code.
 */
export function extractCode(
  message: string,
  length: number = CODE_LENGTH,
): string | null {
  const match = new RegExp(`(?<!\\d)\\d{${length}}(?!\\d)`).exec(message);
  return match ? match[0] : null;
}

/** The SMS Android will hand to the app: the code, then the hash last. */
export function buildSms(code: string, hash: string): string {
  return `Your demo code is ${code} ${hash}`;
}

export type SmsCheck =
  | { ok: true }
  | { ok: false; reason: 'too-long' | 'bad-hash' | 'hash-not-last' };

/** Mirrors what Play services requires, so a bad text fails here first. */
export function checkSms(message: string, hash: string): SmsCheck {
  if (!new RegExp(`^[A-Za-z0-9+/]{${APP_HASH_LENGTH}}$`).test(hash)) {
    return { ok: false, reason: 'bad-hash' };
  }
  if (byteLength(message) > SMS_MAX_BYTES) {
    return { ok: false, reason: 'too-long' };
  }
  if (!message.trimEnd().endsWith(hash)) {
    return { ok: false, reason: 'hash-not-last' };
  }
  return { ok: true };
}
