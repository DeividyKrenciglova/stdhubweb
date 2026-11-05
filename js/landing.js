/* STDHub — landing interactions. Sem dependências, sem CDN. */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ano no rodapé */
  var year = new Date().getFullYear();
  ['year', 'year2'].forEach(function (id) {
    var el = document.getElementById(id);
    if (el) el.textContent = String(year);
  });

  /* nav condensa ao rolar */
  var header = document.getElementById('siteHeader');
  var onScroll = function () {
    if (!header) return;
    header.classList.toggle('is-scrolled', window.scrollY > 12);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* menu mobile */
  var menuBtn = document.getElementById('menuBtn');
  var nav = document.getElementById('siteNav');
  var closeMenu = function () {
    if (!nav || !menuBtn) return;
    nav.classList.remove('is-open');
    menuBtn.setAttribute('aria-expanded', 'false');
    menuBtn.setAttribute('aria-label', 'Abrir menu');
  };
  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 981) closeMenu();
    });
  }

  /* botões com rolagem letra por letra (vv-roll) */
  document.querySelectorAll('[data-roll]').forEach(function (el) {
    var text = (el.textContent || '').trim();
    if (!text) return;
    var box = document.createElement('span');
    box.className = 'roll';
    box.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < text.length; i++) {
      var ch = document.createElement('span');
      ch.className = 'roll-char';
      ch.style.setProperty('--i', String(i));
      var a = document.createElement('span');
      a.textContent = text[i] === ' ' ? '\u00a0' : text[i];
      var b = a.cloneNode(true);
      ch.appendChild(a);
      ch.appendChild(b);
      box.appendChild(ch);
    }
    el.textContent = '';
    el.appendChild(box);
    if (!el.getAttribute('aria-label')) el.setAttribute('aria-label', text);
  });

  /* reveals no scroll (com atraso escalonado por grupo) */
  var revealables = document.querySelectorAll('.reveal, .reveal-scale, .footer-mark');
  if (reduce || !('IntersectionObserver' in window)) {
    revealables.forEach(function (el) { el.classList.add('is-in'); });
  } else {
    document.querySelectorAll('.reveal').forEach(function (el, i) {
      var siblings = el.parentElement ? el.parentElement.children : [];
      var idx = Array.prototype.indexOf.call(siblings, el);
      if (idx > 0) el.style.setProperty('--d', String(Math.min(idx, 6)));
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    revealables.forEach(function (el) { io.observe(el); });
  }

  /* prévia do hero: entra somente depois do primeiro scroll */
  var heroPreview = document.getElementById('heroEditor');
  if (heroPreview) {
    if (reduce) {
      heroPreview.classList.add('is-in');
    } else {
      heroPreview.classList.add('is-hidden');
      var revealPreview = function () {
        if (heroPreview.getBoundingClientRect().top < window.innerHeight * 0.92) {
          heroPreview.classList.remove('is-hidden');
          heroPreview.classList.add('is-in');
          window.removeEventListener('scroll', revealPreview);
        }
      };
      window.addEventListener('scroll', revealPreview, { passive: true });
      revealPreview();
    }
  }

  /* brilho que segue o cursor no badge do hero */
  var badge = document.getElementById('heroBadge');
  var hero = document.getElementById('inicio');
  if (badge && hero && !reduce && window.matchMedia('(any-hover: hover)').matches) {
    var raf = 0;
    hero.addEventListener('pointermove', function (e) {
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = 0;
        var r = badge.getBoundingClientRect();
        var x = e.clientX - r.left;
        var y = e.clientY - r.top;
        var inside = x > -80 && x < r.width + 80 && y > -80 && y < r.height + 80;
        badge.style.setProperty('--mx', x.toFixed(1) + 'px');
        badge.style.setProperty('--my', y.toFixed(1) + 'px');
        badge.style.setProperty('--r', Math.max(46, r.width * 0.5).toFixed(1) + 'px');
        badge.style.setProperty('--glow', inside ? '1' : '0');
      });
    });
    hero.addEventListener('pointerleave', function () {
      badge.style.setProperty('--glow', '0');
    });
  }

  /* logo do colégio quicando no fundo do hero, estilo pong */
  var pong = document.getElementById('heroPong');
  var pongLogo = document.getElementById('pongLogo');
  if (pong && pongLogo && !reduce) {
    var echoes = Array.prototype.slice.call(pong.querySelectorAll('.pong-echo'));
    var paddles = Array.prototype.slice.call(pong.querySelectorAll('.pong-paddle'));
    var BW = 0, BH = 0, BS = 0, px = 0, py = 0, dx = 0, dy = 0;
    var pongRaf = 0, pongLast = 0, pongOn = false, hist = [];
    var paddleH = paddles.length ? paddles[0].offsetHeight : 56;

    var paintPong = function () {
      pongLogo.style.transform = 'translate3d(' + px.toFixed(2) + 'px,' + py.toFixed(2) + 'px,0)';
      echoes.forEach(function (el, i) {
        var p = hist[Math.min(hist.length - 1, (i + 1) * 4)];
        if (p) el.style.transform = 'translate3d(' + p.x.toFixed(2) + 'px,' + p.y.toFixed(2) + 'px,0)';
      });
      paddles.forEach(function (el) {
        el.style.transform = 'translateY(' + (py + BS / 2 - paddleH / 2).toFixed(2) + 'px)';
      });
    };

    var measurePong = function () {
      // o campo do pong ocupa a altura inteira da tela
      var r = pong.getBoundingClientRect();
      BW = r.width;
      BH = r.height;
      BS = pongLogo.offsetWidth || 120;
      if (!px && !py) {
        px = BW * 0.1;
        py = BH * 0.2;
        var ang = 0.62 + Math.random() * 0.5;
        dx = 130 * Math.cos(ang);
        dy = 130 * Math.sin(ang);
      }
      px = Math.max(0, Math.min(px, BW - BS));
      py = Math.max(0, Math.min(py, BH - BS));
      if (!hist.length) {
        for (var k = 0; k < 16; k++) hist.push({ x: px, y: py });
      }
      paintPong();
    };

    var pongFlash = function () {
      pongLogo.classList.remove('is-hit');
      void pongLogo.offsetWidth;
      pongLogo.classList.add('is-hit');
      window.setTimeout(function () { pongLogo.classList.remove('is-hit'); }, 320);
      paddles.forEach(function (el) {
        el.classList.remove('is-hit');
        void el.offsetWidth;
        el.classList.add('is-hit');
      });
    };

    var pongTick = function (now) {
      if (!pongOn) return;
      if (!pongLast) pongLast = now;
      var dt = Math.min((now - pongLast) / 1000, 0.033);
      pongLast = now;
      px += dx * dt;
      py += dy * dt;
      var hit = false;
      if (px <= 0) { px = 0; dx = Math.abs(dx); hit = true; }
      else if (px >= BW - BS) { px = BW - BS; dx = -Math.abs(dx); hit = true; }
      if (py <= 0) { py = 0; dy = Math.abs(dy); hit = true; }
      else if (py >= BH - BS) { py = BH - BS; dy = -Math.abs(dy); hit = true; }
      if (hit) pongFlash();
      hist.unshift({ x: px, y: py });
      if (hist.length > 16) hist.pop();
      paintPong();
      pongRaf = window.requestAnimationFrame(pongTick);
    };

    var startPong = function () {
      if (pongOn) return;
      pongOn = true;
      pongLast = 0;
      pongRaf = window.requestAnimationFrame(pongTick);
    };
    var stopPong = function () {
      pongOn = false;
      if (pongRaf) window.cancelAnimationFrame(pongRaf);
      pongRaf = 0;
    };

    pong.classList.add('is-live');
    measurePong();
    startPong();
    window.addEventListener('resize', measurePong);
    window.addEventListener('load', measurePong);
    window.setTimeout(measurePong, 400);
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) stopPong(); else startPong();
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { if (e.isIntersecting) startPong(); else stopPong(); });
      }, { threshold: 0.02 }).observe(pong);
    }
  }

  /* leve paralaxe nos cartões flutuantes do hero */
  var editor = document.getElementById('heroEditor');
  if (editor && !reduce && window.matchMedia('(any-hover: hover) and (pointer: fine)').matches) {
    var cards = editor.querySelectorAll('.float-card');
    editor.addEventListener('pointermove', function (e) {
      var r = editor.getBoundingClientRect();
      var dx = (e.clientX - r.left) / r.width - 0.5;
      var dy = (e.clientY - r.top) / r.height - 0.5;
      cards.forEach(function (card, i) {
        var k = i === 0 ? 10 : -8;
        card.style.translate = dx * k + 'px ' + dy * k + 'px';
      });
    });
    editor.addEventListener('pointerleave', function () {
      cards.forEach(function (card) { card.style.translate = ''; });
    });
  }
  /* FAQ com abertura e fechamento em slide */
  var faqList = document.querySelector('.faq-list');
  if (faqList && !reduce) {
    faqList.classList.add('is-animated');
    faqList.querySelectorAll('details').forEach(function (details) {
      var summary = details.querySelector('summary');
      var answer = details.querySelector('.faq-answer');
      if (!summary || !answer) return;

      var busy = false;
      answer.style.height = details.open ? 'auto' : '0px';

      summary.addEventListener('click', function (event) {
        event.preventDefault();
        if (busy) return;
        busy = true;

        if (!details.open) {
          details.open = true;
          answer.style.height = '0px';
          answer.classList.remove('is-visible');
          requestAnimationFrame(function () {
            answer.classList.add('is-visible');
            answer.style.height = answer.scrollHeight + 'px';
          });
          answer.addEventListener('transitionend', function onOpen(e) {
            if (e.propertyName !== 'height') return;
            answer.removeEventListener('transitionend', onOpen);
            answer.style.height = 'auto';
            busy = false;
          });
        } else {
          answer.style.height = answer.scrollHeight + 'px';
          answer.classList.remove('is-visible');
          void answer.offsetHeight;
          requestAnimationFrame(function () {
            answer.style.height = '0px';
          });
          answer.addEventListener('transitionend', function onClose(e) {
            if (e.propertyName !== 'height') return;
            answer.removeEventListener('transitionend', onClose);
            details.open = false;
            answer.style.height = '0px';
            busy = false;
          });
        }
      });
    });
  }
})();
