const test = require('node:test');
const assert = require('node:assert/strict');
const {
  buildOrderMessage,
  parseCommand,
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

test('parseCommand understands product management commands', () => {
  assert.deepEqual(parseCommand('/products'), { name: 'products', args: '' });
  assert.deepEqual(parseCommand('/delete #7001'), { name: 'delete', args: '#7001' });
  assert.deepEqual(
    parseCommand('/add MAD Манго | liquids | MAD | 600 | #7001'),
    { name: 'add', args: 'MAD Манго | liquids | MAD | 600 | #7001' }
  );
});

test('isAdminUpdate allows only configured Telegram admin id', () => {
  assert.equal(isAdminUpdate({ message: { from: { id: 123 } } }, '123'), true);
  assert.equal(isAdminUpdate({ message: { from: { id: 777 } } }, '123'), false);
});
