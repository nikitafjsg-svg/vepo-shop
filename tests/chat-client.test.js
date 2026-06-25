const test = require('node:test');
const assert = require('node:assert/strict');
const Chat = require('../chat-client.js');

test('isConfigured accepts a real Supabase URL and anon key', () => {
  assert.equal(Chat.isConfigured({ url: 'https://demo.supabase.co', anonKey: 'abc123' }), true);
  assert.equal(Chat.isConfigured({ url: 'YOUR_SUPABASE_URL', anonKey: 'YOUR_SUPABASE_ANON_KEY' }), false);
});

test('normalizeMessage trims text and records sender', () => {
  const result = Chat.normalizeMessage({ conversationId: 'chat-1', sender: 'customer', text: ' Привет ' });
  assert.equal(result.conversation_id, 'chat-1');
  assert.equal(result.sender, 'customer');
  assert.equal(result.text, 'Привет');
});

test('normalizeMessage rejects empty messages', () => {
  assert.throws(() => Chat.normalizeMessage({ conversationId: 'x', sender: 'customer', text: ' ' }), /пустым/i);
});

test('createConversation keeps customer contact details', () => {
  const result = Chat.createConversation({ name: ' Анна ', phone: '+7 900 000 00 00' }, 'chat-fixed');
  assert.equal(result.id, 'chat-fixed');
  assert.equal(result.customer_name, 'Анна');
  assert.equal(result.customer_phone, '+7 900 000 00 00');
  assert.equal(result.status, 'open');
});
