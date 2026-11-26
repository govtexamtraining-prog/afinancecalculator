/**
 * Original credit-card comparison board (not issuer offers / not NW reviews).
 */
(function (global) {
  'use strict';

  var state = { cards: [], filter: 'all' };

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function cardHtml(c) {
    return (
      '<article class="afc-card-tile" data-cats="' + (c.categories || []).join(' ') + '">' +
      '<div class="afc-card-tile-top">' +
      '<p class="afc-card-issuer">' + (c.issuer || '') + '</p>' +
      '<h3>' + c.name + '</h3>' +
      '<p class="afc-card-score">Desk score <strong>' + (c.score != null ? c.score.toFixed(1) : '—') + '</strong>/5</p>' +
      '</div>' +
      '<ul class="afc-card-facts">' +
      '<li><span>Rewards</span><strong>' + c.rewards + '</strong></li>' +
      '<li><span>Intro APR</span><strong>' + c.introApr + '</strong></li>' +
      '<li><span>Go-to APR</span><strong>' + c.apr + '</strong></li>' +
      '<li><span>Annual fee</span><strong>' + c.annualFee + '</strong></li>' +
      '</ul>' +
      '<p class="afc-card-highlight">' + c.highlight + '</p>' +
      '<a class="afc-card-cta" href="' + c.ctaHref + '">' + (c.ctaLabel || 'Open tool') + '</a>' +
      '</article>'
    );
  }

  function paint() {
    var grid = $('#afc-card-grid');
    if (!grid) return;
    var list = state.cards.filter(function (c) {
      if (state.filter === 'all') return true;
      return (c.categories || []).indexOf(state.filter) !== -1;
    });
    grid.innerHTML = list.map(cardHtml).join('');
    $all('.afc-card-filter').forEach(function (btn) {
      btn.classList.toggle('is-active', btn.getAttribute('data-filter') === state.filter);
    });
  }

  function bind() {
    var bar = $('#afc-card-filters');
    if (!bar || bar.dataset.bound === '1') return;
    bar.dataset.bound = '1';
    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('.afc-card-filter');
      if (!btn) return;
      state.filter = btn.getAttribute('data-filter') || 'all';
      paint();
    });
  }

  function init(data) {
    if (!data) return;
    state.cards = data.cards || [];
    var title = $('#afc-card-compare-title');
    var dek = $('#afc-card-compare-dek');
    var asOf = $('[data-afc-cards-asof]');
    if (title && data.title) title.textContent = data.title;
    if (dek && data.dek) dek.textContent = data.dek;
    if (asOf && data.asOf) asOf.textContent = 'As of ' + data.asOf + ' (editorial)';
    bind();
    paint();
  }

  function boot() {
    fetch('/data/credit-cards.json', { credentials: 'same-origin' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(init)
      .catch(function () {
        var root = $('#afc-card-compare');
        if (root) root.hidden = true;
      });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})(typeof window !== 'undefined' ? window : this);
