#!/usr/bin/env python3
"""Tiny local bridge so a Maestro flow can send a real emulator SMS.

Maestro flows cannot run shell commands, but their scripts can make an HTTP
call to the Mac. GET /sms?text=... runs `adb emu sms send`, which hands the SMS
to Android's telephony stack like a carrier message would.

Usage: scripts/sms-server.py <adb-serial> [port]
"""
import subprocess
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse

SERIAL = sys.argv[1]
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8765
SENDER = "12345"


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        url = urlparse(self.path)
        if url.path != "/sms":
            self.send_error(404)
            return
        text = parse_qs(url.query).get("text", [""])[0]
        result = subprocess.run(
            ["adb", "-s", SERIAL, "emu", "sms", "send", SENDER, text],
            capture_output=True,
            text=True,
        )
        body = (result.stdout + result.stderr).strip() or "sent"
        status = 200 if result.returncode == 0 and "OK" in body else 500
        self.send_response(status)
        self.end_headers()
        self.wfile.write(body.encode())

    def log_message(self, fmt, *args):
        sys.stderr.write("sms-server: " + (fmt % args) + "\n")


HTTPServer(("127.0.0.1", PORT), Handler).serve_forever()
