/* STDHub web — aplica tema, acessibilidade e personalização antes do primeiro
   paint. Carregado no <head>, antes do CSS, para não piscar as cores padrão. */
'use strict';

const Prefs = {
  /* Propriedades que a personalização pode sobrescrever. Limpamos todas antes
     de aplicar de novo, para voltar ao tema sempre que o usuário restaurar. */
  customProps: [
    '--background', '--foreground', '--card', '--card-foreground',
    '--popover', '--popover-foreground', '--panel', '--panel-2',
    '--primary', '--primary-foreground', '--line',
  ],

  defaults: function () {
    return {
      theme: 'light',
      themeChosen: false,
      textSize: 'normal',
      highContrast: false,
      reduceMotion: false,
      underlineLinks: false,
      customBg: '',
      customSurface: '',
      customText: '',
      customPrimary: '',
      lineWidth: 'normal',
    };
  },

  /* Aceita #abc e #aabbcc; devolve '' para qualquer outra coisa. */
  validColor: function (value) {
    if (!value) return '';
    let v = String(value).trim().toLowerCase();
    if (v.charAt(0) !== '#') v = '#' + v;
    if (/^#[0-9a-f]{3}$/.test(v)) {
      v = '#' + v[1] + v[1] + v[2] + v[2] + v[3] + v[3];
    }
    return /^#[0-9a-f]{6}$/.test(v) ? v : '';
  },

  /* Preto ou branco, o que tiver mais contraste com a cor dada. */
  contrastColor: function (value) {
    const hex = this.validColor(value);
    if (!hex) return '#000000';
    const lum = this.luminance(hex);
    const withBlack = (lum + 0.05) / 0.05;
    const withWhite = 1.05 / (lum + 0.05);
    return withBlack >= withWhite ? '#000000' : '#ffffff';
  },

  luminance: function (value) {
    const hex = this.validColor(value);
    if (!hex) return 0;
    const n = parseInt(hex.slice(1), 16);
    const channels = [n >> 16 & 255, n >> 8 & 255, n & 255].map(function (v) {
      v /= 255;
      return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  },

  contrastRatio: function (a, b) {
    const la = this.luminance(a);
    const lb = this.luminance(b);
    const light = Math.max(la, lb);
    const dark = Math.min(la, lb);
    return (light + 0.05) / (dark + 0.05);
  },

  /* Lê uma variável CSS já resolvida pelo navegador e devolve #rrggbb. */
  cssColor: function (variable) {
    const probe = document.createElement('span');
    probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;color:var(' + variable + ')';
    document.body.appendChild(probe);
    const rgb = getComputedStyle(probe).color;
    probe.remove();
    const m = rgb.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (!m) return '';
    return '#' + [m[1], m[2], m[3]].map(function (v) {
      return Number(v).toString(16).padStart(2, '0');
    }).join('');
  },

  apply: function (data) {
    const d = document.documentElement;
    this.customProps.forEach(function (prop) { d.style.removeProperty(prop); });

    const dark = data.theme === 'dark';
    const textSize = data.textSize === 'large' || data.textSize === 'xlarge'
      ? data.textSize : 'normal';
    d.setAttribute('data-theme', dark ? 'dark' : 'light');
    d.setAttribute('data-text-size', textSize);
    d.setAttribute('data-contrast', data.highContrast ? 'high' : 'normal');
    d.setAttribute('data-motion', data.reduceMotion ? 'reduce' : 'normal');
    d.setAttribute('data-links', data.underlineLinks ? 'underline' : 'normal');
    d.style.colorScheme = dark ? 'dark' : 'light';

    const line = data.lineWidth === 'thin' ? '0.5px'
      : data.lineWidth === 'strong' ? '2px' : '';
    if (line) d.style.setProperty('--line', line);

    /* O alto contraste é uma garantia de leitura; ele pausa as cores
       personalizadas e volta aos tokens de contraste do tema. */
    if (data.highContrast) return;

    const bg = this.validColor(data.customBg);
    const surface = this.validColor(data.customSurface);
    const text = this.validColor(data.customText);
    const primary = this.validColor(data.customPrimary);

    if (bg) d.style.setProperty('--background', bg);
    if (text) d.style.setProperty('--foreground', text);
    else if (bg) d.style.setProperty('--foreground', this.contrastColor(bg));

    if (text) {
      d.style.setProperty('--card-foreground', text);
      d.style.setProperty('--popover-foreground', text);
    }
    if (surface) {
      ['--card', '--popover', '--panel', '--panel-2'].forEach(function (prop) {
        d.style.setProperty(prop, surface);
      });
      d.style.setProperty('--card-foreground', text || this.contrastColor(surface));
      d.style.setProperty('--popover-foreground', text || this.contrastColor(surface));
    } else if (bg) {
      /* Sem uma cor secundária escolhida, os painéis acompanham o fundo para
         não ficarem claros demais quando o fundo é escuro. */
      const autoSurface = 'color-mix(in srgb, ' + bg + ' 93%, ' + this.contrastColor(bg) + ')';
      ['--card', '--popover', '--panel', '--panel-2'].forEach(function (prop) {
        d.style.setProperty(prop, autoSurface);
      });
      d.style.setProperty('--card-foreground', text || this.contrastColor(bg));
      d.style.setProperty('--popover-foreground', text || this.contrastColor(bg));
    }

    if (primary) {
      d.style.setProperty('--primary', primary);
      d.style.setProperty('--primary-foreground', this.contrastColor(primary));
    }
  },

  /* Usado pelo script inline do app.html. */
  bootstrap: function (saved) {
    const data = Object.assign(this.defaults(), saved || {});
    if (!saved || !saved.themeChosen) data.theme = 'light';
    this.apply(data);
  },
};

window.Prefs = Prefs;
