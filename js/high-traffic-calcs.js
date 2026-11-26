/**
 * High-traffic calculator engines (amortization, balance transfer, HYSA, CD,
 * Roth IRA, down payment, car/rent affordability, APR compare).
 * Injects panels + sidebar tabs; math stays local / educational.
 */
(function (global) {
  'use strict';

  try {
    global.__AFC_BOOT_SEARCH__ = global.__AFC_BOOT_SEARCH__ || global.location.search || '';
  } catch (e) {
    global.__AFC_BOOT_SEARCH__ = '';
  }

  function money(n) {
    if (typeof global.formatCurrency === 'function') return global.formatCurrency(n);
    return '$' + (Number(n) || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function num(id) {
    var el = document.getElementById(id);
    var v = el ? parseFloat(el.value) : NaN;
    return Number.isFinite(v) ? v : 0;
  }

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }

  function pmt(principal, annualPct, months) {
    if (principal <= 0 || months <= 0) return 0;
    var r = annualPct / 100 / 12;
    if (r === 0) return principal / months;
    return principal * (r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
  }

  function field(id, label, value, attrs) {
    attrs = attrs || {};
    var min = attrs.min != null ? attrs.min : 0;
    var max = attrs.max != null ? attrs.max : '';
    var step = attrs.step != null ? attrs.step : '1';
    var unit = attrs.unit || '';
    var moneyish = attrs.money;
    return (
      '<div><label for="' + id + '" class="block text-xs font-bold text-slate-300 mb-1">' + label + '</label>' +
      '<div class="relative">' +
      (moneyish ? '<span class="absolute left-3 top-2.5 text-slate-500 font-mono currency-symbol-tag">$</span>' : '') +
      '<input type="number" id="' + id + '" value="' + value + '" min="' + min + '"' +
      (max !== '' ? ' max="' + max + '"' : '') +
      ' step="' + step + '" oninput="' + attrs.oninput + '()" class="w-full bg-slate-950 border border-slate-800 rounded-xl ' +
      (moneyish ? 'pl-8 ' : '') + 'pr-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-emerald-500">' +
      (unit ? '<span class="absolute right-3 top-2.5 text-xs text-slate-500 font-bold">' + unit + '</span>' : '') +
      '</div></div>'
    );
  }

  function panel(cfg) {
    return (
      '<section id="engine-' + cfg.id + '" class="engine-panel hidden glass-panel rounded-2xl p-6 sm:p-8">' +
      '<div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800/80 gap-3">' +
      '<div><h2 class="text-xl sm:text-2xl font-black text-white">' + cfg.title + '</h2>' +
      '<p class="text-sm text-slate-400 mt-1">' + cfg.subtitle + '</p></div>' +
      '<div class="engine-actions flex items-center gap-2 no-print">' +
      '<button type="button" onclick="switchEngine(\'tab-' + cfg.id + '\')" class="px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900 border border-slate-800 rounded-lg">Focus</button>' +
      '</div></div>' +
      '<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">' +
      '<div class="space-y-3">' + cfg.fields + '</div>' +
      '<div class="space-y-4">' + cfg.results + '</div>' +
      '</div>' +
      (cfg.extra || '') +
      '</section>'
    );
  }

  function resultCard(mainId, label, subHtml) {
    return (
      '<div class="result-display-card rounded-2xl p-5 text-center output-item">' +
      '<span class="output-label text-xs font-bold text-slate-400">' + label + '</span>' +
      '<div id="' + mainId + '" class="output-value text-3xl sm:text-4xl font-black text-emerald-400 font-mono-num mt-1">$ 0.00</div>' +
      (subHtml || '') +
      '</div>'
    );
  }

  function metric(id, label) {
    return (
      '<div class="bg-slate-900/90 rounded-xl p-3 border border-slate-800/80 output-item">' +
      '<span class="output-label text-[10px] font-bold text-slate-400">' + label + '</span>' +
      '<div id="' + id + '" class="output-value text-base font-bold text-slate-200 font-mono-num mt-1">—</div></div>'
    );
  }

  var ENGINES = [
    {
      id: 'amortization',
      cat: 'home',
      tab: 'Amortization Schedule',
      href: '/amortization-calculator/',
      title: 'Amortization Schedule Calculator',
      subtitle: 'Monthly principal, interest, and remaining balance for any loan. Educational schedule — not a lender disclosure.',
      fields:
        field('amort-principal', 'Loan amount', 360000, { money: true, step: 1000, oninput: 'calcAmortization' }) +
        field('amort-rate', 'Annual interest rate', 6.2, { min: 0, max: 40, step: 0.05, unit: '%', oninput: 'calcAmortization' }) +
        field('amort-years', 'Term (years)', 30, { min: 1, max: 50, step: 1, oninput: 'calcAmortization' }) +
        field('amort-extra', 'Extra principal / month', 0, { money: true, step: 25, oninput: 'calcAmortization' }),
      results:
        resultCard('amort-payment', 'Monthly payment (P&I)') +
        '<div class="grid grid-cols-2 gap-3">' +
        metric('amort-interest', 'Total interest') +
        metric('amort-payoff', 'Payoff time') +
        metric('amort-total', 'Total paid') +
        metric('amort-saved', 'Interest saved vs base') +
        '</div>',
      extra:
        '<div class="mt-6 overflow-x-auto rounded-xl border border-slate-800">' +
        '<table class="w-full text-xs text-left"><thead class="bg-slate-950 text-slate-400">' +
        '<tr><th class="p-2">#</th><th class="p-2">Payment</th><th class="p-2">Principal</th><th class="p-2">Interest</th><th class="p-2">Balance</th></tr>' +
        '</thead><tbody id="amort-table-body" class="text-slate-200 font-mono"></tbody></table>' +
        '<p class="text-[10px] text-slate-500 p-2">Showing first 24 months + last payment. Full CSV available from the mortgage Schedule button when modeling a home loan.</p></div>'
    },
    {
      id: 'balancetransfer',
      cat: 'credit-cards',
      tab: 'Balance Transfer Savings',
      href: '/balance-transfer-calculator/',
      title: 'Balance Transfer Calculator',
      subtitle: 'Estimate interest saved by moving card debt to a 0% (or low) intro APR, after the transfer fee.',
      fields:
        field('bt-balance', 'Current card balance', 8000, { money: true, step: 100, oninput: 'calcBalanceTransfer' }) +
        field('bt-apr', 'Current APR', 22.9, { min: 0, max: 40, step: 0.1, unit: '%', oninput: 'calcBalanceTransfer' }) +
        field('bt-payment', 'Monthly payment', 250, { money: true, step: 10, oninput: 'calcBalanceTransfer' }) +
        field('bt-intro', 'Intro APR on new card', 0, { min: 0, max: 40, step: 0.1, unit: '%', oninput: 'calcBalanceTransfer' }) +
        field('bt-months', 'Intro period (months)', 15, { min: 1, max: 36, step: 1, oninput: 'calcBalanceTransfer' }) +
        field('bt-fee', 'Transfer fee %', 3, { min: 0, max: 10, step: 0.1, unit: '%', oninput: 'calcBalanceTransfer' }) +
        field('bt-go-to', 'APR after intro', 18.9, { min: 0, max: 40, step: 0.1, unit: '%', oninput: 'calcBalanceTransfer' }),
      results:
        resultCard('bt-savings', 'Estimated interest saved') +
        '<div class="grid grid-cols-2 gap-3">' +
        metric('bt-fee-amt', 'Transfer fee') +
        metric('bt-new-balance', 'Balance after fee') +
        metric('bt-old-interest', 'Interest if you stay') +
        metric('bt-new-interest', 'Interest after transfer') +
        '</div>' +
        '<p id="bt-note" class="text-[11px] text-slate-400 leading-relaxed"></p>'
    },
    {
      id: 'savings',
      cat: 'banking',
      tab: 'HYSA / Savings Growth',
      href: '/savings-calculator/',
      title: 'Savings & HYSA Calculator',
      subtitle: 'Project high-yield savings growth with monthly deposits. APY is compounded monthly for planning.',
      fields:
        field('sav-start', 'Starting balance', 5000, { money: true, step: 100, oninput: 'calcSavings' }) +
        field('sav-monthly', 'Monthly deposit', 300, { money: true, step: 25, oninput: 'calcSavings' }) +
        field('sav-apy', 'APY', 4.2, { min: 0, max: 20, step: 0.05, unit: '%', oninput: 'calcSavings' }) +
        field('sav-years', 'Years', 5, { min: 1, max: 50, step: 1, oninput: 'calcSavings' }),
      results:
        resultCard('sav-end', 'Projected balance') +
        '<div class="grid grid-cols-2 gap-3">' +
        metric('sav-contributed', 'Total deposited') +
        metric('sav-interest', 'Interest earned') +
        '</div>'
    },
    {
      id: 'cd',
      cat: 'banking',
      tab: 'CD / Certificate Calculator',
      href: '/cd-calculator/',
      title: 'CD Calculator',
      subtitle: 'Simple certificate of deposit maturity value at the APY and term you enter. Not a live bank quote.',
      fields:
        field('cd-principal', 'Deposit amount', 10000, { money: true, step: 100, oninput: 'calcCd' }) +
        field('cd-apy', 'APY', 4.5, { min: 0, max: 20, step: 0.05, unit: '%', oninput: 'calcCd' }) +
        field('cd-months', 'Term (months)', 12, { min: 1, max: 120, step: 1, oninput: 'calcCd' }) +
        '<div><label for="cd-compound" class="block text-xs font-bold text-slate-300 mb-1">Compounding</label>' +
        '<select id="cd-compound" onchange="calcCd()" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-white">' +
        '<option value="365">Daily</option><option value="12" selected>Monthly</option>' +
        '<option value="4">Quarterly</option><option value="1">Annually</option></select></div>',
      results:
        resultCard('cd-maturity', 'Value at maturity') +
        '<div class="grid grid-cols-2 gap-3">' +
        metric('cd-interest', 'Interest earned') +
        metric('cd-apy-eff', 'Effective yield') +
        '</div>'
    },
    {
      id: 'moneymarket',
      cat: 'banking',
      tab: 'Money Market Growth',
      href: '/money-market-calculator/',
      title: 'Money Market Calculator',
      subtitle: 'Project money-market account growth with monthly deposits. APY is compounded monthly for planning — not a live bank quote.',
      fields:
        field('mm-start', 'Starting balance', 8000, { money: true, step: 100, oninput: 'calcMoneyMarket' }) +
        field('mm-monthly', 'Monthly deposit', 250, { money: true, step: 25, oninput: 'calcMoneyMarket' }) +
        field('mm-apy', 'APY', 3.95, { min: 0, max: 20, step: 0.05, unit: '%', oninput: 'calcMoneyMarket' }) +
        field('mm-years', 'Years', 3, { min: 1, max: 50, step: 1, oninput: 'calcMoneyMarket' }) +
        '<div id="mm-rate-row" class="afc-mm-rate-row" aria-live="polite">Loading editorial money-market rates…</div>',
      results:
        resultCard('mm-end', 'Projected balance') +
        '<div class="grid grid-cols-2 gap-3">' +
        metric('mm-contributed', 'Total deposited') +
        metric('mm-interest', 'Interest earned') +
        '</div>'
    },
    {
      id: 'rothira',
      cat: 'investing',
      tab: 'Roth IRA Growth',
      href: '/roth-ira-calculator/',
      title: 'Roth IRA Calculator',
      subtitle: 'Project Roth IRA growth with annual contributions. Uses the contribution amount you enter (2026 limit awareness is yours to confirm).',
      fields:
        field('roth-start', 'Current balance', 15000, { money: true, step: 500, oninput: 'calcRothIra' }) +
        field('roth-annual', 'Annual contribution', 7000, { money: true, step: 100, oninput: 'calcRothIra' }) +
        field('roth-return', 'Expected annual return', 7, { min: 0, max: 20, step: 0.1, unit: '%', oninput: 'calcRothIra' }) +
        field('roth-years', 'Years until withdrawal', 25, { min: 1, max: 60, step: 1, oninput: 'calcRothIra' }),
      results:
        resultCard('roth-end', 'Projected Roth balance') +
        '<div class="grid grid-cols-2 gap-3">' +
        metric('roth-contributed', 'Total contributions') +
        metric('roth-growth', 'Estimated growth') +
        '</div>' +
        '<p class="text-[11px] text-slate-400">Roth withdrawals of contributions are generally tax-free; earnings rules depend on age and holding period. Not tax advice.</p>'
    },
    {
      id: 'downpayment',
      cat: 'home',
      tab: 'Down Payment Planner',
      href: '/down-payment-calculator/',
      title: 'Down Payment Calculator',
      subtitle: 'See cash needed at a target down-payment percent, plus optional closing-cost buffer.',
      fields:
        field('dp-price', 'Home price', 450000, { money: true, step: 1000, oninput: 'calcDownPayment' }) +
        field('dp-percent', 'Down payment %', 20, { min: 0, max: 100, step: 0.5, unit: '%', oninput: 'calcDownPayment' }) +
        field('dp-saved', 'Already saved', 25000, { money: true, step: 500, oninput: 'calcDownPayment' }) +
        field('dp-monthly', 'Monthly save rate', 800, { money: true, step: 50, oninput: 'calcDownPayment' }) +
        field('dp-closing', 'Closing costs % of price', 3, { min: 0, max: 10, step: 0.1, unit: '%', oninput: 'calcDownPayment' }),
      results:
        resultCard('dp-needed', 'Down payment cash') +
        '<div class="grid grid-cols-2 gap-3">' +
        metric('dp-loan', 'Loan amount') +
        metric('dp-closing-amt', 'Closing-cost buffer') +
        metric('dp-total-cash', 'Total cash to close-ish') +
        metric('dp-months', 'Months to goal') +
        '</div>'
    },
    {
      id: 'carafford',
      cat: 'loans',
      tab: 'Car Affordability',
      href: '/car-affordability-calculator/',
      title: 'How Much Car Can I Afford',
      subtitle: 'Back into a vehicle price from income, term, rate, down payment, and a payment-to-income cap.',
      fields:
        field('car-income', 'Monthly take-home pay', 4500, { money: true, step: 50, oninput: 'calcCarAfford' }) +
        field('car-pct', 'Max payment % of income', 12, { min: 1, max: 30, step: 0.5, unit: '%', oninput: 'calcCarAfford' }) +
        field('car-rate', 'Loan APR', 6.5, { min: 0, max: 30, step: 0.1, unit: '%', oninput: 'calcCarAfford' }) +
        field('car-months', 'Term (months)', 60, { min: 12, max: 96, step: 1, oninput: 'calcCarAfford' }) +
        field('car-down', 'Down payment / trade', 3000, { money: true, step: 100, oninput: 'calcCarAfford' }) +
        field('car-other', 'Other auto debt / mo', 0, { money: true, step: 25, oninput: 'calcCarAfford' }),
      results:
        resultCard('car-price', 'Est. vehicle budget') +
        '<div class="grid grid-cols-2 gap-3">' +
        metric('car-payment', 'Max payment') +
        metric('car-loan', 'Max loan amount') +
        '</div>'
    },
    {
      id: 'rentafford',
      cat: 'personal-finance',
      tab: 'Rent Affordability',
      href: '/rent-affordability-calculator/',
      title: 'How Much Rent Can I Afford',
      subtitle: 'Apply a rent-to-income rule (default 30%) and see leftover cash after other debts.',
      fields:
        field('rent-income', 'Monthly gross or take-home', 5000, { money: true, step: 50, oninput: 'calcRentAfford' }) +
        '<div><label for="rent-basis" class="block text-xs font-bold text-slate-300 mb-1">Income basis</label>' +
        '<select id="rent-basis" onchange="calcRentAfford()" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-white">' +
        '<option value="gross">Gross</option><option value="net" selected>Take-home</option></select></div>' +
        field('rent-pct', 'Rent share of income', 30, { min: 10, max: 50, step: 1, unit: '%', oninput: 'calcRentAfford' }) +
        field('rent-debts', 'Other monthly debts', 400, { money: true, step: 25, oninput: 'calcRentAfford' }) +
        field('rent-utils', 'Est. utilities / mo', 180, { money: true, step: 10, oninput: 'calcRentAfford' }),
      results:
        resultCard('rent-max', 'Suggested max rent') +
        '<div class="grid grid-cols-2 gap-3">' +
        metric('rent-housing', 'Rent + utilities') +
        metric('rent-left', 'Left after debts') +
        '</div>'
    },
    {
      id: 'aprcompare',
      cat: 'loans',
      tab: 'APR / Loan Compare',
      href: '/apr-loan-comparison-calculator/',
      title: 'APR & Loan Comparison Calculator',
      subtitle: 'Compare two loans side by side: payment, total interest, and all-in cost.',
      fields:
        '<p class="text-[10px] font-black uppercase text-emerald-400">Loan A</p>' +
        field('apr-a-amount', 'Amount', 25000, { money: true, step: 500, oninput: 'calcAprCompare' }) +
        field('apr-a-rate', 'APR', 9.9, { min: 0, max: 40, step: 0.05, unit: '%', oninput: 'calcAprCompare' }) +
        field('apr-a-months', 'Term (months)', 48, { min: 1, max: 360, step: 1, oninput: 'calcAprCompare' }) +
        field('apr-a-fees', 'Upfront fees', 0, { money: true, step: 25, oninput: 'calcAprCompare' }) +
        '<p class="text-[10px] font-black uppercase text-emerald-400 pt-2">Loan B</p>' +
        field('apr-b-amount', 'Amount', 25000, { money: true, step: 500, oninput: 'calcAprCompare' }) +
        field('apr-b-rate', 'APR', 7.5, { min: 0, max: 40, step: 0.05, unit: '%', oninput: 'calcAprCompare' }) +
        field('apr-b-months', 'Term (months)', 60, { min: 1, max: 360, step: 1, oninput: 'calcAprCompare' }) +
        field('apr-b-fees', 'Upfront fees', 499, { money: true, step: 25, oninput: 'calcAprCompare' }),
      results:
        resultCard('apr-winner', 'Lower total cost') +
        '<div class="grid grid-cols-2 gap-3">' +
        metric('apr-a-pmt', 'A monthly') +
        metric('apr-b-pmt', 'B monthly') +
        metric('apr-a-total', 'A total cost') +
        metric('apr-b-total', 'B total cost') +
        metric('apr-a-int', 'A interest') +
        metric('apr-b-int', 'B interest') +
        '</div>'
    }
  ];

  function calcAmortization() {
    var principal = num('amort-principal');
    var rate = num('amort-rate');
    var years = num('amort-years');
    var extra = num('amort-extra');
    var months = Math.max(1, Math.round(years * 12));
    var basePmt = pmt(principal, rate, months);
    var pay = basePmt + Math.max(0, extra);
    var bal = principal;
    var r = rate / 100 / 12;
    var interestTotal = 0;
    var rows = [];
    var m = 0;
    while (bal > 0.5 && m < months + 600) {
      m++;
      var interest = bal * r;
      var principalPart = Math.min(bal, pay - interest);
      if (principalPart <= 0) break;
      bal = Math.max(0, bal - principalPart);
      interestTotal += interest;
      rows.push({ m: m, pay: principalPart + interest, principal: principalPart, interest: interest, bal: bal });
      if (bal <= 0.5) break;
    }
    var baseInterest = Math.max(0, basePmt * months - principal);
    setText('amort-payment', money(basePmt));
    setText('amort-interest', money(interestTotal));
    setText('amort-payoff', m + ' mo (' + (m / 12).toFixed(1) + ' yr)');
    setText('amort-total', money(principal + interestTotal));
    setText('amort-saved', money(Math.max(0, baseInterest - interestTotal)));
    var body = document.getElementById('amort-table-body');
    if (body) {
      var show = rows.slice(0, 24);
      if (rows.length > 25) show = show.concat(rows.slice(-1));
      body.innerHTML = show.map(function (row) {
        return '<tr class="border-t border-slate-800"><td class="p-2">' + row.m + '</td><td class="p-2">' +
          money(row.pay) + '</td><td class="p-2">' + money(row.principal) + '</td><td class="p-2">' +
          money(row.interest) + '</td><td class="p-2">' + money(row.bal) + '</td></tr>';
      }).join('');
    }
  }

  function simulatePayoff(balance, apr, payment, maxMonths) {
    var bal = balance;
    var r = apr / 100 / 12;
    var interest = 0;
    var m = 0;
    if (payment <= bal * r + 0.01 && r > 0) {
      return { months: maxMonths, interest: bal * r * maxMonths, shortfall: true };
    }
    while (bal > 0.5 && m < maxMonths) {
      m++;
      var i = bal * r;
      var p = Math.min(bal, payment - i);
      if (p <= 0) return { months: maxMonths, interest: interest, shortfall: true };
      bal -= p;
      interest += i;
    }
    return { months: m, interest: interest, shortfall: bal > 0.5 };
  }

  function calcBalanceTransfer() {
    var balance = num('bt-balance');
    var apr = num('bt-apr');
    var payment = num('bt-payment');
    var intro = num('bt-intro');
    var introMo = Math.max(1, Math.round(num('bt-months')));
    var feePct = num('bt-fee');
    var goTo = num('bt-go-to');
    var fee = balance * (feePct / 100);
    var start = balance + fee;
    var stay = simulatePayoff(balance, apr, payment, 600);
    // Transfer path: intro rate for introMo, then go-to APR
    var bal = start;
    var interest = 0;
    var m = 0;
    var rIntro = intro / 100 / 12;
    var rGo = goTo / 100 / 12;
    while (bal > 0.5 && m < 600) {
      m++;
      var r = m <= introMo ? rIntro : rGo;
      var i = bal * r;
      var p = Math.min(bal, payment - i);
      if (p <= 0) { interest += i; break; }
      bal -= p;
      interest += i;
    }
    var savings = stay.interest - interest;
    setText('bt-savings', money(Math.max(0, savings - 0)));
    setText('bt-fee-amt', money(fee));
    setText('bt-new-balance', money(start));
    setText('bt-old-interest', money(stay.interest));
    setText('bt-new-interest', money(interest));
    var note = document.getElementById('bt-note');
    if (note) {
      note.textContent = savings > fee
        ? 'After the ' + money(fee) + ' fee, this transfer can cut interest if you keep the payment and clear the balance before high APR returns.'
        : 'With these inputs the fee may erase most of the interest savings — raise the payment or pick a longer 0% window.';
    }
  }

  function calcSavings() {
    var start = num('sav-start');
    var monthly = num('sav-monthly');
    var apy = num('sav-apy');
    var years = num('sav-years');
    var months = Math.max(1, Math.round(years * 12));
    var r = apy / 100 / 12;
    var bal = start;
    for (var i = 0; i < months; i++) {
      bal = bal * (1 + r) + monthly;
    }
    var contributed = start + monthly * months;
    setText('sav-end', money(bal));
    setText('sav-contributed', money(contributed));
    setText('sav-interest', money(Math.max(0, bal - contributed)));
  }

  function calcCd() {
    var p = num('cd-principal');
    var apy = num('cd-apy');
    var months = Math.max(1, Math.round(num('cd-months')));
    var freq = parseFloat((document.getElementById('cd-compound') || {}).value) || 12;
    var years = months / 12;
    var maturity = p * Math.pow(1 + (apy / 100) / freq, freq * years);
    var interest = maturity - p;
    setText('cd-maturity', money(maturity));
    setText('cd-interest', money(interest));
    setText('cd-apy-eff', ((interest / p) * (12 / months) * 100).toFixed(2) + '% ann.');
  }

  function calcMoneyMarket() {
    var start = num('mm-start');
    var monthly = num('mm-monthly');
    var apy = num('mm-apy');
    var years = num('mm-years');
    var months = Math.max(1, Math.round(years * 12));
    var r = apy / 100 / 12;
    var bal = start;
    for (var i = 0; i < months; i++) {
      bal = bal * (1 + r) + monthly;
    }
    var contributed = start + monthly * months;
    setText('mm-end', money(bal));
    setText('mm-contributed', money(contributed));
    setText('mm-interest', money(Math.max(0, bal - contributed)));
  }

  function fillMoneyMarketRateRow(data) {
    var row = document.getElementById('mm-rate-row');
    if (!row || !data) return;
    var board = data.rateBoard || {};
    var card = (board.cards || []).filter(function (c) { return c.id === 'money-market'; })[0];
    var bench = ((data.markets || {}).US || {}).moneyMarket || {};
    var best = card && typeof card.best === 'number' ? card.best.toFixed(2) + '%' : '—';
    var avg = card && typeof card.average === 'number' ? card.average.toFixed(2) + '%' : '—';
    var national = typeof bench.value === 'number' ? bench.value.toFixed(2) + '%' : '—';
    var asOf = data.asOf ? (' · as of ' + data.asOf) : '';
    row.innerHTML =
      '<span>Editorial MM desk <strong>' + best + '</strong></span>' +
      '<span>Avg desk <strong>' + avg + '</strong></span>' +
      '<span>US benchmark <strong>' + national + '</strong>' + asOf + '</span>' +
      '<a href="/banking-rates/" class="underline text-emerald-300">Banking rates</a>';
    var apyInput = document.getElementById('mm-apy');
    if (apyInput && card && typeof card.best === 'number' && !apyInput.dataset.seeded) {
      apyInput.value = String(card.best);
      apyInput.dataset.seeded = '1';
      calcMoneyMarket();
    }
  }

  function hydrateMoneyMarketRates() {
    function go(data) { fillMoneyMarketRateRow(data); }
    if (global.MarketRates && typeof global.MarketRates.load === 'function') {
      global.MarketRates.load().then(function (board) {
        go(board || (global.MarketRates.getBoard && global.MarketRates.getBoard()));
      });
    } else {
      fetch('/data/market-rates.json', { credentials: 'same-origin' })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(go)
        .catch(function () {});
    }
  }

  function calcRothIra() {
    var start = num('roth-start');
    var annual = num('roth-annual');
    var ret = num('roth-return') / 100;
    var years = Math.max(1, Math.round(num('roth-years')));
    var bal = start;
    for (var y = 0; y < years; y++) {
      bal = (bal + annual) * (1 + ret);
    }
    var contributed = start + annual * years;
    setText('roth-end', money(bal));
    setText('roth-contributed', money(contributed));
    setText('roth-growth', money(Math.max(0, bal - contributed)));
  }

  function calcDownPayment() {
    var price = num('dp-price');
    var pct = num('dp-percent') / 100;
    var saved = num('dp-saved');
    var monthly = num('dp-monthly');
    var closingPct = num('dp-closing') / 100;
    var down = price * pct;
    var loan = Math.max(0, price - down);
    var closing = price * closingPct;
    var totalCash = down + closing;
    var gap = Math.max(0, totalCash - saved);
    var months = monthly > 0 ? Math.ceil(gap / monthly) : (gap > 0 ? Infinity : 0);
    setText('dp-needed', money(down));
    setText('dp-loan', money(loan));
    setText('dp-closing-amt', money(closing));
    setText('dp-total-cash', money(totalCash));
    setText('dp-months', months === Infinity ? '—' : (months + ' mo'));
  }

  function calcCarAfford() {
    var income = num('car-income');
    var pct = num('car-pct') / 100;
    var rate = num('car-rate');
    var months = Math.max(1, Math.round(num('car-months')));
    var down = num('car-down');
    var other = num('car-other');
    var maxPay = Math.max(0, income * pct - other);
    var r = rate / 100 / 12;
    var maxLoan = 0;
    if (r === 0) maxLoan = maxPay * months;
    else maxLoan = maxPay * (Math.pow(1 + r, months) - 1) / (r * Math.pow(1 + r, months));
    setText('car-price', money(maxLoan + down));
    setText('car-payment', money(maxPay));
    setText('car-loan', money(maxLoan));
  }

  function calcRentAfford() {
    var income = num('rent-income');
    var pct = num('rent-pct') / 100;
    var debts = num('rent-debts');
    var utils = num('rent-utils');
    var maxRent = Math.max(0, income * pct);
    var left = income - maxRent - utils - debts;
    setText('rent-max', money(maxRent));
    setText('rent-housing', money(maxRent + utils));
    setText('rent-left', money(left));
  }

  function loanCost(amount, rate, months, fees) {
    var payment = pmt(amount, rate, months);
    var interest = Math.max(0, payment * months - amount);
    return { payment: payment, interest: interest, total: payment * months + fees };
  }

  function calcAprCompare() {
    var a = loanCost(num('apr-a-amount'), num('apr-a-rate'), Math.max(1, Math.round(num('apr-a-months'))), num('apr-a-fees'));
    var b = loanCost(num('apr-b-amount'), num('apr-b-rate'), Math.max(1, Math.round(num('apr-b-months'))), num('apr-b-fees'));
    setText('apr-a-pmt', money(a.payment));
    setText('apr-b-pmt', money(b.payment));
    setText('apr-a-total', money(a.total));
    setText('apr-b-total', money(b.total));
    setText('apr-a-int', money(a.interest));
    setText('apr-b-int', money(b.interest));
    setText('apr-winner', a.total <= b.total ? 'Loan A' : 'Loan B');
  }

  function inject() {
    if (document.getElementById('engine-amortization')) return;
    var stage = document.getElementById('engine-stage');
    var nav = stage ? stage.closest('main') : null;
    var tabNav = document.querySelector('aside nav.flex.flex-col, aside nav');
    // Prefer the engines nav specifically
    tabNav = document.querySelector('aside .custom-scrollbar') || tabNav;

    var html = ENGINES.map(panel).join('');
    if (stage) {
      var anchor = document.getElementById('engine-airbnb') || stage.lastElementChild;
      if (anchor && anchor.insertAdjacentHTML) {
        anchor.insertAdjacentHTML('afterend', html);
      } else {
        stage.insertAdjacentHTML('beforeend', html);
      }
    }

    if (tabNav) {
      var tabs = ENGINES.map(function (e) {
        return '<a id="tab-' + e.id + '" data-cat="' + e.cat + '" class="tab-btn w-full text-left px-3 py-2.5 text-xs font-bold rounded-xl transition-all cursor-pointer" href="' + e.href + '">' + e.tab + '</a>';
      }).join('');
      var mort = document.getElementById('tab-mortgage');
      if (mort) mort.insertAdjacentHTML('afterend', tabs);
      else tabNav.insertAdjacentHTML('beforeend', tabs);

      ENGINES.forEach(function (e) {
        var btn = document.getElementById('tab-' + e.id);
        if (!btn || btn.dataset.htBound === '1') return;
        btn.dataset.htBound = '1';
        btn.addEventListener('click', function (event) {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
          if (btn.tagName === 'A') event.preventDefault();
          if (typeof global.goToCalculatorPage === 'function') global.goToCalculatorPage(btn.id);
          else if (typeof global.switchEngine === 'function') global.switchEngine(btn.id);
        });
      });
    }

    var mobile = document.getElementById('mobile-engine-select');
    if (mobile) {
      var og = document.createElement('optgroup');
      og.label = 'High-traffic tools';
      ENGINES.forEach(function (e) {
        var opt = document.createElement('option');
        opt.value = 'tab-' + e.id;
        opt.textContent = e.tab;
        og.appendChild(opt);
      });
      mobile.appendChild(og);
    }

    var badge = document.querySelector('aside .font-mono.rounded');
    // soft bump label if present
    document.querySelectorAll('aside span.font-mono').forEach(function (el) {
      if (/50/.test(el.textContent)) el.textContent = el.textContent.replace('50', '60');
    });
  }

  function bindAndRun() {
    inject();
    [
      calcAmortization, calcBalanceTransfer, calcSavings, calcCd, calcMoneyMarket, calcRothIra,
      calcDownPayment, calcCarAfford, calcRentAfford, calcAprCompare
    ].forEach(function (fn) { try { fn(); } catch (e) {} });
    try { hydrateMoneyMarketRates(); } catch (e) {}
    // Re-run deep-link open after panels exist (mechanics may have run first)
    function reopen() {
      if (typeof global.openEngineFromQuery === 'function') {
        try { global.openEngineFromQuery(); } catch (e) {}
      }
    }
    reopen();
    setTimeout(reopen, 0);
    setTimeout(reopen, 50);
  }

  global.calcAmortization = calcAmortization;
  global.calcBalanceTransfer = calcBalanceTransfer;
  global.calcSavings = calcSavings;
  global.calcCd = calcCd;
  global.calcMoneyMarket = calcMoneyMarket;
  global.calcRothIra = calcRothIra;
  global.calcDownPayment = calcDownPayment;
  global.calcCarAfford = calcCarAfford;
  global.calcRentAfford = calcRentAfford;
  global.calcAprCompare = calcAprCompare;
  global.AFC_HIGH_TRAFFIC_ENGINES = ENGINES;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindAndRun);
  } else {
    bindAndRun();
  }
})(typeof window !== 'undefined' ? window : this);
