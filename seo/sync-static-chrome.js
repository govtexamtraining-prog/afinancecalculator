const fs = require('fs');
const path = require('path');
const { siteHeaderHtml, siteFooterHtml, siteChromeLinks } = require('./site-chrome');

const root = path.join(__dirname, '..');
const files = ['about.html', 'privacy.html', 'contact.html', 'terms.html', 'alternatives.html'];
const headerRe = /<!-- Header Navigation -->[\s\S]*?<\/header>/;
const headerRe2 = /<header[\s\S]*?<\/header>/;
const footerRe = /<!-- Footer -->[\s\S]*?<\/footer>/;
const footerRe2 = /<footer[\s\S]*?<\/footer>/;

for (const file of files) {
  const p = path.join(root, file);
  let html = fs.readFileSync(p, 'utf8');

  if (!html.includes('site-chrome.css')) {
    const links = siteChromeLinks();
    if (html.includes('href="css/styles.css"')) {
      html = html.replace(
        '<link rel="stylesheet" href="css/styles.css">',
        `<link rel="stylesheet" href="css/styles.css">\n    ${links}`
      );
    } else if (html.includes('</head>')) {
      html = html.replace('</head>', `    ${links}\n</head>`);
    }
  }

  if (headerRe.test(html)) html = html.replace(headerRe, siteHeaderHtml());
  else if (headerRe2.test(html)) html = html.replace(headerRe2, siteHeaderHtml());

  if (footerRe.test(html)) html = html.replace(footerRe, siteFooterHtml());
  else if (footerRe2.test(html)) html = html.replace(footerRe2, siteFooterHtml());

  fs.writeFileSync(p, html);
  console.log('updated', file, {
    header: html.includes('noir-header'),
    footer: html.includes('site-footer'),
    css: html.includes('site-chrome.css')
  });
}
