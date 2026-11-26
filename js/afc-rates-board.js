/**
 * Homepage + rates pages: "Find smarter rates today" editorial board.
 */
(function (global) {
  'use strict';

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function fmtPct(n) {
    if (typeof n !== 'number' || !isFinite(n)) return '—';
    return n.toFixed(2) + '%';
  }

  function cardHtml(c) {
    return (
      '<article class="afc-rates-card">' +
      '<h3 class="afc-rates-card-label">' + c.label + '</h3>' +
      '<div class="afc-rates-card-best">' +
      '<span class="afc-rates-card-best-label">' + (c.bestLabel || 'Best desk') + '</span>' +
      '<strong>' + fmtPct(c.best) + '</strong>' +
      '</div>' +
      '<div class="afc-rates-card-avg">' +
      '<span>' + (c.avgLabel || 'Average') + '</span>' +
      '<span>' + fmtPct(c.average) + '</span>' +
      '</div>' +
      '<a class="afc-rates-card-cta" href="' + (c.href || '#calculators') + '">' +
      (c.cta || 'Compare') +
      '</a></article>'
    );
  }

  function renderBoard(board, root) {
    if (!root || !board) return;
    var title = $('.afc-rates-title', root);
    var dek = $('.afc-rates-dek', root);
    var asOf = $('.afc-rates-asof', root);
    var grid = $('.afc-rates-grid', root);
    var all = $('.afc-rates-all', root);
    if (title && board.title) title.textContent = board.title;
    if (dek && board.dek) dek.textContent = board.dek;
    if (asOf) asOf.setAttribute('data-afc-rates-asof', '');
    if (all && board.viewAllHref) all.setAttribute('href', board.viewAllHref);
    if (grid) grid.innerHTML = (board.cards || []).map(cardHtml).join('');
  }

  function renderMortgageTable(data, root) {
    if (!root || !data) return;
    var us = (data.markets && data.markets.US) || {};
    var board = data.rateBoard || {};
    var byId = {};
    (board.cards || []).forEach(function (c) { byId[c.id] = c; });
    var rows = [
      ['30-year fixed purchase', byId.mortgage30, us.mortgage30],
      ['15-year fixed purchase', byId.mortgage15, us.mortgage15],
      ['30-year refinance', byId.refinance, us.refinance30]
    ];
    root.innerHTML = rows.map(function (r) {
      var card = r[1] || {};
      var bench = r[2] || {};
      return (
        '<tr><th scope="row">' + r[0] + '</th>' +
        '<td>' + fmtPct(card.best) + '</td>' +
        '<td>' + fmtPct(card.average != null ? card.average : bench.value) + '</td>' +
        '<td>' + fmtPct(bench.value) + '</td></tr>'
      );
    }).join('');
  }

  function renderBankingTable(data, root) {
    if (!root || !data) return;
    var us = (data.markets && data.markets.US) || {};
    var board = data.rateBoard || {};
    var byId = {};
    (board.cards || []).forEach(function (c) { byId[c.id] = c; });
    var rows = [
      ['High-yield savings', byId.savings, us.savingsApy],
      ['1-year CD', byId.cd, us.cd1y],
      ['Money market', byId['money-market'], us.moneyMarket]
    ];
    root.innerHTML = rows.map(function (r) {
      var card = r[1] || {};
      var bench = r[2] || {};
      return (
        '<tr><th scope="row">' + r[0] + '</th>' +
        '<td>' + fmtPct(card.best) + '</td>' +
        '<td>' + fmtPct(card.average) + '</td>' +
        '<td>' + fmtPct(bench.value) + '</td></tr>'
      );
    }).join('');
  }

  function applyAsOf(data) {
    document.querySelectorAll('[data-afc-rates-asof]').forEach(function (el) {
      el.textContent = data && data.asOf ? ('As of ' + data.asOf + ' (editorial)') : '';
    });
    var disc = data && data.disclaimer ? data.disclaimer : '';
    document.querySelectorAll('[data-afc-rates-disclaimer]').forEach(function (el) {
      el.textContent = disc;
    });
  }

  function initWith(data) {
    if (!data) return;
    applyAsOf(data);
    var home = $('#afc-rates-board');
    if (home && data.rateBoard) renderBoard(data.rateBoard, home);
    var mortBody = $('#afc-mortgage-rates-body');
    if (mortBody) renderMortgageTable(data, mortBody);
    var bankBody = $('#afc-banking-rates-body');
    if (bankBody) renderBankingTable(data, bankBody);
  }

  function boot() {
    function go(data) { initWith(data); }
    if (global.MarketRates && typeof global.MarketRates.load === 'function') {
      global.MarketRates.load().then(function (board) {
        go(board || (global.MarketRates.getBoard && global.MarketRates.getBoard()));
      });
    } else {
      fetch('/data/market-rates.json', { credentials: 'same-origin' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(go)
        .catch(function () {});
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  global.AfcRatesBoard = { renderBoard: renderBoard, initWith: initWith };
})(typeof window !== 'undefined' ? window : this);
