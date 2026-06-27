const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');

test('buyer and admin pages load cloud-store after Supabase config', () => {
  const index = read('index.html');
  const admin = read('admin.html');

  assert.match(index, /<script src="cloud-store\.js"><\/script>/);
  assert.match(admin, /<script src="cloud-store\.js"><\/script>/);
  assert.ok(index.indexOf('supabase-config.js') < index.indexOf('cloud-store.js'));
  assert.ok(admin.indexOf('supabase-config.js') < admin.indexOf('cloud-store.js'));
});

test('admin saves products and settings to cloud storage', () => {
  const admin = read('admin.html');

  assert.match(admin, /cloudStore\.saveProducts/);
  assert.match(admin, /cloudStore\.saveSettings/);
});

test('buyer site loads products and settings from cloud storage', () => {
  const index = read('index.html');

  assert.match(index, /cloudStore\.loadProducts/);
  assert.match(index, /cloudStore\.loadSettings/);
  assert.match(index, /cloudStore\.subscribe/);
});

test('Supabase sync schema creates shared products and settings tables', () => {
  const sql = read('supabase-shop-sync-schema.sql');

  assert.match(sql, /create table if not exists public\.shop_products/i);
  assert.match(sql, /create table if not exists public\.shop_settings/i);
  assert.match(sql, /for all/i);
  assert.match(sql, /to anon/i);
});
