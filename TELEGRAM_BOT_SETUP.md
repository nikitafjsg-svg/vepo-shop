# Telegram-уведомления о заказах

Бот используется только для уведомлений о новых заказах.

## Нужные переменные в Vercel

В `Project Settings → Environment Variables` должны быть:

```txt
TELEGRAM_BOT_TOKEN
ADMIN_TELEGRAM_ID
```

`SUPABASE_SERVICE_ROLE_KEY` больше не нужен.

## После деплоя

Откройте:

```txt
https://vepo-shop.vercel.app/api/set-telegram-webhook
```

Если в ответе есть `"ok": true`, webhook подключён.

## Проверка

1. Напишите боту `/start`.
2. Оформите тестовый заказ на сайте.
3. В Telegram должно прийти уведомление с именем, телефоном, Telegram, товарами и суммой.
