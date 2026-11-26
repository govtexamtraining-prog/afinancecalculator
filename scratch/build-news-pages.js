/**
 * Build /news/index.html and /news/<slug>/index.html from wallet-news.json
 */
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const data = JSON.parse(fs.readFileSync(path.join(root, 'data', 'wallet-news.json'), 'utf8'));

const chrome = (() => {
  try {
    return require('../seo/site-chrome.js');
  } catch (e) {
    return null;
  }
})();

function shell({ title, description, canonical, body }) {
  const header = chrome ? chrome.siteHeaderHtml({ ctaHref: '/#calculators' }) : '';
  const footer = chrome ? chrome.siteFooterHtml() : '';
  const links = chrome
    ? chrome.siteChromeLinks()
    : `<link rel="stylesheet" href="/css/afc-nerd.css?v=5">`;
  return `<!DOCTYPE html>
<html lang="en" class="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <meta name="description" content="${description}">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  ${links}
</head>
<body class="afc-news-page">
  ${header}
  <main class="afc-news-main">
    ${body}
  </main>
  ${footer}
  <script src="/js/afc-verticals.js?v=2" defer></script>
  <script src="/js/wallet-news.js?v=1" defer></script>
</body>
</html>`;
}

const newsDir = path.join(root, 'news');
fs.mkdirSync(newsDir, { recursive: true });

const indexBody = `
  <header class="afc-news-page-head">
    <p class="afc-wallet-news-kicker">aFinanceCalculator</p>
    <h1>${data.sectionTitle}</h1>
    <p>${data.sectionDek}</p>
  </header>
  <ul id="afc-wallet-news-list" class="afc-wallet-news-list"></ul>
`;

fs.writeFileSync(
  path.join(newsDir, 'index.html'),
  shell({
    title: 'News that impacts your wallet | aFinanceCalculator',
    description: data.sectionDek,
    canonical: 'https://afinancecalculator.com/news/',
    body: indexBody
  })
);

for (const item of data.items) {
  const dir = path.join(newsDir, item.slug);
  fs.mkdirSync(dir, { recursive: true });
  const body = `
  <article id="afc-wallet-news-article" class="afc-wallet-news-article" data-slug="${item.slug}">
    <p>Loading…</p>
  </article>
  `;
  fs.writeFileSync(
    path.join(dir, 'index.html'),
    shell({
      title: `${item.title} | aFinanceCalculator`,
      description: item.dek.replace(/"/g, '&quot;'),
      canonical: `https://afinancecalculator.com/news/${item.slug}/`,
      body
    })
  );
}

console.log('Built news index +', data.items.length, 'articles');
