#!/usr/bin/env bash
# Emulator verification: one Maestro run covers the control state, a correct
# SMS, a wrong-hash SMS, no-code and over-long-code SMS, and recovery.
# Usage: scripts/verify-emulator.sh <adb-serial> [apk]
# Each SMS is injected through Android's telephony stack
# (`adb emu sms send`), so Play services receives it like a carrier SMS.
set -euo pipefail

SERIAL="${1:?usage: verify-emulator.sh <adb-serial> [apk]}"
APK="${2:-android/app/build/outputs/apk/release/app-release.apk}"

HASH="$(bash scripts/app-hash.sh)"
[ ${#HASH} -eq 11 ] || { echo "FAIL: could not compute the hash" >&2; exit 1; }
echo "Expected hash (from the signing keystore): $HASH"

adb -s "$SERIAL" install -r "$APK" >/dev/null
python3 -I scripts/sms-server.py "$SERIAL" >/tmp/sms-server.log 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT
sleep 1

# On this emulator (Dev_Light_API_36, 2 GB) Maestro's connection sometimes
# drops before the flow reaches its first assertion ("device offline"). That is
# a harness fault, not a result, so a run that produced no assertion verdict is
# retried after an adb reconnect. A failed assertion fails immediately.
OUT="$(mktemp)"
for attempt in 1 2 3 4 5; do
  adb -s "$SERIAL" reconnect >/dev/null
  adb -s "$SERIAL" wait-for-device
  sleep 3
  if maestro --device "$SERIAL" test -e HASH="$HASH" maestro/autofill-all.yaml >"$OUT" 2>&1; then
    grep -E "COMPLETED|Flow" "$OUT"
    echo "ALL EMULATOR CHECKS PASSED (attempt $attempt)"
    exit 0
  fi
  if grep -Eq "Assertion is false|Element not found" "$OUT"; then
    grep -vE "│|╭|╰|^$" "$OUT" | head -30 >&2
    exit 1
  fi
  echo "harness dropped (attempt $attempt), retrying" >&2
done
echo "FAIL: Maestro could not hold a connection to $SERIAL" >&2
exit 1
