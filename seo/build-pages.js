/**
 * Writes one indexable page per real calculator, the sitemap, and the
 * crawlable calculator index on the home page.
 * Run from the site root: node seo/build-pages.js
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const origin = 'https://afinancecalculator.com';

function monthlyPayment(principal, annualPercent, years) {
  const r = annualPercent / 100 / 12;
  const n = years * 12;
  const m = principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  return Math.round(m * 100) / 100;
}

function money(amount, symbol) {
  return symbol + amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const usMortgage = money(monthlyPayment(360000, 6.2, 30), '$');
const caMortgage = money(monthlyPayment(480000, 4.5, 25), 'C$');

/** @type {{slug:string, engine:string, title:string, h1:string, region:'us'|'ca'|'shared', note:string, example?:string, related?:string[]}[]} */
const pages = [
  { slug: 'mortgage-calculator', engine: 'tab-mortgage', title: 'Mortgage Payment Calculator', h1: 'Mortgage payment calculator', region: 'us', note: 'Principal and interest only, compounded monthly. Taxes, insurance, and mortgage insurance are not included.', example: `A $450,000 home with $90,000 down at 6.2% for 30 years is ${usMortgage} a month.`, related: ['biweekly-mortgage-calculator', 'refinance-calculator', 'canada-mortgage-calculator'] },
  { slug: 'canada-mortgage-calculator', engine: 'tab-mortgage', title: 'Canada Mortgage Payment Calculator', h1: 'Canada mortgage payment calculator', region: 'ca', note: 'This is principal and interest, compounded monthly. Many Canadian mortgages compound semi-annually. CMHC or Sagen insurance and the federal stress test are not included.', example: `A C$600,000 home with C$120,000 down at 4.5% for 25 years is ${caMortgage} a month on this monthly schedule.`, related: ['mortgage-calculator', 'us-canada-banks'] },
  { slug: 'biweekly-mortgage-calculator', engine: 'tab-biweekly', title: 'Biweekly Mortgage Calculator', h1: 'Biweekly mortgage calculator', region: 'shared', note: 'Compares a monthly payment with 26 half-payments a year. It does not include taxes, insurance, or a lender’s biweekly fee.', related: ['mortgage-calculator', 'refinance-calculator'] },
  { slug: 'refinance-calculator', engine: 'tab-refinance', title: 'Mortgage Refinance Calculator', h1: 'Mortgage refinance calculator', region: 'shared', note: 'Compares the payment you have with a new rate and term. Closing costs are the amount you enter. It is not a lender quote.', related: ['mortgage-calculator', 'biweekly-mortgage-calculator'] },
  { slug: 'rent-vs-buy-calculator', engine: 'tab-rentbuy', title: 'Rent vs Buy Calculator', h1: 'Rent vs buy calculator', region: 'shared', note: 'Compares five years of rent with principal, interest, and a sale cost you can read on the page. It is not a full cost of owning, and it leaves out repairs, tax, and insurance unless you add them in the fields provided.', related: ['mortgage-calculator', 'home-affordability-calculator'] },
  { slug: 'home-affordability-calculator', engine: 'tab-affordability', title: 'Home Affordability Calculator', h1: 'Home affordability calculator', region: 'us', note: 'Estimates a purchase price from income, debts, and the housing share you set. It is not a Canadian mortgage stress test and it is not a lender pre-approval.', related: ['mortgage-calculator', 'closing-costs-calculator'] },
  { slug: 'heloc-calculator', engine: 'tab-heloc', title: 'HELOC Payment Calculator', h1: 'HELOC payment calculator', region: 'shared', note: 'Estimates interest on the balance you enter. A home-equity line’s real rate and draw rules come from the lender.', related: ['mortgage-calculator', 'refinance-calculator'] },
  { slug: 'closing-costs-calculator', engine: 'tab-closingcosts', title: 'Closing Cost Calculator', h1: 'Closing cost calculator', region: 'us', note: 'Adds the fee amounts you enter for a US-style closing. It does not calculate Canadian land transfer tax or title insurance.', related: ['mortgage-calculator', 'home-affordability-calculator'] },
  { slug: 'cap-rate-calculator', engine: 'tab-caprate', title: 'Cap Rate Calculator', h1: 'Cap rate calculator', region: 'shared', note: 'Net operating income divided by price. It does not subtract the mortgage payment.', related: ['cash-on-cash-calculator', 'airbnb-calculator'] },
  { slug: 'cash-on-cash-calculator', engine: 'tab-cashoncash', title: 'Cash on Cash Return Calculator', h1: 'Cash on cash return calculator', region: 'shared', note: 'Annual cash flow after the mortgage payment, divided by the cash you put in. Vacancy and repairs are only what you enter.', related: ['cap-rate-calculator', 'rent-vs-buy-calculator'] },
  { slug: 'airbnb-calculator', engine: 'tab-airbnb', title: 'Airbnb ROI Calculator', h1: 'Airbnb income calculator', region: 'shared', note: 'Nightly rate times the occupancy you enter, minus the mortgage and operating costs you enter. It is not a forecast of bookings.', related: ['cash-on-cash-calculator', 'cap-rate-calculator'] },
  { slug: 'compound-interest-calculator', engine: 'tab-compound', title: 'Compound Interest Calculator', h1: 'Compound interest calculator', region: 'shared', note: 'Growth compounded once a year at the rate you enter. It is not a market forecast.', related: ['cagr-calculator', 'inflation-calculator'] },
  { slug: 'cagr-calculator', engine: 'tab-cagr', title: 'CAGR Calculator', h1: 'CAGR calculator', region: 'shared', note: 'The annual rate that connects a starting value to an ending value over the years you enter.', related: ['compound-interest-calculator', 'real-return-calculator'] },
  { slug: 'simple-interest-calculator', engine: 'tab-interest', title: 'Simple Interest Calculator', h1: 'Simple interest calculator', region: 'shared', note: 'Interest = principal × rate × time. The rate is not compounded.', related: ['compound-interest-calculator'] },
  { slug: 'dividend-calculator', engine: 'tab-dividend', title: 'Dividend Yield Calculator', h1: 'Dividend yield calculator', region: 'shared', note: 'Annual dividend divided by price. It does not predict whether the dividend continues.', related: ['stock-average-calculator', 'compound-interest-calculator'] },
  { slug: 'stock-average-calculator', engine: 'tab-stockavg', title: 'Stock Average Cost Calculator', h1: 'Stock average cost calculator', region: 'shared', note: 'Combines the share lots you enter into one average cost.', related: ['dividend-calculator', 'capital-gains-calculator'] },
  { slug: 'monthly-investment-calculator', engine: 'tab-sip', title: 'Monthly Investment Calculator', h1: 'Monthly investment calculator', region: 'shared', note: 'A fixed contribution each month at the annual rate you enter, compounded on the schedule labeled in the tool.', related: ['compound-interest-calculator', 'fire-calculator'] },
  { slug: 'inflation-calculator', engine: 'tab-inflation', title: 'Inflation Calculator', h1: 'Inflation calculator', region: 'shared', note: 'Shows what today’s amount is worth later at the inflation rate you enter. It is not a CPI forecast for the US or Canada.', related: ['real-return-calculator', 'compound-interest-calculator'] },
  { slug: 'real-return-calculator', engine: 'tab-realreturns', title: 'Real Return Calculator', h1: 'Real return calculator', region: 'shared', note: 'Uses the Fisher effect on the nominal return and inflation rate you enter.', related: ['inflation-calculator', 'cagr-calculator'] },
  { slug: 'cd-ladder-calculator', engine: 'tab-cdladder', title: 'CD Ladder Calculator', h1: 'CD ladder calculator', region: 'us', note: 'US certificate-of-deposit rungs at the rates you enter. This is not a Canadian GIC ladder, and the rates are not live bank quotes.', related: ['compound-interest-calculator'] },
  { slug: 'fire-calculator', engine: 'tab-fire', title: 'FIRE Calculator', h1: 'FIRE calculator', region: 'shared', note: 'Years until the portfolio covers annual spending at the growth rate you enter, using a 4% withdrawal target. It is not a retirement-income guarantee.', related: ['401k-calculator', 'compound-interest-calculator'] },
  { slug: '401k-calculator', engine: 'tab-four01k', title: '401(k) Calculator', h1: '401(k) calculator', region: 'us', note: 'US employee deferral, capped at the 2026 limit used in this tool, plus an employer match. This is not an RRSP or TFSA calculator.', related: ['fire-calculator', 'paycheck-calculator'] },
  { slug: 'rmd-calculator', engine: 'tab-rmd', title: 'RMD Calculator', h1: 'Required minimum distribution calculator', region: 'us', note: 'US IRA required distribution from the IRS Uniform Lifetime table for ages 72 through 120. It is not Canadian RRIF minimum-withdrawal math.', related: ['401k-calculator', 'social-security-calculator'] },
  { slug: 'social-security-calculator', engine: 'tab-socialsecurity', title: 'Social Security Calculator', h1: 'Social Security calculator', region: 'us', note: 'Compares US claiming ages from the benefit amount you enter. It does not look up your Social Security statement, and it is not Canada Pension Plan or OAS.', related: ['rmd-calculator', 'fire-calculator'] },
  { slug: 'hsa-calculator', engine: 'tab-hsa', title: 'HSA Calculator', h1: 'HSA calculator', region: 'us', note: 'US health savings account growth, capped at the limit used in this tool. It is not a Canadian HSA or FHSA.', related: ['401k-calculator'] },
  { slug: 'paycheck-calculator', engine: 'tab-paycheck', title: 'US Paycheck Calculator', h1: 'US paycheck calculator', region: 'us', note: 'Social Security and Medicare use the 2026 employee rates and wage base in this tool. Federal and state income tax are the percentages you enter. This is not a Canadian payroll or provincial-tax calculator.', related: ['salary-calculator', 'bonus-tax-calculator'] },
  { slug: 'capital-gains-calculator', engine: 'tab-capitalgains', title: 'Capital Gains Calculator', h1: 'Capital gains calculator', region: 'shared', note: 'Gain times the tax rate you enter. The field starts at 15%. It does not apply Canada’s capital-gains inclusion rate or US tax brackets on its own.', related: ['stock-average-calculator', 'dividend-calculator'] },
  { slug: 'quarterly-tax-calculator', engine: 'tab-quarterlytax', title: 'Self-Employment Tax Calculator', h1: 'US self-employment tax calculator', region: 'us', note: 'Estimates US self-employment tax at 15.3% and a federal percentage you enter, then divides the year by four. It is not a CRA instalment calculator.', related: ['paycheck-calculator', 'invoice-calculator'] },
  { slug: 'overtime-calculator', engine: 'tab-overtime', title: 'Overtime Pay Calculator', h1: 'Overtime pay calculator', region: 'shared', note: 'Multiplies the hourly wage you enter by 1.5 or 2. It does not decide whether US or Canadian overtime law applies to the job.', related: ['salary-calculator', 'paycheck-calculator'] },
  { slug: 'bonus-tax-calculator', engine: 'tab-bonustax', title: 'Bonus Tax Calculator', h1: 'US bonus withholding calculator', region: 'us', note: 'Uses US supplemental withholding rates, then Social Security and Medicare. A 401(k) deferral does not reduce those payroll taxes here. It is not Canadian bonus tax.', related: ['paycheck-calculator'] },
  { slug: 'severance-calculator', engine: 'tab-severance', title: 'Severance Pay Calculator', h1: 'US severance calculator', region: 'us', note: 'Withholds US supplemental tax and employee FICA from the lump sum you enter. Unemployment benefits are not added to the runway.', related: ['paycheck-calculator', 'budget-calculator'] },
  { slug: 'debt-snowball-calculator', engine: 'tab-snowball', title: 'Debt Snowball vs Avalanche Calculator', h1: 'Debt snowball and avalanche calculator', region: 'shared', note: 'Two debts, a 36-month minimum, and the extra payment you enter. Snowball pays the smaller balance first. Avalanche pays the higher rate first.', related: ['credit-card-payoff-calculator', 'personal-loan-calculator'] },
  { slug: 'credit-card-payoff-calculator', engine: 'tab-creditcard', title: 'Credit Card Payoff Calculator', h1: 'Credit card payoff calculator', region: 'shared', note: 'Months and interest to clear the balance at the APR and payment you enter.', related: ['debt-snowball-calculator', 'credit-utilization-calculator'] },
  { slug: 'auto-loan-calculator', engine: 'tab-autoloan', title: 'Auto Loan Calculator', h1: 'Auto loan calculator', region: 'shared', note: 'Monthly principal and interest for the amount, rate, and term you enter. Tax, title, and dealer fees are not added unless they are already in the amount.', related: ['auto-refinance-calculator', 'car-lease-calculator'] },
  { slug: 'auto-refinance-calculator', engine: 'tab-autorefi', title: 'Auto Refinance Calculator', h1: 'Auto refinance calculator', region: 'shared', note: 'Compares the current payment with a new rate and term. It is not a lender offer.', related: ['auto-loan-calculator'] },
  { slug: 'car-lease-calculator', engine: 'tab-carlease', title: 'Car Lease vs Buy Calculator', h1: 'Car lease vs buy calculator', region: 'shared', note: 'Compares lease payments with a loan at the rate you enter. Taxes and fees are only what the fields include.', related: ['auto-loan-calculator'] },
  { slug: 'personal-loan-calculator', engine: 'tab-personalloan', title: 'Personal Loan Calculator', h1: 'Personal loan calculator', region: 'shared', note: 'Monthly payment and interest for the amount, rate, and term you enter.', related: ['debt-snowball-calculator', 'credit-card-payoff-calculator'] },
  { slug: 'student-loan-calculator', engine: 'tab-student', title: 'Student Loan Payoff Calculator', h1: 'Student loan payoff calculator', region: 'us', note: 'Payment and interest for the balance, rate, and term you enter. It is not a Canada Student Loan or RAP calculator.', related: ['student-loan-refinance-calculator'] },
  { slug: 'student-loan-refinance-calculator', engine: 'tab-studentrefi', title: 'Student Loan Refinance Calculator', h1: 'Student loan refinance vs PSLF calculator', region: 'us', note: 'Compares a private refinance payment with income-driven payments you describe on the page. PSLF is a US program. This is not a Canada Student Loan calculator, and it does not decide forgiveness.', related: ['student-loan-calculator'] },
  { slug: 'budget-calculator', engine: 'tab-budget', title: '50/30/20 Budget Calculator', h1: '50/30/20 budget calculator', region: 'shared', note: 'Splits take-home pay into 50% needs, 30% wants, and 20% savings. It is a planning split, not a budget you must follow.', related: ['paycheck-calculator', 'debt-snowball-calculator'] },
  { slug: 'credit-utilization-calculator', engine: 'tab-creditscore', title: 'Credit Utilization Calculator', h1: 'Credit utilization calculator', region: 'shared', note: 'Balance divided by limit, in percentage points. It does not estimate a FICO or Equifax score.', related: ['credit-card-payoff-calculator'] },
  { slug: 'invoice-calculator', engine: 'tab-invoice', title: 'Invoice Calculator', h1: 'Invoice calculator', region: 'shared', note: 'Hours times rate, plus the tax percent you enter. It does not file GST, HST, or sales tax.', related: ['quarterly-tax-calculator', 'profit-margin-calculator'] },
  { slug: 'roi-calculator', engine: 'tab-roi', title: 'ROI Calculator', h1: 'ROI calculator', region: 'shared', note: 'Return divided by the amount invested. The gain is the number you enter, not a projection.', related: ['cagr-calculator', 'profit-margin-calculator'] },
  { slug: 'break-even-calculator', engine: 'tab-breakeven', title: 'Break-Even Calculator', h1: 'Break-even calculator', region: 'shared', note: 'Fixed costs divided by the margin on each unit. It breaks even in units and in sales dollars.', related: ['profit-margin-calculator', 'invoice-calculator'] },
  { slug: 'profit-margin-calculator', engine: 'tab-margin', title: 'Profit Margin Calculator', h1: 'Profit margin calculator', region: 'shared', note: 'Price minus cost, as a margin and as a markup.', related: ['break-even-calculator', 'roi-calculator'] },
  { slug: 'salary-calculator', engine: 'tab-salary', title: 'Hourly to Salary Calculator', h1: 'Hourly to salary calculator', region: 'shared', note: 'Hourly wage times the hours and weeks you enter. It is gross pay, before tax.', related: ['paycheck-calculator', 'overtime-calculator'] },
  { slug: 'crypto-leverage-calculator', engine: 'tab-crypto', title: 'Crypto Leverage Calculator', h1: 'Crypto leverage calculator', region: 'shared', note: 'Position size and liquidation from the entry, leverage, and move you enter. It is not an exchange quote.', related: ['staking-calculator'] },
  { slug: 'staking-calculator', engine: 'tab-staking', title: 'Crypto Staking Calculator', h1: 'Crypto staking calculator', region: 'shared', note: 'Yield on the amount and rate you enter, with an impermanent-loss case from the price change you enter.', related: ['crypto-leverage-calculator'] },
  { slug: 'solar-calculator', engine: 'tab-solar', title: 'Solar Payback Calculator', h1: 'Solar payback calculator', region: 'shared', note: 'Years until the system cost is covered by the electric bill share you enter. Incentives are only the amount you type. It is not a US tax-credit determination.', related: ['ev-vs-gas-calculator'] },
  { slug: 'ev-vs-gas-calculator', engine: 'tab-evgas', title: 'EV vs Gas Calculator', h1: 'EV vs gas cost calculator', region: 'shared', note: 'Fuel cost from miles, gas price, MPG, electricity price, and EV efficiency. Insurance and depreciation are not included.', related: ['auto-loan-calculator', 'solar-calculator'] },
  { slug: 'ecommerce-margin-calculator', engine: 'tab-dropship', title: 'Ecommerce Margin Calculator', h1: 'Ecommerce margin calculator', region: 'shared', note: 'Sale price minus product cost, advertising, and the platform percent you enter.', related: ['profit-margin-calculator', 'roi-calculator'] },
  { slug: 'us-canada-banks', engine: 'tab-banking-hub', title: 'US and Canada Bank Directory', h1: 'US and Canada bank directory', region: 'shared', note: 'An editorial list of US and Canadian institutions. Yields are a snapshot, not a live quote, and the page does not open accounts.', related: ['cd-ladder-calculator', 'canada-mortgage-calculator'] }
];

const byEngine = {};
for (const page of pages) {
  if (!byEngine[page.engine]) byEngine[page.engine] = page.slug;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pageHtml(page) {
  const bySlug = Object.fromEntries(pages.map((item) => [item.slug, item]));
  const related = (page.related || [])
    .map((slug) => bySlug[slug])
    .filter(Boolean)
    .map((item) => `<a href="/${item.slug}/">${escapeHtml(item.h1)}</a>`)
    .join(' · ');
  const hreflang = page.slug === 'mortgage-calculator' || page.slug === 'canada-mortgage-calculator'
    ? `<link rel="alternate" hreflang="en-US" href="${origin}/mortgage-calculator/">
    <link rel="alternate" hreflang="en-CA" href="${origin}/canada-mortgage-calculator/">
    <link rel="alternate" hreflang="x-default" href="${origin}/mortgage-calculator/">`
    : '';
  const example = page.example ? `<p class="example">${escapeHtml(page.example)}</p>` : '';
  const regionLine = page.region === 'us'
    ? 'United States.'
    : page.region === 'ca'
      ? 'Canada.'
      : 'United States and Canada.';
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(page.title)} | aFinanceCalculator</title>
    <meta name="description" content="${escapeHtml(page.note)}">
    <link rel="canonical" href="${origin}/${page.slug}/">
    ${hreflang}
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="#171719">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <style>
        body { margin: 0; background: #171719; color: #fff; font-family: "Public Sans", system-ui, sans-serif; }
        header { padding: 20px 20px 12px; max-width: 980px; }
        a { color: #fff; }
        .brand { color: #8a8c92; font-size: 13px; text-decoration: none; }
        h1 { font-size: 26px; font-weight: 600; line-height: 1.2; margin: 10px 0 8px; }
        p { margin: 0 0 8px; color: #c8c8cc; font-size: 15px; line-height: 1.45; max-width: 68ch; }
        .meta { color: #8a8c92; font-size: 13px; }
        .example { color: #fff; font-variant-numeric: tabular-nums; }
        nav { font-size: 14px; }
        .top { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; padding: 12px 16px; }
        h1 { font-size: 22px; font-weight: 700; letter-spacing: -0.03em; line-height: 1.15; margin: 0; }
        iframe { display: block; width: 100%; height: calc(100vh - 52px); min-height: 680px; border: 0; background: #07080a; }
        section { padding: 28px 16px 48px; max-width: 720px; }
    </style>
</head>
<body>
    <header class="top">
        <h1>${escapeHtml(page.h1)}</h1>
        <a class="brand" href="/">All calculators</a>
    </header>
    <iframe src="/index.html?engine=${encodeURIComponent(page.engine)}&landing=1" title="${escapeHtml(page.h1)}"></iframe>
    <section>
        <p class="meta">${regionLine}</p>
        <p>${escapeHtml(page.note)}</p>
        ${example}
        <nav>${related}</nav>
    </section>
</body>
</html>
`;
}

function writePages() {
  for (const page of pages) {
    const dir = path.join(root, page.slug);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), pageHtml(page));
  }
}

function writeSitemap() {
  const today = '2026-11-02';
  const urls = [
    ['/', 'weekly', '1.0'],
    ...pages.map((page) => [`/${page.slug}/`, 'monthly', '0.8']),
    ['/about.html', 'monthly', '0.4'],
    ['/contact.html', 'yearly', '0.3'],
    ['/privacy.html', 'yearly', '0.2'],
    ['/terms.html', 'yearly', '0.2']
  ];
  const body = urls.map(([loc, freq, priority]) => `  <url>
    <loc>${origin}${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
  fs.writeFileSync(path.join(root, 'sitemap.xml'), xml);
}

function writeBrowserMap() {
  const lines = pages.map((page) => `  ${JSON.stringify(page.engine)}: ${JSON.stringify(page.slug)}`);
  // First slug wins per engine, which keeps the US mortgage page as the default link.
  const seen = new Set();
  const unique = [];
  for (const page of pages) {
    if (seen.has(page.engine)) continue;
    seen.add(page.engine);
    unique.push(`  ${JSON.stringify(page.engine)}: ${JSON.stringify(page.slug)}`);
  }
  fs.writeFileSync(path.join(root, 'js', 'calculator-pages.js'), `window.CALCULATOR_BY_ENGINE = {\n${unique.join(',\n')}\n};\n`);
  void lines;
}

function linkTabs(html) {
  const slugByEngine = {};
  for (const page of pages) {
    if (!slugByEngine[page.engine]) slugByEngine[page.engine] = page.slug;
  }
  return html.replace(/<button (id="(tab-[a-z0-9-]+)"[^>]*)>/g, (full, attrs, id) => {
    const slug = slugByEngine[id];
    if (!slug) return full;
    return `<a ${attrs} href="/${slug}/">`;
  }).replace(/id="(tab-[a-z0-9-]+)"([^>]*)>([^<]*)<\/button>/g, (full, id, rest, label) => {
    if (!slugByEngine[id]) return full;
    return `id="${id}"${rest}>${label}</a>`;
  });
}

function indexBlock() {
  const groups = [
    ['United States', pages.filter((page) => page.region === 'us')],
    ['Canada', pages.filter((page) => page.region === 'ca')],
    ['United States and Canada', pages.filter((page) => page.region === 'shared')]
  ];
  const columns = groups.map(([label, items]) => `<div>
                <h3>${label}</h3>
                <ul>
                    ${items.map((page) => `<li><a href="/${page.slug}/">${escapeHtml(page.h1)}</a></li>`).join('\n                    ')}
                </ul>
            </div>`).join('\n            ');
  return `<!-- seo-calculator-index -->
        <nav class="calculator-index" aria-label="Calculators">
            <h2>Calculators</h2>
            <p>Each calculator has its own page. Paycheck, 401(k), Social Security, HSA, and RMD pages use US rules. The Canada mortgage page uses monthly compounding and does not include CMHC insurance or the stress test.</p>
            ${columns}
        </nav>
        <!-- /seo-calculator-index -->`;
}

function patchHome() {
  const indexPath = path.join(root, 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');
  html = linkTabs(html);
  const start = html.indexOf('<!-- Master 120+ Financial Keyword Directory Grid -->');
  const end = html.indexOf('<footer', start);
  if (start === -1 || end === -1) throw new Error('Could not find the calculator directory.');
  const sectionClose = html.lastIndexOf('</section>', end);
  html = html.slice(0, start) + indexBlock() + '\n    </section>\n\n    ' + html.slice(end);
  if (sectionClose === -1) throw new Error('Could not find the section close.');
  fs.writeFileSync(indexPath, html);
}

writePages();
writeSitemap();
writeBrowserMap();
if (process.argv.includes('--home')) patchHome();
console.log('pages', pages.length, 'us mortgage', usMortgage, 'ca mortgage', caMortgage);
