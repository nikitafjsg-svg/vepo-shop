'use strict';

const TELEGRAM_API = 'https://api.telegram.org';

function money(value) {
  return `${new Intl.NumberFormat('ru-RU').format(Number(value) || 0)} ₽`;
}

function normalizeText(value, fallback = 'не указано') {
  const text = String(value || '').trim();
  return text || fallback;
}

function buildOrderMessage(order) {
  const customer = order.customer || {};
  const items = Array.isArray(order.items) ? order.items : [];
  const lines = items.map((item) => {
    const qty = Number(item.qty) || 1;
    const price = Number(item.price) || 0;
    const sku = item.sku ? ` ${item.sku}` : '';
    return `• ${normalizeText(item.name)}${sku} × ${qty} — ${money(price * qty)}`;
  });

  return [
    `🛒 Новый заказ ${normalizeText(order.id, 'без номера')}`,
    '',
    `Имя: ${normalizeText(customer.name)}`,
    `Телефон: ${normalizeText(customer.phone)}`,
    `Telegram: ${normalizeText(customer.telegram)}`,
    customer.comment ? `Комментарий: ${customer.comment}` : '',
    '',
    'Товары:',
    ...(lines.length ? lines : ['• Состав заказа не передан']),
    '',
    `Итого: ${money(order.total)}`
  ].filter(Boolean).join('\n');
}

function parseCommand(text) {
  const source = String(text || '').trim();
  const match = source.match(/^\/([a-zA-Z_]+)(?:@\w+)?(?:\s+([\s\S]*))?$/);
  if (!match) return { name: '', args: source };
  return { name: match[1].toLowerCase(), args: (match[2] || '').trim() };
}

function isAdminUpdate(update, adminId) {
  const fromId = update?.message?.from?.id || update?.callback_query?.from?.id;
  return String(fromId || '') === String(adminId || '');
}

function json(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

async function sendTelegramMessage({ token, chatId, text, replyMarkup }) {
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not configured');
  if (!chatId) throw new Error('ADMIN_TELEGRAM_ID is not configured');

  const response = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
      ...(replyMarkup ? { reply_markup: replyMarkup } : {})
    })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.description || `Telegram error ${response.status}`);
  }
  return payload;
}

async function handleTelegramCommand({ text } = {}) {
  const command = parseCommand(text);

  if (!command.name || command.name === 'start' || command.name === 'help') {
    return [
      'Бот подключён ✅',
      '',
      'Он только присылает уведомления о новых заказах.',
      'Управление товарами отключено, чтобы не требовать лишние ключи Supabase.'
    ].join('\n');
  }

  return 'Этот бот только присылает уведомления о заказах. Управление товарами отключено.';
}

module.exports = {
  buildOrderMessage,
  parseCommand,
  isAdminUpdate,
  sendTelegramMessage,
  handleTelegramCommand,
  json
};
