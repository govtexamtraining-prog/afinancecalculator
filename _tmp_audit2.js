const fs = require('fs');
const path = require('path');
const root = __dirname;
const issues = [];

// News articles on disk
const newsJson = JSON.parse(fs.readFileSync(path.join(root, 'data/wallet-news.json'), 'utf8'));
for (const item of newsJson.items || []) {
  const p = path.join(root, 'news', item.slug, 'index.html');
  if (!fs.existsSync(p)) issues.push('news missing: ' + item.slug);
}

// market-rates card hrefs
const rates = JSON.parse(fs.readFileSync(path.join(root, 'data/market-rates.json'), 'utf8'));
for (const c of (rates.rateBoard && rates.rateBoard.cards) || []) {
  const href = (c.href || '').replace(/^\//, '').replace(/\/$/, '');
  if (!href) continue;
  if (!fs.existsSync(path.join(root, href, 'index.html'))) issues.push('rateBoard href missing: ' + c.href);
}

// credit card CTAs
const cards = JSON.parse(fs.readFileSync(path.join(root, 'data/credit-cards.json'), 'utf8'));
for (const c of cards.cards || []) {
  const href = (c.ctaHref || '').replace(/^\//, '').replace(/\/$/, '');
  if (!href) continue;
  if (!fs.existsSync(path.join(root, href, 'index.html'))) issues.push('card cta missing: ' + c.ctaHref);
}

// index popular searches
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const pop = index.slice(index.indexOf('id="popular-searches"'), index.indexOf('</nav>', index.indexOf('id="popular-searches"')) + 6);
for (const m of pop.matchAll(/href="(\/[^"]+)"/g)) {
  const h = m[1];
  if (h.startsWith('/#')) continue;
  const p = h.replace(/^\//, '').replace(/\/$/, '');
  if (!fs.existsSync(path.join(root, p, 'index.html')) && !fs.existsSync(path.join(root, p))) {
    issues.push('popular search missing: ' + h);
  }
}

// Example chips truncated oddly (ending mid-number like "at 3.")
const lands = fs.readdirSync(root).filter((n) => n.endsWith('-calculator') || ['us-canada-banks'].includes(n));
const trunc = [];
for (const slug of lands) {
  const f = path.join(root, slug, 'index.html');
  if (!fs.existsSync(f)) continue;
  const html = fs.readFileSync(f, 'utf8');
  const chip = html.match(/class="example-chip">([^<]*)</);
  if (!chip) continue;
  const t = chip[1].trim();
  if (/\s(at|of|for|is)\s+\d+\.$/.test(t) || /\$\d+\.$/.test(t) || t.endsWith(' a.') || t.endsWith(' the.')) {
    trunc.push(slug + ' => ' + t);
  }
  if (t.length < 20) trunc.push(slug + ' short => ' + t);
}

// Sidebar tabs without href or with /# only that aren't insurance
const tabs = [...index.matchAll(/<a id="(tab-[^"]+)"[^>]*href="([^"]*)"/g)];
const weak = tabs.filter((m) => !m[2] || m[2] === '#' || m[2] === '/');
issues.push(...weak.map((m) => 'weak tab href: ' + m[1] + ' -> ' + m[2]));

// HT tabs injected - check inject uses goToCalculatorPage
const ht = fs.readFileSync(path.join(root, 'js/high-traffic-calcs.js'), 'utf8');
if (!ht.includes('goToCalculatorPage')) issues.push('HT tabs may not navigate to SEO pages');

// Landing iframe hash engines must match
const build = fs.readFileSync(path.join(root, 'seo/build-pages.js'), 'utf8');
const pages = [];
// rough extract objects
const re = /\{\s*slug:\s*'([^']+)',\s*engine:\s*'([^']+)'/g;
let m;
while ((m = re.exec(build))) pages.push({ slug: m[1], engine: m[2] });
for (const p of pages) {
  const f = path.join(root, p.slug, 'index.html');
  if (!fs.existsSync(f)) continue;
  const html = fs.readFileSync(f, 'utf8');
  if (!html.includes('#engine=' + p.engine) && !html.includes('engine=' + encodeURIComponent(p.engine))) {
    // check iframe src
    const iframe = html.match(/iframe src="([^"]+)"/);
    if (!iframe || !iframe[1].includes(p.engine)) {
      issues.push('landing iframe engine mismatch: ' + p.slug + ' expected ' + p.engine + ' got ' + (iframe && iframe[1]));
    }
  }
}

// Check openEngineFromQuery supports hash
const mech = fs.readFileSync(path.join(root, 'js/mechanics.js'), 'utf8');
const oeq = mech.slice(mech.indexOf('function openEngineFromQuery'), mech.indexOf('function openEngineFromQuery') + 2500);
if (!oeq.includes('location.hash') && !oeq.includes('hash')) issues.push('openEngineFromQuery may ignore #engine= hash');

// service worker registration
const growth = fs.readFileSync(path.join(root, 'js/growth.js'), 'utf8');
const hasSW = /serviceWorker/.test(growth) || /serviceWorker/.test(index) || fs.readdirSync(path.join(root, 'js')).some((f) => {
  try { return /serviceWorker/.test(fs.readFileSync(path.join(root, 'js', f), 'utf8')); } catch { return false; }
});
if (!hasSW) issues.push('No service worker registration found in js/ or index');

// site-chrome version vs a sample SEO page
const savings = fs.readFileSync(path.join(root, 'savings-calculator/index.html'), 'utf8');
if (savings.includes('afc-verticals.js?v=4')) issues.push('savings still on verticals v4');
if (savings.includes('afc-nerd.css?v=6') && !savings.includes('afc-nerd.css?v=7')) issues.push('savings still on nerd v6');

// Check dual category mismatch: investing compound listed under banking in sidebar
const compoundTab = index.match(/id="tab-compound"[^>]*data-cat="([^"]+)"/);
if (compoundTab && compoundTab[1] === 'banking') {
  issues.push('note: tab-compound data-cat=banking (also under Investing mega-nav) — filterCategory banking shows it, investing filter hides it');
}

console.log(JSON.stringify({ issues, truncChips: trunc, pageCount: pages.length }, null, 2));
