'use strict';

const { buildOrderMessage, sendTelegramMessage, json } = require('../lib/telegram-bot.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  try {
    const order = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const text = buildOrderMessage(order);

    await sendTelegramMessage({
      token: process.env.TELEGRAM_BOT_TOKEN,
      chatId: process.env.ADMIN_TELEGRAM_ID,
      text
    });

    return json(res, 200, { ok: true });
  } catch (error) {
    console.error('[api/orders]', error);
    return json(res, 500, { ok: false, error: error.message });
  }
};
