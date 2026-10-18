#!/usr/bin/env bash
# Proves the built APK asks for no SMS permission. Reads the merged manifest of
# the release APK, so a library that sneaks one in is caught too.
set -euo pipefail

APK="${1:-android/app/build/outputs/apk/release/app-release.apk}"
AAPT="$(ls "${ANDROID_HOME:-$HOME/Library/Android/sdk}"/build-tools/*/aapt2 | tail -1)"

permissions="$("$AAPT" dump permissions "$APK")"
echo "$permissions"

if echo "$permissions" | grep -Eq '(READ|RECEIVE|SEND|WRITE)_SMS|RECEIVE_MMS|RECEIVE_WAP_PUSH'; then
  echo "FAIL: the APK requests an SMS-related permission" >&2
  exit 1
fi
echo "PASS: no SMS-related permission in $APK"
