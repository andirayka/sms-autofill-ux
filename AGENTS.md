# AGENTS.md

Guidance for AI agents working in this repository. Read this before changing
code.

## What this project is

A small Android React Native demo of **SMS Retriever autofill**: a login screen
whose 6-digit code fills in by itself when an SMS arrives, while the app holds
**no SMS permission**. It exists to make that platform behaviour visible on a
real phone, and to be recorded for a post.

Android only. Do not imply iOS behaviour.

## Non-negotiables

1. **Never request or declare an SMS permission.** No `READ_SMS`,
   `RECEIVE_SMS`, `RECEIVE_MMS`, `RECEIVE_WAP_PUSH`. The whole claim is that the
   code arrives without one. `npm run verify:manifest` enforces it on the built
   APK; run it after any native or dependency change.
2. **Never fake the fill.** The code reaches the screen only from the native
   `onSms` event, which only fires when Play services delivers a real SMS. No
   debug button, no mock SMS in the app, no pre-filled state.
3. **The hash is part of the contract.** Play services matches an SMS only if it
   ends with the 11-character hash of this package and signing key. A different
   package name or keystore changes it. `scripts/app-hash.sh` recomputes it
   independently of the app; the verification compares the two.
4. **One listen window is one SMS.** After a result (or the 5-minute timeout)
   the native receiver is removed. The hook re-arms it when a matching SMS had
   no code, and on `listen()`. Do not leave a receiver registered on unmount.
5. **Native SMS Retriever code stays in `modules/sms-retriever`.** The screen and
   hook only call its three functions (`getAppHashes`, `start`, `stop`).
6. **No real data.** Fake codes and fake text only. Never commit a real phone
   number, account detail or screenshot containing one.

## Conventions

- TypeScript strict. `npm run typecheck` must pass.
- ESLint flat config plus Prettier. `npm run lint` and `npm run format:check`
  must pass.
- Comments explain _why_, never _what_.
- Copy and colours live in `src/constants/`, not in components.
- Use `npx expo install` for Expo-compatible dependency versions.

## Verifying changes

```sh
npm run typecheck && npm run lint && npm run format:check
npm test                                   # unit + hook + screen tests
cd android && ./gradlew :app:assembleRelease -x lint && cd ..
npm run verify:manifest                    # no SMS permission in the APK
npm run verify:emulator -- <adb-serial>    # Maestro, real emulator SMS
```

Android builds need `ANDROID_HOME` set (for example
`export ANDROID_HOME=$HOME/Library/Android/sdk`).
