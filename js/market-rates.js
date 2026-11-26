/**
 * Editorial / public-benchmark rate board loader.
 * Fetches /data/market-rates.json (same-origin) and merges into LENDER_CATALOG samples.
 * Does NOT scrape bank websites or claim live lender APIs.
 */
(function () {
  'use strict';

  var board = null;
  var readyPromise = null;

  function catalog() {
    return window.LENDER_CATALOG;
  }

  function applyBoard(data) {
    board = data;
    var cat = catalog();
    if (!cat || !data || !data.lenders) return board;
    Object.keys(data.lenders).forEach(function (id) {
      var row = data.lenders[id];
      var lender = cat.getLenderById(id);
      if (lender && row && typeof row.sampleRate === 'number') {
        lender.sampleRate = row.sampleRate;
        lender.rateAsOf = data.asOf;
      }
    });
    return board;
  }

  function load() {
    if (readyPromise) return readyPromise;
    readyPromise = fetch('data/market-rates.json', { credentials: 'same-origin' })
      .then(function (res) {
        if (!res.ok) throw new Error('market-rates ' + res.status);
        return res.json();
      })
      .then(applyBoard)
      .catch(function () {
        // Fallback: try root-absolute path (SEO landings / iframes)
        return fetch('/data/market-rates.json', { credentials: 'same-origin' })
          .then(function (res) {
            if (!res.ok) throw new Error('market-rates abs ' + res.status);
            return res.json();
          })
          .then(applyBoard)
          .catch(function () {
            board = null;
            return null;
          });
      });
    return readyPromise;
  }

  function benchmarkFor(verticalId, market) {
    if (!board || !board.verticalBenchmark || !board.markets) return null;
    var keyMap = board.verticalBenchmark[verticalId];
    if (!keyMap) return null;
    var key = keyMap[market] || keyMap.US;
    if (!key) return null;
    var marketBlock = board.markets[market] || board.markets.US;
    if (!marketBlock || !marketBlock[key]) return null;
    return Object.assign({ key: key, market: market }, marketBlock[key]);
  }

  window.MarketRates = {
    load: load,
    getBoard: function () { return board; },
    benchmarkFor: benchmarkFor,
    applyBoard: applyBoard
  };
})();
