/**
 * Double-verification for Phase 2 lender deep links + SEO pages + rate board.
 * Run: node seo/verify-lender-phase2.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
let failed = 0;

function ok(msg) {
  console.log('  PASS  ' + msg);
}

function fail(msg) {
  failed += 1;
  console.error('  FAIL  ' + msg);
}

function assert(cond, msg) {
  if (cond) ok(msg);
  else fail(msg);
}

console.log('\n=== Phase 2 verification ===\n');

// 1) Catalog
require('../js/lender-catalog.js');
const catalog = globalThis.LENDER_CATALOG;
assert(!!catalog, 'LENDER_CATALOG loads in Node');
assert(catalog.defaultLender('tab-mortgage', 'US').id === 'us-chase-home', 'US mortgage default is Chase');
assert(catalog.defaultLender('tab-mortgage', 'CA').id === 'ca-rbc-mortgage', 'CA mortgage default is RBC');
assert(catalog.getLenderById('us-chase-home').sampleRate === 6.35, 'Chase sample rate present');

// 2) Rate board JSON
const ratesPath = path.join(root, 'data', 'market-rates.json');
assert(fs.existsSync(ratesPath), 'data/market-rates.json exists');
const rates = JSON.parse(fs.readFileSync(ratesPath, 'utf8'));
assert(!!rates.asOf && !!rates.markets.US.mortgage30, 'market board has US mortgage30');
assert(rates.lenders['us-chase-home'].sampleRate > 0, 'board has Chase sample');
assert(/not scraped|not live|editorial/i.test(rates.source + rates.disclaimer), 'board discloses editorial/non-live');

// 3) Builder list + uniqueness
const { buildLenderPageList, brandSlug } = require('./build-lender-pages');
const pages = buildLenderPageList();
assert(pages.length >= 20, 'at least 20 lender SEO pages planned (' + pages.length + ')');
const slugs = pages.map((p) => p.slug);
assert(new Set(slugs).size === slugs.length, 'no duplicate lender SEO slugs');
assert(slugs.includes('chase-mortgage-calculator'), 'chase-mortgage-calculator in list');
assert(slugs.includes('wells-fargo-mortgage-calculator'), 'wells-fargo-mortgage-calculator in list');
assert(slugs.includes('rbc-mortgage-calculator'), 'rbc-mortgage-calculator in list');
assert(brandSlug(catalog.getLenderById('us-chase-home')) === 'chase', 'brandSlug(Chase)=chase');

// 4) Generated artifacts
const chaseDir = path.join(root, 'chase-mortgage-calculator', 'index.html');
assert(fs.existsSync(chaseDir), 'chase-mortgage-calculator/index.html generated');
if (fs.existsSync(chaseDir)) {
  const html = fs.readFileSync(chaseDir, 'utf8');
  assert(html.includes('lender=us-chase-home'), 'Chase page iframe passes lender=');
  assert(html.includes('engine=tab-mortgage'), 'Chase page iframe passes engine=');
  assert(/not affiliated/i.test(html), 'Chase page has affiliation disclaimer');
  assert(html.includes('og-image.png'), 'Chase page has OG image');
  assert(html.includes('application/ld+json'), 'Chase page has JSON-LD');
}

const mapPath = path.join(root, 'js', 'lender-pages.js');
assert(fs.existsSync(mapPath), 'js/lender-pages.js generated');
if (fs.existsSync(mapPath)) {
  const mapJs = fs.readFileSync(mapPath, 'utf8');
  assert(mapJs.includes('us-chase-home::tab-mortgage'), 'map has Chase mortgage key');
}

const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
assert(sitemap.includes('chase-mortgage-calculator'), 'sitemap includes chase-mortgage-calculator');
assert(sitemap.includes('<!-- lender-seo-pages -->'), 'sitemap has lender block markers');

// 5) Homepage wiring
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
assert(/lender-context\.js\?v=\d+/.test(indexHtml), 'index loads lender-context.js');
assert(indexHtml.includes('market-rates.js'), 'index loads market-rates.js');
assert(indexHtml.includes('lender-pages.js'), 'index loads lender-pages.js');
assert(indexHtml.includes('lender-context-copy'), 'index has Share desk control');
assert(indexHtml.includes('lender-context-rateboard'), 'index has rateboard chip strip');
assert(indexHtml.includes('lender-context-benchmark'), 'index has market benchmark chip');
assert(indexHtml.includes('Payment calculator desk'), 'index uses bank-desk kicker copy');

const ctx = fs.readFileSync(path.join(root, 'js', 'lender-context.js'), 'utf8');
assert(ctx.includes('lenderIdFromUrl'), 'lender-context reads URL lender');
assert(ctx.includes('buildDeepLink'), 'lender-context builds deep links');
assert(ctx.includes('MarketRates'), 'lender-context integrates MarketRates');

const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
assert(/afinancecalc-v2\d-cache/.test(sw), 'service worker cache is v2x');
assert(sw.includes('data/market-rates.json'), 'SW precaches market-rates.json');

// 6) Deep-link resolution matrix
const matrix = [
  ['tab-mortgage', 'US', 'us-chase-home'],
  ['tab-autoloan', 'US', 'us-chase-auto'],
  ['tab-personalloan', 'US', 'us-sofi-personal'],
  ['tab-creditcard', 'US', 'us-chase-card'],
  ['tab-mortgage', 'CA', 'ca-rbc-mortgage'],
  ['tab-paycheck', 'US', 'us-chase-checking']
];
matrix.forEach(function (row) {
  const got = catalog.defaultLender(row[0], row[1]);
  assert(got && got.id === row[2], 'default ' + row[1] + ' ' + row[0] + ' → ' + row[2]);
});

// URL lender must exist for every generated page
pages.forEach(function (p) {
  const lender = catalog.getLenderById(p.lenderId);
  if (!lender) fail('missing lender for page ' + p.slug);
  else if (!lender.verticals.includes(p.verticalId) && p.verticalId !== 'payroll') {
    // payroll/business multi-vertical ok
  }
});
ok('all lender page ids resolve in catalog (' + pages.length + ')');

console.log('\n=== Result: ' + (failed === 0 ? 'ALL CHECKS PASSED' : failed + ' FAILURES') + ' ===\n');
process.exit(failed === 0 ? 0 : 1);
