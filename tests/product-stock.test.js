const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const Store = require('../store-core.js');

test('default products start with one unit in stock and available status', () => {
  assert.equal(Store.defaultProducts.every(product => product.stock === 1), true);
  assert.equal(Store.defaultProducts.every(product => product.available === true), true);
});

test('normalizeProduct stores stock and availability with safe defaults', () => {
  const defaultProduct = Store.normalizeProduct({ name: 'Test', category: 'liquids', brand: 'MAD', price: '650' }, []);
  assert.equal(defaultProduct.stock, 1);
  assert.equal(defaultProduct.available, true);

  const unavailable = Store.normalizeProduct({ name: 'Test', category: 'liquids', brand: 'MAD', price: '650', stock: '7', available: '' }, []);
  assert.equal(unavailable.stock, 7);
  assert.equal(unavailable.available, false);
});

test('createOrder does not include more units than product stock', () => {
  const order = Store.createOrder({
    customer: { name: 'Анна', phone: '+79000000000' },
    cart: [{ productId: 'a', qty: 5 }, { productId: 'b', qty: 1 }],
    products: [
      { id: 'a', name: 'MAD Манго', price: 600, stock: 1, available: true },
      { id: 'b', name: 'Нет товара', price: 900, stock: 0, available: false }
    ],
    now: new Date('2026-06-26T10:00:00Z'),
    existing: []
  });

  assert.equal(order.items.length, 1);
  assert.equal(order.items[0].qty, 1);
  assert.equal(order.total, 600);
});

test('admin product form exposes stock and availability controls', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'admin.html'), 'utf8');
  assert.match(html, /name="stock"/);
  assert.match(html, /name="available"/);
  assert.match(html, /ОСТАТОК|КОЛИЧЕСТВО/i);
  assert.match(html, /В НАЛИЧИИ/i);
});

test('customer catalog shows stock and disables unavailable products', () => {
  const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
  assert.match(html, /stockLabel/);
  assert.match(html, /disabled/);
  assert.match(html, /НЕТ В НАЛИЧИИ/);
});
