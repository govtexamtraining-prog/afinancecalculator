/**
 * aFinanceCalculator money verticals (NerdWallet-inspired IA, original UX).
 * Drives mega-nav panels + category filtering. Does not copy NW markup/CSS.
 */
(function (global) {
  'use strict';

  var VERTICALS = [
    {
      id: 'credit-cards',
      label: 'Credit cards',
      blurb: 'Pay off balances, track utilization, and plan rewards-friendly debt moves.',
      primary: 'tab-creditcard',
      links: [
        { label: 'Compare credit cards', href: '/compare-credit-cards/', engine: null },
        { label: 'Credit card payoff', href: '/credit-card-payoff-calculator/', engine: 'tab-creditcard' },
        { label: 'Balance transfer savings', href: '/balance-transfer-calculator/', engine: 'tab-balancetransfer' },
        { label: 'Credit utilization', href: '/credit-utilization-calculator/', engine: 'tab-creditscore' },
        { label: 'Debt snowball vs avalanche', href: '/debt-snowball-calculator/', engine: 'tab-snowball' },
        { label: 'Chase card desk', href: '/chase-credit-card-calculator/', engine: null }
      ]
    },
    {
      id: 'banking',
      label: 'Banking',
      blurb: 'Compare HYSA / CD / money-market math and browse the U.S. & Canada banking hub.',
      primary: 'tab-banking-hub',
      links: [
        { label: 'US & Canada banking hub', href: '/us-canada-banks/', engine: 'tab-banking-hub' },
        { label: 'HYSA / savings calculator', href: '/savings-calculator/', engine: 'tab-savings' },
        { label: 'CD calculator', href: '/cd-calculator/', engine: 'tab-cd' },
        { label: 'Money market calculator', href: '/money-market-calculator/', engine: 'tab-moneymarket' },
        { label: 'Banking rates today', href: '/banking-rates/', engine: null },
        { label: 'Compound growth', href: '/compound-interest-calculator/', engine: 'tab-compound' },
        { label: 'CD ladder APY', href: '/cd-ladder-calculator/', engine: 'tab-cdladder' }
      ]
    },
    {
      id: 'home',
      label: 'Home',
      blurb: 'Mortgage payment, affordability, refinance, and home-equity tools.',
      primary: 'tab-mortgage',
      links: [
        { label: 'Mortgage rates today', href: '/mortgage-rates-today/', engine: null },
        { label: 'Mortgage / EMI (PITI)', href: '/mortgage-calculator/', engine: 'tab-mortgage' },
        { label: 'Amortization schedule', href: '/amortization-calculator/', engine: 'tab-amortization' },
        { label: 'Down payment planner', href: '/down-payment-calculator/', engine: 'tab-downpayment' },
        { label: 'Home affordability', href: '/home-affordability-calculator/', engine: 'tab-affordability' },
        { label: 'Refinance savings', href: '/refinance-calculator/', engine: 'tab-refinance' },
        { label: 'Rent vs buy', href: '/rent-vs-buy-calculator/', engine: 'tab-rentbuy' },
        { label: 'HELOC payoff', href: '/heloc-calculator/', engine: 'tab-heloc' },
        { label: 'Closing costs', href: '/closing-costs-calculator/', engine: 'tab-closingcosts' }
      ]
    },
    {
      id: 'loans',
      label: 'Loans',
      blurb: 'Personal, auto, and student loan payment and refinance math.',
      primary: 'tab-personalloan',
      links: [
        { label: 'Personal loan', href: '/personal-loan-calculator/', engine: 'tab-personalloan' },
        { label: 'APR / loan compare', href: '/apr-loan-comparison-calculator/', engine: 'tab-aprcompare' },
        { label: 'Auto loan', href: '/auto-loan-calculator/', engine: 'tab-autoloan' },
        { label: 'Car affordability', href: '/car-affordability-calculator/', engine: 'tab-carafford' },
        { label: 'Auto refinance', href: '/auto-refinance-calculator/', engine: 'tab-autorefi' },
        { label: 'Student loan payoff', href: '/student-loan-calculator/', engine: 'tab-student' },
        { label: 'Car lease vs buy', href: '/car-lease-calculator/', engine: 'tab-carlease' }
      ]
    },
    {
      id: 'insurance',
      label: 'Insurance',
      blurb: 'Rough life / auto coverage planning and HSA tax-advantaged growth.',
      primary: 'tab-insurance',
      links: [
        { label: 'Insurance planning desk', href: '/#engine-insurance', engine: 'tab-insurance' },
        { label: 'HSA triple-tax growth', href: '/hsa-calculator/', engine: 'tab-hsa' },
        { label: 'Closing costs (home insurance line)', href: '/closing-costs-calculator/', engine: 'tab-closingcosts' }
      ]
    },
    {
      id: 'personal-finance',
      label: 'Personal finance',
      blurb: 'Budgets, pay conversion, inflation, and everyday money runway.',
      primary: 'tab-budget',
      links: [
        { label: '50/30/20 budget', href: '/budget-calculator/', engine: 'tab-budget' },
        { label: 'Rent affordability', href: '/rent-affordability-calculator/', engine: 'tab-rentafford' },
        { label: 'Hourly to salary', href: '/salary-calculator/', engine: 'tab-salary' },
        { label: 'Inflation eroder', href: '/inflation-calculator/', engine: 'tab-inflation' },
        { label: 'Severance runway', href: '/severance-calculator/', engine: 'tab-severance' },
        { label: 'EV vs gas costs', href: '/ev-vs-gas-calculator/', engine: 'tab-evgas' }
      ]
    },
    {
      id: 'investing',
      label: 'Investing',
      blurb: 'Compounding, retirement, dividends, and portfolio growth engines.',
      primary: 'tab-compound',
      links: [
        { label: 'Compound interest', href: '/compound-interest-calculator/', engine: 'tab-compound' },
        { label: 'Roth IRA', href: '/roth-ira-calculator/', engine: 'tab-rothira' },
        { label: '401(k) & Roth', href: '/401k-calculator/', engine: 'tab-four01k' },
        { label: 'FIRE calculator', href: '/fire-calculator/', engine: 'tab-fire' },
        { label: 'Dividend yield', href: '/dividend-calculator/', engine: 'tab-dividend' },
        { label: 'SIP / monthly invest', href: '/monthly-investment-calculator/', engine: 'tab-sip' },
        { label: 'CAGR', href: '/cagr-calculator/', engine: 'tab-cagr' },
        { label: 'Social Security', href: '/social-security-calculator/', engine: 'tab-socialsecurity' }
      ]
    },
    {
      id: 'small-business',
      label: 'Small business',
      blurb: 'Margins, break-even, invoices, and ecommerce unit economics.',
      primary: 'tab-breakeven',
      links: [
        { label: 'Break-even point', href: '/break-even-calculator/', engine: 'tab-breakeven' },
        { label: 'Profit margin', href: '/profit-margin-calculator/', engine: 'tab-margin' },
        { label: 'Invoice & tax', href: '/invoice-calculator/', engine: 'tab-invoice' },
        { label: 'Ecommerce / FBA margin', href: '/ecommerce-margin-calculator/', engine: 'tab-dropship' },
        { label: 'ROI', href: '/roi-calculator/', engine: 'tab-roi' },
        { label: 'Airbnb rental ROI', href: '/airbnb-calculator/', engine: 'tab-airbnb' },
        { label: 'Solar ROI', href: '/solar-calculator/', engine: 'tab-solar' }
      ]
    },
    {
      id: 'taxes',
      label: 'Taxes',
      blurb: 'Paycheck withholding, capital gains, quarterly estimates, and bonuses.',
      primary: 'tab-paycheck',
      links: [
        { label: 'Paycheck gross to net', href: '/paycheck-calculator/', engine: 'tab-paycheck' },
        { label: 'Capital gains', href: '/capital-gains-calculator/', engine: 'tab-capitalgains' },
        { label: 'Quarterly 1040-ES', href: '/quarterly-tax-calculator/', engine: 'tab-quarterlytax' },
        { label: 'Bonus withholding', href: '/bonus-tax-calculator/', engine: 'tab-bonustax' },
        { label: 'Overtime pay', href: '/overtime-calculator/', engine: 'tab-overtime' }
      ]
    }
  ];

  var openId = null;

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $all(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function closePanels() {
    openId = null;
    $all('.afc-mega-item').forEach(function (item) {
      item.classList.remove('is-open');
      var btn = $('.afc-mega-trigger', item);
      var panel = $('.afc-mega-panel', item);
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (panel) panel.hidden = true;
    });
  }

  function closeDrawer() {
    var drawer = $('.afc-mega-drawer');
    if (drawer) drawer.classList.remove('is-open');
    var toggle = $('.afc-mega-mobile-toggle');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  function closeAll() {
    closePanels();
    closeDrawer();
  }

  function openVertical(id) {
    if (openId === id) {
      closePanels();
      return;
    }
    closePanels();
    openId = id;
    var item = $('.afc-mega-item[data-vertical="' + id + '"]');
    if (!item) return;
    item.classList.add('is-open');
    var btn = $('.afc-mega-trigger', item);
    var panel = $('.afc-mega-panel', item);
    if (btn) btn.setAttribute('aria-expanded', 'true');
    if (panel) panel.hidden = false;
  }

  function goVertical(id, engineId) {
    closeAll();
    var v = VERTICALS.find(function (x) { return x.id === id; });
    if (typeof global.filterCategory === 'function') {
      global.filterCategory(id);
    }
    var target = engineId || (v && v.primary);
    if (target && typeof global.switchEngine === 'function') {
      global.switchEngine(target, true);
    } else if (target === 'tab-banking-hub' && typeof global.scrollToBankingHub === 'function') {
      global.scrollToBankingHub();
    } else {
      var calc = document.getElementById('calculators');
      if (calc) calc.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (typeof global.showToast === 'function' && v) {
      global.showToast(v.label + ' tools');
    }
  }

  function isHomePath() {
    var p = location.pathname || '/';
    // Only the real site root — NOT every "/slug/" landing (those also end in "/").
    return p === '/' || p === '/index.html' || /\/index\.html$/i.test(p);
  }

  function onLinkClick(e) {
    var a = e.target.closest('a[data-afc-engine], a[data-afc-vertical]');
    if (!a) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    var engine = a.getAttribute('data-afc-engine');
    var vertical = a.getAttribute('data-afc-vertical');
    if (!engine && !vertical) return;
    // Homepage only: SPA switch. Landing pages must follow href normally.
    if (!isHomePath()) return;
    // Prefer dedicated calculator URLs when present (works even if SPA engine is late).
    var href = a.getAttribute('href') || '';
    if (href && href.charAt(0) === '/' && href.indexOf('/#') !== 0 && href !== '/') {
      e.preventDefault();
      closeAll();
      location.assign(href);
      return;
    }
    e.preventDefault();
    goVertical(vertical || '', engine || null);
  }

  function bind() {
    var nav = $('.afc-mega-nav');
    if (!nav || nav.dataset.bound === '1') return;
    nav.dataset.bound = '1';

    $all('.afc-mega-trigger', nav).forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        openVertical(btn.getAttribute('data-vertical'));
      });
    });

    var mobileToggle = $('.afc-mega-mobile-toggle');
    if (mobileToggle) {
      mobileToggle.addEventListener('click', function (e) {
        e.preventDefault();
        var drawer = $('.afc-mega-drawer');
        var open = drawer && drawer.classList.toggle('is-open');
        mobileToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    nav.addEventListener('click', onLinkClick);
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.afc-mega-nav')) closeAll();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeAll();
    });
  }

  function calcLifeInsurance() {
    var income = parseFloat(($('#ins-life-income') || {}).value) || 0;
    var years = parseFloat(($('#ins-life-years') || {}).value) || 0;
    var savings = parseFloat(($('#ins-life-savings') || {}).value) || 0;
    var existing = parseFloat(($('#ins-life-existing') || {}).value) || 0;
    var need = Math.max(0, income * years - savings - existing);
    var out = $('#ins-life-need');
    if (out) {
      out.textContent = need.toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      });
    }
  }

  function calcAutoInsurance() {
    var premium = parseFloat(($('#ins-auto-premium') || {}).value) || 0;
    var income = parseFloat(($('#ins-auto-income') || {}).value) || 0;
    var annual = premium * 12;
    var pct = income > 0 ? (annual / income) * 100 : 0;
    var outA = $('#ins-auto-annual');
    var outP = $('#ins-auto-pct');
    if (outA) {
      outA.textContent = annual.toLocaleString(undefined, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0
      });
    }
    if (outP) outP.textContent = pct.toFixed(1) + '% of income';
  }

  function bindInsurance() {
    ['ins-life-income', 'ins-life-years', 'ins-life-savings', 'ins-life-existing'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', calcLifeInsurance);
    });
    ['ins-auto-premium', 'ins-auto-income'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', calcAutoInsurance);
    });
    calcLifeInsurance();
    calcAutoInsurance();
  }

  function init() {
    bind();
    bindInsurance();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  global.AFC_VERTICALS = VERTICALS;
  global.afcOpenVertical = openVertical;
  global.afcGoVertical = goVertical;
  global.afcCloseMegaNav = closeAll;
  global.calcLifeInsurance = calcLifeInsurance;
  global.calcAutoInsurance = calcAutoInsurance;
})(typeof window !== 'undefined' ? window : this);
