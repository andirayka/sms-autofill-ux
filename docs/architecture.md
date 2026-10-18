# Architecture

```
 SMS ──► telephony ──► Google Play services ──► SmsRetriever broadcast
                       (matches the app hash)         │
                                                      ▼
   VerifyScreen ◄── useSmsAutofill ◄── SmsRetrieverModule (Kotlin)
   (6 boxes)         (extractCode)      start / stop / getAppHashes
```

- `modules/sms-retriever` (Kotlin): `start()` calls `startSmsRetriever()` and
  registers a receiver guarded by the Play services send permission; one
  result (SMS or timeout) unregisters it. `AppHash` computes the 11-character
  hash.
- `src/sms/otp.ts`: pure functions: `extractCode` (a standalone 6-digit run),
  `buildSms`, `checkSms` (140 bytes, hash last).
- `src/sms/useSmsAutofill.ts`: owns the listen window, re-arms it when an SMS
  has no code, removes listeners and stops the native window on unmount.
- `src/screens/VerifyScreen.tsx`: draws the boxes and status. It never sets the
  code itself.

## Permissions

The built APK declares only `INTERNET`, `VIBRATE`, `SYSTEM_ALERT_WINDOW`, the
legacy storage permissions capped at API 32, and a dynamic-receiver permission
for the app's own receivers. No SMS permission. See `npm run verify:manifest`.
