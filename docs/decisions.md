# Decisions

## SMS Retriever, not SMS User Consent, not READ_SMS

- **READ_SMS / RECEIVE_SMS** would work but is exactly what the demo is meant
  to avoid, and is restricted by Google Play policy.
- **SMS User Consent** needs no permission either but shows a system popup the
  user must tap. The point here is a fully automatic fill, so it is out of
  scope.
- **SMS Retriever** needs no permission and no popup. The price: the SMS must
  end with the app's hash, be at most 140 bytes, and the app must be listening.

## A local Expo module instead of a library

`react-native-otp-verify` was tried first. Expo's installer warned that it does
not support the New Architecture, which React Native 0.88 requires. The native
side is about 100 lines (receiver, start call, hash), so it lives in
`modules/sms-retriever`, depends only on
`com.google.android.gms:play-services-auth-api-phone`, and is auditable here.

## Release and debug builds share one hash in this repo

The hash comes from the package name and the signing certificate. This project
signs the release build with the generated debug keystore (the Expo prebuild
default), so debug and release produce the **same** hash. A real production
keystore, or Play App Signing, would produce a different one; the SMS must then
use that hash. `getAppHashes()` reports whatever the installed build has.

## The prepared-SMS panel

A small "Prepared SMS" toggle at the bottom shows a ready-to-send message with
the build's own hash, so the text for a physical phone can be copied from the
build being filmed. It is deliberately small and outside the main flow.

## The SMS is one line

`Your demo code is 482913 <hash>`. A single line is easy to type on a phone and
to inject with `adb emu sms send`, and Play services accepts it. The hash is
last.

## Verification runs on the emulator

Per the workspace rule, the repository is verified on the Android emulator. The
physical-phone behaviour is demonstrated separately and is **not** claimed from
emulator results.
