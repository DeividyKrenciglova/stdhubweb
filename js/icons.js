/* STDHub web — conjunto de ícones próprios (SVG inline, stroke 1.6).
   Sem biblioteca e sem CDN: os caminhos são desenhados no mesmo grid 24×24
   para manter o traço consistente em toda a interface. */
'use strict';

(function () {
  var P = {
    notebook: '<rect x="4" y="3" width="16" height="18" rx="2.6"/><path d="M8 3v18"/><path d="M11.5 8h5M11.5 12h5M11.5 16h3"/>',
    calculator: '<rect x="5" y="3" width="14" height="18" rx="2.6"/><path d="M8 7h8"/><path d="M8.5 11.5h.01M12 11.5h.01M15.5 11.5h.01M8.5 15h.01M12 15h.01M15.5 15h.01M8.5 18.5h.01M12 18.5h.01M15.5 18.5h.01"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="M15.8 15.8 20.5 20.5"/>',
    chat: '<path d="M20 4.8H4v11.4h5.2L12 19.4l2.8-3.2H20z"/>',
    sliders: '<path d="M4 7h8.5M17 7h3M4 17h3.5M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9.2" cy="17" r="2"/>',
    help: '<circle cx="12" cy="12" r="8.5"/><path d="M9.7 9.3a2.4 2.4 0 1 1 3.4 2.2c-.7.4-1.1.9-1.1 1.7"/><path d="M12 16.6h.01"/>',
    x: '<path d="M6.5 6.5 17.5 17.5M17.5 6.5 6.5 17.5"/>',
    pin: '<path d="M9 3.2h6l-.8 5.2 2.8 2v1.8H7v-1.8l2.8-2z"/><path d="M12 12.2v8"/>',
    save: '<path d="M5 4.5h10.4L19 8.1v11.4H5z"/><path d="M8.5 4.5v4.8h6.4V4.5"/><path d="M8.5 19.5v-4.8h7v4.8"/>',
    pencil: '<path d="M4 20h3.9L20 7.9 16.1 4 4 16.1z"/><path d="m13.9 6.2 4 4"/>',
    book: '<path d="M12 6.6C10 5 7 4.3 4 4.3v13.2c3 0 6 .7 8 2.3 2-1.6 5-2.3 8-2.3V4.3c-3 0-6 .7-8 2.3Z"/><path d="M12 6.6v13.2"/>',
    folder: '<path d="M3.5 6.5h5.2l2 2h9.8v10.4H3.5z"/>',
    file: '<path d="M6 3.5h7.6L18 8v12.5H6z"/><path d="M13.5 3.5V8H18"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    chevron: '<path d="m6.5 9.5 5.5 5.5 5.5-5.5"/>',
    check: '<path d="M5 12.5 9.6 17 19 7"/>',
    trash: '<path d="M4.5 7h15M9.2 7V4.5h5.6V7M6.6 7l1 13h8.8l1-13"/><path d="M10 11v5M14 11v5"/>',
    undo: '<path d="M4 4.5v6h6"/><path d="M4.6 10.4a8 8 0 1 1 .6 5"/>',
    cards: '<rect x="3.5" y="6" width="12.5" height="12" rx="2.2"/><path d="M20.5 9.2v6.8a2.2 2.2 0 0 1-2.2 2.2H8.6"/>',
    quiz: '<rect x="4" y="4" width="16" height="16" rx="3.2"/><path d="M8.4 12.4 11 15l4.6-6"/>',
    table: '<rect x="3.5" y="5" width="17" height="14" rx="2.2"/><path d="M3.5 10h17M9.5 10v9M15 10v9"/>',
    quote: '<path d="M9.4 6.5H5.8v4.2h3.6c0 3-1 5-3.6 6.6"/><path d="M18.6 6.5h-3.6v4.2h3.6c0 3-1 5-3.6 6.6"/>',
    list: '<path d="M8.5 7h11.5M8.5 12h11.5M8.5 17h11.5"/><path d="M4.2 7h.01M4.2 12h.01M4.2 17h.01"/>',
    link: '<path d="M10.2 13.8a4 4 0 0 1 0-5.6l2.2-2.2a4 4 0 0 1 5.6 5.6l-1.8 1.8"/><path d="M13.8 10.2a4 4 0 0 1 0 5.6l-2.2 2.2A4 4 0 0 1 6 12.4l1.8-1.8"/>',
    callout: '<circle cx="12" cy="12" r="8.5"/><path d="M12 8v5.2M12 16.4h.01"/>',
    ink: '<path d="M4 20c1.6-3 2.2-6.2 4.2-8.2l6.9-6.9 4 4-6.9 6.9C10.2 17.8 7 18.4 4 20Z"/><path d="m13 5 4 4"/>',
    sigma: '<path d="M17.5 5.5H7l5.2 6.5L7 18.5h10.5"/>',
    flash: '<path d="M13 3 5.5 13.5H11L10 21l7.5-10.5H12z"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 1.8"/>',
    grid: '<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>',
    arrowRight: '<path d="M4 12h15"/><path d="m14 7 5 5-5 5"/>',
    send: '<path d="M20 4 4 11l7 2 2 7z"/><path d="M20 4 11 13"/>'
  };

  window.Icons = {
    names: Object.keys(P),
    svg: function (name, cls) {
      var body = P[name];
      if (!body) return '';
      return '<svg class="ico' + (cls ? ' ' + cls : '') + '" viewBox="0 0 24 24" fill="none" ' +
        'stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ' +
        'aria-hidden="true" focusable="false">' + body + '</svg>';
    },
    el: function (name, cls) {
      var wrap = document.createElement('span');
      wrap.innerHTML = this.svg(name, cls);
      return wrap.firstChild || document.createElement('span');
    }
  };
})();
