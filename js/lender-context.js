/**
 * Lender context controller — bank/finance-branded calculator experience.
 * Phase 2: ?lender= deep links, shareable bank URLs, market-rates board.
 * Does not modify mechanics.js; wraps switchEngine after load.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'afc-lender-by-engine';
  var state = {
    market: 'US',
    engineId: 'tab-mortgage',
    lenderId: null,
    applySampleRate: true,
    fromUrl: false
  };

  function catalog() {
    return window.LENDER_CATALOG;
  }

  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn, { once: true });
    } else {
      fn();
    }
  }

  function loadPrefs() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') || {};
    } catch (e) {
      return {};
    }
  }

  function savePref(engineId, lenderId) {
    try {
      var prefs = loadPrefs();
      prefs[engineId] = lenderId;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch (e) { /* private mode */ }
  }

  function queryParams() {
    try {
      return new URLSearchParams(window.location.search);
    } catch (e) {
      return new URLSearchParams();
    }
  }

  function lenderIdFromUrl() {
    var params = queryParams();
    return (params.get('lender') || params.get('bank') || '').trim() || null;
  }

  function resolveMarket() {
    var cat = catalog();
    if (!cat) return 'US';
    var params = queryParams();
    var marketParam = (params.get('market') || '').toLowerCase();
    if (marketParam === 'ca' || marketParam === 'canada') return 'CA';
    if (marketParam === 'us' || marketParam === 'usa') return 'US';
    if (marketParam === 'gb' || marketParam === 'uk') return 'GB';
    if (marketParam === 'in' || marketParam === 'india') return 'IN';

    var code = (typeof currentCurrencyCode !== 'undefined' && currentCurrencyCode)
      ? currentCurrencyCode
      : (document.getElementById('global-currency') || {}).value || 'USD';
    return cat.marketFromCurrency(code);
  }

  function activeEngine() {
    if (typeof activeEngineId !== 'undefined' && activeEngineId) return activeEngineId;
    return state.engineId || 'tab-mortgage';
  }

  function alignCurrencyToMarket(market) {
    var cat = catalog();
    if (!cat || !cat.MARKETS[market]) return;
    var currency = cat.MARKETS[market].currency;
    var select = document.getElementById('global-currency');
    if (select && select.value !== currency) {
      select.value = currency;
      if (typeof setGlobalCurrency === 'function') {
        try { setGlobalCurrency(currency); } catch (e) { /* optional */ }
      } else {
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  }

  function resolveLender(engineId, market) {
    var cat = catalog();
    if (!cat) return null;
    var verticalId = cat.verticalForEngine(engineId);
    var urlId = lenderIdFromUrl();
    if (urlId) {
      var fromUrl = cat.getLenderById(urlId);
      if (fromUrl && verticalId && fromUrl.verticals.indexOf(verticalId) !== -1) {
        state.fromUrl = true;
        return fromUrl;
      }
      // URL lender valid but wrong vertical — still honor if same market product family missing
      if (fromUrl && fromUrl.market === market) {
        state.fromUrl = true;
        return fromUrl;
      }
    }
    state.fromUrl = false;
    var prefs = loadPrefs();
    var preferred = prefs[engineId] ? cat.getLenderById(prefs[engineId]) : null;
    if (preferred && preferred.market === market && verticalId && preferred.verticals.indexOf(verticalId) !== -1) {
      return preferred;
    }
    return cat.defaultLender(engineId, market);
  }

  function setCssVars(lender) {
    var root = document.documentElement;
    if (!lender || !lender.brand) {
      root.removeAttribute('data-lender-variant');
      root.style.removeProperty('--lender-primary');
      root.style.removeProperty('--lender-accent');
      root.style.removeProperty('--lender-soft');
      root.style.removeProperty('--lender-ink');
      return;
    }
    root.setAttribute('data-lender-variant', lender.variant || 'us-blue');
    root.style.setProperty('--lender-primary', lender.brand.primary);
    root.style.setProperty('--lender-accent', lender.brand.accent);
    root.style.setProperty('--lender-soft', lender.brand.soft);
    root.style.setProperty('--lender-ink', lender.brand.ink);
  }

  function applySampleRates(engineId, lender) {
    if (!state.applySampleRate || !lender || lender.sampleRate == null) return;
    var cat = catalog();
    var verticalId = cat.verticalForEngine(engineId);
    var vertical = verticalId ? cat.VERTICALS[verticalId] : null;
    if (!vertical || !vertical.rateFields) return;
    var fields = vertical.rateFields[engineId] || [];
    fields.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el || el.dataset.userEdited === '1') return;
      el.value = lender.sampleRate;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  function markRateFieldsEditable(engineId) {
    var cat = catalog();
    if (!cat) return;
    var verticalId = cat.verticalForEngine(engineId);
    var vertical = verticalId ? cat.VERTICALS[verticalId] : null;
    if (!vertical || !vertical.rateFields) return;
    var fields = vertical.rateFields[engineId] || [];
    fields.forEach(function (id) {
      var el = document.getElementById(id);
      if (!el || el.dataset.lenderBound === '1') return;
      el.dataset.lenderBound = '1';
      el.addEventListener('input', function () {
        el.dataset.userEdited = '1';
      });
    });
  }

  function seoSlugFor(lenderId, engineId) {
    if (!window.LENDER_PAGES) return null;
    return window.LENDER_PAGES[lenderId + '::' + engineId] || null;
  }

  function buildDeepLink(lender, engineId) {
    var url = new URL(window.location.href);
    // Prefer pretty SEO path when available and we are on homepage-style URL
    var pretty = seoSlugFor(lender.id, engineId);
    if (pretty && (url.pathname === '/' || /index\.html$/i.test(url.pathname))) {
      return url.origin + '/' + pretty + '/';
    }
    url.searchParams.set('engine', engineId);
    url.searchParams.set('lender', lender.id);
    if (lender.market === 'CA') url.searchParams.set('market', 'ca');
    else if (lender.market === 'US') url.searchParams.set('market', 'us');
    else url.searchParams.set('market', lender.market.toLowerCase());
    url.hash = '';
    return url.toString();
  }

  function writeUrlLender(lender, engineId) {
    try {
      var url = new URL(window.location.href);
      if (!lender) {
        url.searchParams.delete('lender');
        url.searchParams.delete('bank');
      } else {
        url.searchParams.set('lender', lender.id);
        if (lender.market === 'CA') url.searchParams.set('market', 'ca');
      }
      if (engineId) url.searchParams.set('engine', engineId);
      window.history.replaceState({}, '', url.pathname + url.search + url.hash);
    } catch (e) { /* ignore */ }
  }

  function updateBenchmarkChip(verticalId, market) {
    var el = document.getElementById('lender-context-benchmark');
    var wrap = document.getElementById('lender-context-benchmark-wrap');
    if (!el) return;
    var bench = window.MarketRates && window.MarketRates.benchmarkFor
      ? window.MarketRates.benchmarkFor(verticalId, market)
      : null;
    if (!bench || typeof bench.value !== 'number') {
      if (wrap) wrap.hidden = true;
      else el.hidden = true;
      return;
    }
    if (wrap) wrap.hidden = false;
    el.hidden = false;
    el.textContent = Number(bench.value).toFixed(2) + '%';
    if (wrap) {
      wrap.title = (bench.label || 'Market benchmark') + (boardAsOf() ? ' · as of ' + boardAsOf() : '');
    }
  }

  function boardAsOf() {
    var b = window.MarketRates && window.MarketRates.getBoard && window.MarketRates.getBoard();
    return b && b.asOf ? b.asOf : '';
  }

  function renderBar(lender, engineId, market) {
    var bar = document.getElementById('lender-context-bar');
    if (!bar) return;
    var cat = catalog();
    var verticalId = cat ? cat.verticalForEngine(engineId) : null;

    if (!verticalId || engineId === 'tab-banking-hub') {
      bar.hidden = true;
      bar.classList.remove('is-active');
      document.body.classList.remove('has-lender-context');
      setCssVars(null);
      return;
    }

    var marketMeta = cat.MARKETS[market] || cat.MARKETS.US;
    var vertical = cat.VERTICALS[verticalId];
    var options = cat.lendersFor(engineId, market);
    // If URL lender is outside filtered list (cross-market), include it
    if (lender && !options.some(function (o) { return o.id === lender.id; })) {
      options = [lender].concat(options);
    }

    bar.hidden = false;
    bar.classList.add('is-active');
    document.body.classList.add('has-lender-context');
    bar.setAttribute('data-design-family', vertical.designFamily || 'loan-desk');

    var select = document.getElementById('lender-context-select');
    if (select) {
      select.innerHTML = options.map(function (l) {
        var selected = lender && l.id === lender.id ? ' selected' : '';
        return '<option value="' + l.id + '"' + selected + '>' +
          '#' + l.rank + ' · ' + l.name +
          '</option>';
      }).join('');
    }

    var nameEl = document.getElementById('lender-context-name');
    var productEl = document.getElementById('lender-context-product');
    var marketEl = document.getElementById('lender-context-market');
    var rateEl = document.getElementById('lender-context-rate');
    var rateWrap = document.getElementById('lender-context-rate-wrap');
    var rankEl = document.getElementById('lender-context-rank');
    var markEl = document.getElementById('lender-context-mark');

    if (nameEl) nameEl.textContent = lender ? lender.shortName : 'Top lender';
    if (productEl) productEl.textContent = lender ? (lender.product || vertical.label) : vertical.label;
    if (marketEl) marketEl.textContent = marketMeta.label;
    if (rateEl) {
      if (lender && lender.sampleRate != null) {
        rateEl.textContent = Number(lender.sampleRate).toFixed(2) + '%';
        if (rateWrap) rateWrap.hidden = false;
        rateEl.hidden = false;
      } else if (rateWrap) {
        rateWrap.hidden = true;
      } else {
        rateEl.hidden = true;
      }
    }
    if (rankEl) {
      rankEl.textContent = lender && lender.rank != null ? '#' + lender.rank : '—';
    }
    if (markEl) {
      markEl.textContent = lender ? (lender.shortName || 'A').charAt(0) : 'A';
    }
    if (lender && lender.variant) {
      bar.setAttribute('data-lender-variant', lender.variant);
    }

    var defaultNote = document.getElementById('lender-context-default-note');
    if (defaultNote) {
      var isDefault = lender && options[0] && lender.id === options[0].id && !loadPrefs()[engineId] && !state.fromUrl;
      defaultNote.hidden = !isDefault;
    }

    updateBenchmarkChip(verticalId, market);

    var linkInput = document.getElementById('lender-context-link');
    if (linkInput && lender) {
      linkInput.value = buildDeepLink(lender, engineId);
    }
  }

  function sync(opts) {
    opts = opts || {};
    var cat = catalog();
    if (!cat) return;

    state.market = resolveMarket();
    state.engineId = opts.engineId || activeEngine();
    var lender = opts.lender || resolveLender(state.engineId, state.market);
    state.lenderId = lender ? lender.id : null;

    if (lender && opts.alignCurrency !== false && (state.fromUrl || opts.forceCurrency)) {
      alignCurrencyToMarket(lender.market);
      state.market = lender.market;
    }

    setCssVars(lender);
    renderBar(lender, state.engineId, state.market);
    markRateFieldsEditable(state.engineId);

    if (opts.applyRate !== false) {
      applySampleRates(state.engineId, lender);
    }

    if (opts.writeUrl && lender) {
      writeUrlLender(lender, state.engineId);
    }

    var panel = document.getElementById(String(state.engineId).replace('tab-', 'engine-'));
    if (panel) {
      panel.setAttribute('data-lender-id', state.lenderId || '');
      panel.setAttribute('data-lender-variant', (lender && lender.variant) || '');
    }
  }

  function clearRateDirty(engineId) {
    var cat = catalog();
    var verticalId = cat.verticalForEngine(engineId);
    var vertical = verticalId ? cat.VERTICALS[verticalId] : null;
    if (!vertical || !vertical.rateFields || !vertical.rateFields[engineId]) return;
    vertical.rateFields[engineId].forEach(function (fid) {
      var el = document.getElementById(fid);
      if (el) el.dataset.userEdited = '0';
    });
  }

  function onSelectChange(event) {
    var id = event.target.value;
    var cat = catalog();
    var lender = cat.getLenderById(id);
    if (!lender) return;
    clearRateDirty(state.engineId);
    savePref(state.engineId, id);
    state.applySampleRate = true;
    state.fromUrl = true;
    sync({ lender: lender, applyRate: true, writeUrl: true, forceCurrency: true });
  }

  function copyDeepLink() {
    var lender = catalog().getLenderById(state.lenderId);
    if (!lender) return;
    var link = buildDeepLink(lender, state.engineId);
    var input = document.getElementById('lender-context-link');
    if (input) input.value = link;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(link).then(function () {
        if (typeof showToast === 'function') showToast('Bank calculator link copied');
        var btn = document.getElementById('lender-context-copy');
        if (btn) {
          var prev = btn.textContent;
          btn.textContent = 'Copied';
          window.setTimeout(function () { btn.textContent = prev; }, 1600);
        }
      });
    }
  }

  function wrapSwitchEngine() {
    if (typeof window.switchEngine !== 'function') return;
    if (window.switchEngine.__lenderWrapped) return;
    var original = window.switchEngine;
    function wrapped(tabOrEngineId, shouldScroll) {
      var result = original.apply(this, arguments);
      window.setTimeout(function () {
        sync({ engineId: activeEngine(), applyRate: true });
      }, 0);
      return result;
    }
    wrapped.__lenderWrapped = true;
    window.switchEngine = wrapped;
  }

  function wrapCurrency() {
    var select = document.getElementById('global-currency');
    if (!select || select.dataset.lenderBound === '1') return;
    select.dataset.lenderBound = '1';
    select.addEventListener('change', function () {
      window.setTimeout(function () {
        if (lenderIdFromUrl()) {
          sync({ applyRate: true });
          return;
        }
        var prefs = loadPrefs();
        delete prefs[activeEngine()];
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch (e) {}
        sync({ applyRate: true });
      }, 50);
    });
  }

  function initBarEvents() {
    var select = document.getElementById('lender-context-select');
    if (select && select.dataset.bound !== '1') {
      select.dataset.bound = '1';
      select.addEventListener('change', onSelectChange);
    }
    var resetBtn = document.getElementById('lender-context-reset');
    if (resetBtn && resetBtn.dataset.bound !== '1') {
      resetBtn.dataset.bound = '1';
      resetBtn.addEventListener('click', function () {
        var prefs = loadPrefs();
        delete prefs[state.engineId];
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch (e) {}
        clearRateDirty(state.engineId);
        state.fromUrl = false;
        writeUrlLender(null, state.engineId);
        sync({ applyRate: true });
      });
    }
    var copyBtn = document.getElementById('lender-context-copy');
    if (copyBtn && copyBtn.dataset.bound !== '1') {
      copyBtn.dataset.bound = '1';
      copyBtn.addEventListener('click', copyDeepLink);
    }
  }

  function boot() {
    if (!catalog()) return;
    initBarEvents();
    wrapSwitchEngine();
    wrapCurrency();
    window.setTimeout(wrapSwitchEngine, 100);
    window.setTimeout(wrapSwitchEngine, 600);

    var start = function () {
      // After mechanics openEngineFromQuery
      window.setTimeout(function () {
        var urlLender = lenderIdFromUrl();
        if (urlLender) {
          var lender = catalog().getLenderById(urlLender);
          if (lender) {
            savePref(activeEngine(), lender.id);
            sync({
              lender: lender,
              engineId: activeEngine(),
              applyRate: true,
              forceCurrency: true,
              writeUrl: false
            });
            return;
          }
        }
        sync({ applyRate: true });
      }, 80);
    };

    if (window.MarketRates && window.MarketRates.load) {
      window.MarketRates.load().finally(start);
    } else {
      start();
    }
  }

  ready(boot);

  window.LenderContext = {
    sync: sync,
    getState: function () { return Object.assign({}, state); },
    resolveMarket: resolveMarket,
    buildDeepLink: function () {
      var lender = catalog().getLenderById(state.lenderId);
      return lender ? buildDeepLink(lender, state.engineId) : '';
    },
    lenderIdFromUrl: lenderIdFromUrl
  };
})();
