(function (root, factory) {
  const api = factory(root);
  if (typeof module === 'object' && module.exports) module.exports = api;
  root.VapeChat = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (root) {
  'use strict';

  const LOCAL_CONVERSATIONS = 'pv_chat_conversations_v1';
  const LOCAL_MESSAGES = 'pv_chat_messages_v1';

  const parse = (value, fallback) => {
    try { return value ? JSON.parse(value) : fallback; } catch (_) { return fallback; }
  };

  function isConfigured(config) {
    return !!(config && /^https:\/\/.+\.supabase\.co$/i.test(config.url || '') &&
      config.anonKey && !String(config.anonKey).includes('YOUR_'));
  }

  function uuid() {
    if (root.crypto && root.crypto.randomUUID) return root.crypto.randomUUID();
    return `chat-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  function createConversation(customer, id = uuid()) {
    return {
      id,
      customer_name: String(customer.name || '').trim() || 'Покупатель',
      customer_phone: String(customer.phone || '').trim(),
      status: 'open',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  function normalizeMessage({ conversationId, sender, text }) {
    const clean = String(text || '').trim();
    if (!clean) throw new Error('Сообщение не может быть пустым');
    if (!['customer', 'admin', 'system'].includes(sender)) throw new Error('Неизвестный отправитель');
    return {
      id: uuid(),
      conversation_id: conversationId,
      sender,
      text: clean,
      created_at: new Date().toISOString()
    };
  }

  function localRead(key) {
    return typeof localStorage === 'undefined' ? [] : parse(localStorage.getItem(key), []);
  }

  function localWrite(key, data) {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, JSON.stringify(data));
  }

  function createClient(config = root.VAPE_SUPABASE) {
    const online = isConfigured(config) && root.supabase && root.supabase.createClient;
    const db = online ? root.supabase.createClient(config.url, config.anonKey) : null;

    async function ensureConversation(customer, id) {
      const conversation = createConversation(customer, id);
      if (online) {
        const { data, error } = await db.from('chat_conversations').upsert(conversation).select().single();
        if (error) throw error;
        return data;
      }
      const list = localRead(LOCAL_CONVERSATIONS);
      const existing = list.find(x => x.id === conversation.id);
      if (existing) return existing;
      list.push(conversation);
      localWrite(LOCAL_CONVERSATIONS, list);
      return conversation;
    }

    async function listConversations() {
      if (online) {
        const { data, error } = await db.from('chat_conversations').select('*').order('updated_at', { ascending:false });
        if (error) throw error;
        return data || [];
      }
      return localRead(LOCAL_CONVERSATIONS).sort((a,b) => new Date(b.updated_at) - new Date(a.updated_at));
    }

    async function listMessages(conversationId) {
      if (online) {
        const { data, error } = await db.from('chat_messages').select('*').eq('conversation_id', conversationId).order('created_at');
        if (error) throw error;
        return data || [];
      }
      return localRead(LOCAL_MESSAGES).filter(x => x.conversation_id === conversationId).sort((a,b) => new Date(a.created_at)-new Date(b.created_at));
    }

    async function sendMessage(input) {
      const message = normalizeMessage(input);
      if (online) {
        const { data, error } = await db.from('chat_messages').insert(message).select().single();
        if (error) throw error;
        await db.from('chat_conversations').update({ updated_at:message.created_at }).eq('id', message.conversation_id);
        return data;
      }
      const messages = localRead(LOCAL_MESSAGES);
      messages.push(message);
      localWrite(LOCAL_MESSAGES, messages);
      const conversations = localRead(LOCAL_CONVERSATIONS);
      const chat = conversations.find(x => x.id === message.conversation_id);
      if (chat) chat.updated_at = message.created_at;
      localWrite(LOCAL_CONVERSATIONS, conversations);
      root.dispatchEvent?.(new CustomEvent('vape-chat-change'));
      return message;
    }

    function subscribe(conversationId, callback) {
      if (online) {
        const channel = db.channel(`chat-${conversationId || 'admin'}`)
          .on('postgres_changes', { event:'*', schema:'public', table:'chat_messages', ...(conversationId ? { filter:`conversation_id=eq.${conversationId}` } : {}) }, callback)
          .on('postgres_changes', { event:'*', schema:'public', table:'chat_conversations' }, callback)
          .subscribe();
        return () => db.removeChannel(channel);
      }
      const handler = () => callback();
      root.addEventListener?.('storage', handler);
      root.addEventListener?.('vape-chat-change', handler);
      return () => {
        root.removeEventListener?.('storage', handler);
        root.removeEventListener?.('vape-chat-change', handler);
      };
    }

    return { online:!!online, ensureConversation, listConversations, listMessages, sendMessage, subscribe };
  }

  return { isConfigured, createConversation, normalizeMessage, createClient };
});
