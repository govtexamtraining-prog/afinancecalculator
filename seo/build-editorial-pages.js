/**
 * Writes mortgage-rates-today, banking-rates, and compare-credit-cards pages.
 * Run: node seo/build-editorial-pages.js
 */
const fs = require('fs');
const path = require('path');
const { siteHeaderHtml, siteFooterHtml, siteChromeLinks } = require('./site-chrome');

const root = path.join(__dirname, '..');
const origin = 'https://afinancecalculator.com';

function shell(opts) {
  const {
    slug,
    title,
    description,
    body,
    extraScripts = '',
    bodyClass = 'afc-rates-static'
  } = opts;
  return `<!DOCTYPE html>
<html lang="en" class="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | aFinanceCalculator</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${origin}/${slug}/">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  ${siteChromeLinks()}
  <script src="/js/market-rates.js?v=1" defer></script>
  ${extraScripts}
</head>
<body class="${bodyClass}">
  ${siteHeaderHtml({ ctaHref: '/#calculators', ctaLabel: 'Calculate now' })}
  <main class="afc-rates-page">
    ${body}
  </main>
  ${siteFooterHtml()}
</body>
</html>
`;
}

const mortgage = shell({
  slug: 'mortgage-rates-today',
  title: 'Mortgage Rates Today — Editorial Board',
  description:
    'Editorial US mortgage rate board for 30-year, 15-year, and refinance planning. Not live lender quotes.',
  extraScripts: '<script src="/js/afc-rates-board.js?v=1" defer></script>',
  body: `
    <h1>Mortgage rates today</h1>
    <p class="afc-rates-lede">Planning benchmarks vs sample “best desk” purchase and refinance figures. Confirm every rate with a lender — this is not a live quote feed.</p>
    <p class="afc-rates-asof" data-afc-rates-asof></p>
    <div class="afc-rates-table-wrap">
      <table class="afc-rates-table">
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col">Best desk</th>
            <th scope="col">Desk avg</th>
            <th scope="col">National bench</th>
          </tr>
        </thead>
        <tbody id="afc-mortgage-rates-body"></tbody>
      </table>
    </div>
    <p class="afc-rates-disclaimer" data-afc-rates-disclaimer style="margin-top:16px"></p>
    <div class="afc-rates-page-actions">
      <a href="/mortgage-calculator/">Mortgage PITI calculator</a>
      <a href="/refinance-calculator/">Refinance break-even</a>
      <a href="/amortization-calculator/">Amortization schedule</a>
      <a href="/banking-rates/">Banking rates</a>
    </div>
  `
});

const banking = shell({
  slug: 'banking-rates',
  title: 'Banking Rates Today — HYSA, CD & Money Market',
  description:
    'Editorial high-yield savings, CD, and money-market rate board for planning. Not live bank offers.',
  extraScripts: '<script src="/js/afc-rates-board.js?v=1" defer></script>',
  body: `
    <h1>Banking rates today</h1>
    <p class="afc-rates-lede">Sample “best desk” APYs next to national-style averages for savings, CDs, and money-market accounts. Edit <code>data/market-rates.json</code> to refresh the board without code changes.</p>
    <p class="afc-rates-asof" data-afc-rates-asof></p>
    <div class="afc-rates-table-wrap">
      <table class="afc-rates-table">
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col">Best desk</th>
            <th scope="col">Desk avg</th>
            <th scope="col">National bench</th>
          </tr>
        </thead>
        <tbody id="afc-banking-rates-body"></tbody>
      </table>
    </div>
    <p class="afc-rates-disclaimer" data-afc-rates-disclaimer style="margin-top:16px"></p>
    <div class="afc-rates-page-actions">
      <a href="/savings-calculator/">HYSA / savings calculator</a>
      <a href="/cd-calculator/">CD calculator</a>
      <a href="/money-market-calculator/">Money market calculator</a>
      <a href="/mortgage-rates-today/">Mortgage rates today</a>
    </div>
  `
});

const cards = shell({
  slug: 'compare-credit-cards',
  title: 'Compare Credit Cards — Original Desk Notes',
  description:
    'Original aFinanceCalculator credit-card comparison desk. Not issuer offers and not NerdWallet reviews.',
  bodyClass: 'afc-rates-static afc-card-page',
  extraScripts: '<script src="/js/afc-card-compare.js?v=1" defer></script>',
  body: `
    <section id="afc-card-compare" class="afc-card-compare" style="border:0;padding:0;background:transparent" aria-label="Compare credit cards">
      <div class="afc-card-inner" style="width:100%;margin:0">
        <div class="afc-card-head">
          <div>
            <h1 id="afc-card-compare-title" style="font-size:clamp(1.6rem,3vw,2.1rem)">Compare credit cards</h1>
            <p id="afc-card-compare-dek">Original desk notes for planning — confirm terms on the issuer site before you apply.</p>
            <p class="afc-card-asof" data-afc-cards-asof></p>
          </div>
        </div>
        <div id="afc-card-filters" class="afc-card-filters" role="toolbar" aria-label="Filter cards">
          <button type="button" class="afc-card-filter is-active" data-filter="all">All</button>
          <button type="button" class="afc-card-filter" data-filter="cash-back">Cash back</button>
          <button type="button" class="afc-card-filter" data-filter="travel">Travel</button>
          <button type="button" class="afc-card-filter" data-filter="zero-apr">0% APR</button>
          <button type="button" class="afc-card-filter" data-filter="balance-transfer">Balance transfer</button>
        </div>
        <div id="afc-card-grid" class="afc-card-grid" aria-live="polite"></div>
        <div class="afc-rates-page-actions">
          <a href="/balance-transfer-calculator/">Balance transfer calculator</a>
          <a href="/credit-card-payoff-calculator/">Credit card payoff</a>
          <a href="/credit-utilization-calculator/">Credit utilization</a>
        </div>
      </div>
    </section>
  `
});

function writePage(slug, html) {
  const dir = path.join(root, slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  console.log('wrote', slug + '/index.html');
}

writePage('mortgage-rates-today', mortgage);
writePage('banking-rates', banking);
writePage('compare-credit-cards', cards);
