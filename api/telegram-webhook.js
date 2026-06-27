'use strict';

const {
  handleTelegramCommand,
  isAdminUpdate,
  sendTelegramMessage,
  json
} = require('../lib/telegram-bot.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  const update = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
  const adminId = process.env.ADMIN_TELEGRAM_ID;
  const token = process.env.TELEGRAM_BOT_TOKEN;

  try {
    if (!isAdminUpdate(update, adminId)) {
      const chatId = update?.message?.chat?.id;
      if (chatId) {
        await sendTelegramMessage({
          token,
          chatId,
          text: '⛔️ У вас нет доступа к управлению магазином.'
        });
      }
      return json(res, 200, { ok: true, ignored: true });
    }

    const chatId = update?.message?.chat?.id || adminId;
    const text = update?.message?.text || '';
    const answer = await handleTelegramCommand({
      text,
      env: {
        SUPABASE_URL: process.env.SUPABASE_URL,
        SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });

    await sendTelegramMessage({ token, chatId, text: answer });
    return json(res, 200, { ok: true });
  } catch (error) {
    console.error('[api/telegram-webhook]', error);
    const chatId = update?.message?.chat?.id || adminId;
    if (chatId) {
      await sendTelegramMessage({
        token,
        chatId,
        text: `Ошибка: ${error.message}`
      }).catch(() => {});
    }
    return json(res, 200, { ok: false, error: error.message });
  }
};
