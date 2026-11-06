/* STDHub web — settings modal + AI connection test. Classic script. */
'use strict';

const SettingsView = {
  dlg: null,

  openModal: function () {
    if (!this.dlg) this.build();
    this.sync();
    this.dlg.showModal();
  },

  build: function () {
    const toggleRow = function (key, label, hint) {
      return '<div class="set-row"><button type="button" class="set-toggle" role="switch" aria-checked="false" ' + key + '>' +
        '<span class="set-toggle-copy"><span ' + label + '></span>' +
        '<small class="set-hint" ' + hint + '></small></span>' +
        '<span class="switch" aria-hidden="true"></span></button></div>';
    };
    const colorRow = function (prop, label) {
      return '<div class="color-row">' +
        '<span class="color-label" id="custom-' + prop + '-label" ' + label + '></span>' +
        '<div class="color-field">' +
        '<input type="color" data-pick="' + prop + '" aria-labelledby="custom-' + prop + '-label" />' +
        '<input type="text" class="color-hex" data-hex="' + prop + '" maxlength="7" spellcheck="false" aria-labelledby="custom-' + prop + '-label" />' +
        '<button type="button" class="color-clear" data-color-clear="' + prop + '">↺</button>' +
        '</div></div>';
    };
    const dlg = document.createElement('dialog');
    dlg.className = 'web-modal wide';
    dlg.setAttribute('aria-labelledby', 'settings-title');
    dlg.innerHTML =
      '<form method="dialog" class="modal-stack" data-form>' +
      '<h3 data-title id="settings-title" style="margin:0"></h3>' +
      '<div class="set-group"><p class="set-group-title" data-g-look></p>' +
      '<div class="set-row"><span data-l-theme></span><div class="set-line">' +
      '<button type="button" class="btn btn-outline btn-sm" data-theme-dark></button>' +
      '<button type="button" class="btn btn-outline btn-sm" data-theme-light></button></div></div>' +
      '<div class="set-row"><span data-l-lang></span><div class="set-line">' +
      '<button type="button" class="btn btn-outline btn-sm" data-lang-pt>Português</button>' +
      '<button type="button" class="btn btn-outline btn-sm" data-lang-en>English</button></div></div></div>' +
      '<div class="set-group"><p class="set-group-title" data-g-a11y></p>' +
      '<div class="set-row"><span id="set-text-size-label" data-l-textsize></span>' +
      '<div class="seg" role="group" aria-labelledby="set-text-size-label">' +
      '<button type="button" class="btn btn-outline btn-sm" data-size-normal aria-pressed="false"></button>' +
      '<button type="button" class="btn btn-outline btn-sm" data-size-large aria-pressed="false"></button>' +
      '<button type="button" class="btn btn-outline btn-sm" data-size-xlarge aria-pressed="false"></button>' +
      '</div></div>' +
      toggleRow('data-set-contrast', 'data-l-contrast', 'data-h-contrast') +
      toggleRow('data-set-motion', 'data-l-motion', 'data-h-motion') +
      toggleRow('data-set-links', 'data-l-links', 'data-h-links') +
      '</div>' +
      '<div class="set-group"><p class="set-group-title" data-g-custom></p>' +
      '<p class="set-hint" data-custom-note></p>' +
      '<p class="set-hint custom-warn" data-custom-warn hidden></p>' +
      '<div class="color-grid">' +
      colorRow('bg', 'data-l-bg') +
      colorRow('surface', 'data-l-surface') +
      colorRow('text', 'data-l-text') +
      colorRow('button', 'data-l-button') +
      '</div>' +
      '<div class="set-row"><span id="set-line-label" data-l-line></span>' +
      '<div class="seg" role="group" aria-labelledby="set-line-label">' +
      '<button type="button" class="btn btn-outline btn-sm" data-line-thin aria-pressed="false"></button>' +
      '<button type="button" class="btn btn-outline btn-sm" data-line-normal aria-pressed="false"></button>' +
      '<button type="button" class="btn btn-outline btn-sm" data-line-strong aria-pressed="false"></button>' +
      '</div></div>' +
      '<div class="set-line"><button type="button" class="btn btn-outline btn-sm" data-reset-custom></button></div>' +
      '</div>' +
      '<div class="set-group"><p class="set-group-title" data-l-ai></p>' +
      '<label class="small muted" data-l-preset for="set-ai-preset"></label><select id="set-ai-preset" data-ai-preset>' +
      '<option value="pollinations"></option><option value="openai"></option></select>' +
      '<label class="small muted" data-l-base for="set-ai-base"></label><input id="set-ai-base" data-ai-base />' +
      '<label class="small muted" data-l-model for="set-ai-model"></label><input id="set-ai-model" data-ai-model />' +
      '<label class="small muted" data-l-key for="set-ai-key"></label><input id="set-ai-key" data-ai-key type="password" autocomplete="off" />' +
      '<div class="set-line"><button type="button" class="btn btn-outline btn-sm" data-ai-test></button>' +
      '<span class="small muted" data-ai-msg></span></div></div>' +
      '<div class="set-group"><p class="set-group-title" data-l-brave id="set-brave-label"></p>' +
      '<input data-brave-key aria-labelledby="set-brave-label" type="password" autocomplete="off" /></div>' +
      '<div class="set-group"><p class="set-group-title" data-g-data></p>' +
      '<div class="set-row"><span data-l-tour></span>' +
      '<div class="set-line"><button type="button" class="btn btn-outline btn-sm" data-tour></button></div></div>' +
      '<div class="set-line"><button type="button" class="btn btn-outline btn-sm" data-clear></button>' +
      '<span class="small muted" data-saved></span></div></div>' +
      '<div class="modal-actions"><button class="btn btn-primary btn-sm" value="ok" data-done>OK</button></div>' +
      '</form>';
    document.body.appendChild(dlg);
    this.dlg = dlg;
    const q = (s) => dlg.querySelector(s);
    q('[data-theme-dark]').addEventListener('click', () => this.setTheme('dark'));
    q('[data-theme-light]').addEventListener('click', () => this.setTheme('light'));
    q('[data-lang-pt]').addEventListener('click', () => this.setLang('pt'));
    q('[data-lang-en]').addEventListener('click', () => this.setLang('en'));
    q('[data-size-normal]').addEventListener('click', () => this.setTextSize('normal'));
    q('[data-size-large]').addEventListener('click', () => this.setTextSize('large'));
    q('[data-size-xlarge]').addEventListener('click', () => this.setTextSize('xlarge'));
    q('[data-set-contrast]').addEventListener('click', () => this.togglePref('highContrast'));
    q('[data-set-motion]').addEventListener('click', () => this.togglePref('reduceMotion'));
    q('[data-set-links]').addEventListener('click', () => this.togglePref('underlineLinks'));
    q('[data-line-thin]').addEventListener('click', () => this.setLineWidth('thin'));
    q('[data-line-normal]').addEventListener('click', () => this.setLineWidth('normal'));
    q('[data-line-strong]').addEventListener('click', () => this.setLineWidth('strong'));
    q('[data-reset-custom]').addEventListener('click', () => this.resetCustom());
    dlg.querySelectorAll('[data-pick]').forEach((input) => {
      input.addEventListener('input', () => this.setColor(input.dataset.pick, input.value));
    });
    dlg.querySelectorAll('[data-hex]').forEach((input) => {
      input.addEventListener('change', () => this.setColorHex(input.dataset.hex, input.value));
    });
    dlg.querySelectorAll('[data-color-clear]').forEach((button) => {
      button.addEventListener('click', () => this.setColor(button.dataset.colorClear, ''));
    });
    q('[data-ai-preset]').addEventListener('change', (e) => {
      const v = e.target.value;
      Store.set('aiPreset', v);
      if (v === 'pollinations') {
        Store.set('aiBaseUrl', 'https://text.pollinations.ai/openai');
        Store.set('aiModel', 'openai');
        Store.set('aiKey', '');
      }
      this.sync();
    });
    ['aiBaseUrl', 'aiModel', 'aiKey', 'braveKey'].forEach((k) => {
      const map = { aiBaseUrl: '[data-ai-base]', aiModel: '[data-ai-model]', aiKey: '[data-ai-key]', braveKey: '[data-brave-key]' };
      q(map[k]).addEventListener('change', (e) => {
        Store.set(k, e.target.value);
        this.flashSaved();
      });
    });
    q('[data-ai-test]').addEventListener('click', () => this.testAi());
    q('[data-tour]').addEventListener('click', () => { dlg.close(); App.replayTour(); });
    q('[data-clear]').addEventListener('click', () => {
      Store.clear();
      I18n.setLang(Store.get('lang'));
      q('[data-saved]').textContent = I18n.t('app.cleared');
      this.sync();
      App.refreshTexts();
    });
  },

  setTheme: function (theme) {
    Store.set('theme', theme);
    Store.set('themeChosen', true);
    Store.applyPrefs();
    this.sync();
    this.flashSaved();
  },

  setTextSize: function (size) {
    Store.set('textSize', size);
    Store.applyPrefs();
    this.sync();
    this.flashSaved();
  },

  togglePref: function (key) {
    Store.set(key, !Store.get(key));
    Store.applyPrefs();
    this.sync();
    this.flashSaved();
  },

  setColor: function (prop, value) {
    const map = { bg: 'customBg', surface: 'customSurface', text: 'customText', button: 'customPrimary' };
    const key = map[prop];
    if (!key) return;
    Store.set(key, Prefs.validColor(value));
    Store.applyPrefs();
    this.syncCustom();
    this.flashSaved();
  },

  setColorHex: function (prop, value) {
    const raw = String(value || '').trim();
    if (!raw) {
      this.setColor(prop, '');
      return;
    }
    if (!Prefs.validColor(raw)) {
      this.syncCustom();
      return;
    }
    this.setColor(prop, raw);
  },

  setLineWidth: function (width) {
    Store.set('lineWidth', width === 'thin' || width === 'strong' ? width : 'normal');
    Store.applyPrefs();
    this.sync();
    this.flashSaved();
  },

  resetCustom: function () {
    ['customBg', 'customSurface', 'customText', 'customPrimary'].forEach((key) => Store.set(key, ''));
    Store.set('lineWidth', 'normal');
    Store.applyPrefs();
    this.sync();
    this.flashSaved();
  },

  setLang: function (lang) {
    Store.set('lang', lang);
    I18n.setLang(lang);
    this.sync();
    App.refreshTexts();
  },

  sync: function () {
    if (!this.dlg) return;
    const q = (s) => this.dlg.querySelector(s);
    q('[data-title]').textContent = I18n.t('app.settings');
    q('[data-g-look]').textContent = I18n.t('app.groupLook');
    q('[data-g-a11y]').textContent = I18n.t('app.groupA11y');
    q('[data-g-custom]').textContent = I18n.t('app.groupCustom');
    q('[data-custom-note]').textContent = I18n.t(Store.get('highContrast') ? 'app.customPaused' : 'app.customHint');
    q('[data-g-data]').textContent = I18n.t('app.groupData');
    q('[data-l-theme]').textContent = I18n.t('app.theme');
    q('[data-theme-dark]').textContent = I18n.t('app.dark');
    q('[data-theme-light]').textContent = I18n.t('app.light');
    q('[data-l-lang]').textContent = I18n.t('app.language');
    q('[data-l-textsize]').textContent = I18n.t('app.textSize');
    q('[data-size-normal]').textContent = I18n.t('app.textNormal');
    q('[data-size-large]').textContent = I18n.t('app.textLarge');
    q('[data-size-xlarge]').textContent = I18n.t('app.textXL');
    q('[data-l-contrast]').textContent = I18n.t('app.highContrast');
    q('[data-h-contrast]').textContent = I18n.t('app.highContrastHint');
    q('[data-l-motion]').textContent = I18n.t('app.reduceMotion');
    q('[data-h-motion]').textContent = I18n.t('app.reduceMotionHint');
    q('[data-l-links]').textContent = I18n.t('app.underlineLinks');
    q('[data-h-links]').textContent = I18n.t('app.underlineLinksHint');
    q('[data-l-bg]').textContent = I18n.t('app.bgColor');
    q('[data-l-surface]').textContent = I18n.t('app.surfaceColor');
    q('[data-l-text]').textContent = I18n.t('app.textColor');
    q('[data-l-button]').textContent = I18n.t('app.buttonColor');
    q('[data-l-line]').textContent = I18n.t('app.lineWidth');
    q('[data-line-thin]').textContent = I18n.t('app.lineThin');
    q('[data-line-normal]').textContent = I18n.t('app.lineNormal');
    q('[data-line-strong]').textContent = I18n.t('app.lineStrong');
    q('[data-reset-custom]').textContent = I18n.t('app.resetCustom');
    q('[data-l-ai]').textContent = I18n.t('app.aiTitle');
    q('[data-l-preset]').textContent = I18n.t('app.aiPreset');
    q('[data-ai-preset] option[value="pollinations"]').textContent = I18n.t('app.pollinations');
    q('[data-ai-preset] option[value="openai"]').textContent = I18n.t('app.openai');
    q('[data-l-base]').textContent = I18n.t('app.aiBaseUrl');
    q('[data-l-model]').textContent = I18n.t('app.aiModel');
    q('[data-l-key]').textContent = I18n.t('app.aiKey');
    q('[data-ai-test]').textContent = I18n.t('app.aiTest');
    q('[data-l-brave]').textContent = I18n.t('app.braveKey');
    q('[data-l-tour]').textContent = I18n.t('app.tourRow');
    q('[data-tour]').textContent = I18n.t('tour.open');
    q('[data-clear]').textContent = I18n.t('app.clearData');
    const dark = Store.get('theme') === 'dark';
    q('[data-theme-dark]').classList.toggle('on', dark);
    q('[data-theme-light]').classList.toggle('on', !dark);
    q('[data-theme-dark]').setAttribute('aria-pressed', String(dark));
    q('[data-theme-light]').setAttribute('aria-pressed', String(!dark));
    const lang = Store.get('lang');
    q('[data-lang-pt]').classList.toggle('on', lang === 'pt');
    q('[data-lang-en]').classList.toggle('on', lang === 'en');
    q('[data-lang-pt]').setAttribute('aria-pressed', String(lang === 'pt'));
    q('[data-lang-en]').setAttribute('aria-pressed', String(lang === 'en'));
    const size = Store.get('textSize') || 'normal';
    [['normal', '[data-size-normal]'], ['large', '[data-size-large]'], ['xlarge', '[data-size-xlarge]']]
      .forEach((pair) => {
        const on = size === pair[0];
        q(pair[1]).classList.toggle('on', on);
        q(pair[1]).setAttribute('aria-pressed', String(on));
      });
    q('[data-set-contrast]').setAttribute('aria-checked', String(!!Store.get('highContrast')));
    q('[data-set-motion]').setAttribute('aria-checked', String(!!Store.get('reduceMotion')));
    q('[data-set-links]').setAttribute('aria-checked', String(!!Store.get('underlineLinks')));
    const line = Store.get('lineWidth') || 'normal';
    [['thin', '[data-line-thin]'], ['normal', '[data-line-normal]'], ['strong', '[data-line-strong]']]
      .forEach((pair) => {
        const on = line === pair[0];
        q(pair[1]).classList.toggle('on', on);
        q(pair[1]).setAttribute('aria-pressed', String(on));
      });
    q('[data-ai-preset]').value = Store.get('aiPreset');
    q('[data-ai-base]').value = Store.get('aiBaseUrl');
    q('[data-ai-model]').value = Store.get('aiModel');
    q('[data-ai-key]').value = Store.get('aiKey');
    q('[data-brave-key]').value = Store.get('braveKey');
    q('[data-ai-msg]').textContent = '';
    q('[data-saved]').textContent = '';
    this.syncCustom();
  },

  /* Mantém os seletores de cor em sincronia sem resetar o restante do modal. */
  syncCustom: function () {
    if (!this.dlg) return;
    const q = (s) => this.dlg.querySelector(s);
    const high = !!Store.get('highContrast');
    const fields = [
      ['bg', 'customBg', '--background'],
      ['surface', 'customSurface', '--panel-2'],
      ['text', 'customText', '--foreground'],
      ['button', 'customPrimary', '--primary'],
    ];
    fields.forEach((field) => {
      const prop = field[0];
      const value = Prefs.validColor(Store.get(field[1]));
      const current = value || Prefs.cssColor(field[2]) || '#000000';
      const picker = q('[data-pick="' + prop + '"]');
      const hex = q('[data-hex="' + prop + '"]');
      const clear = q('[data-color-clear="' + prop + '"]');
      picker.value = current;
      picker.disabled = high;
      hex.value = value;
      hex.placeholder = value ? '' : current;
      hex.disabled = high;
      clear.disabled = high || !value;
      clear.title = I18n.t('app.resetColor');
      clear.setAttribute('aria-label', I18n.t('app.resetColor') + ': ' + q('[data-l-' + prop + ']').textContent);
    });
    const any = !!(Store.get('customBg') || Store.get('customSurface') || Store.get('customText')
      || Store.get('customPrimary') || (Store.get('lineWidth') || 'normal') !== 'normal');
    q('[data-reset-custom]').disabled = !any;
    q('[data-custom-note]').textContent = I18n.t(high ? 'app.customPaused' : 'app.customHint');
    q('[data-custom-warn]').textContent = I18n.t('app.customWarn');
    if (!high) {
      const fg = Prefs.cssColor('--foreground');
      const bg = Prefs.cssColor('--background');
      const surface = Prefs.cssColor('--panel-2');
      const weak = (fg && bg && Prefs.contrastRatio(fg, bg) < 4.5)
        || (fg && surface && Prefs.contrastRatio(fg, surface) < 4.5);
      q('[data-custom-warn]').hidden = !weak;
    } else {
      q('[data-custom-warn]').hidden = true;
    }
  },

  flashSaved: function () {
    if (!this.dlg) return;
    this.dlg.querySelector('[data-saved]').textContent = I18n.t('app.saved');
  },

  testAi: async function () {
    const q = (s) => this.dlg.querySelector(s);
    q('[data-ai-msg]').textContent = '...';
    try {
      const out = await AI.chat(
        [{ role: 'user', content: 'Reply with exactly: ok' }],
        { model: Store.get('aiModel'), baseUrl: Store.get('aiBaseUrl'), key: Store.get('aiKey') },
      );
      q('[data-ai-msg]').textContent = I18n.t('app.aiTestOk') + ' (' + out.slice(0, 40) + ')';
    } catch (e) {
      q('[data-ai-msg]').textContent = e.message === 'offline'
        ? I18n.t('app.offline')
        : I18n.t('app.aiTestFail', { message: String(e.message || e).slice(0, 120) });
    }
  },
};

window.SettingsView = SettingsView;
