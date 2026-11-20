/**
 * Usage illustrations for each calculator.
 * Photo + SVG icon + short “how to use” copy.
 * Does not change calculator math. Photos: Unsplash (lazy-loaded).
 */
(function (global) {
  'use strict';

  function photo(id, w) {
    return 'https://images.unsplash.com/' + id + '?auto=format&fit=crop&w=' + (w || 640) + '&q=70';
  }

  var ICONS = {
    home: '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M8 22 L24 10 L40 22 V40 H28 V28 H20 V40 H8 Z" stroke="#22d3ee" stroke-width="2.5" stroke-linejoin="round"/><circle cx="24" cy="24" r="3" fill="#34d399"/></svg>',
    pay: '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><rect x="8" y="14" width="32" height="22" rx="4" stroke="#22d3ee" stroke-width="2.5"/><path d="M8 20 H40" stroke="#67e8f9" stroke-width="2"/><circle cx="16" cy="30" r="3" fill="#34d399"/><path d="M24 28 H36 M24 33 H32" stroke="#a1a1aa" stroke-width="2" stroke-linecap="round"/></svg>',
    grow: '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M10 36 L20 24 L28 30 L38 14" stroke="#34d399" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="38" cy="14" r="3" fill="#22d3ee"/><path d="M10 38 H38" stroke="#3f3f46" stroke-width="2"/></svg>',
    fire: '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M24 8 C28 16 34 18 34 26 A10 10 0 0 1 14 26 C14 20 18 16 24 8 Z" stroke="#fbbf24" stroke-width="2.5" fill="rgba(251,191,36,0.15)"/><path d="M24 22 C26 26 28 27 28 30 A4 4 0 0 1 20 30 C20 27 22 26 24 22 Z" fill="#22d3ee"/></svg>',
    debt: '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="18" cy="26" r="10" stroke="#fb7185" stroke-width="2.5"/><circle cx="30" cy="26" r="10" stroke="#34d399" stroke-width="2.5"/><path d="M14 26 H22 M26 26 H34" stroke="#a1a1aa" stroke-width="2"/></svg>',
    car: '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M10 28 L14 18 H34 L38 28 V36 H10 Z" stroke="#22d3ee" stroke-width="2.5" stroke-linejoin="round"/><circle cx="16" cy="36" r="3.5" fill="#67e8f9"/><circle cx="32" cy="36" r="3.5" fill="#67e8f9"/><path d="M16 22 H32" stroke="#34d399" stroke-width="2"/></svg>',
    tax: '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><rect x="12" y="8" width="24" height="32" rx="3" stroke="#22d3ee" stroke-width="2.5"/><path d="M18 16 H30 M18 22 H30 M18 28 H26" stroke="#a1a1aa" stroke-width="2" stroke-linecap="round"/><path d="M28 34 L32 30 L36 34" stroke="#34d399" stroke-width="2" stroke-linecap="round"/></svg>',
    bank: '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M8 18 L24 8 L40 18 V20 H8 Z" stroke="#22d3ee" stroke-width="2.5" stroke-linejoin="round"/><path d="M12 22 V34 M20 22 V34 M28 22 V34 M36 22 V34" stroke="#67e8f9" stroke-width="2.5"/><path d="M8 36 H40" stroke="#34d399" stroke-width="2.5"/></svg>',
    biz: '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><rect x="10" y="16" width="28" height="22" rx="3" stroke="#22d3ee" stroke-width="2.5"/><path d="M18 16 V12 H30 V16" stroke="#67e8f9" stroke-width="2.5"/><path d="M16 28 H32 M16 33 H26" stroke="#a1a1aa" stroke-width="2" stroke-linecap="round"/></svg>',
    crypto: '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="24" r="14" stroke="#fbbf24" stroke-width="2.5"/><path d="M22 14 V34 M26 14 V34 M18 20 H30 M18 28 H30" stroke="#22d3ee" stroke-width="2" stroke-linecap="round"/></svg>',
    solar: '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><circle cx="24" cy="20" r="8" stroke="#fbbf24" stroke-width="2.5"/><path d="M24 6 V10 M24 30 V34 M10 20 H14 M34 20 H38 M14 10 L17 13 M31 27 L34 30 M34 10 L31 13 M17 27 L14 30" stroke="#fbbf24" stroke-width="2" stroke-linecap="round"/><path d="M12 38 H36" stroke="#34d399" stroke-width="2.5"/></svg>',
    rent: '<svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><rect x="8" y="16" width="14" height="22" rx="2" stroke="#22d3ee" stroke-width="2.5"/><path d="M26 22 L38 14 V38 H26 Z" stroke="#34d399" stroke-width="2.5" stroke-linejoin="round"/><path d="M12 22 H18 M12 28 H18" stroke="#a1a1aa" stroke-width="2"/></svg>'
  };

  /** engine id suffix -> illustration config */
  var CATALOG = {
    banking: { icon: 'bank', title: 'Compare banks visually', blurb: 'Browse US & Canada institutions, then open a calculator when you need a payment figure.', steps: ['Pick a bank', 'Note the product', 'Run a related calculator'], img: photo('photo-1556742049-0cfed4f6a45d') },
    mortgage: { icon: 'home', title: 'See your home payment', blurb: 'Enter price, down payment, rate, and years. The ring shows how much goes to the home vs interest.', steps: ['Set home price', 'Adjust down payment', 'Read monthly P&I'], img: photo('photo-1560518883-ce09059eeffa') },
    invoice: { icon: 'biz', title: 'Invoice net after tax buffer', blurb: 'Type hours and rate. The result shows take-home after the tax percent you set aside.', steps: ['Hours × rate', 'Set tax %', 'See net'], img: photo('photo-1454165804606-c3d57bc86b40') },
    roi: { icon: 'grow', title: 'Measure campaign return', blurb: 'Compare ad spend to revenue. ROAS and ROI update as you move the sliders.', steps: ['Enter spend', 'Enter revenue', 'Read ROAS'], img: photo('photo-1460925895917-afdab827c52f') },
    crypto: { icon: 'crypto', title: 'Size a leveraged position', blurb: 'Set entry, leverage, and move size. The graphic highlights liquidation risk at a glance.', steps: ['Entry price', 'Leverage', 'Check liquidation'], img: photo('photo-1621761191319-c6fb62004040') },
    compound: { icon: 'grow', title: 'Watch money multiply', blurb: 'Start with a deposit, rate, and years. The donut separates what you put in from growth earned.', steps: ['Deposit', 'Annual rate', 'Years'], img: photo('photo-1579621970563-ebec7560ff3e') },
    caprate: { icon: 'home', title: 'Property income vs price', blurb: 'Net operating income divided by price. Use it to compare rental properties quickly.', steps: ['Annual rent', 'Costs', 'Property value'], img: photo('photo-1560518883-ce09059eeffa') },
    salary: { icon: 'pay', title: 'Hourly wage → yearly pay', blurb: 'Convert an hourly rate into annual gross using hours and weeks you work.', steps: ['Hourly rate', 'Hours/week', 'Weeks/year'], img: photo('photo-1554224155-6726b3ff858f') },
    breakeven: { icon: 'biz', title: 'Units needed to break even', blurb: 'Fixed costs ÷ margin per unit. See how many sales cover your overhead.', steps: ['Fixed costs', 'Price & cost', 'Units to break even'], img: photo('photo-1556761175-5973dc0f32e7') },
    creditcard: { icon: 'debt', title: 'Months to clear a card', blurb: 'Balance, APR, and payment. The payoff path shows interest vs principal progress.', steps: ['Balance', 'APR', 'Monthly payment'], img: photo('photo-1556740758-90de374c12ad') },
    stockavg: { icon: 'grow', title: 'Average your share cost', blurb: 'Combine lots into one average price so you know your true cost basis.', steps: ['Add lots', 'Shares × price', 'See average'], img: photo('photo-1611974789855-9c2a0a7236a3') },
    rentbuy: { icon: 'rent', title: 'Rent path vs buy path', blurb: 'Compare five years of rent with owning costs from the numbers you enter.', steps: ['Monthly rent', 'Home & rate', 'Compare 5 years'], img: photo('photo-1560448204-e02f11c3d0e2') },
    margin: { icon: 'biz', title: 'Margin and markup', blurb: 'Price minus cost as margin % and markup %. Useful for retail and product pricing.', steps: ['Sale price', 'Cost', 'Read margin'], img: photo('photo-1441986300917-64674bd600d8') },
    autoloan: { icon: 'car', title: 'Estimate a car payment', blurb: 'Financed amount, APR, and months. The ring shows loan vs finance charges.', steps: ['Loan amount', 'APR', 'Term months'], img: photo('photo-1492144534655-ae79c964c9d7') },
    student: { icon: 'tax', title: 'Student loan payoff', blurb: 'Balance, rate, and term for a fixed repayment schedule (US-style inputs).', steps: ['Balance', 'Rate', 'Term'], img: photo('photo-1523050854058-8df90110c9f1') },
    budget: { icon: 'pay', title: '50/30/20 money split', blurb: 'Split take-home into needs, wants, and savings so the budget is easy to picture.', steps: ['Take-home pay', 'See 50/30/20', 'Adjust habits'], img: photo('photo-1554224154-26032ffc0d07') },
    interest: { icon: 'grow', title: 'Simple interest only', blurb: 'Principal × rate × time. No compounding—ideal for short notes.', steps: ['Principal', 'Rate', 'Time'], img: photo('photo-1633158829875-e5316a73c6e4') },
    dividend: { icon: 'grow', title: 'Dividend yield snapshot', blurb: 'Annual dividend ÷ price. See income from shares you hold.', steps: ['Dividend', 'Share price', 'Yield %'], img: photo('photo-1590283603385-17ffb3a7f29f') },
    inflation: { icon: 'grow', title: 'Buying power over time', blurb: 'See what today’s amount is worth later at the inflation rate you enter.', steps: ['Amount today', 'Inflation %', 'Years'], img: photo('photo-1526304640581-d334cdbbf45e') },
    sip: { icon: 'grow', title: 'Monthly investing path', blurb: 'Fixed deposits each month grow at the rate you set—great for SIP-style planning.', steps: ['Monthly amount', 'Rate', 'Years'], img: photo('photo-1579621970795-87facc2f976d') },
    cagr: { icon: 'grow', title: 'Smooth annual growth rate', blurb: 'Connect start value to end value over years with one CAGR figure.', steps: ['Start value', 'End value', 'Years'], img: photo('photo-1642790551116-18e150f248e3') },
    affordability: { icon: 'home', title: 'How much house fits?', blurb: 'Income, debts, and housing share turn into an estimated purchase price.', steps: ['Income', 'Debts', 'See price'], img: photo('photo-1600585154340-be6161a56a0c') },
    refinance: { icon: 'home', title: 'Refi break-even picture', blurb: 'Compare current vs new payment and see months to recover closing costs.', steps: ['Current loan', 'New rate', 'Break-even'], img: photo('photo-1560518883-ce09059eeffa') },
    biweekly: { icon: 'home', title: 'Biweekly payoff boost', blurb: '26 half-payments a year vs monthly—see interest saved visually.', steps: ['Monthly payment', 'Compare biweekly', 'Interest saved'], img: photo('photo-1600596542815-ffad4c1539a9') },
    cashoncash: { icon: 'home', title: 'Cash-on-cash return', blurb: 'Annual cash flow after the mortgage ÷ cash you invested.', steps: ['Cash invested', 'Annual cash flow', 'Return %'], img: photo('photo-1582407947304-fd86f028f716') },
    heloc: { icon: 'home', title: 'HELOC draw & repay', blurb: 'Interest-only draw years, then amortized repayment—two payment pictures.', steps: ['Balance', 'Rate', 'Draw vs repay'], img: photo('photo-1560518883-ce09059eeffa') },
    closingcosts: { icon: 'home', title: 'Closing cash checklist', blurb: 'Add the fee amounts you expect so the cash-to-close total is clear.', steps: ['Add fees', 'Sum cash needed', 'Plan funds'], img: photo('photo-1450101499163-c8848c66ca85') },
    fire: { icon: 'fire', title: 'Path to financial independence', blurb: 'Gauge shows progress to your FIRE number. Adjust spending and savings to move the needle.', steps: ['Annual spend', 'Savings', 'Years to FIRE'], img: photo('photo-1500530855697-b586d89ba3ee') },
    four01k: { icon: 'grow', title: '401(k) growth picture', blurb: 'Salary, deferral, and match grow over years—US plan limits apply in the tool.', steps: ['Salary', 'Deferral %', 'Years'], img: photo('photo-1434626881859-194d67b2b86f') },
    rmd: { icon: 'tax', title: 'Required distribution size', blurb: 'Balance ÷ IRS factor for your age. See annual and monthly RMD.', steps: ['Balance', 'Age', 'RMD amount'], img: photo('photo-1554224155-8d04cb21cd6c') },
    socialsecurity: { icon: 'pay', title: 'Claiming age tradeoff', blurb: 'Compare monthly benefit amounts across claiming ages from the figure you enter.', steps: ['Benefit amount', 'Claiming age', 'Compare'], img: photo('photo-1579621970563-ebec7560ff3e') },
    cdladder: { icon: 'bank', title: 'CD ladder rungs', blurb: 'Each rung is a deposit + APY + term. See interest by rung and in total.', steps: ['Add rungs', 'Set APYs', 'Total interest'], img: photo('photo-1601597111158-2fceff292cdc') },
    hsa: { icon: 'grow', title: 'HSA growth within caps', blurb: 'Contribute up to the tool’s US HSA limit and grow at the rate you enter.', steps: ['Contribution', 'Coverage type', 'Growth'], img: photo('photo-1576091160399-112ba8d25d1d') },
    paycheck: { icon: 'pay', title: 'Gross → take-home split', blurb: 'FICA is calculated; federal/state are the % you type. The donut shows pocket vs taxes.', steps: ['Gross pay', 'Tax %', 'Net pay'], img: photo('photo-1554224155-6726b3ff858f') },
    capitalgains: { icon: 'tax', title: 'Gain after tax', blurb: 'Sale minus cost, then tax at the rate you enter. Net profit is highlighted.', steps: ['Buy cost', 'Sale price', 'Tax rate'], img: photo('photo-1611974789855-9c2a0a7236a3') },
    quarterlytax: { icon: 'tax', title: 'Quarterly tax voucher', blurb: 'Estimate self-employment + income tax, then divide by four for a voucher size.', steps: ['Revenue', 'Expenses', 'Quarterly amount'], img: photo('photo-1554224154-26032ffc0d07') },
    overtime: { icon: 'pay', title: 'OT and double-time pay', blurb: 'Regular, 1.5×, and 2× hours stack into one week’s gross pay.', steps: ['Hourly wage', 'OT hours', 'Week total'], img: photo('photo-1454165804606-c3d57bc86b40') },
    bonustax: { icon: 'tax', title: 'Bonus withholding sketch', blurb: 'US supplemental rates plus FICA on the bonus amount you enter.', steps: ['Bonus amount', 'See withholding', 'Net deposit'], img: photo('photo-1523289333742-be1143f6b2f2') },
    severance: { icon: 'pay', title: 'Severance runway', blurb: 'Lump sum after supplemental tax ÷ monthly spend = months covered.', steps: ['Severance', 'Spending', 'Months'], img: photo('photo-1486312338219-ce68d2c6f44d') },
    snowball: { icon: 'debt', title: 'Snowball vs avalanche', blurb: 'Two debts race. Bars compare total interest so the cheaper method is obvious.', steps: ['Two balances', 'Extra payment', 'Compare methods'], img: photo('photo-1579621970795-87facc2f976d') },
    carlease: { icon: 'car', title: 'Lease vs buy cost', blurb: 'Side-by-side net cost over the term so the cheaper path stands out.', steps: ['Lease terms', 'Loan terms', 'Compare'], img: photo('photo-1503376780353-7e6692767b70') },
    personalloan: { icon: 'debt', title: 'Personal loan payment', blurb: 'Amount, rate, and term → fixed payment and total interest.', steps: ['Amount', 'APR', 'Term'], img: photo('photo-1556742049-0cfed4f6a45d') },
    autorefi: { icon: 'car', title: 'Auto refinance delta', blurb: 'Current payment vs new payment after a rate/term change.', steps: ['Balance left', 'New rate', 'Savings'], img: photo('photo-1492144534655-ae79c964c9d7') },
    studentrefi: { icon: 'tax', title: 'Refi vs PSLF path', blurb: 'Private refinance payment next to the income-driven path you describe.', steps: ['Balance', 'New rate', 'Compare paths'], img: photo('photo-1523050854058-8df90110c9f1') },
    creditscore: { icon: 'debt', title: 'Utilization snapshot', blurb: 'Balances ÷ limits. Lower bars mean healthier utilization.', steps: ['Balances', 'Limits', 'Utilization %'], img: photo('photo-1563013544-824ae1b704d3') },
    solar: { icon: 'solar', title: 'Solar payback years', blurb: 'System cost covered by the bill savings share you enter.', steps: ['System cost', 'Bill savings', 'Payback years'], img: photo('photo-1509391366360-2e959784a276') },
    evgas: { icon: 'car', title: 'EV vs gas fuel cost', blurb: 'Miles, MPG, and electricity vs gas price—see which costs less to drive.', steps: ['Miles', 'Fuel prices', 'Compare'], img: photo('photo-1593941707882-a5bba14938c7') },
    staking: { icon: 'crypto', title: 'Staking yield sketch', blurb: 'Yield on the amount and rate you enter, with an IL case from price change.', steps: ['Stake amount', 'APY', 'IL case'], img: photo('photo-1621761191319-c6fb62004040') },
    dropship: { icon: 'biz', title: 'Ecommerce margin map', blurb: 'Sale price minus product, ads, and platform fees.', steps: ['Sale price', 'Costs & ads', 'Margin'], img: photo('photo-1556740738-b6a63e27c4df') },
    realreturns: { icon: 'grow', title: 'Return after inflation', blurb: 'Fisher real return from the nominal rate and inflation you type.', steps: ['Nominal %', 'Inflation %', 'Real %'], img: photo('photo-1526304640581-d334cdbbf45e') },
    airbnb: { icon: 'rent', title: 'Short-term rental income', blurb: 'Nightly rate × occupancy, minus mortgage and ops you enter.', steps: ['Nightly rate', 'Occupancy', 'Cash flow'], img: photo('photo-1522708323590-d24dbb6b0267') }
  };

  var GALLERY = [
    { engine: 'mortgage', href: '/mortgage-calculator/' },
    { engine: 'paycheck', href: '/paycheck-calculator/' },
    { engine: 'compound', href: '/compound-interest-calculator/' },
    { engine: 'autoloan', href: '/auto-loan-calculator/' },
    { engine: 'fire', href: '/fire-calculator/' },
    { engine: 'snowball', href: '/debt-snowball-calculator/' },
    { engine: 'rentbuy', href: '/rent-vs-buy-calculator/' },
    { engine: 'affordability', href: '/home-affordability-calculator/' }
  ];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function stepsHtml(steps) {
    return '<div class="usage-hero-steps">' + (steps || []).map(function (s, i) {
      return '<span><b>' + (i + 1) + '</b> ' + esc(s) + '</span>';
    }).join('') + '</div>';
  }

  function bannerHtml(key, cfg) {
    return '<div class="usage-hero" data-usage="' + esc(key) + '">' +
      '<div class="usage-hero-media">' +
      '<img src="' + esc(cfg.img) + '" alt="" width="640" height="160" loading="lazy" decoding="async">' +
      '<div class="usage-hero-art">' + (ICONS[cfg.icon] || ICONS.grow) + '</div>' +
      '</div>' +
      '<div class="usage-hero-copy">' +
      '<p class="usage-hero-kicker">How to use this page</p>' +
      '<p class="usage-hero-title">' + esc(cfg.title) + '</p>' +
      '<p class="usage-hero-blurb">' + esc(cfg.blurb) + '</p>' +
      stepsHtml(cfg.steps) +
      '</div></div>';
  }

  function mountEngineBanners() {
    // Always mount — including landing iframes (?landing=1) so /{slug}/ pages keep images
    Object.keys(CATALOG).forEach(function (key) {
      var panel = document.getElementById('engine-' + key);
      if (!panel || panel.querySelector('.usage-hero')) return;
      var header = panel.querySelector(':scope > div');
      var html = bannerHtml(key, CATALOG[key]);
      if (header && header.nextSibling) {
        header.insertAdjacentHTML('afterend', html);
      } else {
        panel.insertAdjacentHTML('afterbegin', html);
      }
    });
  }

  function mountGallery() {
    if (document.documentElement.classList.contains('in-frame')) return;
    if (document.querySelector('.usage-gallery')) return;
    var anchor = document.querySelector('.noir-cinematic-section') || document.querySelector('.noir-hero');
    if (!anchor) return;
    var cards = GALLERY.map(function (item) {
      var cfg = CATALOG[item.engine];
      if (!cfg) return '';
      var src = String(cfg.img).replace('w=640', 'w=480');
      return '<a class="usage-gallery-card" href="' + esc(item.href) + '">' +
        '<img src="' + esc(src) + '" alt="" loading="lazy" decoding="async" width="480" height="110">' +
        '<div class="usage-gallery-body"><strong>' + esc(cfg.title) + '</strong><span>' + esc(cfg.blurb) + '</span></div></a>';
    }).join('');
    var wrap = document.createElement('section');
    wrap.className = 'usage-gallery';
    wrap.setAttribute('aria-label', 'Calculator usage examples');
    wrap.innerHTML = cards;
    anchor.insertAdjacentElement('afterend', wrap);
  }

  function decorateTabs() {
    Object.keys(CATALOG).forEach(function (key) {
      var tab = document.getElementById('tab-' + key) || document.getElementById('tab-' + key.replace(/([A-Z])/g, '-$1').toLowerCase());
      // engine ids map: four01k -> tab-four01k already
      tab = document.getElementById('tab-' + key);
      if (!tab || tab.querySelector('.usage-tab-icon')) return;
      var cfg = CATALOG[key];
      var icon = document.createElement('span');
      icon.className = 'usage-tab-icon';
      icon.innerHTML = ICONS[cfg.icon] || ICONS.grow;
      tab.insertBefore(icon, tab.firstChild);
    });
  }

  function init() {
    mountEngineBanners();
    mountGallery();
    decorateTabs();
  }

  global.UsageIllustrations = { init: init, catalog: CATALOG };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(window);
