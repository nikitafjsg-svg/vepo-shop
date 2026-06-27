const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

test('checkout asks for Telegram instead of email', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  const checkoutStart = html.indexOf('<form id="checkout-form">');
  const checkoutEnd = html.indexOf('<div class="order-preview"', checkoutStart);
  const checkoutForm = html.slice(checkoutStart, checkoutEnd);

  assert.match(checkoutForm, /Telegram/i);
  assert.match(checkoutForm, /name="telegram"/);
  assert.doesNotMatch(checkoutForm, /name="email"/);
});

test('checkout sends created orders to the Vercel Telegram API', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

  assert.match(html, /\/api\/orders/);
  assert.match(html, /notifyOrderToTelegram/);
});
