/* STDHub web — guided tour (coach marks on the REAL UI). Pure JS, no libs,
   no CDN. Port of the placement math in mobile/src/lib/tour.ts: a step
   spotlights a `data-tour="id"` control and the card sits below/above it.
   A missing or invisible target falls back to a centered card, so the tour
   never strands. `before` prepares the app so the target really exists. */
'use strict';

const Tour = {
  KEY: 'stdhub.web.tourSeen',
  MARGIN: 16,   // keep the card this far from the viewport edges
  GAP: 12,      // distance between the spotlight and the card
  PAD: 6,       // breathing room around the spotlighted control
  running: false,
  at: 0,
  steps: [],
  el: {},

  /* ---------- persistence ---------- */

  seen: function () {
    try { return window.localStorage.getItem(this.KEY) === '1'; } catch (e) { return false; }
  },

  remember: function () {
    try { window.localStorage.setItem(this.KEY, '1'); } catch (e) { /* private mode */ }
  },

  forget: function () {
    try { window.localStorage.removeItem(this.KEY); } catch (e) { /* ignore */ }
  },

  /* ---------- steps ---------- */

  catalog: function () {
    const nbEdit = function () { NotebookView.prepareForTour('edit'); };
    const nbRead = function () { NotebookView.prepareForTour('read'); };
    return [
      { title: 'tour.t1Title', text: 'tour.t1Text' },
      { title: 'tour.t2Title', text: 'tour.t2Text', target: 'sidebar' },
      { title: 'tour.t3Title', text: 'tour.t3Text', target: 'newfile', before: nbEdit },
      { title: 'tour.t4Title', text: 'tour.t4Text', target: 'toolbar', before: nbEdit },
      { title: 'tour.t5Title', text: 'tour.t5Text', target: 'readmode', before: nbRead },
      { title: 'tour.t6Title', text: 'tour.t6Text', target: 'calc', view: 'calculator' },
      { title: 'tour.t7Title', text: 'tour.t7Text', target: 'search', view: 'research' },
      { title: 'tour.t8Title', text: 'tour.t8Text', target: 'tutor', view: 'tutor' },
      { title: 'tour.t9Title', text: 'tour.t9Text', target: 'pin' },
      { title: 'tour.t10Title', text: 'tour.t10Text', final: true },
    ];
  },

  /* ---------- lifecycle ---------- */

  start: function (fromStep) {
    if (this.running) this.stop();
    this.steps = this.catalog();
    this.at = Math.max(0, Math.min(this.steps.length - 1, fromStep || 0));
    this.build();
    this.running = true;
    this.el.root.hidden = false;
    this.onKey = (e) => this.onKeydown(e);
    document.addEventListener('keydown', this.onKey, true);
    this.onResize = () => this.paint();
    window.addEventListener('resize', this.onResize);
    window.addEventListener('scroll', this.onResize, true);
    this.show();
  },

  stop: function () {
    this.running = false;
    this.remember();
    if (this.el.root) this.el.root.hidden = true;
    if (this.onKey) document.removeEventListener('keydown', this.onKey, true);
    if (this.onResize) {
      window.removeEventListener('resize', this.onResize);
      window.removeEventListener('scroll', this.onResize, true);
    }
  },

  restart: function () {
    this.forget();
    this.start(0);
  },

  onKeydown: function (e) {
    if (!this.running) return;
    // The spotlight does not block clicks, so the user may be typing in the
    // editor: never steal Enter/arrows from a field.
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT' || t.isContentEditable)) return;
    if (e.key === 'Escape') { e.preventDefault(); this.stop(); return; }
    if (e.key === 'ArrowRight' || e.key === 'Enter') { e.preventDefault(); this.next(); return; }
    if (e.key === 'ArrowLeft') { e.preventDefault(); this.back(); }
  },

  next: function () {
    if (this.at >= this.steps.length - 1) { this.stop(); return; }
    this.at += 1;
    this.show();
  },

  back: function () {
    if (this.at <= 0) return;
    this.at -= 1;
    this.show();
  },

  /* ---------- render ---------- */

  build: function () {
    if (this.el.root) return;
    const root = document.createElement('div');
    root.className = 'tour';
    root.setAttribute('role', 'dialog');
    root.setAttribute('aria-modal', 'true');
    root.dataset.tourRoot = '';
    root.innerHTML =
      '<div class="tour-veil" data-veil></div>' +
      '<div class="tour-ring" data-ring aria-hidden="true"></div>' +
      '<div class="tour-card" data-card>' +
      '<div class="tour-top"><span class="tour-count" data-count></span>' +
      '<span class="tour-dots" data-dots></span></div>' +
      '<h2 class="tour-title" data-title></h2>' +
      '<p class="tour-text" data-text></p>' +
      '<div class="tour-actions">' +
      '<button class="btn btn-outline btn-sm" type="button" data-back></button>' +
      '<button class="btn btn-ghost btn-sm" type="button" data-skip></button>' +
      '<button class="btn btn-primary btn-sm" type="button" data-next></button>' +
      '</div></div>';
    document.body.appendChild(root);
    const q = (s) => root.querySelector(s);
    this.el = {
      root: root,
      veil: q('[data-veil]'),
      ring: q('[data-ring]'),
      card: q('[data-card]'),
      count: q('[data-count]'),
      dots: q('[data-dots]'),
      title: q('[data-title]'),
      text: q('[data-text]'),
      back: q('[data-back]'),
      skip: q('[data-skip]'),
      next: q('[data-next]'),
    };
    this.el.back.addEventListener('click', () => this.back());
    this.el.skip.addEventListener('click', () => this.stop());
    this.el.next.addEventListener('click', () => this.next());
    this.el.veil.addEventListener('click', () => this.next());
  },

  show: function () {
    const step = this.steps[this.at];
    if (step.view) App.openTab(step.view);
    if (step.before) step.before();
    // Leaving the notebook: do not strand the mobile file drawer open.
    if (step.view && step.view !== 'notebook') NotebookView.setTreeOpen(false);
    this.el.card.setAttribute('aria-label', I18n.t(step.title));
    this.el.title.textContent = I18n.t(step.title);
    this.el.text.textContent = I18n.t(step.text);
    this.el.count.textContent = (this.at + 1) + ' / ' + this.steps.length;
    this.el.back.hidden = this.at === 0;
    this.el.skip.hidden = !!step.final;
    this.el.back.textContent = I18n.t('tour.back');
    this.el.skip.textContent = I18n.t('tour.skip');
    this.el.next.textContent = step.final ? I18n.t('tour.gotIt') : I18n.t('tour.next');
    this.el.dots.innerHTML = '';
    this.steps.forEach((_s, i) => {
      const d = document.createElement('span');
      d.className = 'tour-dot' + (i === this.at ? ' on' : '');
      this.el.dots.appendChild(d);
    });
    this.paint();
    // The step action may have re-rendered the view; re-measure on the
    // next frame so the spotlight lands on the final geometry.
    window.requestAnimationFrame(() => this.paint());
  },

  frame: function () {
    const step = this.steps[this.at];
    if (!step || !step.target) return null;
    const el = document.querySelector('[data-tour="' + step.target + '"]');
    if (!el) return null;
    const r = el.getBoundingClientRect();
    if (r.width <= 0 || r.height <= 0) return null;   // hidden: fall back
    // Scrolled out of a horizontal strip (tab bar, toolbar): fall back too.
    if (r.right <= 0 || r.bottom <= 0 || r.left >= window.innerWidth || r.top >= window.innerHeight) return null;
    return {
      x: Math.max(0, r.left - this.PAD),
      y: Math.max(0, r.top - this.PAD),
      w: r.width + this.PAD * 2,
      h: r.height + this.PAD * 2,
    };
  },

  /* Card below the target when it fits, above when it does not, centered
     as a last resort. Same rule as the mobile tour. */
  place: function (frame, h, w) {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const clampX = (x) => Math.max(this.MARGIN, Math.min(x, Math.max(this.MARGIN, vw - this.MARGIN - w)));
    if (!frame) {
      return { top: Math.max(this.MARGIN, (vh - h) / 2), left: (vw - w) / 2 };
    }
    const left = clampX(frame.x + frame.w / 2 - w / 2);
    const below = frame.y + frame.h + this.GAP;
    if (below + h + this.MARGIN <= vh) return { top: below, left: left };
    const above = frame.y - this.GAP - h;
    if (above >= this.MARGIN) return { top: above, left: left };
    return { top: Math.max(this.MARGIN, (vh - h) / 2), left: left };
  },

  paint: function () {
    if (!this.running) return;
    const frame = this.frame();
    const card = this.el.card;
    // Pin the width first, then measure: the height depends on how the text
    // wraps, so measuring at the old width would misplace the card.
    const w = Math.max(180, Math.min(window.innerWidth - this.MARGIN * 2, 360));
    card.style.width = Math.round(w) + 'px';
    card.style.left = '0px';
    card.style.top = '0px';
    card.style.visibility = 'hidden';
    const pos = this.place(frame, card.offsetHeight, w);
    card.style.top = Math.round(pos.top) + 'px';
    card.style.left = Math.round(pos.left) + 'px';
    card.style.visibility = 'visible';
    if (frame) {
      this.el.veil.hidden = true;
      this.el.ring.hidden = false;
      this.el.ring.style.left = frame.x + 'px';
      this.el.ring.style.top = frame.y + 'px';
      this.el.ring.style.width = frame.w + 'px';
      this.el.ring.style.height = frame.h + 'px';
    } else {
      this.el.veil.hidden = false;
      this.el.ring.hidden = true;
    }
  },
};

window.Tour = Tour;
