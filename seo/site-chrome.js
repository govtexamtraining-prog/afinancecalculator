/**
 * Shared site header + footer markup for landings and static pages.
 * Keep in sync with index.html .noir-header / site footer pattern.
 */

function siteHeaderHtml(options = {}) {
  const ctaHref = options.ctaHref || '/#calculators';
  const ctaLabel = options.ctaLabel || 'Calculate now';
  return `<header class="noir-header">
        <nav class="noir-pill" aria-label="Primary">
            <a class="noir-brand" href="/">
                <span class="brand-mark" aria-hidden="true">A</span>
                <span>aFinanceCalculator</span>
            </a>
            <div class="noir-links">
                <a href="/#calculators">Calculators</a>
                <a href="/#calculators">Tools</a>
                <a href="/about.html">About</a>
                <a href="/contact.html">Support</a>
            </div>
            <a class="noir-cta" href="${ctaHref}">${ctaLabel}</a>
        </nav>
    </header>`;
}

function siteFooterHtml() {
  return `<footer class="site-footer">
      <div class="site-footer-inner">
        <div class="site-footer-grid">
          <div>
            <a class="site-footer-brand" href="/">
              <span class="brand-mark" aria-hidden="true">A</span>
              <span>a<span>Finance</span>Calculator</span>
            </a>
            <p>Free browser calculators for mortgages, paychecks, loans, and investing. Numbers stay on this device.</p>
          </div>
          <div>
            <h3>Legal</h3>
            <ul>
              <li><a href="/privacy.html">Privacy Policy</a></li>
              <li><a href="/terms.html">Terms of Service</a></li>
              <li><a href="/privacy.html#cookies">Cookie Policy</a></li>
              <li><a href="/terms.html#disclaimer">Financial Disclaimer</a></li>
            </ul>
          </div>
          <div>
            <h3>Company</h3>
            <ul>
              <li><a href="/about.html">About</a></li>
              <li><a href="/alternatives.html">vs Calculator.net &amp; Bankrate</a></li>
              <li><a href="/contact.html">Contact Support</a></li>
              <li><a href="/sitemap.xml">XML Sitemap</a></li>
            </ul>
          </div>
          <div>
            <h3>Popular tools</h3>
            <ul>
              <li><a href="/mortgage-calculator/">Mortgage calculator</a></li>
              <li><a href="/compound-interest-calculator/">Compound interest</a></li>
              <li><a href="/paycheck-calculator/">Paycheck calculator</a></li>
              <li><a href="/loan-calculator/">Loan calculator</a></li>
            </ul>
          </div>
        </div>
        <div class="site-footer-note">
          <p>Educational math only. Not a lender quote, tax filing, or financial advice. &copy; 2026 aFinanceCalculator.</p>
          <nav aria-label="Footer links">
            <a href="/">Home</a>
            <a href="/privacy.html">Privacy</a>
            <a href="/terms.html">Terms</a>
            <a href="/contact.html">Contact</a>
            <a href="/about.html">About</a>
          </nav>
        </div>
      </div>
    </footer>`;
}

function siteChromeLinks() {
  return `<link rel="stylesheet" href="/css/noir.css?v=1.0.9">
    <link rel="stylesheet" href="/css/site-chrome.css?v=1">`;
}

module.exports = {
  siteHeaderHtml,
  siteFooterHtml,
  siteChromeLinks
};
