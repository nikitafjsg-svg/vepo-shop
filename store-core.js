(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.VapeStore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const KEYS = {
    products: 'pv_products_v1',
    cart: 'pv_cart_v1',
    orders: 'pv_orders_v1',
    reviews: 'pv_reviews_v1',
    settings: 'pv_settings_v1',
    age: 'pv_age_verified_v1'
  };

  const categories = {
    liquids: { label: 'ЖИДКОСТИ', icon: 'fa-droplet' },
    disposables: { label: 'ОДНОРАЗКИ', icon: 'fa-bolt' },
    snus: { label: 'СНЮС', icon: 'fa-circle-dot' },
    cartridges: { label: 'КАРТРИДЖИ', icon: 'fa-screwdriver-wrench' },
    boosters: { label: 'НИКОБУСТЕРЫ', icon: 'fa-flask' }
  };

  const palette = ['#7c3aed', '#06b6d4', '#d4af37', '#ef476f', '#4361ee'];
  const image = (label, color, shape = 'bottle') => {
    const safe = String(label).replace(/[<>&"]/g, '');
    const body = shape === 'pod'
      ? `<rect x="105" y="68" width="140" height="214" rx="38" fill="${color}"/><rect x="132" y="40" width="86" height="64" rx="22" fill="#11162f"/>`
      : shape === 'tin'
        ? `<ellipse cx="175" cy="194" rx="106" ry="58" fill="${color}"/><rect x="69" y="150" width="212" height="48" fill="${color}"/><ellipse cx="175" cy="150" rx="106" ry="58" fill="#fff" opacity=".92"/>`
        : `<rect x="110" y="92" width="130" height="190" rx="28" fill="${color}"/><rect x="137" y="54" width="76" height="62" rx="15" fill="#151a36"/>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="350" height="350" viewBox="0 0 350 350"><defs><radialGradient id="g"><stop stop-color="#fff"/><stop offset="1" stop-color="#eef1f7"/></radialGradient></defs><rect width="350" height="350" rx="36" fill="url(#g)"/><circle cx="175" cy="172" r="132" fill="${color}" opacity=".08"/>${body}<text x="175" y="185" text-anchor="middle" font-family="Arial" font-size="20" font-weight="700" fill="#11162f">${safe}</text><circle cx="278" cy="70" r="9" fill="#d4af37"/></svg>`)}`;
  };

  const defaultProducts = [
    ['p1','MAD Манго маракуйя','liquids','MAD','Премиум линейка',600,'#7001',true,'bottle'],
    ['p2','MAD Черника лёд','liquids','MAD','Премиум линейка',600,'#7002',true,'bottle'],
    ['p3','ZLAIA Кислая вишня','liquids','ZLAIA MAHANKA','80 MG',650,'#7003',true,'bottle'],
    ['p4','FAFF Груша бергамот','liquids','FAFF','Артизанальная серия',700,'#7004',false,'bottle'],
    ['p5','CATS Клубничный крем','liquids','CATS','Limited Edition',750,'#7005',false,'bottle'],
    ['p6','MONSTERVATOR Гуава','liquids','MONSTERVATOR','Экзотика',700,'#7006',false,'bottle'],
    ['p7','ELF BAR Blue Razz','disposables','ELF BAR','BC Series',1350,'#7007',true,'pod'],
    ['p8','LOST MARY Watermelon','disposables','LOST MARY','MO Series',1450,'#7008',true,'pod'],
    ['p9','HQD Peach Ice','disposables','HQD','Cuvie Plus',1200,'#7009',false,'pod'],
    ['p10','VELO Arctic Mint','snus','VELO','Freeze Collection',500,'#7010',true,'tin'],
    ['p11','SIBERIA Red','snus','SIBERIA','Ultra Strong',550,'#7011',false,'tin'],
    ['p12','VAPORESSO XROS 0.8','cartridges','VAPORESSO','XROS',450,'#7012',true,'pod'],
    ['p13','OXVA XLIM 0.6','cartridges','OXVA','XLIM',480,'#7013',false,'pod'],
    ['p14','NICO Shot 20mg','boosters','NICO','Classic',250,'#7014',false,'bottle'],
    ['p15','SMOKE KITCHEN Booster','boosters','SMOKE KITCHEN','Pure',280,'#7015',false,'bottle']
  ].map((p, i) => ({
    id:p[0], name:p[1], category:p[2], brand:p[3], series:p[4], price:p[5], sku:p[6],
    featured:p[7], stock:1, available:true, image:image(p[3], palette[i % palette.length], p[8]), createdAt:'2026-06-26T00:00:00.000Z'
  }));

  const defaultReviews = [
    { id:'r1', name:'Мария', rating:5, text:'Очень аккуратный магазин и приятная консультация. Заказ подготовили быстро.', date:'2026-06-22T12:00:00.000Z', featured:true },
    { id:'r2', name:'Алексей', rating:5, text:'Хороший выбор премиальных жидкостей. Всё свежее, цены понятные.', date:'2026-06-24T15:30:00.000Z', featured:false },
    { id:'r3', name:'Виктория', rating:4, text:'Понравилось оформление заказа и отношение к деталям.', date:'2026-06-25T09:15:00.000Z', featured:false }
  ];

  const defaultSettings = {
    shopName:'цензура ИП не даст',
    whatsapp:'79000000000',
    phone:'+7 (900) 000-00-00',
    email:'hello@premium-vape.ru',
    address:'Красноярск, центр города',
    telegram:'premium_vape'
  };

  function safeParse(value, fallback) {
    try { return value == null ? fallback : JSON.parse(value); }
    catch (_) { return fallback; }
  }

  function isAdminPassword(value) {
    return value === 'ксюша';
  }

  function read(key, fallback) {
    if (typeof localStorage === 'undefined') return fallback;
    return safeParse(localStorage.getItem(key), fallback);
  }

  function write(key, value) {
    if (typeof localStorage === 'undefined') return false;
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (_) { return false; }
  }

  function seedData() {
    if (typeof localStorage === 'undefined') return;
    if (!localStorage.getItem(KEYS.products)) write(KEYS.products, defaultProducts);
    else write(KEYS.products, read(KEYS.products, []).map(withInventory));
    if (!localStorage.getItem(KEYS.reviews)) write(KEYS.reviews, defaultReviews);
    if (!localStorage.getItem(KEYS.settings)) write(KEYS.settings, defaultSettings);
    if (!localStorage.getItem(KEYS.cart)) write(KEYS.cart, []);
    if (!localStorage.getItem(KEYS.orders)) write(KEYS.orders, []);
  }

  function withInventory(product) {
    const rawStock = Number(product?.stock);
    const stock = Number.isFinite(rawStock) && rawStock >= 0 ? Math.floor(rawStock) : 1;
    return { ...product, stock, available: product?.available === false ? false : stock > 0 };
  }

  function cartSummary(cart, products) {
    return (cart || []).reduce((acc, item) => {
      const product = (products || []).find(p => p.id === item.productId);
      if (!product) return acc;
      const qty = Math.max(0, Number(item.qty) || 0);
      acc.count += qty;
      acc.total += qty * Number(product.price || 0);
      return acc;
    }, { count:0, total:0 });
  }

  function validateCheckout(data) {
    const errors = {};
    if (!String(data.name || '').trim()) errors.name = 'Пожалуйста, заполните поле';
    const digits = String(data.phone || '').replace(/\D/g, '');
    if (String(data.name || '').trim() && digits.length !== 11) errors.phone = 'Телефон должен содержать 11 цифр';
    else if (!String(data.phone || '').trim()) errors.phone = 'Пожалуйста, заполните поле';
    return errors;
  }

  function whatsappUrl(phone, product) {
    const text = `Добрый день! Хочу заказать: ${product.name} ${product.sku} за ${product.price}₽`;
    return `https://wa.me/${String(phone).replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
  }

  function nextSku(products) {
    const max = (products || []).reduce((n, p) => Math.max(n, Number(String(p.sku || '').replace(/\D/g, '')) || 7000), 7000);
    return `#${String(max + 1).padStart(4, '0')}`;
  }

  function filterProducts(products, category, brands) {
    const selected = brands instanceof Set ? brands : new Set(brands || []);
    return (products || []).filter(p => p.category === category && (!selected.size || selected.has(p.brand)));
  }

  function sortReviews(reviews, mode) {
    let list = [...(reviews || [])];
    if (mode === 'photo') list = list.filter(r => r.image);
    return list.sort((a, b) => {
      if (!!a.featured !== !!b.featured) return a.featured ? -1 : 1;
      if (mode === 'best') return Number(b.rating) - Number(a.rating) || new Date(b.date) - new Date(a.date);
      return new Date(b.date) - new Date(a.date);
    });
  }

  function createOrder({ customer, cart, products, now = new Date(), existing = [] }) {
    const date = new Date(now);
    const localDate = new Intl.DateTimeFormat('en-CA', { timeZone:'Asia/Krasnoyarsk', year:'numeric', month:'2-digit', day:'2-digit' }).format(date);
    const [year, month, day] = localDate.split('-');
    const stamp = `${year.slice(-2)}${month}${day}`;
    const prefix = `PV-${stamp}-`;
    const sequence = (existing || []).filter(o => String(o.id).startsWith(prefix)).length + 1;
    const items = (cart || []).map(item => {
      const p = (products || []).map(withInventory).find(x => x.id === item.productId);
      const qty = Math.min(Math.max(0, Number(item.qty) || 0), Number(p?.stock) || 0);
      return p && p.available && qty > 0 ? { productId:p.id, name:p.name, sku:p.sku, price:Number(p.price), qty } : null;
    }).filter(Boolean);
    return {
      id:`${prefix}${String(sequence).padStart(3,'0')}`,
      date:date.toISOString(), customer:{ ...customer }, items,
      total:items.reduce((sum, item) => sum + item.price * item.qty, 0),
      status:'Новый'
    };
  }

  function createReview(input, now = new Date()) {
    return {
      id:`r-${new Date(now).getTime()}-${Math.random().toString(36).slice(2,7)}`,
      name:String(input.name || '').trim(),
      rating:Math.min(5, Math.max(1, Number(input.rating) || 1)),
      text:String(input.text || '').trim(),
      image:input.image || '',
      date:new Date(now).toISOString(),
      featured:false
    };
  }

  function normalizeProduct(input, products) {
    const name = String(input.name || '').trim();
    const category = String(input.category || '').trim();
    const brand = String(input.brand || '').trim();
    const price = Number(input.price);
    if (!name || !category || !brand || !price || price < 0) throw new Error('Название, категория, бренд и цена обязательны');
    const stock = Math.max(0, Math.floor(Number(input.stock ?? 1) || 0));
    return {
      id:input.id || `p-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
      name, category, brand, series:String(input.series || 'Премиум серия').trim(),
      price, sku:input.sku || nextSku(products), image:input.image || image(brand, palette[(products || []).length % palette.length]),
      featured:!!input.featured, stock, available:input.available === undefined ? stock > 0 : !!input.available && stock > 0, createdAt:input.createdAt || new Date().toISOString()
    };
  }

  return {
    KEYS, categories, defaultProducts, defaultReviews, defaultSettings,
    safeParse, isAdminPassword, read, write, seedData, withInventory, cartSummary, validateCheckout,
    whatsappUrl, nextSku, filterProducts, sortReviews, createOrder,
    createReview, normalizeProduct
  };
});
