(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.VapeCloudStore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  function isConfigured(config) {
    return !!(config && /^https:\/\/.+\.supabase\.co$/i.test(config.url || '') &&
      config.anonKey && !String(config.anonKey).includes('YOUR_'));
  }

  function createClient(config = root.VAPE_SUPABASE) {
    const online = isConfigured(config) && root.supabase && root.supabase.createClient;
    const db = online ? root.supabase.createClient(config.url, config.anonKey) : null;

    const normalizeProduct = product => {
      const withInventory = root.VapeStore?.withInventory || (x => x);
      return withInventory(product);
    };

    async function seedProducts(products) {
      if (!online || !Array.isArray(products) || !products.length) return false;
      const { data, error } = await db.from('shop_products').select('id').limit(1);
      if (error) throw error;
      if (data && data.length) return false;
      const { error: insertError } = await db.from('shop_products').upsert(products.map(normalizeProduct));
      if (insertError) throw insertError;
      return true;
    }

    async function loadProducts(fallback = []) {
      if (!online) return fallback;
      const { data, error } = await db.from('shop_products').select('*').order('createdAt', { ascending:true });
      if (error) throw error;
      if (!data || !data.length) {
        await seedProducts(fallback);
        return fallback;
      }
      return data.map(normalizeProduct);
    }

    async function saveProducts(products) {
      if (!online) return false;
      const clean = (products || []).map(normalizeProduct);
      const { error } = await db.from('shop_products').upsert(clean);
      if (error) throw error;
      return true;
    }

    async function deleteProduct(id) {
      if (!online || !id) return false;
      const { error } = await db.from('shop_products').delete().eq('id', id);
      if (error) throw error;
      return true;
    }

    async function loadSettings(fallback = {}) {
      if (!online) return fallback;
      const { data, error } = await db.from('shop_settings').select('data').eq('id', 'main').maybeSingle();
      if (error) throw error;
      if (!data || !data.data) {
        await saveSettings(fallback);
        return fallback;
      }
      return { ...fallback, ...data.data };
    }

    async function saveSettings(settings) {
      if (!online) return false;
      const { error } = await db.from('shop_settings').upsert({
        id: 'main',
        data: settings || {},
        updated_at: new Date().toISOString()
      });
      if (error) throw error;
      return true;
    }

    function subscribe(callback) {
      if (!online) return () => {};
      const channel = db.channel('shop-sync')
        .on('postgres_changes', { event:'*', schema:'public', table:'shop_products' }, callback)
        .on('postgres_changes', { event:'*', schema:'public', table:'shop_settings' }, callback)
        .subscribe();
      return () => db.removeChannel(channel);
    }

    return { online:!!online, loadProducts, saveProducts, deleteProduct, loadSettings, saveSettings, subscribe };
  }

  return { isConfigured, createClient };
});
