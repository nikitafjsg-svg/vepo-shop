# Premium Vape Shop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Создать две автономные страницы премиального вейп-магазина для публикации на Vercel: покупательский сайт и административную панель с общими данными LocalStorage.

**Architecture:** `index.html` и `admin.html` содержат встроенные CSS и JavaScript и используют одинаковую модель данных. Чистая бизнес-логика вынесена в `store-core.js`, чтобы её можно было проверять автоматическими тестами, а страницы подключают этот файл обычным `<script>`.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, LocalStorage, Node.js built-in test runner, Font Awesome 6 CDN, Google Fonts.

## Global Constraints

- Покупательская и административная страницы работают без сборщика.
- Данные хранятся в ключах `pv_products_v1`, `pv_cart_v1`, `pv_orders_v1`, `pv_reviews_v1`, `pv_settings_v1`, `pv_age_verified_v1`.
- Основная палитра: `#0a0e27`, `#d4af37`, `#7c3aed`, `#06b6d4`.
- Десктоп: 3 колонки, планшет: 2, мобильный: 1.
- Пароль демонстрационной админки: `ксюша`.
- Все новые функции бизнес-логики создаются через красный-зелёный цикл тестов.

---

### Task 1: Общая модель данных и тесты

**Files:**
- Create: `tests/store-core.test.js`
- Create: `store-core.js`

**Interfaces:**
- Produces: `VapeStore.safeParse`, `VapeStore.cartSummary`, `VapeStore.validateCheckout`, `VapeStore.whatsappUrl`, `VapeStore.nextSku`, `VapeStore.filterProducts`, `VapeStore.sortReviews`, `VapeStore.seedData`.

- [ ] **Step 1: Write failing tests**

Проверить расчёт количества и суммы корзины, телефон из 11 цифр, URL WhatsApp, следующий свободный артикул, фильтрацию брендов и сортировку отзывов.

- [ ] **Step 2: Verify RED**

Run: `node --test tests/store-core.test.js`
Expected: FAIL because `store-core.js` or exported functions are missing.

- [ ] **Step 3: Implement minimal core**

Создать UMD-объект `VapeStore`, доступный через `module.exports` в Node и `window.VapeStore` в браузере. Добавить безопасный JSON parse и стартовые товары всех пяти категорий.

- [ ] **Step 4: Verify GREEN**

Run: `node --test tests/store-core.test.js`
Expected: all tests PASS.

### Task 2: Покупательский сайт

**Files:**
- Create: `index.html`
- Test: `tests/store-core.test.js`

**Interfaces:**
- Consumes: все функции `VapeStore`, ключи LocalStorage из `VapeStore.KEYS`.
- Produces: UI главной, каталога, отзывов, корзины и checkout.

- [ ] **Step 1: Add failing core tests for order creation and review creation**

Проверить уникальный ID заказа, статус `Новый`, нормализацию отзыва и дату.

- [ ] **Step 2: Verify RED**

Run: `node --test tests/store-core.test.js`
Expected: FAIL for missing `createOrder` and `createReview`.

- [ ] **Step 3: Implement minimal functions**

Добавить `createOrder` и `createReview` без DOM-зависимостей.

- [ ] **Step 4: Verify GREEN**

Run: `node --test tests/store-core.test.js`
Expected: all tests PASS.

- [ ] **Step 5: Build `index.html`**

Реализовать age gate, preloader, стеклянную шапку, hero, избранные товары, каталог с категориями и брендами, отзывы, контакты, корзину, checkout, мобильное меню, кнопку наверх, WhatsApp и адаптивность.

- [ ] **Step 6: Static verification**

Run: `node -e "const fs=require('fs');const s=fs.readFileSync('index.html','utf8');for(const x of ['age-gate','catalog','reviews','cart-drawer','checkout-modal'])if(!s.includes(x))throw Error(x)"`
Expected: exit 0.

### Task 3: Административная панель

**Files:**
- Create: `admin.html`
- Test: `tests/store-core.test.js`

**Interfaces:**
- Consumes: `VapeStore` и те же ключи LocalStorage.
- Produces: управление товарами, заказами, отзывами и настройками.

- [ ] **Step 1: Add failing tests for product normalization**

Проверить обязательные поля, числовую цену и создание артикула.

- [ ] **Step 2: Verify RED**

Run: `node --test tests/store-core.test.js`
Expected: FAIL for missing `normalizeProduct`.

- [ ] **Step 3: Implement product normalization**

Добавить чистую функцию `normalizeProduct(input, products)`.

- [ ] **Step 4: Verify GREEN**

Run: `node --test tests/store-core.test.js`
Expected: all tests PASS.

- [ ] **Step 5: Build `admin.html`**

Реализовать вход, sessionStorage-сессию, сайдбар, статистику, CRUD товаров, сжатие изображений Canvas, статусы заказов, избранные отзывы и настройки.

- [ ] **Step 6: Static verification**

Run: `node -e "const fs=require('fs');const s=fs.readFileSync('admin.html','utf8');for(const x of ['admin-login','dashboard','products-panel','orders-panel','reviews-panel','settings-panel'])if(!s.includes(x))throw Error(x)"`
Expected: exit 0.

### Task 4: Метаданные и Vercel

**Files:**
- Create: `vercel.json`
- Modify: `index.html`
- Modify: `admin.html`

**Interfaces:**
- Produces: корректная раздача статических страниц и метаданные публикации.

- [ ] **Step 1: Add Open Graph, favicon and canonical-friendly metadata**

Добавить title, description, theme-color, OG title/description/type и встроенный SVG favicon 18+.

- [ ] **Step 2: Add Vercel configuration**

Создать `vercel.json` с `cleanUrls: true` и `trailingSlash: false`.

- [ ] **Step 3: Verify JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('vercel.json','utf8'))"`
Expected: exit 0.

### Task 5: Финальная проверка

**Files:**
- Verify: `index.html`
- Verify: `admin.html`
- Verify: `store-core.js`
- Verify: `tests/store-core.test.js`
- Verify: `vercel.json`

- [ ] **Step 1: Run automated tests**

Run: `node --test tests/store-core.test.js`
Expected: all tests PASS.

- [ ] **Step 2: Run syntax checks**

Run: `node --check store-core.js`
Expected: exit 0.

- [ ] **Step 3: Inspect responsive UI in a real browser**

Проверить desktop 1440×900 и mobile 390×844: age gate, каталог, корзину, checkout, отзыв, вход в админку и редактирование товара.

- [ ] **Step 4: Re-read the specification**

Сверить каждый раздел `docs/superpowers/specs/2026-06-26-premium-vape-shop-design.md` с реализованным интерфейсом и устранить найденные пробелы.
