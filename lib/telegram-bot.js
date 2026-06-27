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

function parseProductArgs(args) {
  const parts = String(args || '').split('|').map((part) => part.trim());
  if (parts.length < 4) {
    throw new Error('Формат: /add Название | category | brand | price | #sku');
  }
  const [name, category, brand, priceRaw, skuRaw] = parts;
  const price = Number(String(priceRaw).replace(/[^\d.]/g, ''));
  if (!name || !category || !brand || !price) {
    throw new Error('Название, категория, бренд и цена обязательны');
  }
  return {
    name,
    category,
    brand,
    price,
    sku: skuRaw || '',
    series: 'Telegram bot',
    featured: false
  };
}

async function supabaseRequest({ url, serviceRoleKey, path, method = 'GET', body }) {
  if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY не добавлен в Vercel');
  const response = await fetch(`${url.replace(/\/$/, '')}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(payload?.message || `Supabase error ${response.status}`);
  return payload;
}

async function handleTelegramCommand({ text, env }) {
  const command = parseCommand(text);
  const supabaseUrl = env.SUPABASE_URL || 'https://pjxarmbbxusfelcxadrp.supabase.co';
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

  if (!command.name || command.name === 'start' || command.name === 'help') {
    return [
      'Команды админ-бота:',
      '/products — список товаров',
      '/add Название | category | brand | price | #sku — добавить товар',
      '/delete #sku — удалить товар',
      '',
      'Пример:',
      '/add MAD Манго | liquids | MAD | 600 | #7020'
    ].join('\n');
  }

  if (command.name === 'products') {
    const products = await supabaseRequest({
      url: supabaseUrl,
      serviceRoleKey,
      path: 'products?select=id,name,sku,price,category,brand&order=created_at.desc&limit=20'
    });
    if (!products?.length) return 'Товаров в Supabase пока нет.';
    return products.map((p) => `${p.sku || 'без артикула'} — ${p.name} — ${money(p.price)}`).join('\n');
  }

  if (command.name === 'add') {
    const product = parseProductArgs(command.args);
    const inserted = await supabaseRequest({
      url: supabaseUrl,
      serviceRoleKey,
      path: 'products',
      method: 'POST',
      body: product
    });
    const saved = Array.isArray(inserted) ? inserted[0] : product;
    return `Товар добавлен: ${saved.sku || product.sku || 'без артикула'} — ${saved.name || product.name}`;
  }

  if (command.name === 'delete') {
    const sku = command.args.trim();
    if (!sku) return 'Напиши артикул: /delete #7001';
    await supabaseRequest({
      url: supabaseUrl,
      serviceRoleKey,
      path: `products?sku=eq.${encodeURIComponent(sku)}`,
      method: 'DELETE'
    });
    return `Товар ${sku} удалён, если он был в базе.`;
  }

  return 'Не понял команду. Напиши /help';
}

module.exports = {
  buildOrderMessage,
  parseCommand,
  isAdminUpdate,
  sendTelegramMessage,
  parseProductArgs,
  handleTelegramCommand,
  json
};
