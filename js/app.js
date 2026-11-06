/* STDHub web — shell: login gate, sidebar, tabs, right dock. Classic script. */
'use strict';

const App = {
  views: {},       // id -> { title, icon, el, mount?, onShow? }
  order: ['notebook', 'calculator', 'research', 'tutor'],
  open: [],
  active: null,
  dock: [],
  dockActive: null,
  lastMain: null,
  els: {},

  t: function (k, v) { return I18n.t(k, v); },

  init: function () {
    Store.load();
    I18n.setLang(Store.get('lang'));
    Store.applyPrefs();
    this.els = {
      login: document.getElementById('login'),
      shell: document.getElementById('shell'),
      sidebar: document.getElementById('sidebar'),
      tabbar: document.getElementById('tabbar'),
      content: document.getElementById('content'),
      dock: document.getElementById('dock'),
      dockHead: document.getElementById('dock-head'),
      dockBody: document.getElementById('dock-body'),
      hint: document.getElementById('centerHint'),
    };
    this.renderLogin();
    document.getElementById('guestBtn').addEventListener('click', () => this.enter());
    this.renderSidebar();
    this.renderAll();
  },

  renderLogin: function () {
    const set = (id, key) => { document.getElementById(id).textContent = this.t(key); };
    set('loginTitle', 'app.loginTitle');
    set('loginSub', 'app.loginSub');
    set('guestBtn', 'app.guest');
    set('guestNote', 'app.guestNote');
  },

  enter: function () {
    this.els.login.hidden = true;
    this.els.shell.hidden = false;
    this.openTab('notebook');
    // First visit: show the tour once. `?tour=1` replays it on demand
    // (that is what the landing page "ver o tour" button links to).
    const replay = /[?&]tour=1/.test(window.location.search);
    if (replay || !Tour.seen()) {
      window.setTimeout(() => Tour.start(0), 350);
    }
  },

  replayTour: function () {
    if (!this.els.login.hidden) {
      this.els.login.hidden = true;
      this.els.shell.hidden = false;
      this.openTab('notebook');
    }
    Tour.restart();
  },

  register: function (id, def) { this.views[id] = def; },

  viewEl: function (id) {
    const v = this.views[id];
    if (!v.el) {
      const el = document.createElement('div');
      el.className = 'view';
      el.dataset.view = id;
      v.el = el;
      if (v.mount) v.mount(el);
    }
    return v.el;
  },

  openTab: function (id) {
    if (!this.views[id]) return;
    if (!this.open.includes(id)) this.open.push(id);
    this.active = id;
    this.undockSilent(id);
    if (!this.dock.includes(id)) this.lastMain = id;
    this.renderAll();
    const v = this.views[id];
    if (v.onShow) v.onShow();
  },

  closeTab: function (id) {
    this.open = this.open.filter((t) => t !== id);
    this.dock = this.dock.filter((t) => t !== id);
    if (this.dockActive === id) this.dockActive = null;
    if (this.active === id) {
      this.active = this.open.length ? this.open[this.open.length - 1] : null;
    }
    this.renderAll();
  },

  pinRight: function (id) {
    if (id === 'notebook') return;
    if (!this.dock.includes(id)) this.dock.push(id);
    this.dockActive = id;
    this.renderAll();
  },

  undockSilent: function (id) {
    this.dock = this.dock.filter((t) => t !== id);
    if (this.dockActive === id) this.dockActive = this.dock.length ? this.dock[this.dock.length - 1] : null;
  },

  undock: function (id) {
    this.undockSilent(id);
    if (!this.open.includes(id)) this.open.push(id);
    this.active = id;
    this.lastMain = id;
    this.renderAll();
  },

  icon: function (name) {
    return window.Icons ? Icons.svg(name) : '';
  },

  viewIcon: function (id) {
    return { notebook: 'notebook', calculator: 'calculator', research: 'search', tutor: 'chat' }[id] || 'file';
  },

  renderSidebar: function () {
    const icons = {
      notebook: 'notebook', calculator: 'calculator', research: 'search', tutor: 'chat',
      settings: 'sliders', tour: 'help',
    };
    const titles = {
      notebook: 'app.notebook', calculator: 'app.calculator', research: 'app.research',
      tutor: 'app.tutor', settings: 'app.settings',
    };
    const short = I18n.lang === 'en'
      ? { notebook: 'Notes', calculator: 'Calc', research: 'Search', tutor: 'Tutor', settings: 'Settings', tour: 'Help' }
      : { notebook: 'Caderno', calculator: 'Calc', research: 'Busca', tutor: 'Tutor', settings: 'Ajustes', tour: 'Ajuda' };
    const bar = this.els.sidebar;
    bar.innerHTML = '';

    const brand = document.createElement('a');
    brand.className = 'side-brand';
    brand.href = 'index.html';
    brand.title = 'STDHub';
    brand.setAttribute('aria-label', 'STDHub');
    brand.innerHTML = '<img src="assets/logo.svg" alt="" />';
    bar.appendChild(brand);

    const list = this.order.concat(['settings', 'tour']);
    list.forEach((id) => {
      if (id === 'settings') {
        const sp = document.createElement('div');
        sp.className = 'side-spacer';
        bar.appendChild(sp);
      }
      const label = this.t(id === 'tour' ? 'tour.open' : titles[id]);
      const b = document.createElement('button');
      b.className = 'side-btn';
      b.dataset.id = id;
      b.type = 'button';
      b.title = label;
      b.setAttribute('aria-label', label);
      b.innerHTML = this.icon(icons[id]) +
        '<span class="side-label">' + short[id] + '</span>' +
        '<span class="side-tip" aria-hidden="true">' + label + '</span>';
      b.addEventListener('click', () => {
        if (id === 'settings') SettingsView.openModal();
        else if (id === 'tour') this.replayTour();
        else this.openTab(id);
      });
      bar.appendChild(b);
    });
  },

  renderAll: function () {
    this.renderSidebarActive();
    this.renderTabs();
    this.renderContent();
    this.renderDock();
  },

  renderSidebarActive: function () {
    const btns = this.els.sidebar.querySelectorAll('.side-btn');
    btns.forEach((b) => {
      const on = this.active === b.dataset.id;
      b.classList.toggle('active', on);
      b.setAttribute('aria-pressed', String(on));
    });
  },

  renderTabs: function () {
    const bar = this.els.tabbar;
    bar.innerHTML = '';
    this.open.forEach((id) => {
      const v = this.views[id];
      const tab = document.createElement('div');
      tab.className = 'tab' + (this.active === id ? ' active' : '');
      const tabIcon = document.createElement('span');
      tabIcon.className = 'tab-ico';
      tabIcon.innerHTML = this.icon(this.viewIcon(id));
      tab.appendChild(tabIcon);
      const label = document.createElement('button');
      label.className = 'tab-label';
      label.textContent = v.title();
      label.setAttribute('aria-label', v.title());
      label.addEventListener('click', () => this.openTab(id));
      tab.appendChild(label);
      if (id !== 'notebook') {
        const pin = document.createElement('button');
        pin.className = 'pin';
        pin.dataset.tour = 'pin';
        pin.innerHTML = this.icon('pin');
        pin.title = this.t('app.pinRight');
        pin.setAttribute('aria-label', this.t('app.pinRight'));
        pin.addEventListener('click', (e) => { e.stopPropagation(); this.pinRight(id); });
        tab.appendChild(pin);
      }
      const x = document.createElement('button');
      x.className = 'x';
      x.innerHTML = this.icon('x');
      x.title = this.t('app.close');
      x.setAttribute('aria-label', this.t('app.close') + ' ' + v.title());
      x.addEventListener('click', (e) => { e.stopPropagation(); this.closeTab(id); });
      tab.appendChild(x);
      bar.appendChild(tab);
    });
  },

  placeView: function (id, host) {
    const el = this.viewEl(id);
    if (el.parentElement !== host) host.appendChild(el);
    return el;
  },

  renderContent: function () {
    const host = this.els.content;
    const hint = this.els.hint;
    // Focusing a docked tab never blanks the center: fall back to the last
    // main tab (same rule as the desktop app).
    let mainId = this.active && !this.dock.includes(this.active) ? this.active : null;
    if (!mainId) {
      if (this.lastMain && this.open.includes(this.lastMain) && !this.dock.includes(this.lastMain)) {
        mainId = this.lastMain;
      } else {
        mainId = this.open.find((id) => !this.dock.includes(id)) || null;
      }
    }
    if (mainId) {
      hint.hidden = true;
      this.open.forEach((id) => {
        const el = this.placeView(id, host);
        el.classList.toggle('active', id === mainId);
      });
    } else {
      this.open.forEach((id) => {
        const el = this.placeView(id, host);
        el.classList.remove('active');
      });
      hint.hidden = false;
      hint.textContent = this.t('app.noTabs');
    }
  },

  renderDock: function () {
    const dock = this.els.dock;
    const head = this.els.dockHead;
    const body = this.els.dockBody;
    head.innerHTML = '';
    if (!this.dock.length) {
      dock.hidden = true;
      return;
    }
    dock.hidden = false;
    if (!this.dockActive || !this.dock.includes(this.dockActive)) {
      this.dockActive = this.dock[this.dock.length - 1];
    }
    this.dock.forEach((id) => {
      const v = this.views[id];
      const tab = document.createElement('div');
      tab.className = 'tab' + (this.dockActive === id ? ' active' : '');
      const dockIcon = document.createElement('span');
      dockIcon.className = 'tab-ico';
      dockIcon.innerHTML = this.icon(this.viewIcon(id));
      tab.appendChild(dockIcon);
      const label = document.createElement('button');
      label.className = 'tab-label';
      label.textContent = v.title();
      label.addEventListener('click', () => { this.dockActive = id; this.renderAll(); });
      tab.appendChild(label);
      const back = document.createElement('button');
      back.className = 'x';
      back.innerHTML = this.icon('undo');
      back.title = this.t('app.unpin');
      back.setAttribute('aria-label', this.t('app.unpin'));
      back.addEventListener('click', (e) => { e.stopPropagation(); this.undock(id); });
      tab.appendChild(back);
      const x = document.createElement('button');
      x.className = 'x';
      x.innerHTML = this.icon('x');
      x.title = this.t('app.close');
      x.setAttribute('aria-label', this.t('app.close') + ' ' + v.title());
      x.addEventListener('click', (e) => { e.stopPropagation(); this.closeTab(id); });
      tab.appendChild(x);
      head.appendChild(tab);
      const el = this.placeView(id, body);
      el.classList.toggle('active', id === this.dockActive);
    });
  },

  refreshTexts: function () {
    this.renderLogin();
    this.renderSidebar();
    this.renderAll();
    Object.keys(this.views).forEach((id) => {
      if (this.views[id].onLang) this.views[id].onLang();
    });
    if (Tour.running) Tour.show();
  },
};

document.addEventListener('DOMContentLoaded', function () { App.init(); });
