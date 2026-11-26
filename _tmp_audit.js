const fs = require('fs');
const path = require('path');
const root = __dirname;

function exists(p) {
  return fs.existsSync(path.join(root, p));
}

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    if (['node_modules', '.git', 'agent-tools'].includes(name)) continue;
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

const issues = [];
const notes = [];

// --- Calculators from build-pages ---
const build = fs.readFileSync(path.join(root, 'seo/build-pages.js'), 'utf8');
const pageSlugs = [...build.matchAll(/slug:\s*'([^']+)'/g)].map((m) => m[1]);
const pageEngines = [...build.matchAll(/engine:\s*'([^']+)'/g)].map((m) => m[1]);

const missingLanding = [];
for (const slug of pageSlugs) {
  if (!exists(path.join(slug, 'index.html'))) missingLanding.push(slug);
}
if (missingLanding.length) issues.push({ sev: 'high', msg: 'Missing landing pages', items: missingLanding });

// --- calculator-pages.js engines ---
const calcMap = fs.readFileSync(path.join(root, 'js/calculator-pages.js'), 'utf8');
const mapEngines = [...calcMap.matchAll(/"(tab-[^"]+)":\s*"([^"]+)"/g)].map((m) => ({ eng: m[1], slug: m[2] }));
const mapMissing = mapEngines.filter((e) => !exists(path.join(e.slug, 'index.html')));
if (mapMissing.length) issues.push({ sev: 'high', msg: 'CALCULATOR_BY_ENGINE points to missing pages', items: mapMissing });

// --- high-traffic engines ---
const ht = fs.readFileSync(path.join(root, 'js/high-traffic-calcs.js'), 'utf8');
const htIds = [...ht.matchAll(/id:\s*'([a-z0-9-]+)'/g)].map((m) => m[1]);
const htHrefs = [...ht.matchAll(/href:\s*'(\/[^']+\/)'/g)].map((m) => m[1]);
const htHrefMissing = htHrefs.filter((h) => !exists(path.join(h.replace(/^\//, '').replace(/\/$/, ''), 'index.html')));
if (htHrefMissing.length) issues.push({ sev: 'high', msg: 'HT href missing pages', items: htHrefMissing });

const htEngineMissingMap = htIds.filter((id) => {
  const tab = 'tab-' + id;
  return !calcMap.includes('"' + tab + '"');
});
if (htEngineMissingMap.length) issues.push({ sev: 'med', msg: 'HT engines missing from CALCULATOR_BY_ENGINE', items: htEngineMissingMap });

// --- index mega-nav hrefs ---
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const megaStart = index.indexOf('afc-mega-drawer');
const megaEnd = index.indexOf('</ul>', megaStart);
const mega = index.slice(megaStart, megaEnd);
const megaHrefs = [...mega.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
const megaMissing = [];
for (const h of megaHrefs) {
  if (h.startsWith('/#') || h.startsWith('#') || h.startsWith('http')) continue;
  const p = h.replace(/^\//, '').replace(/\/$/, '');
  if (p.endsWith('.html')) {
    if (!exists(p)) megaMissing.push(h);
  } else if (!exists(path.join(p, 'index.html')) && !exists(p + '.html')) {
    megaMissing.push(h);
  }
}
if (megaMissing.length) issues.push({ sev: 'high', msg: 'Mega-nav missing targets', items: megaMissing });

// --- engines referenced in mega vs DOM ---
const megaEngines = [...mega.matchAll(/data-afc-engine="([^"]+)"/g)].map((m) => m[1]).filter(Boolean);
const tabIdsInIndex = [...index.matchAll(/id="(tab-[a-z0-9-]+)"/g)].map((m) => m[1]);
const engineIdsInIndex = [...index.matchAll(/id="(engine-[a-z0-9-]+)"/g)].map((m) => m[1]);
const htEngineIds = htIds.map((id) => 'engine-' + id);
const allEngines = new Set([...engineIdsInIndex, ...htEngineIds]);
const megaEngineMissingDom = megaEngines.filter((tab) => {
  if (!tab) return false;
  const eng = tab.replace('tab-', 'engine-');
  // banking hub special
  if (tab === 'tab-banking-hub') return !index.includes('id="tab-banking-hub"') && !index.includes('engine-banking');
  return !allEngines.has(eng) && !tabIdsInIndex.includes(tab);
});
if (megaEngineMissingDom.length) issues.push({ sev: 'med', msg: 'Mega engines with no tab/engine in home+HT', items: [...new Set(megaEngineMissingDom)] });

// --- sitemap vs pages ---
const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>https:\/\/afinancecalculator\.com(\/[^<]*)<\/loc>/g)].map((m) => m[1]);
const sitemapMissing = [];
for (const u of sitemapUrls) {
  if (u === '/') continue;
  const p = u.replace(/^\//, '').replace(/\/$/, '');
  if (p.endsWith('.html')) {
    if (!exists(p)) sitemapMissing.push(u);
  } else if (!exists(path.join(p, 'index.html')) && !exists(p + '.html')) {
    sitemapMissing.push(u);
  }
}
if (sitemapMissing.length) issues.push({ sev: 'high', msg: 'Sitemap URLs missing on disk', items: sitemapMissing });

const editorial = ['mortgage-rates-today/', 'banking-rates/', 'compare-credit-cards/', 'money-market-calculator/', 'news/'];
for (const e of editorial) {
  if (!sitemap.includes('/' + e.replace(/\/$/, '') + '/') && !sitemap.includes('/' + e)) {
    issues.push({ sev: 'med', msg: 'Editorial path maybe absent from sitemap', items: [e] });
  }
}

// --- data files ---
for (const f of ['data/market-rates.json', 'data/credit-cards.json', 'data/wallet-news.json']) {
  if (!exists(f)) issues.push({ sev: 'high', msg: 'Missing data file', items: [f] });
  else {
    try { JSON.parse(fs.readFileSync(path.join(root, f), 'utf8')); }
    catch (err) { issues.push({ sev: 'high', msg: 'Invalid JSON ' + f, items: [String(err.message)] }); }
  }
}

// --- script version skew on index ---
const scriptVers = [...index.matchAll(/src="([^"]+\.js\?v=[^"]+)"/g)].map((m) => m[1]);
notes.push({ msg: 'index script tags', items: scriptVers });

// --- SW precache vs files ---
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const cacheName = (sw.match(/CACHE_NAME\s*=\s*'([^']+)'/) || [])[1];
const assets = [...sw.matchAll(/'\.\/([^']+)'/g)].map((m) => m[1]);
const swMissing = assets.filter((a) => a !== '' && !exists(a.replace(/\/$/, '/index.html').replace(/\/index\.html$/, (m, o, s) => {
  // directories ending /
  return a.endsWith('/') ? a + 'index.html' : a;
}))).filter((a) => {
  if (a.endsWith('/')) return !exists(a + 'index.html') && !exists(a);
  return !exists(a);
});
if (swMissing.length) issues.push({ sev: 'med', msg: 'SW precache paths missing', items: swMissing });
notes.push({ msg: 'CACHE_NAME', items: [cacheName] });

// --- isHomePath present ---
const vert = fs.readFileSync(path.join(root, 'js/afc-verticals.js'), 'utf8');
if (!vert.includes('isHomePath')) issues.push({ sev: 'high', msg: 'afc-verticals missing isHomePath fix', items: [] });
if (/\/\\\/\(index\\.html\)\?\$\//.test(vert) || vert.includes('/\\/(index\\.html)?$/')) {
  // old buggy pattern still?
  if (vert.includes('/\\/(index\\.html)?$/.test(location.pathname)')) {
    issues.push({ sev: 'high', msg: 'Old buggy onHome regex still present', items: [] });
  }
}

// --- page-copy coverage for HT ---
const pageCopy = fs.readFileSync(path.join(root, 'seo/page-copy.js'), 'utf8');
const htSlugs = htHrefs.map((h) => h.replace(/\//g, '')).filter(Boolean);
// better parse
const htSlugList = [...ht.matchAll(/href:\s*'\/([^']+)\/'/g)].map((m) => m[1]);
const missingCopy = htSlugList.filter((s) => !pageCopy.includes("'" + s + "'") && !pageCopy.includes('"' + s + '"'));
if (missingCopy.length) notes.push({ msg: 'HT pages without page-copy entry (generic FAQ fallback)', items: missingCopy });

// --- usageImageSrc unused? ---
if (build.includes('function usageImageSrc') && !build.includes('usageImageSrc(')) {
  notes.push({ msg: 'usageImageSrc defined but unused in build-pages', items: ['dead code'] });
} else if (build.includes('function usageImageSrc')) {
  const calls = [...build.matchAll(/usageImageSrc\(/g)].length;
  notes.push({ msg: 'usageImageSrc call count', items: [String(calls)] });
}

// --- truncated example chips ---
const moneyMarket = exists('money-market-calculator/index.html')
  ? fs.readFileSync(path.join(root, 'money-market-calculator/index.html'), 'utf8')
  : '';
if (moneyMarket.includes('at 3.</p>') || /example-chip">[^<]{0,40} at 3\.<\/p>/.test(moneyMarket)) {
  issues.push({ sev: 'low', msg: 'Truncated example chip on money-market landing', items: [] });
}

// --- duplicate afc-rates.css links ---
const mort = fs.readFileSync(path.join(root, 'mortgage-rates-today/index.html'), 'utf8');
const ratesCssCount = (mort.match(/afc-rates\.css/g) || []).length;
if (ratesCssCount > 1) issues.push({ sev: 'low', msg: 'Duplicate afc-rates.css on mortgage-rates-today', items: [String(ratesCssCount)] });

// --- wallet news articles ---
try {
  const news = JSON.parse(fs.readFileSync(path.join(root, 'data/wallet-news.json'), 'utf8'));
  const arts = news.articles || news.items || news;
  const list = Array.isArray(arts) ? arts : (arts.articles || []);
  const newsMissing = [];
  for (const a of list) {
    const slug = a.slug || a.href || a.url;
    if (!slug) continue;
    const rel = String(slug).replace(/^\//, '').replace(/\/$/, '');
    if (rel.startsWith('news/') || !rel.includes('/')) {
      const p = rel.startsWith('news/') ? rel : path.join('news', rel);
      if (!exists(path.join(p, 'index.html')) && !exists(p + '.html') && !exists(p)) newsMissing.push(rel);
    }
  }
  if (newsMissing.length) issues.push({ sev: 'med', msg: 'wallet-news articles missing pages', items: newsMissing });
} catch (e) {
  issues.push({ sev: 'med', msg: 'wallet-news parse/check failed', items: [e.message] });
}

// --- verticals.js vs site-chrome vs index link drift ---
const siteChrome = fs.readFileSync(path.join(root, 'seo/site-chrome.js'), 'utf8');
const indexHasMM = index.includes('/money-market-calculator/');
const chromeHasMM = siteChrome.includes('/money-market-calculator/');
const vertHasMM = vert.includes('/money-market-calculator/');
if (!(indexHasMM && chromeHasMM && vertHasMM)) {
  issues.push({ sev: 'med', msg: 'money-market link drift across nav sources', items: [
    'index=' + indexHasMM, 'chrome=' + chromeHasMM, 'verticals=' + vertHasMM
  ]});
}

// --- check tab click handlers use goToCalculatorPage ---
const mechanics = fs.readFileSync(path.join(root, 'js/mechanics.js'), 'utf8');
if (!mechanics.includes('goToCalculatorPage')) issues.push({ sev: 'high', msg: 'mechanics missing goToCalculatorPage', items: [] });

// --- sample landing has new hero-copy styles ---
const profit = fs.readFileSync(path.join(root, 'profit-margin-calculator/index.html'), 'utf8');
if (profit.includes('position: absolute; inset: 0 -4%') || profit.includes('hero-bg')) {
  issues.push({ sev: 'med', msg: 'profit-margin still has old overlay hero', items: [] });
}
if (!profit.includes('--land-ink')) issues.push({ sev: 'med', msg: 'profit-margin missing new landing styles', items: [] });

// --- check for empty data-afc-engine ---
if (index.includes('data-afc-engine=""')) issues.push({ sev: 'low', msg: 'Empty data-afc-engine attrs in index', items: [] });

console.log(JSON.stringify({ issues, notes, counts: {
  pageSlugs: pageSlugs.length,
  mapEngines: mapEngines.length,
  htIds: htIds.length,
  megaHrefs: megaHrefs.length,
  sitemapUrls: sitemapUrls.length
}}, null, 2));
