const test = require('node:test');
const assert = require('node:assert/strict');
const Store = require('../store-core.js');

test('administrator password is ксюша', () => {
  assert.equal(Store.isAdminPassword('ксюша'), true);
  assert.equal(Store.isAdminPassword('admin123'), false);
  assert.equal(Store.isAdminPassword('Ксюша'), false);
});

test('cartSummary counts units and total price', () => {
  const products = [{ id: 'a', price: 600 }, { id: 'b', price: 950 }];
  const result = Store.cartSummary([{ productId: 'a', qty: 2 }, { productId: 'b', qty: 1 }], products);
  assert.deepEqual(result, { count: 3, total: 2150 });
});

test('validateCheckout requires a name and eleven phone digits', () => {
  assert.deepEqual(Store.validateCheckout({ name: '', phone: '+7 (900) 000-00-00' }), { name: 'Пожалуйста, заполните поле' });
  assert.deepEqual(Store.validateCheckout({ name: 'Анна', phone: '+7 (900) 000-00' }), { phone: 'Телефон должен содержать 11 цифр' });
  assert.deepEqual(Store.validateCheckout({ name: 'Анна', phone: '+7 (900) 000-00-00' }), {});
});

test('whatsappUrl encodes product information', () => {
  const url = Store.whatsappUrl('79000000000', { name: 'MAD Манго', sku: '#7001', price: 600 });
  assert.match(url, /^https:\/\/wa\.me\/79000000000\?text=/);
  assert.equal(decodeURIComponent(url.split('text=')[1]), 'Добрый день! Хочу заказать: MAD Манго #7001 за 600₽');
});

test('nextSku returns the first free #70XX code after the maximum', () => {
  assert.equal(Store.nextSku([{ sku: '#7001' }, { sku: '#7012' }]), '#7013');
  assert.equal(Store.nextSku([]), '#7001');
});

test('filterProducts applies category and selected brands', () => {
  const products = [
    { category: 'liquids', brand: 'MAD' },
    { category: 'liquids', brand: 'FAFF' },
    { category: 'pods', brand: 'MAD' }
  ];
  assert.equal(Store.filterProducts(products, 'liquids', new Set(['MAD'])).length, 1);
  assert.equal(Store.filterProducts(products, 'liquids', new Set()).length, 2);
});

test('sortReviews puts featured first and sorts by selected mode', () => {
  const reviews = [
    { id: 1, rating: 5, date: '2026-01-01', featured: false },
    { id: 2, rating: 3, date: '2026-01-02', featured: true },
    { id: 3, rating: 4, date: '2026-01-03', featured: false }
  ];
  assert.deepEqual(Store.sortReviews(reviews, 'new').map(x => x.id), [2, 3, 1]);
  assert.deepEqual(Store.sortReviews(reviews, 'best').map(x => x.id), [2, 1, 3]);
});

test('createOrder builds a new order with total and status', () => {
  const order = Store.createOrder({
    customer: { name: 'Анна', phone: '+79000000000' },
    cart: [{ productId: 'a', qty: 2 }],
    products: [{ id: 'a', name: 'MAD Манго', price: 600 }],
    now: new Date('2026-06-26T10:00:00Z'),
    existing: []
  });
  assert.equal(order.id, 'PV-260626-001');
  assert.equal(order.status, 'Новый');
  assert.equal(order.total, 1200);
  assert.equal(order.items[0].name, 'MAD Манго');
});

test('createReview trims fields and stores rating', () => {
  const review = Store.createReview({ name: ' Анна ', text: ' Отлично ', rating: 5 }, new Date('2026-06-26T10:00:00Z'));
  assert.equal(review.name, 'Анна');
  assert.equal(review.text, 'Отлично');
  assert.equal(review.rating, 5);
  assert.equal(review.featured, false);
});

test('normalizeProduct validates fields and supplies a sku', () => {
  const result = Store.normalizeProduct({ name: ' Test ', category: 'liquids', brand: ' MAD ', price: '650' }, []);
  assert.equal(result.name, 'Test');
  assert.equal(result.brand, 'MAD');
  assert.equal(result.price, 650);
  assert.equal(result.sku, '#7001');
  assert.throws(() => Store.normalizeProduct({ name: '', price: 0 }, []), /обязательны/i);
});
