# Telegram-бот для заказов и управления

## Что уже должно быть в Vercel

В `Project Settings → Environment Variables`:

- `TELEGRAM_BOT_TOKEN` — токен от BotFather.
- `ADMIN_TELEGRAM_ID` — ваш Telegram ID.

После добавления переменных сделайте redeploy проекта.

## Включить webhook после деплоя

Откройте в браузере:

```txt
https://ВАШ-ДОМЕН.vercel.app/api/set-telegram-webhook
```

Для текущего домена это будет примерно:

```txt
https://vepo-shop.vercel.app/api/set-telegram-webhook
```

Если ответ содержит `"ok": true`, бот подключён.

## Проверка

1. Напишите своему боту `/start`.
2. Оформите тестовый заказ на сайте.
3. В Telegram должно прийти уведомление о заказе.

## Команды бота

```txt
/start
/help
/products
/add Название | category | brand | price | #sku
/delete #sku
```

Пример:

```txt
/add MAD Манго | liquids | MAD | 600 | #7020
```

## Чтобы команды товаров работали полностью

Нужно:

1. В Supabase SQL Editor выполнить `supabase-commerce-schema.sql`.
2. В Vercel добавить ещё один secret:

```txt
SUPABASE_SERVICE_ROLE_KEY
```

Это не anon key. Это секретный service role key из Supabase. Его нельзя публиковать на GitHub и нельзя вставлять в HTML.

Опционально можно добавить:

```txt
SUPABASE_URL
```

Но если не добавить, код использует текущий URL проекта Supabase.
