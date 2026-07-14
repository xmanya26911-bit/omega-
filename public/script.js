/* ═══════════════════════════════════════
   OMEGA Cloud — Frontend Logic
   ═══════════════════════════════════════ */

(function() {
  'use strict';

  // ─── State ───
  const STATE = {
    password: '',
    isStreaming: false,
    abortController: null,
    conversations: JSON.parse(localStorage.getItem('omega_conversations') || '[]'),
    currentId: localStorage.getItem('omega_current_id') || null,
    theme: localStorage.getItem('omega_theme') || 'dark',
    apiKey: localStorage.getItem('omega_api_key') || '',
    model: localStorage.getItem('omega_model') || 'deepseek-v4-flash-free',
    apiUrl: localStorage.getItem('omega_api_url') || 'https://api.opencode.ai/v1',
  };

  // ─── DOM refs ───
  const $ = id => document.getElementById(id);
  const gate = $('password-gate');
  const chat = $('chat-ui');
  const passwordInput = $('password-input');
  const passwordSubmit = $('password-submit');
  const passwordError = $('password-error');
  const messagesEl = $('messages');
  const input = $('message-input');
  const sendBtn = $('send-btn');
  const themeToggle = $('theme-toggle');
  const settingsToggle = $('settings-toggle');
  const settingsPanel = $('settings-panel');
  const settingsClose = $('settings-close');
  const apiKeyInput = $('api-key-input');
  const modelSelect = $('model-select');
  const apiUrlInput = $('api-url-input');
  const modelBadge = $('model-badge');
  const clearBtn = $('clear-conversations-btn');
  const newChatBtn = $('new-chat-btn');
  const container = $('messages-container');

  // ─── Password Gate ───
  passwordInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') submitPassword();
  });
  passwordSubmit.addEventListener('click', submitPassword);

  function submitPassword() {
    const pw = passwordInput.value.trim();
    if (!pw) return;
    // Offline check: password validation via /api/chat with empty message
    checkPassword(pw);
  }

  async function checkPassword(pw) {
    passwordError.textContent = 'Authenticating...';
    passwordError.style.color = 'var(--accent)';
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pw, message: '__auth_check__' }),
      });
      if (res.ok) {
        STATE.password = pw;
        localStorage.setItem('omega_password', pw);
        gate.classList.add('hidden');
        chat.classList.remove('hidden');
        initChat();
      } else {
        const text = await res.text();
        let msg = 'Invalid access key';
        try { const d = JSON.parse(text); msg = d.error || msg; } catch(e) { msg = text.slice(0,100) || msg; }
        passwordError.textContent = msg;
        passwordError.style.color = '#ff6b6b';
      }
    } catch (err) {
      // Offline fallback: accept the password locally
      STATE.password = pw;
      localStorage.setItem('omega_password', pw);
      gate.classList.add('hidden');
      chat.classList.remove('hidden');
      initChat();
    }
  }

  // ─── Init ───
  function initChat() {
    applyTheme(STATE.theme);
    apiKeyInput.value = STATE.apiKey;
    modelSelect.value = STATE.model;
    apiUrlInput.value = STATE.apiUrl;
    modelBadge.textContent = STATE.model;

    restoreConversations();

    // Auto-resize textarea
    input.addEventListener('input', autoResize);
    input.addEventListener('keydown', handleInputKey);

    sendBtn.addEventListener('click', sendMessage);
    themeToggle.addEventListener('click', toggleTheme);
    settingsToggle.addEventListener('click', () => togglePanel(settingsPanel));
    settingsClose.addEventListener('click', saveSettings);
    clearBtn.addEventListener('click', clearAll);
    newChatBtn.addEventListener('click', newChat);
  }

  // ─── Auto-resize ───
  function autoResize() {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 150) + 'px';
    sendBtn.disabled = !input.value.trim() || STATE.isStreaming;
  }

  // ─── Input handling ───
  function handleInputKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  // ─── Send message ───
  async function sendMessage() {
    const text = input.value.trim();
    if (!text || STATE.isStreaming) return;

    input.value = '';
    input.style.height = 'auto';
    sendBtn.disabled = true;

    // Get/create conversation
    let conv = getCurrentConversation();
    if (!conv) {
      conv = createConversation();
    }

    // Add user message
    addMessage('user', text, conv.id);
    saveConversation(conv.id);

    // Show assistant placeholder
    const msgId = `msg-${Date.now()}`;
    const msgDiv = document.createElement('div');
    msgDiv.className = 'message assistant';
    msgDiv.id = msgId;
    msgDiv.innerHTML = `
      <div class="message-header">
        <div class="message-avatar assistant">Ω</div>
        <span class="message-name">OMEGA</span>
        <span class="message-time">${timeNow()}</span>
      </div>
      <div class="message-content">
        <div class="typing-indicator"><span></span><span></span><span></span></div>
      </div>
    `;
    messagesEl.appendChild(msgDiv);
    scrollToBottom();

    // Build conversation history
    const history = buildHistory(conv.id);

    STATE.isStreaming = true;
    STATE.abortController = new AbortController();

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: STATE.abortController.signal,
        body: JSON.stringify({
          message: text,
          password: STATE.password,
          apiKey: STATE.apiKey || undefined,
          model: STATE.model,
          conversationHistory: history,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        let msg = `HTTP ${res.status}`;
        try { const d = JSON.parse(text); msg = d.error || msg; } catch(e) { msg = text.slice(0,150) || msg; }
        throw new Error(msg);
      }

      // Check if streaming
      const streamMode = res.headers.get('X-Stream-Mode');
      const contentType = res.headers.get('Content-Type') || '';

      let fullResponse = '';

      if (streamMode === 'sse' || contentType.includes('text/event-stream')) {
        // SSE streaming
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                const content = parsed?.choices?.[0]?.delta?.content || '';
                if (content) {
                  fullResponse += content;
                  updateAssistantMessage(msgId, fullResponse);
                }
              } catch (e) {
                // Skip malformed JSON
              }
            }
          }
        }
      } else {
        // Non-streaming response
        const data = await res.json();
        fullResponse = data?.choices?.[0]?.message?.content || data?.content || 'No response';
        updateAssistantMessage(msgId, fullResponse);
      }

      // Save to conversation
      if (fullResponse) {
        conv = getCurrentConversation();
        if (conv) {
          conv.messages.push({ role: 'assistant', content: fullResponse, time: timeNow() });
          saveConversation(conv.id);
        }
      }

    } catch (err) {
      if (err.name === 'AbortError') return;
      const contentEl = document.querySelector(`#${msgId} .message-content`);
      if (contentEl) {
        contentEl.innerHTML = `<p style="color:#ff6b6b">⚠️ ${escapeHtml(err.message)}</p>`;
      }
    } finally {
      STATE.isStreaming = false;
      sendBtn.disabled = false;
      autoResize();
    }
  }

  // ─── Update assistant message (streaming) ───
  function updateAssistantMessage(msgId, text) {
    const contentEl = document.querySelector(`#${msgId} .message-content`);
    if (!contentEl) return;
    const html = marked.parse(text, { breaks: true });
    contentEl.innerHTML = html + '<span class="streaming-cursor"></span>';
    contentEl.querySelectorAll('pre code').forEach(block => {
      hljs.highlightElement(block);
      addCopyButton(block);
    });
    scrollToBottom();
  }

  // ─── Add copy button to code blocks ───
  function addCopyButton(codeBlock) {
    const pre = codeBlock.parentElement;
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = 'Copy';
    btn.addEventListener('click', () => {
      navigator.clipboard.writeText(codeBlock.textContent).then(() => {
        btn.textContent = 'Copied!';
        setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
      });
    });
    pre.appendChild(btn);
  }

  // ─── Add message to DOM ───
  function addMessage(role, content, convId) {
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${role}`;
    const avatar = role === 'user' ? 'U' : 'Ω';
    const name = role === 'user' ? 'You' : 'OMEGA';
    msgDiv.innerHTML = `
      <div class="message-header">
        <div class="message-avatar ${role}">${avatar}</div>
        <span class="message-name">${name}</span>
        <span class="message-time">${timeNow()}</span>
      </div>
      <div class="message-content">${role === 'user' ? escapeHtml(content) : ''}</div>
    `;
    // Insert before welcome message if present
    const welcome = messagesEl.querySelector('.welcome-message');
    if (welcome) welcome.remove();
    messagesEl.appendChild(msgDiv);
    scrollToBottom();
  }

  // ─── Conversation management ───
  function getCurrentConversation() {
    if (!STATE.currentId) return null;
    return STATE.conversations.find(c => c.id === STATE.currentId);
  }

  function createConversation() {
    const conv = {
      id: 'conv_' + Date.now(),
      title: 'Chat ' + (STATE.conversations.length + 1),
      messages: [],
      created: timeNow(),
    };
    STATE.conversations.unshift(conv);
    STATE.currentId = conv.id;
    return conv;
  }

  function buildHistory(convId) {
    const conv = STATE.conversations.find(c => c.id === convId);
    if (!conv) return [];
    return conv.messages.slice(-40).map(m => ({
      role: m.role,
      content: m.content,
    }));
  }

  function saveConversation(convId) {
    localStorage.setItem('omega_conversations', JSON.stringify(STATE.conversations));
    localStorage.setItem('omega_current_id', STATE.currentId);
  }

  function restoreConversations() {
    // Messages are restored from localStorage on load
    if (STATE.currentId) {
      const conv = getCurrentConversation();
      if (conv && conv.messages.length > 0) {
        const welcome = messagesEl.querySelector('.welcome-message');
        if (welcome) welcome.remove();
        conv.messages.forEach(m => {
          addMessage(m.role, m.content, conv.id);
          if (m.role === 'assistant') {
            const lastMsg = messagesEl.lastElementChild;
            if (lastMsg) {
              const contentEl = lastMsg.querySelector('.message-content');
              if (contentEl) {
                contentEl.innerHTML = marked.parse(m.content, { breaks: true });
                contentEl.querySelectorAll('pre code').forEach(block => {
                  hljs.highlightElement(block);
                  addCopyButton(block);
                });
              }
            }
          }
        });
      }
    }
  }

  function newChat() {
    if (STATE.isStreaming) {
      STATE.abortController?.abort();
      STATE.isStreaming = false;
    }
    createConversation();
    saveConversation(STATE.currentId);
    // Clear visible messages, keep welcome
    const msgs = messagesEl.querySelectorAll('.message');
    msgs.forEach(m => m.remove());
    const welcome = messagesEl.querySelector('.welcome-message');
    if (!welcome) {
      messagesEl.innerHTML = `
        <div class="welcome-message">
          <div class="welcome-icon">Ω</div>
          <h2>OMEGA Cloud Ready</h2>
          <p>Connected to OpenCode AI. Ask me anything — I'm always online.</p>
        </div>
      `;
    }
    sendBtn.disabled = true;
  }

  function clearAll() {
    if (confirm('Delete all conversations?')) {
      STATE.conversations = [];
      STATE.currentId = null;
      localStorage.removeItem('omega_conversations');
      localStorage.removeItem('omega_current_id');
      newChat();
    }
  }

  // ─── Theme ───
  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    STATE.theme = theme;
    localStorage.setItem('omega_theme', theme);
  }

  function toggleTheme() {
    applyTheme(STATE.theme === 'dark' ? 'light' : 'dark');
  }

  // ─── Settings ───
  function togglePanel(panel) {
    panel.classList.toggle('hidden');
  }

  function saveSettings() {
    STATE.apiKey = apiKeyInput.value.trim();
    STATE.model = modelSelect.value;
    STATE.apiUrl = apiUrlInput.value.trim();

    localStorage.setItem('omega_api_key', STATE.apiKey);
    localStorage.setItem('omega_model', STATE.model);
    localStorage.setItem('omega_api_url', STATE.apiUrl);

    modelBadge.textContent = STATE.model;
    settingsPanel.classList.add('hidden');
  }

  // ─── Helpers ───
  function timeNow() {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function scrollToBottom() {
    setTimeout(() => {
      container.scrollTop = container.scrollHeight;
    }, 50);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

})();
