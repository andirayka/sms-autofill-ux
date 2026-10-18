export const CODE_LENGTH = 6;

// Play services only delivers messages of at most 140 bytes.
export const SMS_MAX_BYTES = 140;

export const APP_HASH_LENGTH = 11;

export const COPY = {
  title: 'Enter the code',
  subtitle: 'We sent a 6-digit code by SMS',
  waiting: 'Waiting for SMS…',
  filled: 'Code filled automatically',
  timeout: 'No SMS arrived. Tap to listen again.',
  error: 'Could not start listening.',
  setup: 'Prepared SMS',
  setupHide: 'Hide',
  setupHint: 'Send this text to the phone. The hash must stay last.',
} as const;
