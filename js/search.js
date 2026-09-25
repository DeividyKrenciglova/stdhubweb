/* STDHub web — Research: Google web search + AI summary.
   Google is the base path: it needs no key, no CORS and no account, so the
   search always works — it just sends the person to the real results page.
   With a Brave key configured we ALSO get results in-app plus the AI
   summary; otherwise the query goes to Google and the log says so. */
'use strict';

const SearchView = {
  busy: false,
  el: null,
  ui: {},

  title: function () { return I18n.t('app.research'); },

  mount: function (el) {
    this.el = el;
    el.innerHTML =
      '<div class="chat-wrap"><div class="chat-log" data-log></div>' +
      '<form class="chat-form search-form" data-form>' +
      '<input data-input data-tour="search" />' +
      '<button class="btn btn-outline" type="button" data-google></button>' +
      '<button class="btn btn-primary" data-send></button></form></div>';
    this.ui = {
      log: el.querySelector('[data-log]'),
      form: el.querySelector('[data-form]'),
      input: el.querySelector('[data-input]'),
      google: el.querySelector('[data-google]'),
      send: el.querySelector('[data-send]'),
    };
    this.ui.input.placeholder = I18n.t('app.searchPlaceholder');
    this.ui.input.setAttribute('aria-label', I18n.t('app.searchPlaceholder'));
    this.ui.send.textContent = I18n.t('app.search');
    this.ui.google.textContent = I18n.t('app.googleSearch');
    this.ui.google.title = I18n.t('app.googleSearch');
    this.ui.google.setAttribute('aria-label', I18n.t('app.googleSearch'));
    this.ui.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.search(this.ui.input.value.trim());
    });
    this.ui.google.addEventListener('click', () => this.openGoogle());
  },

  onLang: function () {
    if (!this.el) return;
    this.ui.input.placeholder = I18n.t('app.searchPlaceholder');
    this.ui.send.textContent = I18n.t('app.search');
    this.ui.google.textContent = I18n.t('app.googleSearch');
    this.ui.google.title = I18n.t('app.googleSearch');
    this.ui.google.setAttribute('aria-label', I18n.t('app.googleSearch'));
  },

  say: function (cls, text, isHtml) {
    const d = document.createElement('div');
    d.className = cls;
    if (isHtml) d.innerHTML = text;
    else d.textContent = text;
    this.ui.log.appendChild(d);
    this.ui.log.scrollTop = this.ui.log.scrollHeight;
    return d;
  },

  esc: function (s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  },

  /* The real Google results page, in the student's language. */
  googleUrl: function (q) {
    const hl = I18n.lang === 'en' ? 'en' : 'pt-BR';
    return 'https://www.google.com/search?q=' + encodeURIComponent(q) + '&hl=' + hl;
  },

  /* Called straight from the button, so it keeps the user gesture and the
     popup blocker stays happy. `window.open` returns null whenever noopener
     is set, so we never read the return value: the link below the message
     is the real fallback when the tab does not open. */
  openGoogle: function () {
    const q = this.ui.input.value.trim();
    if (!q) return;
    window.open(this.googleUrl(q), '_blank', 'noopener,noreferrer');
    this.googleNote(q, I18n.t('app.googleOpened', { query: q }));
  },

  search: async function (q) {
    if (!q || this.busy) return;
    const key = Store.get('braveKey');
    if (!key) {
      // No key: do not dead-end on a config screen — run the search on the
      // web, which is the whole point of this view.
      this.openGoogle();
      return;
    }
    this.busy = true;
    let results = [];
    try {
      const res = await fetch(
        'https://api.search.brave.com/res/v1/web/search?q=' + encodeURIComponent(q) + '&count=5',
        { headers: { 'X-Subscription-Token': key, Accept: 'application/json' } },
      );
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      results = (data.web && data.web.results) || [];
    } catch (e) {
      this.say('chat-msg sys', e.message === 'Failed to fetch' || e.name === 'TypeError'
        ? I18n.t('app.offline')
        : String(e.message || e));
      this.busy = false;
      return;
    }
    if (!results.length) {
      this.say('chat-msg sys', '0 results');
      this.googleNote(q);
      this.busy = false;
      return;
    }
    results.forEach((r) => {
      this.say('search-hit', '<a href="' + this.esc(r.url) + '" target="_blank" rel="noreferrer">' +
        this.esc(r.title || r.url) + '</a><p>' + this.esc(r.description || '') + '</p>', true);
    });
    this.googleNote(q);
    const summaryBox = this.say('search-summary', I18n.t('app.summarizing'));
    try {
      const context = results.map((r, i) => '[' + (i + 1) + '] ' + r.title + ' — ' + (r.description || '')).join('\n');
      const out = await AI.chat([
        { role: 'system', content: 'Summarize these web results briefly in the student language, citing [1], [2]...' },
        { role: 'user', content: q + '\n\n' + context },
      ]);
      summaryBox.textContent = out;
    } catch (e) {
      summaryBox.textContent = e.message === 'offline' ? I18n.t('app.offline') : String(e.message || e);
    }
    this.busy = false;
    this.ui.log.scrollTop = this.ui.log.scrollHeight;
  },

  /* "See it on Google" line — the way out to the real web, kept next to
     whatever the in-app search managed to show. */
  googleNote: function (q, text) {
    const box = this.say('chat-msg sys', text || '');
    if (text) box.appendChild(document.createElement('br'));
    const link = document.createElement('a');
    link.href = this.googleUrl(q);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.textContent = I18n.t('app.googleResults');
    link.style.color = 'var(--info)';
    box.appendChild(link);
    return box;
  },
};

window.SearchView = SearchView;
