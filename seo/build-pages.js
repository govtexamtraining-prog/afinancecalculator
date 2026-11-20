/**
 * Writes one indexable page per real calculator, the sitemap, and the
 * crawlable calculator index on the home page.
 * Run from the site root: node seo/build-pages.js
 */
const fs = require('fs');
const path = require('path');
const pageCopy = require('./page-copy');
const { siteHeaderHtml, siteFooterHtml, siteChromeLinks } = require('./site-chrome');

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

/** @type {{slug:string, engine:string, title:string, h1:string, region:'us'|'ca'|'shared', note:string, example?:string, related?:string[], keywords?:string, priority?:string}[]} */
const pages = [
  { slug: 'mortgage-calculator', engine: 'tab-mortgage', title: 'Mortgage Calculator — Free Payment & Amortization', h1: 'Mortgage calculator', region: 'us', note: 'Free US mortgage payment calculator for principal and interest. Also used as a loan calculator and amortization schedule helper. Compounded monthly. Taxes, insurance, and mortgage insurance are not included.', example: `A $450,000 home with $90,000 down at 6.2% for 30 years is ${usMortgage} a month.`, related: ['biweekly-mortgage-calculator', 'refinance-calculator', 'canada-mortgage-calculator', 'home-affordability-calculator'], keywords: 'mortgage calculator, mortgage payment calculator, loan calculator, amortization calculator, home mortgage calculator, free mortgage calculator', priority: '1.0' },
  { slug: 'canada-mortgage-calculator', engine: 'tab-mortgage', market: 'ca', title: 'Canada Mortgage Calculator — Semi-Annual Payment', h1: 'Canada mortgage calculator', region: 'ca', note: 'Canadian mortgage payment calculator with the quoted rate compounded semi-annually. CMHC premium uses the published homeowner schedule when the down payment is under 20%. Provincial sales tax and the federal stress test are not included.', example: 'A C$600,000 home with C$120,000 down at 4.5% for 25 years is C$2,656.67 a month. That down payment is 20%, so no CMHC premium is added.', related: ['mortgage-calculator', 'us-canada-banks'], keywords: 'canada mortgage calculator, canadian mortgage calculator, mortgage calculator canada, cmhc calculator', priority: '0.95' },
  { slug: 'biweekly-mortgage-calculator', engine: 'tab-biweekly', title: 'Biweekly Mortgage Calculator — Extra Payment Savings', h1: 'Biweekly mortgage calculator', region: 'shared', note: 'Biweekly mortgage payment calculator that compares a monthly payment with 26 half-payments a year. It does not include taxes, insurance, or a lender’s biweekly fee.', related: ['mortgage-calculator', 'refinance-calculator'], keywords: 'biweekly mortgage calculator, bi weekly mortgage calculator, mortgage payment calculator', priority: '0.9' },
  { slug: 'refinance-calculator', engine: 'tab-refinance', title: 'Refinance Calculator — Mortgage Break-Even', h1: 'Refinance calculator', region: 'shared', note: 'Mortgage refinance calculator comparing your current payment with a new rate and term. Closing costs are the amount you enter. It is not a lender quote.', related: ['mortgage-calculator', 'biweekly-mortgage-calculator'], keywords: 'refinance calculator, mortgage refinance calculator, refinance loan calculator', priority: '0.95' },
  { slug: 'rent-vs-buy-calculator', engine: 'tab-rentbuy', title: 'Rent vs Buy Calculator — 5-Year Cost Compare', h1: 'Rent vs buy calculator', region: 'shared', note: 'Rent vs buy calculator comparing five years of rent with principal, interest, and a sale cost. It leaves out repairs, tax, and insurance unless you add them.', related: ['mortgage-calculator', 'home-affordability-calculator'], keywords: 'rent vs buy calculator, rent or buy calculator, should I rent or buy', priority: '0.9' },
  { slug: 'home-affordability-calculator', engine: 'tab-affordability', title: 'How Much House Can I Afford Calculator', h1: 'How much house can I afford calculator', region: 'us', note: 'Home affordability calculator estimating purchase price from income, debts, and the housing share you set. Not a Canadian stress test or lender pre-approval.', related: ['mortgage-calculator', 'closing-costs-calculator'], keywords: 'how much house can I afford, home affordability calculator, house affordability calculator', priority: '0.95' },
  { slug: 'heloc-calculator', engine: 'tab-heloc', title: 'HELOC Calculator — Payment & Payoff', h1: 'HELOC calculator', region: 'shared', note: 'HELOC payment calculator for interest on the balance you enter during the draw period and an amortized repayment. Lender rate and draw rules are not looked up.', related: ['mortgage-calculator', 'refinance-calculator'], keywords: 'heloc calculator, home equity line of credit calculator, heloc payment calculator', priority: '0.9' },
  { slug: 'closing-costs-calculator', engine: 'tab-closingcosts', title: 'Closing Cost Calculator', h1: 'Closing cost calculator', region: 'us', note: 'Adds the fee amounts you enter for a US-style closing. It does not calculate Canadian land transfer tax or title insurance.', related: ['mortgage-calculator', 'home-affordability-calculator'] },
  { slug: 'cap-rate-calculator', engine: 'tab-caprate', title: 'Cap Rate Calculator', h1: 'Cap rate calculator', region: 'shared', note: 'Net operating income divided by price. It does not subtract the mortgage payment.', related: ['cash-on-cash-calculator', 'airbnb-calculator'] },
  { slug: 'cash-on-cash-calculator', engine: 'tab-cashoncash', title: 'Cash on Cash Return Calculator', h1: 'Cash on cash return calculator', region: 'shared', note: 'Annual cash flow after the mortgage payment, divided by the cash you put in. Vacancy and repairs are only what you enter.', related: ['cap-rate-calculator', 'rent-vs-buy-calculator'] },
  { slug: 'airbnb-calculator', engine: 'tab-airbnb', title: 'Airbnb ROI Calculator', h1: 'Airbnb income calculator', region: 'shared', note: 'Nightly rate times the occupancy you enter, minus the mortgage and operating costs you enter. It is not a forecast of bookings.', related: ['cash-on-cash-calculator', 'cap-rate-calculator'] },
  { slug: 'compound-interest-calculator', engine: 'tab-compound', title: 'Compound Interest Calculator — Free Growth Tool', h1: 'Compound interest calculator', region: 'shared', note: 'Free compound interest calculator. Growth is compounded once a year at the rate you enter. It is not a market forecast or investment advice.', related: ['cagr-calculator', 'inflation-calculator', 'monthly-investment-calculator'], keywords: 'compound interest calculator, interest calculator, investment calculator, cumulative interest calculator', priority: '1.0' },
  { slug: 'cagr-calculator', engine: 'tab-cagr', title: 'CAGR Calculator', h1: 'CAGR calculator', region: 'shared', note: 'The annual rate that connects a starting value to an ending value over the years you enter.', related: ['compound-interest-calculator', 'real-return-calculator'] },
  { slug: 'simple-interest-calculator', engine: 'tab-interest', title: 'Simple Interest Calculator', h1: 'Simple interest calculator', region: 'shared', note: 'Interest = principal × rate × time. The rate is not compounded.', related: ['compound-interest-calculator'] },
  { slug: 'dividend-calculator', engine: 'tab-dividend', title: 'Dividend Yield Calculator', h1: 'Dividend yield calculator', region: 'shared', note: 'Annual dividend divided by price. It does not predict whether the dividend continues.', related: ['stock-average-calculator', 'compound-interest-calculator'] },
  { slug: 'stock-average-calculator', engine: 'tab-stockavg', title: 'Stock Average Cost Calculator', h1: 'Stock average cost calculator', region: 'shared', note: 'Combines the share lots you enter into one average cost.', related: ['dividend-calculator', 'capital-gains-calculator'] },
  { slug: 'monthly-investment-calculator', engine: 'tab-sip', title: 'Investment Calculator — Monthly Contributions', h1: 'Investment calculator', region: 'shared', note: 'Monthly investment calculator for a fixed contribution each month at the annual rate you enter. It is not a market forecast.', related: ['compound-interest-calculator', 'fire-calculator'], keywords: 'investment calculator, monthly investment calculator, sip calculator', priority: '0.9' },
  { slug: 'inflation-calculator', engine: 'tab-inflation', title: 'Inflation Calculator', h1: 'Inflation calculator', region: 'shared', note: 'Shows what today’s amount is worth later at the inflation rate you enter. It is not a CPI forecast for the US or Canada.', related: ['real-return-calculator', 'compound-interest-calculator'] },
  { slug: 'real-return-calculator', engine: 'tab-realreturns', title: 'Real Return Calculator', h1: 'Real return calculator', region: 'shared', note: 'Uses the Fisher effect on the nominal return and inflation rate you enter.', related: ['inflation-calculator', 'cagr-calculator'] },
  { slug: 'cd-ladder-calculator', engine: 'tab-cdladder', title: 'CD Calculator & Ladder — US APY Growth', h1: 'CD ladder calculator', region: 'us', note: 'US CD calculator and ladder tool using the rates you enter. Not a Canadian GIC ladder, and rates are not live bank quotes.', related: ['compound-interest-calculator'], keywords: 'cd calculator, cd ladder calculator, certificate of deposit calculator', priority: '0.9' },
  { slug: 'fire-calculator', engine: 'tab-fire', title: 'FIRE Calculator — Retirement Independence Number', h1: 'FIRE calculator', region: 'shared', note: 'FIRE calculator and retirement calculator estimate for years until the portfolio covers spending at the growth rate you enter, using a 4% withdrawal target. Not a historical Monte Carlo and not a guarantee. Coast FIRE searches can use this as a simple target estimate.', related: ['401k-calculator', 'compound-interest-calculator'], keywords: 'fire calculator, coast fire calculator, retirement calculator, fire number calculator', priority: '0.9' },
  { slug: '401k-calculator', engine: 'tab-four01k', title: '401k Calculator — Free Retirement Growth', h1: '401k calculator', region: 'us', note: 'Free 401k calculator for US employee deferrals, capped at the 2026 limit used in this tool, plus an employer match. Not an RRSP or TFSA calculator.', related: ['fire-calculator', 'paycheck-calculator'], keywords: '401k calculator, 401(k) calculator, retirement calculator', priority: '0.95' },
  { slug: 'rmd-calculator', engine: 'tab-rmd', title: 'RMD Calculator', h1: 'Required minimum distribution calculator', region: 'us', note: 'US IRA required distribution from the IRS Uniform Lifetime table for ages 72 through 120. It is not Canadian RRIF minimum-withdrawal math.', related: ['401k-calculator', 'social-security-calculator'] },
  { slug: 'social-security-calculator', engine: 'tab-socialsecurity', title: 'Social Security Calculator', h1: 'Social Security calculator', region: 'us', note: 'Compares US claiming ages from the benefit amount you enter. It does not look up your Social Security statement, and it is not Canada Pension Plan or OAS.', related: ['rmd-calculator', 'fire-calculator'] },
  { slug: 'hsa-calculator', engine: 'tab-hsa', title: 'HSA Calculator', h1: 'HSA calculator', region: 'us', note: 'US health savings account growth, capped at the limit used in this tool. It is not a Canadian HSA or FHSA.', related: ['401k-calculator'] },
  { slug: 'paycheck-calculator', engine: 'tab-paycheck', title: 'Paycheck Calculator — Free US Take-Home Pay', h1: 'Paycheck calculator', region: 'us', note: 'Free US paycheck calculator and payroll take-home estimate. Social Security and Medicare use the 2026 employee rates and wage base. Federal and state tax are the percentages you enter (including California, Texas, New York as a typed rate). Not Canadian payroll.', related: ['salary-calculator', 'bonus-tax-calculator', 'overtime-calculator'], keywords: 'paycheck calculator, payroll calculator, salary calculator, take home pay calculator, texas paycheck calculator, california paycheck calculator', priority: '1.0' },
  { slug: 'capital-gains-calculator', engine: 'tab-capitalgains', title: 'Capital Gains Calculator', h1: 'Capital gains calculator', region: 'shared', note: 'Gain times the tax rate you enter. The field starts at 15%. It does not apply Canada’s capital-gains inclusion rate or US tax brackets on its own.', related: ['stock-average-calculator', 'dividend-calculator'] },
  { slug: 'quarterly-tax-calculator', engine: 'tab-quarterlytax', title: 'Self-Employment Tax Calculator', h1: 'US self-employment tax calculator', region: 'us', note: 'Estimates US self-employment tax at 15.3% and a federal percentage you enter, then divides the year by four. It is not a CRA instalment calculator.', related: ['paycheck-calculator', 'invoice-calculator'] },
  { slug: 'overtime-calculator', engine: 'tab-overtime', title: 'Overtime Pay Calculator', h1: 'Overtime pay calculator', region: 'shared', note: 'Multiplies the hourly wage you enter by 1.5 or 2. It does not decide whether US or Canadian overtime law applies to the job.', related: ['salary-calculator', 'paycheck-calculator'] },
  { slug: 'bonus-tax-calculator', engine: 'tab-bonustax', title: 'Bonus Tax Calculator', h1: 'US bonus withholding calculator', region: 'us', note: 'Uses US supplemental withholding rates, then Social Security and Medicare. A 401(k) deferral does not reduce those payroll taxes here. It is not Canadian bonus tax.', related: ['paycheck-calculator'] },
  { slug: 'severance-calculator', engine: 'tab-severance', title: 'Severance Pay Calculator', h1: 'US severance calculator', region: 'us', note: 'Withholds US supplemental tax and employee FICA from the lump sum you enter. Unemployment benefits are not added to the runway.', related: ['paycheck-calculator', 'budget-calculator'] },
  { slug: 'debt-snowball-calculator', engine: 'tab-snowball', title: 'Debt Snowball Calculator vs Avalanche', h1: 'Debt snowball calculator', region: 'shared', note: 'Debt snowball vs avalanche calculator for two debts, a 36-month minimum, and the extra payment you enter. Snowball pays the smaller balance first. Avalanche pays the higher rate first.', related: ['credit-card-payoff-calculator', 'personal-loan-calculator'], keywords: 'debt snowball calculator, debt avalanche calculator, debt payoff calculator', priority: '0.9' },
  { slug: 'credit-card-payoff-calculator', engine: 'tab-creditcard', title: 'Credit Card Payoff Calculator — Free', h1: 'Credit card payoff calculator', region: 'shared', note: 'Free credit card payoff calculator for months and interest to clear the balance at the APR and payment you enter.', related: ['debt-snowball-calculator', 'credit-utilization-calculator'], keywords: 'credit card payoff calculator, credit card calculator, credit card payment calculator', priority: '0.9' },
  { slug: 'auto-loan-calculator', engine: 'tab-autoloan', title: 'Auto Loan Calculator — Car Payment Estimator', h1: 'Auto loan calculator', region: 'shared', note: 'Free auto loan calculator and car payment calculator for monthly principal and interest. Tax, title, and dealer fees are not added unless already in the amount.', related: ['auto-refinance-calculator', 'car-lease-calculator'], keywords: 'auto loan calculator, car loan calculator, car payment calculator, auto payment calculator', priority: '0.95' },
  { slug: 'auto-refinance-calculator', engine: 'tab-autorefi', title: 'Auto Refinance Calculator', h1: 'Auto refinance calculator', region: 'shared', note: 'Compares the current payment with a new rate and term. It is not a lender offer.', related: ['auto-loan-calculator'] },
  { slug: 'car-lease-calculator', engine: 'tab-carlease', title: 'Car Lease vs Buy Calculator', h1: 'Car lease vs buy calculator', region: 'shared', note: 'Compares lease payments with a loan at the rate you enter. Taxes and fees are only what the fields include.', related: ['auto-loan-calculator'] },
  { slug: 'loan-calculator', engine: 'tab-personalloan', title: 'Loan Calculator — Free Payment & Interest', h1: 'Loan calculator', region: 'shared', note: 'Free loan calculator for monthly payment and total interest on the amount, rate, and term you enter. Use the mortgage or auto loan pages when the product is a home or vehicle loan.', related: ['personal-loan-calculator', 'mortgage-calculator', 'auto-loan-calculator'], keywords: 'loan calculator, loan payment calculator, amortization calculator, free loan calculator', priority: '1.0' },
  { slug: 'personal-loan-calculator', engine: 'tab-personalloan', title: 'Personal Loan Calculator — Monthly Payment', h1: 'Personal loan calculator', region: 'shared', note: 'Personal loan calculator for monthly payment and interest on the amount, rate, and term you enter.', related: ['loan-calculator', 'debt-snowball-calculator', 'credit-card-payoff-calculator'], keywords: 'personal loan calculator, loan payment calculator', priority: '0.9' },
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

/** Unsplash photo id for hero atmosphere — not scraped Google Images. */
function usagePhotoId(page) {
  const map = {
    mortgage: 'photo-1560518883-ce09059eeffa',
    canada: 'photo-1560518883-ce09059eeffa',
    biweekly: 'photo-1600596542815-ffad4c1539a9',
    refinance: 'photo-1560518883-ce09059eeffa',
    rent: 'photo-1560448204-e02f11c3d0e2',
    affordability: 'photo-1600585154340-be6161a56a0c',
    heloc: 'photo-1560518883-ce09059eeffa',
    paycheck: 'photo-1554224155-6726b3ff858f',
    compound: 'photo-1579621970563-ebec7560ff3e',
    auto: 'photo-1492144534655-ae79c964c9d7',
    car: 'photo-1503376780353-7e6692767b70',
    fire: 'photo-1500530855697-b586d89ba3ee',
    '401k': 'photo-1434626881859-194d67b2b86f',
    debt: 'photo-1579621970795-87facc2f976d',
    credit: 'photo-1556740758-90de374c12ad',
    loan: 'photo-1556742049-0cfed4f6a45d',
    student: 'photo-1523050854058-8df90110c9f1',
    budget: 'photo-1554224154-26032ffc0d07',
    airbnb: 'photo-1522708323590-d24dbb6b0267',
    solar: 'photo-1509391366360-2e959784a276',
    crypto: 'photo-1621761191319-c6fb62004040',
    bank: 'photo-1556742049-0cfed4f6a45d'
  };
  const slug = page.slug || '';
  const key = Object.keys(map).find((k) => slug.includes(k)) || 'compound';
  return map[key];
}

function usageImageSrc(page, width) {
  return `https://images.unsplash.com/${usagePhotoId(page)}?auto=format&fit=crop&w=${width || 1600}&q=70`;
}

function faqsFor(page) {
  const copy = pageCopy[page.slug] || {};
  const custom = copy.faq || [];
  const defaults = [
    {
      q: `How does the ${page.h1} work?`,
      a: copy.how || page.note
    },
    {
      q: `What is a worked example for the ${page.h1}?`,
      a: copy.example || page.example || page.note
    },
    {
      q: `What does the ${page.h1} leave out?`,
      a: copy.leaves || page.note
    }
  ];
  return (custom.length ? custom : defaults).filter((item) => item.q && item.a);
}

function schemaJson(page, faqs) {
  const url = `${origin}/${page.slug}/`;
  const graph = [
    {
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: `${page.title} | aFinanceCalculator`,
      description: page.note,
      isPartOf: { '@id': `${origin}/#website` },
      about: { '@id': `${url}#app` }
    },
    {
      '@type': 'WebApplication',
      '@id': `${url}#app`,
      name: page.title,
      url,
      applicationCategory: 'FinanceApplication',
      operatingSystem: 'Web',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      description: page.note
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${url}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: `${origin}/` },
        { '@type': 'ListItem', position: 2, name: page.h1, item: url }
      ]
    },
    {
      '@type': 'FAQPage',
      '@id': `${url}#faq`,
      mainEntity: faqs.map((item) => ({
        '@type': 'Question',
        name: item.q,
        acceptedAnswer: { '@type': 'Answer', text: item.a }
      }))
    }
  ];
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph });
}

function pageHtml(page) {
  const bySlug = Object.fromEntries(pages.map((item) => [item.slug, item]));
  const relatedPages = (page.related || [])
    .map((slug) => bySlug[slug])
    .filter(Boolean);
  const hreflang = page.slug === 'mortgage-calculator' || page.slug === 'canada-mortgage-calculator'
    ? `<link rel="alternate" hreflang="en-US" href="${origin}/mortgage-calculator/">
    <link rel="alternate" hreflang="en-CA" href="${origin}/canada-mortgage-calculator/">
    <link rel="alternate" hreflang="x-default" href="${origin}/mortgage-calculator/">`
    : '';
  const regionLine = page.region === 'us'
    ? 'United States'
    : page.region === 'ca'
      ? 'Canada'
      : 'United States and Canada';
  const copy = pageCopy[page.slug];
  const faqs = faqsFor(page);
  const description = page.note;
  const exampleText = (copy && copy.example) || page.example || '';
  const exampleChip = exampleText
    ? (exampleText.match(/^[^.]{12,110}\./) || [exampleText.slice(0, 110) + (exampleText.length > 110 ? '…' : '')])[0]
    : '';
  const howText = (copy && copy.how) || '';
  const leavesText = (copy && copy.leaves) || '';
  const faqHtml = faqs.map((item) => `<details class="faq-item">
        <summary>${escapeHtml(item.q)}</summary>
        <p>${escapeHtml(item.a)}</p>
      </details>`).join('\n      ');
  const moreLinks = pages
    .filter((item) => item.slug !== page.slug && item.region === page.region)
    .slice(0, 6)
    .map((item) => `<a href="/${item.slug}/">${escapeHtml(item.h1)}</a>`)
    .join('');
  const relatedLinks = relatedPages.length
    ? relatedPages.map((item) => `<a href="/${item.slug}/">${escapeHtml(item.h1)}</a>`).join('')
    : moreLinks;
  const iframeSrc = `/index.html?engine=${encodeURIComponent(page.engine)}&landing=1${page.market ? `&market=${encodeURIComponent(page.market)}` : ''}`;
  const heroImg = usageImageSrc(page, 1600);
  const keywordsLine = page.keywords
    ? escapeHtml(page.keywords.split(',').map((k) => k.trim()).filter(Boolean).join(' · '))
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(page.title)} | aFinanceCalculator</title>
    <meta name="description" content="${escapeHtml(description)}">
    ${page.keywords ? `<meta name="keywords" content="${escapeHtml(page.keywords)}">` : ''}
    <link rel="canonical" href="${origin}/${page.slug}/">
    ${hreflang}
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
    <meta name="theme-color" content="#07080a">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${origin}/${page.slug}/">
    <meta property="og:title" content="${escapeHtml(page.title)}">
    <meta property="og:description" content="${escapeHtml(page.note)}">
    <meta property="og:site_name" content="aFinanceCalculator">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(page.title)} | aFinanceCalculator">
    <meta name="twitter:description" content="${escapeHtml(page.note)}">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap" rel="stylesheet">
    ${siteChromeLinks()}
    <script type="application/ld+json">${schemaJson(page, faqs)}</script>
    <style>
        :root {
          color-scheme: dark;
          --bg: #07080a;
          --ink: #f4f4f5;
          --muted: #a1a1aa;
          --line: rgba(255,255,255,0.1);
          --cyan: #67e8f9;
          --panel: rgba(12, 14, 18, 0.92);
        }
        * { box-sizing: border-box; }
        body {
          margin: 0;
          min-height: 100vh;
          color: var(--ink);
          background:
            radial-gradient(ellipse 70% 45% at 10% -10%, rgba(34, 211, 238, 0.16), transparent 55%),
            radial-gradient(ellipse 50% 40% at 100% 0%, rgba(30, 64, 175, 0.28), transparent 50%),
            var(--bg);
          font-family: "Plus Jakarta Sans", system-ui, sans-serif;
        }
        .wrap a { color: var(--cyan); text-decoration: none; }
        .wrap a:hover { text-decoration: underline; }
        .wrap { width: min(1400px, calc(100% - 28px)); margin: 0 auto; }
        .hero {
          position: relative;
          margin: 4px 0 14px;
          padding: 18px 0 6px;
          overflow: hidden;
        }
        .hero-bg {
          position: absolute; inset: 0 -4% auto;
          height: 170px; border-radius: 22px; overflow: hidden;
          pointer-events: none; z-index: 0;
        }
        .hero-bg img {
          width: 100%; height: 100%; object-fit: cover;
          filter: saturate(0.85) brightness(0.45);
          transform: scale(1.02);
        }
        .hero-bg::after {
          content: ""; position: absolute; inset: 0;
          background:
            linear-gradient(180deg, rgba(7,8,10,0.2) 0%, rgba(7,8,10,0.92) 78%, var(--bg) 100%),
            linear-gradient(90deg, rgba(7,8,10,0.75), transparent 55%);
        }
        .hero-copy { position: relative; z-index: 1; max-width: 46rem; }
        .meta {
          color: var(--muted); font-size: 12px; font-weight: 600;
          letter-spacing: 0.02em; margin: 0 0 10px;
        }
        h1 {
          margin: 0 0 10px;
          font-size: clamp(2rem, 4.6vw, 3.35rem);
          font-weight: 800; letter-spacing: -0.045em; line-height: 1.02;
          color: #fff;
        }
        .lede {
          margin: 0;
          font-size: clamp(15px, 1.7vw, 17px);
          line-height: 1.5; color: #d4d4d8; max-width: 48ch;
        }
        .example-chip {
          display: inline-block; margin-top: 14px;
          padding: 8px 12px; border-radius: 999px;
          border: 1px solid rgba(103, 232, 249, 0.28);
          background: rgba(8, 47, 58, 0.55);
          color: #a5f3fc; font-size: 12px; font-weight: 600;
          font-family: "JetBrains Mono", ui-monospace, monospace;
          max-width: 100%;
        }
        .tool { position: relative; z-index: 1; margin: 0 0 28px; }
        .tool-frame {
          border: 1px solid var(--line);
          border-radius: 20px;
          overflow: hidden;
          background: var(--panel);
          box-shadow: 0 24px 60px rgba(0,0,0,0.35);
        }
        iframe {
          display: block; width: 100%;
          height: min(88vh, 1080px); min-height: 760px;
          border: 0; background: #07080a;
        }
        .below { padding: 8px 0 20px; }
        .related {
          display: flex; flex-wrap: wrap; gap: 10px 18px;
          margin: 0 0 22px; padding: 0; list-style: none;
        }
        .related a {
          color: #e4e4e7; font-size: 14px; font-weight: 600;
          text-decoration: none; border-bottom: 1px solid rgba(103,232,249,0.35);
        }
        .related a:hover { color: var(--cyan); }
        .related-label {
          width: 100%; margin: 0 0 2px;
          color: var(--muted); font-size: 11px; font-weight: 700;
          letter-spacing: 0.06em; text-transform: uppercase;
        }
        .notes {
          border-top: 1px solid var(--line);
          padding-top: 8px;
        }
        .notes > details {
          border-bottom: 1px solid var(--line);
          padding: 12px 0;
        }
        .notes > details > summary {
          cursor: pointer; list-style: none;
          font-size: 14px; font-weight: 700; color: #e4e4e7;
        }
        .notes > details > summary::-webkit-details-marker { display: none; }
        .notes-body { padding: 12px 0 4px; max-width: 68ch; }
        .notes-body h2 {
          margin: 18px 0 6px; font-size: 15px; color: #fff;
        }
        .notes-body h2:first-child { margin-top: 0; }
        .notes-body p {
          margin: 0 0 10px; color: #d4d4d8;
          font-size: 14px; line-height: 1.55;
        }
        .faq-item {
          margin: 0 0 8px; padding: 10px 12px;
          border: 1px solid var(--line); border-radius: 12px;
          background: rgba(19, 18, 23, 0.65);
        }
        .faq-item summary { cursor: pointer; font-weight: 700; color: #fff; font-size: 13px; }
        .faq-item p { margin: 8px 0 0; color: #d4d4d8; font-size: 13px; line-height: 1.5; }
        .keywords { margin: 14px 0 0; color: var(--muted); font-size: 12px; }
        @media (max-width: 720px) {
          .hero { padding-top: 18px; }
          .hero-bg { height: 180px; }
          iframe { min-height: 680px; height: 80vh; }
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-bg img { transform: none; }
        }
    </style>
</head>
<body>
    ${siteHeaderHtml({ ctaHref: '#calculator', ctaLabel: 'Use calculator' })}

    <div class="wrap">
      <section class="hero" aria-label="${escapeHtml(page.h1)}">
        <div class="hero-bg" aria-hidden="true">
          <img src="${heroImg}" alt="" width="1600" height="500" loading="eager" decoding="async" fetchpriority="high">
        </div>
        <div class="hero-copy">
          <p class="meta">${escapeHtml(regionLine)} · Free · Runs in your browser</p>
          <h1>${escapeHtml(page.h1)}</h1>
          <p class="lede">${escapeHtml(page.note)}</p>
          ${exampleChip ? `<p class="example-chip">${escapeHtml(exampleChip)}</p>` : ''}
        </div>
      </section>

      <section class="tool" id="calculator">
        <div class="tool-frame">
          <iframe src="${iframeSrc}" title="${escapeHtml(page.h1)}" loading="eager"></iframe>
        </div>
      </section>

      <section class="below">
        <nav class="related" aria-label="Related calculators">
          <span class="related-label">Related</span>
          ${relatedLinks}
        </nav>

        <div class="notes">
          <details>
            <summary>Notes, limits &amp; FAQ</summary>
            <div class="notes-body">
              ${howText ? `<h2>How this figure is calculated</h2><p>${escapeHtml(howText)}</p>` : ''}
              ${leavesText ? `<h2>What this page leaves out</h2><p>${escapeHtml(leavesText)}</p>` : `<p>${escapeHtml(page.note)}</p>`}
              ${exampleText ? `<h2>Worked example</h2><p>${escapeHtml(exampleText)}</p>` : ''}
              <h2>Questions</h2>
              ${faqHtml}
              ${keywordsLine ? `<p class="keywords">${keywordsLine}</p>` : ''}
            </div>
          </details>
        </div>
      </section>
    </div>

    ${siteFooterHtml()}
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
  const today = '2026-11-20';
  const urls = [
    ['/', 'weekly', '1.0'],
    ...pages.map((page) => [`/${page.slug}/`, 'weekly', page.priority || '0.8']),
    ['/about.html', 'monthly', '0.4'],
    ['/alternatives.html', 'weekly', '0.85'],
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
            <p>Each calculator has its own page. Paycheck, 401(k), Social Security, HSA, and RMD pages use US rules. The Canada mortgage page uses semi-annual compounding and CMHC premium bands when the down payment is under 20%. It does not run the federal stress test.</p>
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
require('./sync-static-chrome');
console.log('pages', pages.length, 'us mortgage', usMortgage, 'ca mortgage', caMortgage);
