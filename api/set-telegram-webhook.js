'use strict';

const { json } = require('../lib/telegram-bot.js');

module.exports = async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST');
    return json(res, 405, { ok: false, error: 'Method not allowed' });
  }

  try {
    const token = process.env.TELEGRAM_BOT_TOKEN;
    if (!token) throw new Error('TELEGRAM_BOT_TOKEN is not configured');

    const host = req.headers['x-forwarded-host'] || req.headers.host;
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const webhookUrl = `${proto}://${host}/api/telegram-webhook`;

    const response = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message']
      })
    });

    const payload = await response.json();
    return json(res, response.ok ? 200 : 500, {
      ok: response.ok,
      webhookUrl,
      telegram: payload
    });
  } catch (error) {
    console.error('[api/set-telegram-webhook]', error);
    return json(res, 500, { ok: false, error: error.message });
  }
};
