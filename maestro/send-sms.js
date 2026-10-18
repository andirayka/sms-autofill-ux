// Asks scripts/sms-server.py to deliver one SMS to the emulator.
var response = http.get(
  'http://127.0.0.1:8765/sms?text=' + encodeURIComponent(TEXT),
);
if (!response.ok) {
  throw new Error('SMS bridge failed: ' + response.body);
}
