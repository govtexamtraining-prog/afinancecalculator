/**
 * Shared site header + footer markup for landings and static pages.
 * Keep in sync with index.html .noir-header / site footer pattern.
 */

function siteMegaNavHtml() {
  const item = (id, label, blurb, links) => {
    const grid = links
      .map(([href, text, engine]) => {
        const eng = engine
          ? ` data-afc-vertical="${id}" data-afc-engine="${engine}"`
          : '';
        return `<a href="${href}"${eng}>${text}</a>`;
      })
      .join('');
    return `<li class="afc-mega-item" data-vertical="${id}">
                    <button type="button" class="afc-mega-trigger" data-vertical="${id}" aria-expanded="false">${label}</button>
                    <div class="afc-mega-panel" hidden>
                        <p class="afc-mega-blurb">${blurb}</p>
                        <div class="afc-mega-grid">${grid}</div>
                    </div>
                </li>`;
  };

  return [
    item('credit-cards', 'Credit cards', 'Pay off balances, track utilization, and plan rewards-friendly debt moves.', [
      ['/compare-credit-cards/', 'Compare credit cards', null],
      ['/credit-card-payoff-calculator/', 'Credit card payoff', 'tab-creditcard'],
      ['/balance-transfer-calculator/', 'Balance transfer', 'tab-balancetransfer'],
      ['/credit-utilization-calculator/', 'Credit utilization', 'tab-creditscore'],
      ['/debt-snowball-calculator/', 'Debt snowball', 'tab-snowball'],
      ['/chase-credit-card-calculator/', 'Chase card desk', null]
    ]),
    item('banking', 'Banking', 'Compare HYSA / CD / money-market math and browse the U.S. &amp; Canada banking hub.', [
      ['/us-canada-banks/', 'US &amp; Canada banking hub', 'tab-banking-hub'],
      ['/savings-calculator/', 'HYSA / savings', 'tab-savings'],
      ['/cd-calculator/', 'CD calculator', 'tab-cd'],
      ['/money-market-calculator/', 'Money market', 'tab-moneymarket'],
      ['/banking-rates/', 'Banking rates today', null],
      ['/cd-ladder-calculator/', 'CD ladder APY', 'tab-cdladder']
    ]),
    item('home', 'Home', 'Mortgage payment, affordability, refinance, and home-equity tools.', [
      ['/mortgage-rates-today/', 'Mortgage rates today', null],
      ['/mortgage-calculator/', 'Mortgage / EMI', 'tab-mortgage'],
      ['/home-affordability-calculator/', 'Home affordability', 'tab-affordability'],
      ['/refinance-calculator/', 'Refinance', 'tab-refinance'],
      ['/rent-vs-buy-calculator/', 'Rent vs buy', 'tab-rentbuy'],
      ['/heloc-calculator/', 'HELOC', 'tab-heloc'],
      ['/closing-costs-calculator/', 'Closing costs', 'tab-closingcosts'],
      ['/biweekly-mortgage-calculator/', 'Bi-weekly mortgage', 'tab-biweekly'],
      ['/cash-on-cash-calculator/', 'Cash-on-cash', 'tab-cashoncash']
    ]),
    item('loans', 'Loans', 'Personal, auto, and student loan payment and refinance math.', [
      ['/personal-loan-calculator/', 'Personal loan', 'tab-personalloan'],
      ['/auto-loan-calculator/', 'Auto loan', 'tab-autoloan'],
      ['/auto-refinance-calculator/', 'Auto refinance', 'tab-autorefi'],
      ['/student-loan-calculator/', 'Student loan', 'tab-student'],
      ['/student-loan-refinance-calculator/', 'Student refinance', 'tab-studentrefi'],
      ['/car-lease-calculator/', 'Lease vs buy', 'tab-carlease'],
      ['/loan-calculator/', 'Generic loan EMI', null]
    ]),
    item('insurance', 'Insurance', 'Rough life / auto coverage planning and HSA tax-advantaged growth.', [
      ['/#engine-insurance', 'Insurance planning desk', 'tab-insurance'],
      ['/hsa-calculator/', 'HSA growth', 'tab-hsa'],
      ['/closing-costs-calculator/', 'Home closing costs', 'tab-closingcosts']
    ]),
    item('personal-finance', 'Personal finance', 'Budgets, pay conversion, inflation, and everyday money runway.', [
      ['/budget-calculator/', '50/30/20 budget', 'tab-budget'],
      ['/salary-calculator/', 'Hourly to salary', 'tab-salary'],
      ['/inflation-calculator/', 'Inflation', 'tab-inflation'],
      ['/severance-calculator/', 'Severance runway', 'tab-severance'],
      ['/ev-vs-gas-calculator/', 'EV vs gas', 'tab-evgas'],
      ['/debt-snowball-calculator/', 'Debt snowball', 'tab-snowball']
    ]),
    item('investing', 'Investing', 'Compounding, retirement, dividends, and portfolio growth engines.', [
      ['/compound-interest-calculator/', 'Compound interest', 'tab-compound'],
      ['/401k-calculator/', '401(k) &amp; Roth', 'tab-four01k'],
      ['/fire-calculator/', 'FIRE', 'tab-fire'],
      ['/dividend-calculator/', 'Dividend yield', 'tab-dividend'],
      ['/monthly-investment-calculator/', 'SIP / monthly', 'tab-sip'],
      ['/cagr-calculator/', 'CAGR', 'tab-cagr'],
      ['/stock-average-calculator/', 'Stock averaging', 'tab-stockavg'],
      ['/social-security-calculator/', 'Social Security', 'tab-socialsecurity']
    ]),
    item('small-business', 'Small business', 'Margins, break-even, invoices, and ecommerce unit economics.', [
      ['/break-even-calculator/', 'Break-even', 'tab-breakeven'],
      ['/profit-margin-calculator/', 'Profit margin', 'tab-margin'],
      ['/invoice-calculator/', 'Invoice &amp; tax', 'tab-invoice'],
      ['/ecommerce-margin-calculator/', 'Ecommerce margin', 'tab-dropship'],
      ['/roi-calculator/', 'ROI', 'tab-roi'],
      ['/airbnb-calculator/', 'Airbnb ROI', 'tab-airbnb'],
      ['/solar-calculator/', 'Solar ROI', 'tab-solar']
    ]),
    item('taxes', 'Taxes', 'Paycheck withholding, capital gains, quarterly estimates, and bonuses.', [
      ['/paycheck-calculator/', 'Paycheck', 'tab-paycheck'],
      ['/capital-gains-calculator/', 'Capital gains', 'tab-capitalgains'],
      ['/quarterly-tax-calculator/', 'Quarterly 1040-ES', 'tab-quarterlytax'],
      ['/bonus-tax-calculator/', 'Bonus tax', 'tab-bonustax'],
      ['/overtime-calculator/', 'Overtime pay', 'tab-overtime']
    ])
  ].join('\n                ');
}

function siteHeaderHtml(options = {}) {
  const ctaHref = options.ctaHref || '/#calculators';
  const ctaLabel = options.ctaLabel || 'Calculate now';
  return `<header class="noir-header afc-mega-header">
        <nav class="noir-pill afc-mega-nav" aria-label="Primary">
            <a class="noir-brand" href="/">
                <span class="brand-mark" aria-hidden="true">A</span>
                <span>aFinanceCalculator</span>
            </a>
            <button type="button" class="afc-mega-mobile-toggle" aria-expanded="false" aria-controls="afc-mega-drawer" aria-label="Open money topics menu">
                <span></span><span></span><span></span>
            </button>
            <ul class="afc-mega-links afc-mega-drawer" id="afc-mega-drawer">
                ${siteMegaNavHtml()}
                <li class="afc-mega-item afc-mega-item--static">
                    <a class="afc-mega-static" href="/news/">News</a>
                </li>
                <li class="afc-mega-item afc-mega-item--static">
                    <a class="afc-mega-static" href="/about.html">About</a>
                </li>
            </ul>
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
            <p>Free browser calculators for credit cards, banking, home, loans, insurance, investing, taxes, and small business. Numbers stay on this device.</p>
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
            <h3>Money topics</h3>
            <ul>
              <li><a href="/#calculators">Credit cards &amp; loans</a></li>
              <li><a href="/mortgage-calculator/">Home &amp; mortgage</a></li>
              <li><a href="/compound-interest-calculator/">Investing</a></li>
              <li><a href="/paycheck-calculator/">Taxes &amp; paycheck</a></li>
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
  return `<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/css/noir.css?v=1.0.9">
    <link rel="stylesheet" href="/css/site-chrome.css?v=2">
    <link rel="stylesheet" href="/css/afc-nerd.css?v=6">
    <link rel="stylesheet" href="/css/afc-rates.css?v=1">
    <script src="/js/afc-verticals.js?v=4" defer></script>
    <script src="/js/wallet-news.js?v=2" defer></script>`;
}

module.exports = {
  siteHeaderHtml,
  siteFooterHtml,
  siteChromeLinks,
  siteMegaNavHtml
};
