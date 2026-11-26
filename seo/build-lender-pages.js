/**
 * Phase 2 — SEO pages per bank × product, e.g. /chase-mortgage-calculator/
 * Run: node seo/build-lender-pages.js
 * Also invoked from seo/build-pages.js
 */
const fs = require('fs');
const path = require('path');
const { siteHeaderHtml, siteFooterHtml, siteChromeLinks } = require('./site-chrome');

const root = path.join(__dirname, '..');
const origin = 'https://afinancecalculator.com';

// Load catalog in Node (IIFE attaches to global)
require('../js/lender-catalog.js');
const catalog = global.LENDER_CATALOG || globalThis.LENDER_CATALOG;

const VERTICAL_SEO = {
  mortgage: { product: 'mortgage', engine: 'tab-mortgage', h1Suffix: 'mortgage calculator', titleSuffix: 'Mortgage Calculator', note: 'home payment and amortization estimate' },
  auto: { product: 'auto-loan', engine: 'tab-autoloan', h1Suffix: 'auto loan calculator', titleSuffix: 'Auto Loan Calculator', note: 'car payment estimate' },
  personal: { product: 'personal-loan', engine: 'tab-personalloan', h1Suffix: 'personal loan calculator', titleSuffix: 'Personal Loan Calculator', note: 'personal loan payment estimate' },
  cards: { product: 'credit-card', engine: 'tab-creditcard', h1Suffix: 'credit card payoff calculator', titleSuffix: 'Credit Card Payoff Calculator', note: 'payoff timeline estimate' },
  student: { product: 'student-loan', engine: 'tab-student', h1Suffix: 'student loan calculator', titleSuffix: 'Student Loan Calculator', note: 'student loan payment estimate' },
  deposits: { product: 'cd-savings', engine: 'tab-cdladder', h1Suffix: 'CD and savings calculator', titleSuffix: 'CD & Savings Calculator', note: 'deposit growth estimate' },
  wealth: { product: 'retirement', engine: 'tab-four01k', h1Suffix: 'retirement growth calculator', titleSuffix: 'Retirement Calculator', note: '401(k)-style growth estimate' },
  payroll: { product: 'paycheck', engine: 'tab-paycheck', h1Suffix: 'paycheck calculator', titleSuffix: 'Paycheck Calculator', note: 'take-home pay estimate with payroll banking context' }
};

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');
}

/** Brand token for URL: Chase → chase, Wells Fargo → wells-fargo, Bank of America → bank-of-america */
function brandSlug(lender) {
  const map = {
    'us-chase-home': 'chase',
    'us-chase-auto': 'chase',
    'us-chase-sl': 'chase',
    'us-chase-card': 'chase',
    'us-chase-checking': 'chase',
    'us-chase-biz': 'chase',
    'us-chase-savings': 'chase',
    'us-wells-home': 'wells-fargo',
    'us-wells-auto': 'wells-fargo',
    'us-wells-checking': 'wells-fargo',
    'us-bofa-home': 'bank-of-america',
    'us-bofa-checking': 'bank-of-america',
    'us-bofa-biz': 'bank-of-america',
    'us-capitalone-auto': 'capital-one',
    'us-capitalone-card': 'capital-one',
    'us-capitalone-360': 'capital-one',
    'us-capitalone-checking': 'capital-one',
    'us-ally-auto': 'ally',
    'us-ally-deposit': 'ally',
    'ca-rbc-mortgage': 'rbc',
    'ca-td-mortgage': 'td',
    'ca-scotiabank-mortgage': 'scotiabank',
    'ca-bmo-mortgage': 'bmo',
    'gb-hsbc': 'hsbc',
    'in-sbi': 'sbi',
    'in-hdfc': 'hdfc'
  };
  if (map[lender.id]) return map[lender.id];
  return slugify(lender.shortName);
}

function buildLenderPageList() {
  const pages = [];
  const seen = new Set();

  function push(lender, verticalId, maxRank) {
    if (!lender.verticals.includes(verticalId)) return;
    if (lender.rank > maxRank) return;
    const seo = VERTICAL_SEO[verticalId];
    if (!seo) return;
    const slug = `${brandSlug(lender)}-${seo.product}-calculator`;
    if (seen.has(slug)) return;
    seen.add(slug);
    pages.push({
      slug,
      lenderId: lender.id,
      lenderName: lender.name,
      shortName: lender.shortName,
      market: lender.market,
      verticalId,
      engine: seo.engine,
      product: seo.product,
      rank: lender.rank,
      sampleRate: lender.sampleRate,
      title: `${lender.shortName} ${seo.titleSuffix}`,
      h1: `${lender.shortName} ${seo.h1Suffix}`,
      note: `Unofficial ${seo.note} styled for ${lender.name}. Default sample rate ${lender.sampleRate != null ? lender.sampleRate + '%' : 'is editable'}. Not affiliated with ${lender.shortName}.`
    });
  }

  // US: ranks 1–3 for core money products (SEO + discovery)
  catalog.LENDERS.filter((l) => l.market === 'US').forEach((lender) => {
    ['mortgage', 'auto', 'personal', 'cards', 'student', 'deposits', 'wealth', 'payroll'].forEach((v) => {
      push(lender, v, 3);
    });
  });

  // Canada mortgages ranks 1–4; other CA products rank 1–2
  catalog.LENDERS.filter((l) => l.market === 'CA').forEach((lender) => {
    push(lender, 'mortgage', 4);
    ['auto', 'personal', 'payroll', 'deposits'].forEach((v) => push(lender, v, 2));
  });

  // Global flagship mortgage / retail (rank 1 only)
  catalog.LENDERS.filter((l) => ['GB', 'IN', 'AU', 'EU', 'SG', 'AE'].includes(l.market)).forEach((lender) => {
    push(lender, 'mortgage', 1);
    push(lender, 'personal', 1);
  });

  return pages.sort((a, b) => a.slug.localeCompare(b.slug));
}

function currencyForMarket(market) {
  const m = catalog.MARKETS[market];
  return m ? m.currency : 'USD';
}

function pageHtml(page) {
  const url = `${origin}/${page.slug}/`;
  const marketLabel = (catalog.MARKETS[page.market] || {}).label || page.market;
  const marketQuery = String(page.market || 'US').toLowerCase();
  const iframeSrc = `/index.html?engine=${encodeURIComponent(page.engine)}&lender=${encodeURIComponent(page.lenderId)}&landing=1&market=${encodeURIComponent(marketQuery)}`;
  const relatedGeneric = page.verticalId === 'mortgage'
    ? '/mortgage-calculator/'
    : page.verticalId === 'auto'
      ? '/auto-loan-calculator/'
      : page.verticalId === 'personal'
        ? '/personal-loan-calculator/'
        : page.verticalId === 'cards'
          ? '/credit-card-payoff-calculator/'
          : page.verticalId === 'payroll'
            ? '/paycheck-calculator/'
            : '/';

  const siblings = buildLenderPageList()
    .filter((p) => p.verticalId === page.verticalId && p.slug !== page.slug && p.market === page.market)
    .slice(0, 6);

  const schema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: `${page.title} | aFinanceCalculator`,
        description: page.note,
        isPartOf: { '@id': `${origin}/#website` }
      },
      {
        '@type': 'WebApplication',
        '@id': `${url}#app`,
        name: page.title,
        url,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: currencyForMarket(page.market) },
        description: page.note
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
          { '@type': 'ListItem', position: 2, name: page.h1, item: url }
        ]
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: `Is this an official ${page.shortName} calculator?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: `No. This is an unofficial planning tool on aFinanceCalculator styled for ${page.lenderName}. It is not affiliated with or endorsed by ${page.shortName}.`
            }
          },
          {
            '@type': 'Question',
            name: `Are the ${page.shortName} rates live?`,
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'No. Sample rates come from an editorial rate board you can edit in the calculator. Confirm any offer directly with the institution.'
            }
          }
        ]
      }
    ]
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(page.title)} | aFinanceCalculator</title>
    <meta name="description" content="${escapeHtml(page.note)}">
    <link rel="canonical" href="${url}">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
    <meta name="theme-color" content="#07080a">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url}">
    <meta property="og:title" content="${escapeHtml(page.title)}">
    <meta property="og:description" content="${escapeHtml(page.note)}">
    <meta property="og:image" content="${origin}/og-image.png">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(page.title)}">
    <meta name="twitter:description" content="${escapeHtml(page.note)}">
    <meta name="twitter:image" content="${origin}/og-image.png">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
    ${siteChromeLinks()}
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
    <style>
      :root { color-scheme: dark; --bg:#07080a; --ink:#f4f4f5; --muted:#a1a1aa; --line:rgba(255,255,255,.1); --cyan:#67e8f9; }
      * { box-sizing: border-box; }
      body {
        margin: 0; min-height: 100vh; color: var(--ink);
        background:
          radial-gradient(ellipse 70% 45% at 10% -10%, rgba(34,211,238,.14), transparent 55%),
          var(--bg);
        font-family: "Plus Jakarta Sans", system-ui, sans-serif;
      }
      .wrap { width: min(1400px, calc(100% - 28px)); margin: 0 auto; }
      .hero { padding: 18px 0 10px; max-width: 46rem; }
      .meta { color: var(--muted); font-size: 12px; font-weight: 600; margin: 0 0 10px; }
      h1 { margin: 0 0 10px; font-size: clamp(1.8rem, 4vw, 2.8rem); font-weight: 800; letter-spacing: -.045em; line-height: 1.05; }
      .lede { margin: 0; color: #d4d4d8; font-size: 16px; line-height: 1.5; }
      .chip {
        display: inline-block; margin-top: 12px; padding: 7px 11px; border-radius: 999px;
        border: 1px solid rgba(103,232,249,.28); background: rgba(8,47,58,.55);
        color: #a5f3fc; font-size: 12px; font-weight: 600;
        font-family: "JetBrains Mono", ui-monospace, monospace;
      }
      .tool { margin: 12px 0 24px; }
      .tool-frame {
        border: 1px solid var(--line); border-radius: 20px; overflow: hidden;
        background: rgba(12,14,18,.92); box-shadow: 0 24px 60px rgba(0,0,0,.35);
      }
      iframe { display: block; width: 100%; height: min(88vh, 1080px); min-height: 760px; border: 0; background: #07080a; }
      .below { padding: 4px 0 24px; }
      .related { display: flex; flex-wrap: wrap; gap: 10px 16px; list-style: none; margin: 0 0 18px; padding: 0; }
      .related a { color: #e4e4e7; font-size: 14px; font-weight: 600; border-bottom: 1px solid rgba(103,232,249,.35); text-decoration: none; }
      .related-label { width: 100%; color: var(--muted); font-size: 11px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
      .legal {
        margin: 0; padding: 12px 14px; border-radius: 12px; border: 1px solid var(--line);
        background: rgba(19,18,23,.65); color: #a1a1aa; font-size: 12px; line-height: 1.5;
      }
      .legal a { color: var(--cyan); }
    </style>
</head>
<body>
  ${siteHeaderHtml({ ctaHref: '#calculator', ctaLabel: 'Use calculator' })}
  <div class="wrap">
    <section class="hero">
      <p class="meta">${escapeHtml(marketLabel)} · Rank #${page.rank} context · Unofficial · Free</p>
      <h1>${escapeHtml(page.h1)}</h1>
      <p class="lede">${escapeHtml(page.note)}</p>
      ${page.sampleRate != null ? `<p class="chip">Sample rate ${escapeHtml(String(page.sampleRate))}% · editable in the tool</p>` : ''}
    </section>
    <section class="tool" id="calculator">
      <div class="tool-frame">
        <iframe src="${iframeSrc}" title="${escapeHtml(page.h1)}" loading="eager"></iframe>
      </div>
    </section>
    <section class="below">
      <nav class="related" aria-label="Related bank calculators">
        <span class="related-label">Related ${escapeHtml(page.product)} tools</span>
        <a href="${relatedGeneric}">Generic ${escapeHtml(page.product)} calculator</a>
        ${siblings.map((s) => `<a href="/${s.slug}/">${escapeHtml(s.shortName)}</a>`).join('\n        ')}
        <a href="/">All calculators</a>
      </nav>
      <p class="legal">
        aFinanceCalculator is not affiliated with ${escapeHtml(page.lenderName)}.
        Deep link for this context:
        <a href="/index.html?engine=${encodeURIComponent(page.engine)}&amp;lender=${encodeURIComponent(page.lenderId)}">?lender=${escapeHtml(page.lenderId)}</a>.
        Rates are editorial samples from <a href="/data/market-rates.json">/data/market-rates.json</a>, not live lender APIs.
      </p>
    </section>
  </div>
  ${siteFooterHtml()}
</body>
</html>
`;
}

function writeLenderPages() {
  const pages = buildLenderPageList();
  for (const page of pages) {
    const dir = path.join(root, page.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), pageHtml(page));
  }
  const mapPath = path.join(root, 'js', 'lender-pages.js');
  const mapBody = pages.map((p) => `  ${JSON.stringify(p.lenderId + '::' + p.engine)}: ${JSON.stringify(p.slug)}`).join(',\n');
  fs.writeFileSync(mapPath, `window.LENDER_PAGES = {\n${mapBody}\n};\nwindow.LENDER_PAGE_LIST = ${JSON.stringify(pages.map((p) => ({ slug: p.slug, lenderId: p.lenderId, engine: p.engine, market: p.market, verticalId: p.verticalId })), null, 2)};\n`);
  return pages;
}

function appendLenderSitemap(pages) {
  const sitemapPath = path.join(root, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) return;
  let xml = fs.readFileSync(sitemapPath, 'utf8');
  const today = new Date().toISOString().slice(0, 10);
  const entries = pages.map((page) => `  <url>
    <loc>${origin}/${page.slug}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`).join('\n');
  // Remove prior lender block if re-run
  xml = xml.replace(/\n  <!-- lender-seo-pages -->[\s\S]*?<!-- \/lender-seo-pages -->\n/, '\n');
  xml = xml.replace('</urlset>', `  <!-- lender-seo-pages -->\n${entries}\n  <!-- /lender-seo-pages -->\n</urlset>`);
  fs.writeFileSync(sitemapPath, xml);
}

if (require.main === module) {
  const pages = writeLenderPages();
  appendLenderSitemap(pages);
  console.log('lender pages', pages.length);
} else {
  module.exports = { writeLenderPages, appendLenderSitemap, buildLenderPageList, brandSlug, VERTICAL_SEO };
}
