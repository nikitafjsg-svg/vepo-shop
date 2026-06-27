const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildOrderMessage,
  handleTelegramCommand,
  isAdminUpdate
} = require('../lib/telegram-bot.js');

test('buildOrderMessage formats customer contacts and order items', () => {
  const message = buildOrderMessage({
    id: 'PV-260627-001',
    customer: { name: 'Никита', phone: '+7 (900) 000-00-00', telegram: '@nikita', comment: 'вечером' },
    items: [
      { name: 'MAD Манго', sku: '#7001', qty: 2, price: 600 },
      { name: 'ELF BAR', sku: '#7007', qty: 1, price: 1350 }
    ],
    total: 2550
  });

  assert.match(message, /Новый заказ PV-260627-001/);
  assert.match(message, /Никита/);
  assert.match(message, /@nikita/);
  assert.match(message, /MAD Манго #7001 × 2 — 1\s? ?200 ₽/);
  assert.match(message, /ELF BAR #7007 × 1 — 1\s? ?350 ₽/);
  assert.match(message, /Итого: 2\s? ?550 ₽/);
  assert.match(message, /Комментарий: вечером/);
});

test('telegram bot only supports order notifications and does not require Supabase service role', async () => {
  const start = await handleTelegramCommand({ text: '/start' });
  const products = await handleTelegramCommand({ text: '/products' });

  assert.match(start, /уведомления/i);
  assert.doesNotMatch(start, /\/add|\/delete|SUPABASE_SERVICE_ROLE_KEY/i);
  assert.match(products, /только.*уведомления/i);
});

test('isAdminUpdate allows only configured Telegram admin id', () => {
  assert.equal(isAdminUpdate({ message: { from: { id: 123 } } }, '123'), true);
  assert.equal(isAdminUpdate({ message: { from: { id: 777 } } }, '123'), false);
});
