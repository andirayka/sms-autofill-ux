#!/usr/bin/env bash
# Computes the SMS Retriever app hash without the app: SHA-256 of
# "<package> <signing-cert-hex>", first 9 bytes, base64, first 11 characters.
# It is an independent check of the hash the native module reports.
# Usage: scripts/app-hash.sh [keystore] [alias] [storepass]
set -euo pipefail

PKG="com.andirayka.smsautofillux"
KEYSTORE="${1:-android/app/debug.keystore}"
ALIAS="${2:-androiddebugkey}"
STOREPASS="${3:-android}"

CERT_HEX="$(keytool -exportcert -alias "$ALIAS" -keystore "$KEYSTORE" -storepass "$STOREPASS" 2>/dev/null \
  | xxd -p | tr -d '\n')"
printf '%s %s' "$PKG" "$CERT_HEX" | openssl dgst -sha256 -binary | head -c 9 | base64 | tr -d '=\n' | head -c 11
echo
