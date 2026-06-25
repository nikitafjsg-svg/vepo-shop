# Customer–Admin Chat Implementation Plan

**Goal:** Заменить быстрые WhatsApp-заказы встроенным чатом покупателя с администратором.

**Architecture:** Общий `chat-client.js` использует Supabase Realtime при заполненном `supabase-config.js` и LocalStorage как демонстрационный fallback. Покупатель работает с одним сохранённым диалогом, администратор видит список всех диалогов и отвечает в отдельном разделе.

**Tech Stack:** Vanilla JavaScript, Supabase JS v2 CDN, Postgres Realtime, LocalStorage fallback.

## Tasks

- [ ] Добавить тесты идентификаторов, нормализации сообщений и конфигурации.
- [ ] Создать `chat-client.js`, `supabase-config.js` и `supabase-schema.sql`.
- [ ] Удалить WhatsApp-кнопки и добавить покупательский chat widget.
- [ ] Добавить раздел «ЧАТЫ» в админ-панель.
- [ ] Добавить настройку подключения и инструкцию.
- [ ] Проверить локальный режим, синтаксис и адаптивность.
