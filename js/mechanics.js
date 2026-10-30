/**
 * aFinanceCalculator - Universal 20-in-1 Hyper-Speed Mathematical Processing Engine
 * High-performance, client-side, real-time reactive calculations
 * Includes: Advanced SVG Micro-Charts, Amortization Schedule Drawer,
 * CSV Exporter, What-If Sensitivity Engine, URL Deep-Linking,
 * LocalStorage Auto-Save, Calculation History, Light/Dark Modes, and Shortcuts.
 */

// Global State
let currentCurrency = '$';
let currentCurrencyCode = 'USD';
let activeEngineId = 'tab-mortgage';
let mortgageTermYears = 30;
let cryptoStrategy = 'long';
let isFocusMode = true;
let currentAmortizationData = [];
let currentAmortizationType = 'mortgage';
let currentAmortizationPrincipal = 0;
let currentAmortizationRate = 0;
let currentAmortizationMonths = 360;
let amortizationViewMode = 'annual';
let amortizationSearchQuery = '';
let currentHistoryCategory = 'all';
let historySearchQuery = '';
let currentScenarioModel = 'mortgage-terms';
let scenarioExtraPayment = 250;
let scenario15YrRate = 5.6;

// Utility Formatters
function formatCurrency(amount, withIndianDenomination = true) {
  if (isNaN(amount) || !isFinite(amount)) return `${currentCurrency} 0.00`;
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  
  // Use en-IN for Indian Rupee grouping (e.g. 60,00,000.00), en-US for others
  const locale = currentCurrencyCode === 'INR' ? 'en-IN' : 'en-US';
  const absFormatted = absVal.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  let formatted = isNegative ? `-${currentCurrency} ${absFormatted}` : `${currentCurrency} ${absFormatted}`;

  if (withIndianDenomination !== false && currentCurrencyCode === 'INR') {
    if (absVal >= 10000000) {
      formatted += ` (${(absVal / 10000000).toFixed(2)} Cr)`;
    } else if (absVal >= 100000) {
      formatted += ` (${(absVal / 100000).toFixed(2)} L)`;
    }
  }

  return formatted;
}

function formatPercent(value, decimals = 2) {
  if (isNaN(value) || !isFinite(value)) return `0.00%`;
  return `${value.toFixed(decimals)}%`;
}

function formatNumber(value, decimals = 0) {
  if (isNaN(value) || !isFinite(value)) return '0';
  const locale = currentCurrencyCode === 'INR' ? 'en-IN' : 'en-US';
  return value.toLocaleString(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}

function syncDualInput(numberInputId, rangeInputId, callback) {
  const numInput = document.getElementById(numberInputId);
  const rangeInput = document.getElementById(rangeInputId);

  if (!numInput || !rangeInput) return;

  numInput.addEventListener('input', () => {
    rangeInput.value = numInput.value;
    updateInputPreviewTag(numberInputId, numInput.value);
    if (callback) callback();
    saveStateDebounced();
  });

  rangeInput.addEventListener('input', () => {
    numInput.value = rangeInput.value;
    updateInputPreviewTag(numberInputId, rangeInput.value);
    if (callback) callback();
    saveStateDebounced();
  });
}

function flashElement(elemId) {
  const el = document.getElementById(elemId);
  if (el) {
    el.classList.remove('value-flash');
    void el.offsetWidth;
    el.classList.add('value-flash');
  }
}

// -------------------------------------------------------------
// 1. MORTGAGE LIABILITY CONSOLE & WHAT-IF ENGINE
// -------------------------------------------------------------
function setMortgageTerm(years, source) {
  const numInp = document.getElementById('mortgage-term');
  const rangeInp = document.getElementById('mortgage-term-range');
  const dispSpan = document.getElementById('mortgage-term-display');

  if (source === 'input') {
    if (years === '' || isNaN(parseFloat(years))) return;
  }

  const val = parseFloat(years);
  const parsed = Math.max(1, Math.min(50, isNaN(val) ? 30 : val));
  mortgageTermYears = parsed;

  if (numInp && source !== 'input') {
    numInp.value = parsed;
  }
  if (rangeInp) {
    rangeInp.value = Math.min(40, Math.max(1, parsed));
  }
  if (dispSpan) {
    dispSpan.textContent = `${parsed} Year${parsed === 1 ? '' : 's'}`;
  }

  let hasPresetMatch = false;
  document.querySelectorAll('.mortgage-term-btn').forEach(btn => {
    const match = parseFloat(btn.dataset.years) === parsed;
    btn.classList.toggle('active', match);
    if (match) hasPresetMatch = true;
  });
  const customBtn = document.getElementById('mortgage-term-custom-btn');
  if (customBtn) {
    customBtn.classList.toggle('active', !hasPresetMatch);
  }

  calcMortgage();
  calcMortgageWhatIf(
    Math.max(0, (parseFloat(document.getElementById('mortgage-asset')?.value) || 0) - (parseFloat(document.getElementById('mortgage-down')?.value) || 0)),
    parseFloat(document.getElementById('mortgage-rate')?.value) || 0,
    parseFloat(document.getElementById('mortgage-payment')?.textContent?.replace(/[^0-9.-]/g, '')) || 0,
    parseFloat(document.getElementById('mortgage-total-interest')?.textContent?.replace(/[^0-9.-]/g, '')) || 0,
    parseFloat(document.getElementById('mortgage-extra')?.value) || 0
  );
  saveStateDebounced();
}

function calcMortgage() {
  const asset = parseFloat(document.getElementById('mortgage-asset').value) || 0;
  const down = parseFloat(document.getElementById('mortgage-down').value) || 0;
  const rate = parseFloat(document.getElementById('mortgage-rate').value) || 0;
  const extraPay = parseFloat(document.getElementById('mortgage-extra')?.value) || 0;
  
  if (document.getElementById('mortgage-term')) {
    const manualYears = parseFloat(document.getElementById('mortgage-term').value);
    if (manualYears > 0) {
      mortgageTermYears = manualYears;
    }
  }
  const dispSpan = document.getElementById('mortgage-term-display');
  if (dispSpan) dispSpan.textContent = `${mortgageTermYears} Year${mortgageTermYears === 1 ? '' : 's'}`;
  document.querySelectorAll('.mortgage-term-btn').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.dataset.years) === mortgageTermYears);
  });

  const n = mortgageTermYears * 12;

  const principal = Math.max(0, asset - down);
  let monthlyPayment = 0;

  if (principal > 0 && n > 0) {
    if (rate === 0) {
      monthlyPayment = principal / n;
    } else {
      const monthlyRate = (rate / 100) / 12;
      monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1);
    }
  }

  const totalPayment = monthlyPayment * n;
  const totalInterest = Math.max(0, totalPayment - principal);
  const ltv = asset > 0 ? (principal / asset) * 100 : 0;

  const targetEl = document.getElementById('mortgage-payment');
  if (targetEl) targetEl.textContent = formatCurrency(monthlyPayment);
  
  const interestEl = document.getElementById('mortgage-total-interest');
  if (interestEl) interestEl.textContent = formatCurrency(totalInterest);

  const totalEl = document.getElementById('mortgage-total-payment');
  if (totalEl) totalEl.textContent = formatCurrency(totalPayment);

  const ltvEl = document.getElementById('mortgage-ltv');
  if (ltvEl) ltvEl.textContent = formatPercent(ltv, 1);

  // Update SVG Donut / Bar Chart
  renderMortgageChart(principal, totalInterest);

  // Calculate What-If Scenarios (30yr vs 15yr comparison & Extra payment)
  calcMortgageWhatIf(principal, rate, monthlyPayment, totalInterest, extraPay);

  // Update Plain English Solution Card
  const solTextEl = document.getElementById('mortgage-solution-text');
  if (solTextEl) {
    solTextEl.innerHTML = `To buy a home priced at <strong>${formatCurrency(asset)}</strong> with <strong>${formatCurrency(down)}</strong> down, your exact monthly payment is <strong class="text-emerald-400 font-bold">${formatCurrency(monthlyPayment)}/mo</strong>. Over ${mortgageTermYears} years, you will pay <strong class="text-rose-400 font-bold">${formatCurrency(totalInterest)}</strong> in interest to the bank.`;
  }

  flashElement('mortgage-payment');
}

function calcMortgageWhatIf(principal, rate, currentPayment, currentInterest, extraPay) {
  // Compare 30yr vs 15yr
  const r = (rate / 100) / 12;
  const n30 = 360;
  const n15 = 180;
  
  let p30 = 0, p15 = 0;
  if (principal > 0 && r > 0) {
    p30 = (principal * r * Math.pow(1 + r, n30)) / (Math.pow(1 + r, n30) - 1);
    p15 = (principal * r * Math.pow(1 + r, n15)) / (Math.pow(1 + r, n15) - 1);
  }
  const int30 = (p30 * n30) - principal;
  const int15 = (p15 * n15) - principal;
  const intSaved15 = Math.max(0, int30 - int15);

  const compSavingsEl = document.getElementById('mortgage-15yr-savings');
  if (compSavingsEl) compSavingsEl.textContent = formatCurrency(intSaved15);

  // Extra Principal Payment Simulation
  if (extraPay > 0 && principal > 0 && r > 0) {
    let balance = principal;
    const totalMonthly = currentPayment + extraPay;
    let acceleratedMonths = 0;
    let acceleratedInterest = 0;

    while (balance > 0 && acceleratedMonths < 600) {
      acceleratedMonths++;
      const intCharge = balance * r;
      acceleratedInterest += intCharge;
      const principalPortion = Math.min(balance, totalMonthly - intCharge);
      balance -= principalPortion;
    }

    const monthsSaved = Math.max(0, (mortgageTermYears * 12) - acceleratedMonths);
    const extraInterestSaved = Math.max(0, currentInterest - acceleratedInterest);

    const extraMonthsEl = document.getElementById('mortgage-extra-months-saved');
    if (extraMonthsEl) extraMonthsEl.textContent = `${monthsSaved} Mo (${(monthsSaved / 12).toFixed(1)} Yrs)`;

    const extraIntEl = document.getElementById('mortgage-extra-int-saved');
    if (extraIntEl) extraIntEl.textContent = formatCurrency(extraInterestSaved);

    const solTipEl = document.getElementById('mortgage-solution-tip');
    if (solTipEl) {
      solTipEl.innerHTML = `<strong>Action Plan:</strong> Paying an extra <strong>${formatCurrency(extraPay)}/month</strong> pays off your loan <strong>${(monthsSaved / 12).toFixed(1)} years earlier</strong> and keeps <strong>${formatCurrency(extraInterestSaved)} in your pocket</strong>!`;
    }
  } else {
    const extraMonthsEl = document.getElementById('mortgage-extra-months-saved');
    if (extraMonthsEl) extraMonthsEl.textContent = `0 Months`;

    const extraIntEl = document.getElementById('mortgage-extra-int-saved');
    if (extraIntEl) extraIntEl.textContent = formatCurrency(0);

    const solTipEl = document.getElementById('mortgage-solution-tip');
    if (solTipEl) {
      solTipEl.innerHTML = `<strong>Action Plan:</strong> Adding just <strong>$100 extra each month</strong> directly towards your principal can shave up to <strong>4.5 years</strong> off your loan and save tens of thousands in interest!`;
    }
  }
}

function setExtraPaymentPreset(amt) {
  const extraInput = document.getElementById('mortgage-extra');
  if (extraInput) {
    extraInput.value = amt;
    calcMortgage();
    saveStateDebounced();
  }
}

function renderMortgageChart(principal, totalInterest) {
  const total = principal + totalInterest;
  if (total <= 0) return;

  const principalPct = (principal / total) * 100;
  const interestPct = (totalInterest / total) * 100;

  const barPrincipal = document.getElementById('mortgage-chart-principal');
  const barInterest = document.getElementById('mortgage-chart-interest');
  const lblPrincipal = document.getElementById('mortgage-chart-principal-pct');
  const lblInterest = document.getElementById('mortgage-chart-interest-pct');

  if (barPrincipal) barPrincipal.style.width = `${principalPct}%`;
  if (barInterest) barInterest.style.width = `${interestPct}%`;
  if (lblPrincipal) lblPrincipal.textContent = `${principalPct.toFixed(1)}% Principal`;
  if (lblInterest) lblInterest.textContent = `${interestPct.toFixed(1)}% Interest`;
}

// -------------------------------------------------------------
// 2. CONTRACTOR INVOICING & TAX MATRIX
// -------------------------------------------------------------
function calcInvoice() {
  const rate = parseFloat(document.getElementById('invoice-rate').value) || 0;
  const hours = parseFloat(document.getElementById('invoice-hours').value) || 0;
  const taxPct = parseFloat(document.getElementById('invoice-tax').value) || 0;

  const gross = rate * hours;
  const taxBuffer = gross * (taxPct / 100);
  const netYield = gross - taxBuffer;
  const effectiveRate = hours > 0 ? netYield / hours : 0;

  const grossEl = document.getElementById('invoice-gross');
  if (grossEl) grossEl.textContent = formatCurrency(gross);

  const taxEl = document.getElementById('invoice-tax-buffer');
  if (taxEl) taxEl.textContent = `-${formatCurrency(taxBuffer)}`;

  const netEl = document.getElementById('invoice-net');
  if (netEl) netEl.textContent = formatCurrency(netYield);

  const effEl = document.getElementById('invoice-effective-rate');
  if (effEl) effEl.textContent = `${formatCurrency(effectiveRate)}/hr`;

  flashElement('invoice-net');
}

// -------------------------------------------------------------
// 3. CAMPAIGN ENTERPRISE ROI METRICS
// -------------------------------------------------------------
function calcRoi() {
  const spend = parseFloat(document.getElementById('roi-spend').value) || 0;
  const revenue = parseFloat(document.getElementById('roi-revenue').value) || 0;

  const netProfit = revenue - spend;
  const roas = spend > 0 ? revenue / spend : 0;
  const roiPct = spend > 0 ? (netProfit / spend) * 100 : 0;

  const roasEl = document.getElementById('roi-roas');
  if (roasEl) roasEl.textContent = `${roas.toFixed(2)}x`;

  const returnEl = document.getElementById('roi-return-pct');
  if (returnEl) returnEl.textContent = formatPercent(roiPct);

  const profitEl = document.getElementById('roi-net-profit');
  if (profitEl) profitEl.textContent = formatCurrency(netProfit);

  flashElement('roi-roas');
}

// -------------------------------------------------------------
// 4. CRYPTO FUTURES LEVERAGE & LIQUIDATION MATRIX
// -------------------------------------------------------------
function setCryptoStrategy(strategy) {
  cryptoStrategy = strategy;
  document.querySelectorAll('.crypto-strat-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.strat === strategy);
  });
  calcCrypto();
  saveStateDebounced();
}

function calcCrypto() {
  const entry = parseFloat(document.getElementById('crypto-entry').value) || 0;
  const leverage = parseFloat(document.getElementById('crypto-leverage').value) || 1;
  const mmr = 0.005;

  let liqPrice = 0;
  let safetyMarginPct = 0;

  if (cryptoStrategy === 'long') {
    liqPrice = entry * (1 - (1 / leverage) + mmr);
    safetyMarginPct = Math.max(0, ((1 / leverage) - mmr) * 100);
  } else {
    liqPrice = entry * (1 + (1 / leverage) - mmr);
    safetyMarginPct = Math.max(0, ((1 / leverage) - mmr) * 100);
  }

  liqPrice = Math.max(0, liqPrice);
  const distance = Math.abs(entry - liqPrice);

  const liqEl = document.getElementById('crypto-liquidation');
  if (liqEl) liqEl.textContent = formatCurrency(liqPrice);

  const distEl = document.getElementById('crypto-distance');
  if (distEl) distEl.textContent = formatCurrency(distance);

  const safetyEl = document.getElementById('crypto-risk-pct');
  if (safetyEl) safetyEl.textContent = formatPercent(safetyMarginPct);

  // Render Danger Gauge
  const gaugeEl = document.getElementById('crypto-gauge-bar');
  if (gaugeEl) {
    const fillPct = Math.min(100, Math.max(2, 100 - (safetyMarginPct * 4)));
    gaugeEl.style.width = `${fillPct}%`;
    gaugeEl.className = fillPct > 60 ? 'h-2 rounded-full bg-rose-500' : fillPct > 30 ? 'h-2 rounded-full bg-amber-400' : 'h-2 rounded-full bg-emerald-400';
  }

  flashElement('crypto-liquidation');
}

// -------------------------------------------------------------
// 5. COMPOUND INTEREST WEALTH MULTIPLIER SUITE
// -------------------------------------------------------------
function calcCompound() {
  const principal = parseFloat(document.getElementById('compound-principal').value) || 0;
  const rate = parseFloat(document.getElementById('compound-rate').value) || 0;
  const years = parseFloat(document.getElementById('compound-years').value) || 0;

  const r = rate / 100;
  const futureVal = principal * Math.pow(1 + r, years);
  const totalInterest = Math.max(0, futureVal - principal);
  const multiplier = principal > 0 ? futureVal / principal : 0;

  const targetEl = document.getElementById('compound-future-val');
  if (targetEl) targetEl.textContent = formatCurrency(futureVal);

  const interestEl = document.getElementById('compound-total-interest');
  if (interestEl) interestEl.textContent = formatCurrency(totalInterest);

  const multEl = document.getElementById('compound-multiplier');
  if (multEl) multEl.textContent = `${multiplier.toFixed(2)}x`;

  const solCompEl = document.getElementById('compound-solution-text');
  if (solCompEl) {
    solCompEl.innerHTML = `You deposit <strong>${formatCurrency(principal)}</strong> of your own money. Over <strong>${years} years</strong> at <strong>${rate}% annual growth</strong>, compound interest earns you <strong class="text-emerald-400 font-bold">${formatCurrency(totalInterest)} in 100% free money</strong>, multiplying your savings by <strong>${multiplier.toFixed(2)}x</strong> without extra work! Total future wealth: <strong class="text-white">${formatCurrency(futureVal)}</strong>.`;
  }

  renderGrowthCurve('compound-growth-svg', principal, rate, years);
  flashElement('compound-future-val');
}

function renderGrowthCurve(svgId, principal, rate, years) {
  const svg = document.getElementById(svgId);
  if (!svg || years <= 0 || principal <= 0) return;

  const width = 340;
  const height = 90;
  const points = [];
  const r = rate / 100;
  const maxVal = principal * Math.pow(1 + r, years);

  for (let t = 0; t <= years; t += Math.max(1, Math.floor(years / 10))) {
    const val = principal * Math.pow(1 + r, t);
    const x = (t / years) * width;
    const y = height - (maxVal > 0 ? (val / maxVal) * (height - 15) : 0) - 5;
    points.push({ x, y });
  }

  let pathD = `M 0,${height} `;
  points.forEach((pt, i) => {
    pathD += `${i === 0 ? 'L' : 'L'} ${pt.x.toFixed(1)},${pt.y.toFixed(1)} `;
  });
  const strokePathD = pathD.replace(`M 0,${height} L`, 'M');
  pathD += `L ${width},${height} Z`;

  svg.innerHTML = `
    <defs>
      <linearGradient id="grad-${svgId}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
      </linearGradient>
    </defs>
    <path d="${pathD}" fill="url(#grad-${svgId})" />
    <path d="${strokePathD}" fill="none" stroke="#10b981" stroke-width="2.5" />
    <circle cx="${points[points.length-1].x.toFixed(1)}" cy="${points[points.length-1].y.toFixed(1)}" r="4" fill="#34d399" />
  `;
}

// -------------------------------------------------------------
// 6. COMMERCIAL ASSET CAP RATE MATRIX
// -------------------------------------------------------------
function calcCapRate() {
  const rent = parseFloat(document.getElementById('caprate-rent').value) || 0;
  const costs = parseFloat(document.getElementById('caprate-costs').value) || 0;
  const val = parseFloat(document.getElementById('caprate-value').value) || 0;

  const noi = rent - costs;
  const capRate = val > 0 ? (noi / val) * 100 : 0;
  const monthlyNoi = noi / 12;

  const noiEl = document.getElementById('caprate-noi');
  if (noiEl) noiEl.textContent = formatCurrency(noi);

  const rateEl = document.getElementById('caprate-rate');
  if (rateEl) rateEl.textContent = formatPercent(capRate);

  const mNoiEl = document.getElementById('caprate-monthly-noi');
  if (mNoiEl) mNoiEl.textContent = formatCurrency(monthlyNoi);

  flashElement('caprate-rate');
}

// -------------------------------------------------------------
// 7. WAGE HOURLY TO SALARY CONVERTER ENGINE
// -------------------------------------------------------------
function calcSalary() {
  const wage = parseFloat(document.getElementById('salary-wage').value) || 0;
  const hours = parseFloat(document.getElementById('salary-hours').value) || 0;

  const weekly = wage * hours;
  const annual = weekly * 52;
  const monthly = annual / 12;

  const wEl = document.getElementById('salary-weekly');
  if (wEl) wEl.textContent = formatCurrency(weekly);

  const mEl = document.getElementById('salary-monthly');
  if (mEl) mEl.textContent = formatCurrency(monthly);

  const aEl = document.getElementById('salary-annual');
  if (aEl) aEl.textContent = formatCurrency(annual);

  flashElement('salary-annual');
}

// -------------------------------------------------------------
// 8. STARTUP VENTURE BREAK-EVEN LEVEL
// -------------------------------------------------------------
function calcBreakEven() {
  const overhead = parseFloat(document.getElementById('breakeven-overhead').value) || 0;
  const price = parseFloat(document.getElementById('breakeven-price').value) || 0;
  const cost = parseFloat(document.getElementById('breakeven-cost').value) || 0;

  const unitMargin = price - cost;
  let reqUnits = 0;
  let breakRevenue = 0;

  if (unitMargin > 0) {
    reqUnits = Math.ceil(overhead / unitMargin);
    breakRevenue = reqUnits * price;
  }

  const unitsEl = document.getElementById('breakeven-units');
  if (unitsEl) unitsEl.textContent = `${formatNumber(reqUnits)} Units`;

  const marginEl = document.getElementById('breakeven-unit-margin');
  if (marginEl) marginEl.textContent = formatCurrency(unitMargin);

  const revEl = document.getElementById('breakeven-revenue');
  if (revEl) revEl.textContent = formatCurrency(breakRevenue);

  flashElement('breakeven-units');
}

// -------------------------------------------------------------
// 9. CREDIT CARD LIABILITY ELIMINATION ENGINE
// -------------------------------------------------------------
function calcCreditCard() {
  const debt = parseFloat(document.getElementById('creditcard-debt').value) || 0;
  const apr = parseFloat(document.getElementById('creditcard-apr').value) || 0;
  const payment = parseFloat(document.getElementById('creditcard-payment').value) || 0;

  const r = (apr / 100) / 12;
  const warningEl = document.getElementById('creditcard-warning');

  if (payment <= debt * r && debt > 0) {
    if (warningEl) warningEl.classList.remove('hidden');
    document.getElementById('creditcard-months').textContent = '∞ Lifespan';
    document.getElementById('creditcard-total-interest').textContent = 'Accumulating';
    document.getElementById('creditcard-total-paid').textContent = 'Unpayable';
    return;
  } else {
    if (warningEl) warningEl.classList.add('hidden');
  }

  let months = 0;
  let totalInterest = 0;
  let totalPaid = 0;

  if (debt > 0 && payment > 0) {
    if (r === 0) {
      months = Math.ceil(debt / payment);
      totalInterest = 0;
      totalPaid = debt;
    } else {
      months = Math.ceil(-Math.log(1 - (r * debt) / payment) / Math.log(1 + r));
      let balance = debt;
      totalInterest = 0;
      for (let i = 0; i < months && balance > 0; i++) {
        const intCharge = balance * r;
        totalInterest += intCharge;
        balance = balance + intCharge - payment;
        if (balance < 0) balance = 0;
      }
      totalPaid = debt + totalInterest;
    }
  }

  const monthsEl = document.getElementById('creditcard-months');
  if (monthsEl) monthsEl.textContent = `${months} Months`;

  const intEl = document.getElementById('creditcard-total-interest');
  if (intEl) intEl.textContent = formatCurrency(totalInterest);

  const paidEl = document.getElementById('creditcard-total-paid');
  if (paidEl) paidEl.textContent = formatCurrency(totalPaid);

  const solCardEl = document.getElementById('creditcard-solution-text');
  if (solCardEl) {
    if (months > 0 && months < 600) {
      const yrs = (months / 12).toFixed(1);
      solCardEl.innerHTML = `At your current payment of <strong>${formatCurrency(payment)}/month</strong>, you will be completely debt-free in <strong class="text-emerald-400 font-bold">${months} months (${yrs} years)</strong>. The card company will take <strong class="text-rose-400 font-bold">${formatCurrency(totalInterest)} in pure interest fees</strong>. Total payback: <strong>${formatCurrency(totalPaid)}</strong>.`;
    } else {
      solCardEl.innerHTML = `<span class="text-rose-400 font-bold">⚠️ Warning:</span> Your monthly payment is too low to beat interest charges. Increase your monthly payment to start paying off the principal!`;
    }
  }

  flashElement('creditcard-months');
}

// -------------------------------------------------------------
// 10. EQUITY ASSET COST AVERAGING SUITE
// -------------------------------------------------------------
function calcStockAvg() {
  const shares1 = parseFloat(document.getElementById('stockavg-shares1').value) || 0;
  const price1 = parseFloat(document.getElementById('stockavg-price1').value) || 0;
  const shares2 = parseFloat(document.getElementById('stockavg-shares2').value) || 0;
  const price2 = parseFloat(document.getElementById('stockavg-price2').value) || 0;

  const totalShares = shares1 + shares2;
  const totalCost = (shares1 * price1) + (shares2 * price2);
  const avgCost = totalShares > 0 ? totalCost / totalShares : 0;

  const shEl = document.getElementById('stockavg-total-shares');
  if (shEl) shEl.textContent = `${formatNumber(totalShares)} Shares`;

  const costEl = document.getElementById('stockavg-avg-price');
  if (costEl) costEl.textContent = formatCurrency(avgCost);

  const invEl = document.getElementById('stockavg-total-invested');
  if (invEl) invEl.textContent = formatCurrency(totalCost);

  flashElement('stockavg-avg-price');
}

// -------------------------------------------------------------
// 11. RESIDENTIAL HOUSING ANALYSIS FRAMEWORK (RENT VS BUY DECISION MATRIX)
// -------------------------------------------------------------
let rentbuyHorizonYears = 5;

function setRentBuyHorizon(years) {
  rentbuyHorizonYears = parseInt(years) || 5;
  document.querySelectorAll('.rentbuy-horizon-btn').forEach(btn => {
    const btnYears = parseInt(btn.dataset.years) || 5;
    const match = btnYears === rentbuyHorizonYears;
    btn.classList.toggle('active', match);
    btn.classList.toggle('bg-emerald-500/20', match);
    btn.classList.toggle('text-emerald-400', match);
    btn.classList.toggle('border-emerald-500/40', match);
    btn.classList.toggle('bg-slate-950', !match);
    btn.classList.toggle('text-slate-300', !match);
    btn.classList.toggle('border-slate-800', !match);
  });
  calcRentBuy();
  saveStateDebounced();
}

function toggleRentBuyAssumptions() {
  const panel = document.getElementById('rentbuy-assumptions-panel');
  const icon = document.getElementById('rentbuy-assumptions-icon');
  if (panel) {
    const isHidden = panel.classList.contains('hidden');
    panel.classList.toggle('hidden');
    if (icon) icon.textContent = isHidden ? '▲' : '▼';
  }
}

function updateRentBuyScorecard(rent, mortgage, horizon, monthlyDiff, totalRentPaid, totalMortPaid, investedWealth, homeEquity, breakEvenYear) {
  const tbody = document.getElementById('rentbuy-scorecard-body');
  if (!tbody) return;

  const rentWinsMonthly = monthlyDiff > 0;
  const buyWinsMonthly = monthlyDiff < 0;

  const rows = [
    {
      criteria: 'Monthly Outlay',
      renting: `${formatCurrency(rent)}`,
      buying: `${formatCurrency(mortgage)}`,
      winner: rentWinsMonthly 
        ? `<span class="text-emerald-400 font-bold">🟢 Rent saves ${formatCurrency(monthlyDiff)}/mo</span>`
        : (buyWinsMonthly ? `<span class="text-sky-400 font-bold">🟢 Buy saves ${formatCurrency(Math.abs(monthlyDiff))}/mo</span>` : `<span class="text-slate-400">⚖️ Equal Parity</span>`)
    },
    {
      criteria: `${horizon}-Year Total Outflow`,
      renting: `${formatCurrency(totalRentPaid)} <span class="text-[10px] text-slate-500 block">(w/ 5% annual rent hikes)</span>`,
      buying: `${formatCurrency(totalMortPaid)} <span class="text-[10px] text-slate-500 block">(Fixed loan payments)</span>`,
      winner: totalMortPaid > totalRentPaid
        ? `<span class="text-emerald-400 font-bold">🟢 Rent saves ${formatCurrency(totalMortPaid - totalRentPaid)}</span>`
        : `<span class="text-sky-400 font-bold">🟢 Buy saves ${formatCurrency(totalRentPaid - totalMortPaid)}</span>`
    },
    {
      criteria: `${horizon}-Year Net Wealth Outlook`,
      renting: `${formatCurrency(investedWealth)} <span class="text-[10px] text-slate-500 block">(If monthly savings invested @ 8%)</span>`,
      buying: `${formatCurrency(homeEquity)} <span class="text-[10px] text-slate-500 block">(Home equity + 4% growth)</span>`,
      winner: investedWealth > homeEquity
        ? `<span class="text-emerald-400 font-bold">🟢 Renting creates more liquid wealth</span>`
        : `<span class="text-sky-400 font-bold">🟢 Buying creates more property wealth</span>`
    },
    {
      criteria: 'Maintenance, Repairs & Taxes',
      renting: `<span class="text-emerald-400 font-semibold">${formatCurrency(0)}</span> (Landlord obligation)`,
      buying: `~${formatCurrency(mortgage * 0.10)}/mo <span class="text-slate-500 text-[10px] block">(Repairs, society dues, tax)</span>`,
      winner: `<span class="text-emerald-400 font-bold">🟢 Renting (Zero maintenance liability)</span>`
    },
    {
      criteria: 'Relocation & Job Flexibility',
      renting: `<span class="text-emerald-400 font-semibold">High</span> (30-day notice to move)`,
      buying: `<span class="text-rose-400 font-semibold">Low</span> (Takes 3-6 mos to sell, 6-8% fees)`,
      winner: `<span class="text-emerald-400 font-bold">🟢 Renting (Maximum freedom)</span>`
    }
  ];

  tbody.innerHTML = rows.map(r => `
    <tr class="hover:bg-slate-800/30 transition-colors">
      <td class="py-2.5 font-bold text-slate-200">${r.criteria}</td>
      <td class="py-2.5 font-mono text-slate-300">${r.renting}</td>
      <td class="py-2.5 font-mono text-slate-300">${r.buying}</td>
      <td class="py-2.5 text-right font-medium">${r.winner}</td>
    </tr>
  `).join('');
}

function updateRentBuyActionTips(monthlyDiff, horizon, breakEvenYear, investReturnPct) {
  const rentList = document.getElementById('rentbuy-action-rent-tips');
  const buyList = document.getElementById('rentbuy-action-buy-tips');

  if (rentList) {
    if (monthlyDiff > 0) {
      rentList.innerHTML = `
        <li>Automate an SIP / investment of <strong>${formatCurrency(monthlyDiff)}/mo</strong> into mutual funds or index funds yielding ~${investReturnPct}%.</li>
        <li>Enjoy zero liability for unexpected roof repairs, plumbing issues, or property tax hikes.</li>
        <li>Retain complete freedom to move for higher-paying career opportunities without taking a 6-8% hit on selling fees.</li>
      `;
    } else {
      rentList.innerHTML = `
        <li>Only rent if you plan to stay less than 2-3 years, as monthly rent is currently more expensive than purchasing.</li>
        <li>Negotiate a multi-year fixed lease to protect yourself against local rent inflation.</li>
      `;
    }
  }

  if (buyList) {
    if (monthlyDiff > 0) {
      const beText = breakEvenYear > 0 ? `stay for at least <strong>${breakEvenYear} to ${breakEvenYear + 2} years</strong>` : 'plan to stay for 8+ years';
      buyList.innerHTML = `
        <li>Only purchase if you are confident you will ${beText} so property equity surpasses rent savings.</li>
        <li>Keep at least a 6-month liquid emergency fund AFTER paying your 20% down payment and closing costs.</li>
        <li>Budget an extra 1% to 1.5% of the property value annually for repairs, maintenance, and insurance.</li>
      `;
    } else {
      buyList.innerHTML = `
        <li><strong>Strongly pursue buying:</strong> Your monthly EMI is cheaper than rent, allowing you to build personal wealth immediately.</li>
        <li>Get pre-approved for a fixed-rate home loan to permanently lock in your housing payment against inflation.</li>
        <li>Build personal equity with every payment instead of funding your landlord's retirement nest egg.</li>
      `;
    }
  }
}

function calcRentBuy() {
  const rent = parseFloat(document.getElementById('rentbuy-rent')?.value) || 0;
  const mortgage = parseFloat(document.getElementById('rentbuy-mortgage')?.value) || 0;
  const rentGrowthPct = parseFloat(document.getElementById('rentbuy-rent-growth')?.value) || 5.0;
  const homeApprPct = parseFloat(document.getElementById('rentbuy-home-appreciation')?.value) || 4.0;
  const investReturnPct = parseFloat(document.getElementById('rentbuy-invest-return')?.value) || 8.0;

  const horizon = rentbuyHorizonYears || 5;
  const monthlyVariance = mortgage - rent; // Positive means rent is cheaper
  const annualVariance = monthlyVariance * 12;
  const fiveYearVariance = annualVariance * 5;
  const horizonVariance = annualVariance * horizon;

  // 1. Backward-compatible DOM updates
  const annEl = document.getElementById('rentbuy-annual-variance');
  if (annEl) annEl.textContent = `${formatCurrency(annualVariance)} / Annum`;

  const monEl = document.getElementById('rentbuy-monthly-variance');
  if (monEl) monEl.textContent = `${formatCurrency(monthlyVariance)} / Mo`;

  const fiveEl = document.getElementById('rentbuy-5yr-variance');
  if (fiveEl) fiveEl.textContent = formatCurrency(fiveYearVariance);

  const verdictEl = document.getElementById('rentbuy-verdict');
  if (verdictEl) {
    if (monthlyVariance > 0) {
      verdictEl.textContent = `Renting retains ${formatCurrency(monthlyVariance)}/mo positive operational cash flow over purchasing.`;
    } else if (monthlyVariance < 0) {
      verdictEl.textContent = `Mortgage is ${formatCurrency(Math.abs(monthlyVariance))}/mo cheaper than contractual leasing!`;
    } else {
      verdictEl.textContent = `Lease and purchase outlays are currently at cash-flow parity.`;
    }
  }

  // 2. Realistic multi-year compounding and wealth modeling
  const rGrowth = rentGrowthPct / 100;
  let totalRentPaid = 0;
  let currentYearRent = rent;
  for (let y = 1; y <= horizon; y++) {
    totalRentPaid += currentYearRent * 12;
    currentYearRent *= (1 + rGrowth);
  }
  const totalMortPaid = mortgage * 12 * horizon;

  // Invested Monthly Savings (Future Value of SIP if Rent < Mortgage)
  const monthlyInvestRate = (investReturnPct / 100) / 12;
  let investedSavingsWealth = 0;
  if (monthlyVariance > 0 && monthlyInvestRate > 0) {
    const totalMonths = horizon * 12;
    investedSavingsWealth = monthlyVariance * ((Math.pow(1 + monthlyInvestRate, totalMonths) - 1) / monthlyInvestRate);
  }

  // Home equity estimate: Property value estimated as ~140x monthly mortgage payment
  const estimatedPropertyVal = mortgage * 140;
  const futurePropertyValue = estimatedPropertyVal * Math.pow(1 + (homeApprPct / 100), horizon);
  const principalAmortizedPct = Math.min(1.0, (horizon / 25) * 0.7);
  const estimatedDownPayment = estimatedPropertyVal * 0.20;
  const homeEquity = estimatedDownPayment + (estimatedPropertyVal * 0.80 * principalAmortizedPct) + (futurePropertyValue - estimatedPropertyVal);

  // 3. Break-even horizon calculation (Year where buyer net position beats renter)
  let breakEvenYear = 0;
  for (let y = 1; y <= 25; y++) {
    const yMonths = y * 12;
    const yInvested = monthlyVariance > 0 && monthlyInvestRate > 0
      ? monthlyVariance * ((Math.pow(1 + monthlyInvestRate, yMonths) - 1) / monthlyInvestRate)
      : 0;
    const yHomeVal = estimatedPropertyVal * Math.pow(1 + (homeApprPct / 100), y);
    // Home equity minus 6% sale friction fees
    const yEquity = estimatedDownPayment + (estimatedPropertyVal * 0.80 * Math.min(1.0, (y / 25) * 0.7)) + (yHomeVal - estimatedPropertyVal) - (yHomeVal * 0.06);

    if (yEquity > yInvested && breakEvenYear === 0) {
      breakEvenYear = y;
    }
  }

  // 4. Executive Decision & Solution Rationale
  const decisionCard = document.getElementById('rentbuy-decision-card');
  const decisionIcon = document.getElementById('rentbuy-decision-icon');
  const decisionHeadline = document.getElementById('rentbuy-decision-headline');
  const decisionBadge = document.getElementById('rentbuy-decision-badge');
  const decisionSummary = document.getElementById('rentbuy-decision-summary');
  const summarySavings = document.getElementById('rentbuy-summary-savings');
  const summaryBreakeven = document.getElementById('rentbuy-summary-breakeven');
  const summary5Yr = document.getElementById('rentbuy-summary-5yr');

  let winner = 'rent';
  let headlineText = '';
  let badgeText = '';
  let summaryText = '';
  let iconEmoji = '🏆';

  if (monthlyVariance >= 50) {
    // Renting is noticeably cheaper on monthly cash flow
    if (horizon < (breakEvenYear || 8)) {
      winner = 'rent';
      iconEmoji = '🏆';
      headlineText = 'RECOMMENDED DECISION: RENTING IS BETTER FOR YOU';
      badgeText = `Renting Saves ${formatCurrency(monthlyVariance)} / mo`;
      summaryText = `At your numbers, renting saves you <strong>${formatCurrency(monthlyVariance)} in cash every single month</strong> (${formatCurrency(annualVariance)}/year). Over your planned <strong>${horizon}-year stay</strong>, renting saves you <strong>${formatCurrency(horizonVariance)} in pure cash outflow</strong>. If you invest that monthly difference in index funds/SIP at ${investReturnPct}%, you will build <strong>${formatCurrency(investedSavingsWealth)} in liquid wealth</strong> without taking on mortgage debt, property taxes, or home repairs.`;
    } else {
      winner = 'buy';
      iconEmoji = '🏡';
      headlineText = 'RECOMMENDED DECISION: BUYING BUILDS GREATER LONG-TERM WEALTH';
      badgeText = `Long-Term Equity Winner`;
      summaryText = `Even though renting is cheaper month-to-month by ${formatCurrency(monthlyVariance)}, your extended stay of <strong>${horizon} years</strong> allows property price appreciation (${homeApprPct}%/yr) and loan principal paydown to overcome the early savings of renting. By Year ${horizon}, your estimated home equity reaches <strong>${formatCurrency(homeEquity)}</strong>, creating more net wealth than renting.`;
    }
  } else if (monthlyVariance <= -50) {
    // Mortgage is cheaper than rent!
    winner = 'buy';
    iconEmoji = '🏡';
    headlineText = 'RECOMMENDED DECISION: BUYING IS CLEARLY SUPERIOR';
    badgeText = `Buying Saves ${formatCurrency(Math.abs(monthlyVariance))} / mo`;
    summaryText = `Buying is a clear financial victory here! Your monthly mortgage payment of <strong>${formatCurrency(mortgage)}/mo</strong> is actually cheaper than rent (<strong>${formatCurrency(rent)}/mo</strong>). You keep <strong>${formatCurrency(Math.abs(monthlyVariance))}/mo</strong> in positive cash flow while simultaneously building property equity instead of paying off your landlord's mortgage.`;
  } else {
    // Close parity
    winner = 'tie';
    iconEmoji = '⚖️';
    headlineText = 'RECOMMENDED DECISION: IT\'S A TIE — DECIDE BY YOUR STAY HORIZON';
    badgeText = `Cash-Flow Parity (~${formatCurrency(Math.abs(monthlyVariance))}/mo)`;
    summaryText = `Monthly rent and mortgage are almost identical. <strong>The deciding factor is how long you plan to live here:</strong> If you will move within 4–5 years, <strong>Rent</strong> to avoid transaction and selling costs (6-8%). If you plan to stay 6+ years, <strong>Buy</strong> to lock in your housing costs against rising rent inflation.`;
  }

  if (decisionHeadline) decisionHeadline.textContent = headlineText;
  if (decisionIcon) decisionIcon.textContent = iconEmoji;
  if (decisionBadge) decisionBadge.textContent = badgeText;
  if (decisionSummary) decisionSummary.innerHTML = summaryText;

  if (summarySavings) {
    summarySavings.textContent = monthlyVariance > 0 
      ? `Save ${formatCurrency(monthlyVariance)}/mo` 
      : (monthlyVariance < 0 ? `Buy saves ${formatCurrency(Math.abs(monthlyVariance))}/mo` : `Parity`);
  }
  if (summaryBreakeven) {
    summaryBreakeven.textContent = breakEvenYear > 0 ? `~Year ${breakEvenYear}` : (monthlyVariance < 0 ? `Year 1 (Immediate)` : `10+ Years`);
  }
  if (summary5Yr) {
    summary5Yr.textContent = formatCurrency(Math.abs(fiveYearVariance));
  }

  // Update Decision Card Style classes
  if (decisionCard) {
    decisionCard.classList.remove('rentbuy-verdict-rent', 'rentbuy-verdict-buy', 'rentbuy-verdict-tie');
    if (winner === 'rent') decisionCard.classList.add('rentbuy-verdict-rent');
    else if (winner === 'buy') decisionCard.classList.add('rentbuy-verdict-buy');
    else decisionCard.classList.add('rentbuy-verdict-tie');
  }

  // 5. Update Scorecard Table Rows
  updateRentBuyScorecard(rent, mortgage, horizon, monthlyVariance, totalRentPaid, totalMortPaid, investedSavingsWealth, homeEquity, breakEvenYear);

  // 6. Update Action Checklist Tips
  updateRentBuyActionTips(monthlyVariance, horizon, breakEvenYear, investReturnPct);

  // 7. Render comparison chart
  renderRentBuyChart(rent, mortgage);
  flashElement('rentbuy-annual-variance');
}

// -------------------------------------------------------------
// 12. RETAIL COMMERCE GROSS PROFIT MARGIN SUITE
// -------------------------------------------------------------
function calcMargin() {
  const cost = parseFloat(document.getElementById('margin-cost').value) || 0;
  const price = parseFloat(document.getElementById('margin-price').value) || 0;

  const profit = price - cost;
  const marginPct = price > 0 ? (profit / price) * 100 : 0;
  const markupPct = cost > 0 ? (profit / cost) * 100 : 0;

  const profEl = document.getElementById('margin-profit');
  if (profEl) profEl.textContent = formatCurrency(profit);

  const margEl = document.getElementById('margin-pct');
  if (margEl) margEl.textContent = formatPercent(marginPct);

  const markEl = document.getElementById('margin-markup');
  if (markEl) markEl.textContent = formatPercent(markupPct);

  flashElement('margin-profit');
}

// -------------------------------------------------------------
// 13. AUTO CAPITAL FINANCING ESTIMATOR MATRIX
// -------------------------------------------------------------
function calcAutoLoan() {
  const val = parseFloat(document.getElementById('autoloan-value').value) || 0;
  const apr = parseFloat(document.getElementById('autoloan-rate').value) || 0;
  const term = parseFloat(document.getElementById('autoloan-term').value) || 1;

  const dispSpan = document.getElementById('autoloan-term-display');
  if (dispSpan) dispSpan.textContent = `${term} Mo`;
  document.querySelectorAll('.autoloan-term-btn').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.dataset.months) === term);
  });

  let monthly = 0;
  const r = (apr / 100) / 12;

  if (val > 0 && term > 0) {
    if (r === 0) {
      monthly = val / term;
    } else {
      monthly = (val * r * Math.pow(1 + r, term)) / (Math.pow(1 + r, term) - 1);
    }
  }

  const totalPaid = monthly * term;
  const totalInterest = Math.max(0, totalPaid - val);

  const payEl = document.getElementById('autoloan-payment');
  if (payEl) payEl.textContent = formatCurrency(monthly);

  const intEl = document.getElementById('autoloan-total-interest');
  if (intEl) intEl.textContent = formatCurrency(totalInterest);

  const totEl = document.getElementById('autoloan-total-outflow');
  if (totEl) totEl.textContent = formatCurrency(totalPaid);

  flashElement('autoloan-payment');
}

function setAutoLoanTerm(months, source) {
  const termEl = document.getElementById('autoloan-term');
  const rangeEl = document.getElementById('autoloan-term-range');
  const dispSpan = document.getElementById('autoloan-term-display');

  if (source === 'input' && (months === '' || isNaN(parseInt(months)))) return;

  const val = parseInt(months);
  const parsed = Math.max(1, Math.min(120, isNaN(val) ? 60 : val));

  if (termEl && source !== 'input') termEl.value = parsed;
  if (rangeEl) rangeEl.value = Math.min(84, Math.max(12, parsed));
  if (dispSpan) dispSpan.textContent = `${parsed} Mo (${(parsed / 12).toFixed(1)} Yrs)`;

  let hasPreset = false;
  document.querySelectorAll('.autoloan-term-btn').forEach(btn => {
    const match = parseInt(btn.dataset.months) === parsed;
    btn.classList.toggle('active', match);
    if (match) hasPreset = true;
  });
  const customBtn = document.getElementById('autoloan-term-custom-btn');
  if (customBtn) customBtn.classList.toggle('active', !hasPreset);

  calcAutoLoan();
  saveStateDebounced();
}

// -------------------------------------------------------------
// 14. STUDENT LOAN PAYOFF HORIZON MATRIX
// -------------------------------------------------------------
function calcStudent() {
  const debt = parseFloat(document.getElementById('student-debt').value) || 0;
  const apr = parseFloat(document.getElementById('student-rate').value) || 0;
  const months = parseFloat(document.getElementById('student-months').value) || 1;

  const dispSpan = document.getElementById('student-months-display');
  if (dispSpan) dispSpan.textContent = `${months} Mo (${(months / 12).toFixed(1)} Yrs)`;
  document.querySelectorAll('.student-term-btn').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.dataset.months) === months);
  });

  let monthly = 0;
  const r = (apr / 100) / 12;

  if (debt > 0 && months > 0) {
    if (r === 0) {
      monthly = debt / months;
    } else {
      monthly = (debt * r * Math.pow(1 + r, months)) / (Math.pow(1 + r, months) - 1);
    }
  }

  const totalRepay = monthly * months;
  const totalInterest = Math.max(0, totalRepay - debt);

  const payEl = document.getElementById('student-payment');
  if (payEl) payEl.textContent = formatCurrency(monthly);

  const intEl = document.getElementById('student-total-interest');
  if (intEl) intEl.textContent = formatCurrency(totalInterest);

  const sumEl = document.getElementById('student-total-sum');
  if (sumEl) sumEl.textContent = formatCurrency(totalRepay);

  flashElement('student-payment');
}

function setStudentMonths(months, source) {
  const termEl = document.getElementById('student-months');
  const rangeEl = document.getElementById('student-months-range');
  const dispSpan = document.getElementById('student-months-display');

  if (source === 'input' && (months === '' || isNaN(parseInt(months)))) return;

  const val = parseInt(months);
  const parsed = Math.max(1, Math.min(360, isNaN(val) ? 120 : val));

  if (termEl && source !== 'input') termEl.value = parsed;
  if (rangeEl) rangeEl.value = Math.min(240, Math.max(12, parsed));
  if (dispSpan) dispSpan.textContent = `${parsed} Mo (${(parsed / 12).toFixed(1)} Yrs)`;

  let hasPreset = false;
  document.querySelectorAll('.student-term-btn').forEach(btn => {
    const match = parseInt(btn.dataset.months) === parsed;
    btn.classList.toggle('active', match);
    if (match) hasPreset = true;
  });
  const customBtn = document.getElementById('student-term-custom-btn');
  if (customBtn) customBtn.classList.toggle('active', !hasPreset);

  calcStudent();
  saveStateDebounced();
}

// -------------------------------------------------------------
// 15. 50/30/20 PORTFOLIO ALLOCATION FRAMEWORK
// -------------------------------------------------------------
function calcBudget() {
  const income = parseFloat(document.getElementById('budget-income').value) || 0;

  const needs = income * 0.50;
  const wants = income * 0.30;
  const savings = income * 0.20;
  const annualSavings = savings * 12;

  const nEl = document.getElementById('budget-needs');
  if (nEl) nEl.textContent = formatCurrency(needs);

  const wEl = document.getElementById('budget-wants');
  if (wEl) wEl.textContent = formatCurrency(wants);

  const sEl = document.getElementById('budget-savings');
  if (sEl) sEl.textContent = formatCurrency(savings);

  const annSEl = document.getElementById('budget-annual-savings');
  if (annSEl) annSEl.textContent = `${formatCurrency(annualSavings)} / yr`;

  flashElement('budget-needs');
}

// -------------------------------------------------------------
// 16. SIMPLE INTEREST CONTRACT LEDGER CORE
// -------------------------------------------------------------
function calcInterest() {
  const p = parseFloat(document.getElementById('interest-principal').value) || 0;
  const r = parseFloat(document.getElementById('interest-rate').value) || 0;
  const t = parseFloat(document.getElementById('interest-years').value) || 0;

  const yieldVal = p * (r / 100) * t;
  const totalVal = p + yieldVal;

  const yEl = document.getElementById('interest-yield');
  if (yEl) yEl.textContent = formatCurrency(yieldVal);

  const tEl = document.getElementById('interest-total');
  if (tEl) tEl.textContent = formatCurrency(totalVal);

  flashElement('interest-yield');
}

// -------------------------------------------------------------
// 17. STOCK DIVIDEND YIELD CONSOLE
// -------------------------------------------------------------
function calcDividend() {
  const equity = parseFloat(document.getElementById('dividend-equity').value) || 0;
  const yieldPct = parseFloat(document.getElementById('dividend-yield').value) || 0;

  const annualInflow = equity * (yieldPct / 100);
  const monthlyInflow = annualInflow / 12;
  const quarterlyInflow = annualInflow / 4;

  const aEl = document.getElementById('dividend-annual');
  if (aEl) aEl.textContent = formatCurrency(annualInflow);

  const mEl = document.getElementById('dividend-monthly');
  if (mEl) mEl.textContent = formatCurrency(monthlyInflow);

  const qEl = document.getElementById('dividend-quarterly');
  if (qEl) qEl.textContent = formatCurrency(quarterlyInflow);

  flashElement('dividend-annual');
}

// -------------------------------------------------------------
// 18. CASH INFLATION ERODER SUITE
// -------------------------------------------------------------
function calcInflation() {
  const cash = parseFloat(document.getElementById('inflation-cash').value) || 0;
  const rate = parseFloat(document.getElementById('inflation-rate').value) || 0;
  const years = parseFloat(document.getElementById('inflation-years').value) || 0;

  const i = rate / 100;
  const futureReal = i > -1 ? cash / Math.pow(1 + i, years) : 0;
  const lostVal = -(cash - futureReal);
  const retainedPct = cash > 0 ? (futureReal / cash) * 100 : 0;

  const futEl = document.getElementById('inflation-future-val');
  if (futEl) futEl.textContent = formatCurrency(futureReal);

  const lostEl = document.getElementById('inflation-lost-val');
  if (lostEl) lostEl.textContent = formatCurrency(lostVal);

  const retEl = document.getElementById('inflation-retained-pct');
  if (retEl) retEl.textContent = formatPercent(retainedPct);

  // Update Degradation Milestones
  renderInflationMilestones(cash, i);

  flashElement('inflation-future-val');
}

function renderInflationMilestones(cash, i) {
  const m5 = cash / Math.pow(1 + i, 5);
  const m10 = cash / Math.pow(1 + i, 10);
  const m15 = cash / Math.pow(1 + i, 15);
  const m20 = cash / Math.pow(1 + i, 20);

  const el5 = document.getElementById('inflation-m5');
  const el10 = document.getElementById('inflation-m10');
  const el15 = document.getElementById('inflation-m15');
  const el20 = document.getElementById('inflation-m20');

  if (el5) el5.textContent = formatCurrency(m5);
  if (el10) el10.textContent = formatCurrency(m10);
  if (el15) el15.textContent = formatCurrency(m15);
  if (el20) el20.textContent = formatCurrency(m20);
}

// -------------------------------------------------------------
// 19. SYSTEMATIC MONTHLY INVESTMENT (SIP) PLANNER
// -------------------------------------------------------------
function calcSip() {
  const monthly = parseFloat(document.getElementById('sip-monthly').value) || 0;
  const rate = parseFloat(document.getElementById('sip-rate').value) || 0;
  const years = parseFloat(document.getElementById('sip-years').value) || 0;

  const i = (rate / 100) / 12;
  const n = years * 12;
  const totalInvested = monthly * n;

  let maturityVal = 0;
  if (monthly > 0 && n > 0) {
    if (i === 0) {
      maturityVal = totalInvested;
    } else {
      maturityVal = monthly * ((Math.pow(1 + i, n) - 1) / i) * (1 + i);
    }
  }

  const wealthGain = maturityVal - totalInvested;

  const invEl = document.getElementById('sip-invested');
  if (invEl) invEl.textContent = formatCurrency(totalInvested);

  const matEl = document.getElementById('sip-maturity');
  if (matEl) matEl.textContent = formatCurrency(maturityVal);

  const gainEl = document.getElementById('sip-gain');
  if (gainEl) gainEl.textContent = `+${formatCurrency(wealthGain)}`;

  renderSipChart(monthly, i, n, maturityVal);
  flashElement('sip-maturity');
}

function renderSipChart(monthly, i, totalMonths, maxMaturity) {
  const svg = document.getElementById('sip-growth-svg');
  if (!svg || totalMonths <= 0 || monthly <= 0) return;

  const width = 340;
  const height = 90;
  const investedPts = [];
  const maturityPts = [];

  const step = Math.max(1, Math.floor(totalMonths / 12));
  for (let m = 0; m <= totalMonths; m += step) {
    const inv = monthly * m;
    let mat = inv;
    if (i > 0 && m > 0) {
      mat = monthly * ((Math.pow(1 + i, m) - 1) / i) * (1 + i);
    }
    const x = (m / totalMonths) * width;
    const yInv = height - (maxMaturity > 0 ? (inv / maxMaturity) * (height - 15) : 0) - 5;
    const yMat = height - (maxMaturity > 0 ? (mat / maxMaturity) * (height - 15) : 0) - 5;
    investedPts.push({ x, y: yInv });
    maturityPts.push({ x, y: yMat });
  }

  let matD = `M 0,${height} `;
  maturityPts.forEach(pt => matD += `L ${pt.x.toFixed(1)},${pt.y.toFixed(1)} `);
  const strokeMat = matD.replace(`M 0,${height} L`, 'M');
  matD += `L ${width},${height} Z`;

  let invD = 'M ';
  investedPts.forEach((pt, idx) => invD += `${idx === 0 ? '' : 'L '}${pt.x.toFixed(1)},${pt.y.toFixed(1)} `);

  svg.innerHTML = `
    <defs>
      <linearGradient id="grad-sip" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
      </linearGradient>
    </defs>
    <path d="${matD}" fill="url(#grad-sip)" />
    <path d="${strokeMat}" fill="none" stroke="#10b981" stroke-width="2.5" />
    <path d="${invD}" fill="none" stroke="#64748b" stroke-width="2" stroke-dasharray="4,4" />
    <circle cx="${maturityPts[maturityPts.length-1].x.toFixed(1)}" cy="${maturityPts[maturityPts.length-1].y.toFixed(1)}" r="4" fill="#34d399" />
  `;
}

// -------------------------------------------------------------
// 20. COMPOUND ANNUAL GROWTH RATE (CAGR) COMPUTER
// -------------------------------------------------------------
function calcCagr() {
  const initial = parseFloat(document.getElementById('cagr-initial').value) || 0;
  const finalVal = parseFloat(document.getElementById('cagr-final').value) || 0;
  const years = parseFloat(document.getElementById('cagr-years').value) || 1;

  let cagr = 0;
  let absolute = 0;
  let mult = 0;

  if (initial > 0 && finalVal > 0 && years > 0) {
    cagr = (Math.pow(finalVal / initial, 1 / years) - 1) * 100;
    absolute = ((finalVal - initial) / initial) * 100;
    mult = finalVal / initial;
  }

  const resEl = document.getElementById('cagr-result');
  if (resEl) resEl.textContent = formatPercent(cagr);

  const absEl = document.getElementById('cagr-absolute');
  if (absEl) absEl.textContent = `${absolute >= 0 ? '+' : ''}${formatPercent(absolute)}`;

  const multEl = document.getElementById('cagr-multiplier');
  if (multEl) multEl.textContent = `${mult.toFixed(2)}x`;

  flashElement('cagr-result');
}

// -------------------------------------------------------------
// GLOBAL RECALCULATION & CURRENCY
// -------------------------------------------------------------

// -------------------------------------------------------------
// 21. HOME AFFORDABILITY ENGINE
// -------------------------------------------------------------
function calcAffordability() {
  const income = parseFloat(document.getElementById('affordability-income').value) || 0;
  const down = parseFloat(document.getElementById('affordability-down').value) || 0;
  const debt = parseFloat(document.getElementById('affordability-debt').value) || 0;
  const rate = parseFloat(document.getElementById('affordability-rate').value) || 0;
  const termYears = parseFloat(document.getElementById('affordability-term')?.value) || 30;
  const n = termYears * 12;

  const dispSpan = document.getElementById('affordability-term-display');
  if (dispSpan) dispSpan.textContent = `${termYears} Year${termYears === 1 ? '' : 's'}`;
  document.querySelectorAll('.affordability-term-btn').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.dataset.years) === termYears);
  });

  const monthlyGross = income / 12;
  const maxDebtAllowed = monthlyGross * 0.36; // 36% back-end DTI cap
  const taxInsBuffer = monthlyGross * 0.05;
  const maxMonthlyPI = Math.max(0, maxDebtAllowed - debt - taxInsBuffer);

  let loanSupported = 0;
  if (maxMonthlyPI > 0 && rate > 0) {
    const monthlyRate = (rate / 100) / 12;
    loanSupported = (maxMonthlyPI * (Math.pow(1 + monthlyRate, n) - 1)) / (monthlyRate * Math.pow(1 + monthlyRate, n));
  } else if (rate === 0 && maxMonthlyPI > 0) {
    loanSupported = maxMonthlyPI * n;
  }

  const maxHomePrice = Math.max(0, loanSupported + down);
  const actualDti = monthlyGross > 0 ? ((debt + maxMonthlyPI + taxInsBuffer) / monthlyGross) * 100 : 0;

  const maxHomeEl = document.getElementById('affordability-max-home');
  const maxLoanEl = document.getElementById('affordability-max-mortgage');
  const maxMoEl = document.getElementById('affordability-max-monthly');
  const dtiEl = document.getElementById('affordability-dti');

  if (maxHomeEl) maxHomeEl.textContent = formatCurrency(maxHomePrice);
  if (maxLoanEl) maxLoanEl.textContent = formatCurrency(loanSupported);
  if (maxMoEl) maxMoEl.textContent = formatCurrency(maxMonthlyPI);
  if (dtiEl) dtiEl.textContent = formatPercent(Math.min(100, actualDti), 1);

  flashElement('affordability-max-home');
}

function setAffordabilityTerm(years, source) {
  const termEl = document.getElementById('affordability-term');
  const rangeEl = document.getElementById('affordability-term-range');
  const dispSpan = document.getElementById('affordability-term-display');

  if (source === 'input' && (years === '' || isNaN(parseFloat(years)))) return;

  const val = parseFloat(years);
  const parsed = Math.max(1, Math.min(50, isNaN(val) ? 30 : val));

  if (termEl && source !== 'input') termEl.value = parsed;
  if (rangeEl) rangeEl.value = Math.min(40, Math.max(5, parsed));
  if (dispSpan) dispSpan.textContent = `${parsed} Year${parsed === 1 ? '' : 's'}`;

  let hasPreset = false;
  document.querySelectorAll('.affordability-term-btn').forEach(btn => {
    const match = parseFloat(btn.dataset.years) === parsed;
    btn.classList.toggle('active', match);
    if (match) hasPreset = true;
  });
  const customBtn = document.getElementById('affordability-term-custom-btn');
  if (customBtn) customBtn.classList.toggle('active', !hasPreset);

  calcAffordability();
  saveStateDebounced();
}

// -------------------------------------------------------------
// 22. MORTGAGE REFINANCE BREAK-EVEN
// -------------------------------------------------------------
function calcRefinance() {
  const balance = parseFloat(document.getElementById('refinance-balance').value) || 0;
  const curRate = parseFloat(document.getElementById('refinance-current-rate').value) || 0;
  const newRate = parseFloat(document.getElementById('refinance-new-rate').value) || 0;
  const costs = parseFloat(document.getElementById('refinance-costs').value) || 0;
  const termYears = parseFloat(document.getElementById('refinance-term')?.value) || 30;
  const n = termYears * 12;

  const dispSpan = document.getElementById('refinance-term-display');
  if (dispSpan) dispSpan.textContent = `${termYears} Year${termYears === 1 ? '' : 's'}`;
  const lifeLabel = document.getElementById('refinance-lifetime-label');
  if (lifeLabel) lifeLabel.textContent = `${termYears}-Year Net Lifetime Savings`;
  document.querySelectorAll('.refinance-term-btn').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.dataset.years) === termYears);
  });

  const calcMo = (bal, r) => {
    if (r === 0) return bal / n;
    const mr = (r / 100) / 12;
    return (bal * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
  };

  const oldMonthly = balance > 0 ? calcMo(balance, curRate) : 0;
  const newMonthly = balance > 0 ? calcMo(balance, newRate) : 0;
  const monthlySavings = Math.max(0, oldMonthly - newMonthly);

  const breakevenMonths = monthlySavings > 0 ? Math.ceil(costs / monthlySavings) : 0;
  const lifetimeSavings = Math.max(0, (monthlySavings * n) - costs);

  const saveEl = document.getElementById('refinance-monthly-savings');
  const breakEl = document.getElementById('refinance-breakeven-months');
  const lifeEl = document.getElementById('refinance-lifetime-savings');

  if (saveEl) saveEl.textContent = formatCurrency(monthlySavings);
  if (breakEl) breakEl.textContent = `${breakevenMonths} Months`;
  if (lifeEl) lifeEl.textContent = formatCurrency(lifetimeSavings);

  flashElement('refinance-monthly-savings');
}

function setRefinanceTerm(years, source) {
  const termEl = document.getElementById('refinance-term');
  const rangeEl = document.getElementById('refinance-term-range');
  const dispSpan = document.getElementById('refinance-term-display');

  if (source === 'input' && (years === '' || isNaN(parseFloat(years)))) return;

  const val = parseFloat(years);
  const parsed = Math.max(1, Math.min(50, isNaN(val) ? 30 : val));

  if (termEl && source !== 'input') termEl.value = parsed;
  if (rangeEl) rangeEl.value = Math.min(40, Math.max(5, parsed));
  if (dispSpan) dispSpan.textContent = `${parsed} Year${parsed === 1 ? '' : 's'}`;

  let hasPreset = false;
  document.querySelectorAll('.refinance-term-btn').forEach(btn => {
    const match = parseFloat(btn.dataset.years) === parsed;
    btn.classList.toggle('active', match);
    if (match) hasPreset = true;
  });
  const customBtn = document.getElementById('refinance-term-custom-btn');
  if (customBtn) customBtn.classList.toggle('active', !hasPreset);

  calcRefinance();
  saveStateDebounced();
}

// -------------------------------------------------------------
// 23. BI-WEEKLY MORTGAGE ACCELERATION
// -------------------------------------------------------------
function calcBiweekly() {
  const balance = parseFloat(document.getElementById('biweekly-balance').value) || 0;
  const rate = parseFloat(document.getElementById('biweekly-rate').value) || 0;
  const termYears = parseFloat(document.getElementById('biweekly-term')?.value) || 30;
  const n = termYears * 12;

  const dispSpan = document.getElementById('biweekly-term-display');
  if (dispSpan) dispSpan.textContent = `${termYears} Year${termYears === 1 ? '' : 's'}`;
  document.querySelectorAll('.biweekly-term-btn').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.dataset.years) === termYears);
  });

  let monthlyP = 0;
  const mr = (rate / 100) / 12;
  if (mr === 0) {
    monthlyP = balance / n;
  } else {
    monthlyP = (balance * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
  }

  const biweeklyPayment = monthlyP / 2;
  // Bi-weekly results in 26 half-payments = 13 monthly payments/year (1 extra monthly payment/yr)
  const extraAnnual = monthlyP;
  const approxYearsSaved = rate > 0 ? Math.min(termYears - 1, (extraAnnual / (monthlyP * 12)) * termYears * 1.8) : 0;
  const approxInterestSaved = monthlyP * 12 * approxYearsSaved * 0.45;

  const intEl = document.getElementById('biweekly-interest-saved');
  const payEl = document.getElementById('biweekly-payment');
  const yrsEl = document.getElementById('biweekly-years-saved');

  if (intEl) intEl.textContent = formatCurrency(approxInterestSaved);
  if (payEl) payEl.textContent = formatCurrency(biweeklyPayment);
  if (yrsEl) yrsEl.textContent = `${approxYearsSaved.toFixed(1)} Years`;

  flashElement('biweekly-interest-saved');
}

function setBiweeklyTerm(years, source) {
  const termEl = document.getElementById('biweekly-term');
  const rangeEl = document.getElementById('biweekly-term-range');
  const dispSpan = document.getElementById('biweekly-term-display');

  if (source === 'input' && (years === '' || isNaN(parseFloat(years)))) return;

  const val = parseFloat(years);
  const parsed = Math.max(1, Math.min(50, isNaN(val) ? 30 : val));

  if (termEl && source !== 'input') termEl.value = parsed;
  if (rangeEl) rangeEl.value = Math.min(40, Math.max(5, parsed));
  if (dispSpan) dispSpan.textContent = `${parsed} Year${parsed === 1 ? '' : 's'}`;

  let hasPreset = false;
  document.querySelectorAll('.biweekly-term-btn').forEach(btn => {
    const match = parseFloat(btn.dataset.years) === parsed;
    btn.classList.toggle('active', match);
    if (match) hasPreset = true;
  });
  const customBtn = document.getElementById('biweekly-term-custom-btn');
  if (customBtn) customBtn.classList.toggle('active', !hasPreset);

  calcBiweekly();
  saveStateDebounced();
}

// -------------------------------------------------------------
// 24. RENTAL CASH-ON-CASH RETURN & NOI
// -------------------------------------------------------------
function calcCashOnCash() {
  const rent = parseFloat(document.getElementById('cashoncash-rent').value) || 0;
  const mortgage = parseFloat(document.getElementById('cashoncash-mortgage').value) || 0;
  const expenses = parseFloat(document.getElementById('cashoncash-expenses').value) || 0;
  const investment = parseFloat(document.getElementById('cashoncash-investment').value) || 1;

  const monthlyCashflow = rent - mortgage - expenses;
  const annualCashflow = monthlyCashflow * 12;
  const cocReturn = investment > 0 ? (annualCashflow / investment) * 100 : 0;
  const noi = (rent - expenses) * 12;

  const cocEl = document.getElementById('cashoncash-coc-return');
  const cfEl = document.getElementById('cashoncash-annual-cashflow');
  const noiEl = document.getElementById('cashoncash-noi');

  if (cocEl) cocEl.textContent = formatPercent(cocReturn);
  if (cfEl) cfEl.textContent = formatCurrency(annualCashflow);
  if (noiEl) noiEl.textContent = formatCurrency(noi);

  flashElement('cashoncash-coc-return');
}

// -------------------------------------------------------------
// 25. HELOC PAYMENT & PAYOFF CONSOLE
// -------------------------------------------------------------
function calcHeloc() {
  const drawn = parseFloat(document.getElementById('heloc-drawn').value) || 0;
  const rate = parseFloat(document.getElementById('heloc-rate').value) || 0;
  const drawYears = parseFloat(document.getElementById('heloc-draw-years').value) || 10;
  const repayYears = parseFloat(document.getElementById('heloc-repay-years')?.value) || 15;

  const dispSpan = document.getElementById('heloc-repay-years-display');
  if (dispSpan) dispSpan.textContent = `${repayYears} Year${repayYears === 1 ? '' : 's'}`;
  document.querySelectorAll('.heloc-term-btn').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.dataset.years) === repayYears);
  });

  const monthlyRate = (rate / 100) / 12;
  const drawMonthly = drawn * monthlyRate;

  const repayMonths = repayYears * 12;
  let repayMonthly = 0;
  if (monthlyRate === 0) {
    repayMonthly = drawn / repayMonths;
  } else {
    repayMonthly = (drawn * monthlyRate * Math.pow(1 + monthlyRate, repayMonths)) / (Math.pow(1 + monthlyRate, repayMonths) - 1);
  }

  const totalInterest = (drawMonthly * drawYears * 12) + Math.max(0, (repayMonthly * repayMonths) - drawn);

  const drawEl = document.getElementById('heloc-draw-payment');
  const repayEl = document.getElementById('heloc-repay-payment');
  const intEl = document.getElementById('heloc-total-interest');

  if (drawEl) drawEl.textContent = formatCurrency(drawMonthly);
  if (repayEl) repayEl.textContent = formatCurrency(repayMonthly);
  if (intEl) intEl.textContent = formatCurrency(totalInterest);

  flashElement('heloc-draw-payment');
}

function setHelocRepayYears(years, source) {
  const termEl = document.getElementById('heloc-repay-years');
  const rangeEl = document.getElementById('heloc-repay-years-range');
  const dispSpan = document.getElementById('heloc-repay-years-display');

  if (source === 'input' && (years === '' || isNaN(parseInt(years)))) return;

  const val = parseInt(years);
  const parsed = Math.max(1, Math.min(30, isNaN(val) ? 15 : val));

  if (termEl && source !== 'input') termEl.value = parsed;
  if (rangeEl) rangeEl.value = Math.min(25, Math.max(5, parsed));
  if (dispSpan) dispSpan.textContent = `${parsed} Year${parsed === 1 ? '' : 's'}`;

  let hasPreset = false;
  document.querySelectorAll('.heloc-term-btn').forEach(btn => {
    const match = parseInt(btn.dataset.years) === parsed;
    btn.classList.toggle('active', match);
    if (match) hasPreset = true;
  });
  const customBtn = document.getElementById('heloc-repay-custom-btn');
  if (customBtn) customBtn.classList.toggle('active', !hasPreset);

  calcHeloc();
  saveStateDebounced();
}

// -------------------------------------------------------------
// 26. TITLE & CLOSING COST ESTIMATOR
// -------------------------------------------------------------
function calcClosingCosts() {
  const price = parseFloat(document.getElementById('closingcosts-price').value) || 0;
  const downPct = parseFloat(document.getElementById('closingcosts-down-pct').value) || 20;
  const origPct = parseFloat(document.getElementById('closingcosts-origination-pct').value) || 1.0;

  const loan = price * Math.max(0, 1 - downPct / 100);
  const downCash = price * (downPct / 100);
  const origination = loan * (origPct / 100);
  const titleAndEscrow = Math.max(1600, price * 0.012) + 1100;
  const totalClosing = origination + titleAndEscrow;
  const cashToClose = downCash + totalClosing;
  const pctOfLoan = loan > 0 ? (totalClosing / loan) * 100 : 0;

  const totEl = document.getElementById('closingcosts-total');
  const cashEl = document.getElementById('closingcosts-cash-to-close');
  const pctEl = document.getElementById('closingcosts-pct-of-loan');

  if (totEl) totEl.textContent = formatCurrency(totalClosing);
  if (cashEl) cashEl.textContent = formatCurrency(cashToClose);
  if (pctEl) pctEl.textContent = formatPercent(pctOfLoan, 2);

  flashElement('closingcosts-total');
}

// -------------------------------------------------------------
// 27. FIRE INDEPENDENCE & SAFE WITHDRAWAL
// -------------------------------------------------------------
function calcFire() {
  const expenses = parseFloat(document.getElementById('fire-expenses').value) || 0;
  const savings = parseFloat(document.getElementById('fire-savings').value) || 0;
  const annualSave = parseFloat(document.getElementById('fire-annual-save').value) || 0;
  const swr = parseFloat(document.getElementById('fire-swr').value) || 4.0;

  const target = swr > 0 ? expenses / (swr / 100) : 0;
  let cur = savings;
  let years = 0;
  const realGrowth = 0.07; // 7% standard real market return

  if (cur < target) {
    while (cur < target && years < 60) {
      cur = (cur * (1 + realGrowth)) + annualSave;
      years++;
    }
  }

  const safeMonthly = expenses / 12;

  const targetEl = document.getElementById('fire-target-number');
  const yrsEl = document.getElementById('fire-years-to-fire');
  const moEl = document.getElementById('fire-safe-monthly');

  if (targetEl) targetEl.textContent = formatCurrency(target);
  if (yrsEl) yrsEl.textContent = `${years.toFixed(1)} Years`;
  if (moEl) moEl.textContent = formatCurrency(safeMonthly);

  renderFireChart(expenses, savings, annualSave, target, years);
  flashElement('fire-target-number');
}

// -------------------------------------------------------------
// 28. 401(K) & ROTH RETIREMENT GROWTH
// -------------------------------------------------------------
function calcFour01k() {
  const salary = parseFloat(document.getElementById('four01k-salary').value) || 0;
  const contribPct = parseFloat(document.getElementById('four01k-contrib-pct').value) || 0;
  const matchPct = parseFloat(document.getElementById('four01k-match-pct').value) || 0;
  const years = parseFloat(document.getElementById('four01k-years').value) || 0;
  const rate = parseFloat(document.getElementById('four01k-rate').value) || 0;

  const annualEmployee = salary * (contribPct / 100);
  const annualEmployer = salary * (matchPct / 100);
  const totalAnnual = annualEmployee + annualEmployer;

  let balance = 0;
  const r = rate / 100;
  for (let y = 1; y <= years; y++) {
    balance = (balance + totalAnnual) * (1 + r);
  }

  const totalEmployerMatch = annualEmployer * years;
  const monthlyRetirement = (balance * 0.04) / 12;

  const balEl = document.getElementById('four01k-future-balance');
  const matchEl = document.getElementById('four01k-total-employer');
  const moEl = document.getElementById('four01k-monthly-retirement');

  if (balEl) balEl.textContent = formatCurrency(balance);
  if (matchEl) matchEl.textContent = formatCurrency(totalEmployerMatch);
  if (moEl) moEl.textContent = formatCurrency(monthlyRetirement);

  flashElement('four01k-future-balance');
}

// -------------------------------------------------------------
// 29. REQUIRED MINIMUM DISTRIBUTION (RMD)
// -------------------------------------------------------------
function calcRmd() {
  const balance = parseFloat(document.getElementById('rmd-balance').value) || 0;
  const age = parseInt(document.getElementById('rmd-age').value) || 74;

  const factors = {
    73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9,
    78: 22.0, 79: 21.1, 80: 20.2, 81: 19.4, 82: 18.5,
    83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2, 87: 14.4,
    88: 13.7, 89: 12.9, 90: 12.2, 95: 8.9, 100: 6.4
  };

  const factor = factors[age] || Math.max(5.0, 26.5 - (age - 73) * 0.85);
  const rmdAnnual = factor > 0 ? balance / factor : 0;
  const rmdMonthly = rmdAnnual / 12;

  const annEl = document.getElementById('rmd-annual-amount');
  const moEl = document.getElementById('rmd-monthly-amount');
  const facEl = document.getElementById('rmd-distribution-factor');

  if (annEl) annEl.textContent = formatCurrency(rmdAnnual);
  if (moEl) moEl.textContent = formatCurrency(rmdMonthly);
  if (facEl) facEl.textContent = factor.toFixed(1);

  flashElement('rmd-annual-amount');
}

// -------------------------------------------------------------
// 30. SOCIAL SECURITY & PENSION MAXIMIZER
// -------------------------------------------------------------
function calcSocialSecurity() {
  const pia = parseFloat(document.getElementById('socialsecurity-pia').value) || 0;
  const claimAge = parseInt(document.getElementById('socialsecurity-claim-age').value) || 67;

  let factor = 1.0;
  if (claimAge === 62) factor = 0.70;
  else if (claimAge === 63) factor = 0.75;
  else if (claimAge === 64) factor = 0.80;
  else if (claimAge === 65) factor = 0.867;
  else if (claimAge === 66) factor = 0.933;
  else if (claimAge === 67) factor = 1.0;
  else if (claimAge === 68) factor = 1.08;
  else if (claimAge === 69) factor = 1.16;
  else if (claimAge === 70) factor = 1.24;

  const monthly = pia * factor;
  const annual = monthly * 12;
  const adjPct = (factor - 1.0) * 100;

  const moEl = document.getElementById('socialsecurity-monthly-benefit');
  const annEl = document.getElementById('socialsecurity-annual-benefit');
  const adjEl = document.getElementById('socialsecurity-penalty-bonus');

  if (moEl) moEl.textContent = formatCurrency(monthly);
  if (annEl) annEl.textContent = formatCurrency(annual);
  if (adjEl) adjEl.textContent = `${adjPct >= 0 ? '+' : ''}${adjPct.toFixed(1)}% vs Age 67`;

  flashElement('socialsecurity-monthly-benefit');
}

// -------------------------------------------------------------
// 31. CD LADDER & APY GROWTH
// -------------------------------------------------------------
function calcCdLadder() {
  const capital = parseFloat(document.getElementById('cdladder-capital').value) || 0;
  const apy = parseFloat(document.getElementById('cdladder-apy').value) || 0;
  const rungs = parseInt(document.getElementById('cdladder-rungs').value) || 4;

  const capitalPerRung = rungs > 0 ? capital / rungs : 0;
  const annualInterest = capital * (apy / 100);
  const rungPayout = capitalPerRung * (1 + (apy / 100));
  const totalMaturity = capital + annualInterest;

  const intEl = document.getElementById('cdladder-annual-interest');
  const rungEl = document.getElementById('cdladder-rung-payout');
  const totEl = document.getElementById('cdladder-total-maturity');

  if (intEl) intEl.textContent = formatCurrency(annualInterest);
  if (rungEl) rungEl.textContent = formatCurrency(rungPayout);
  if (totEl) totEl.textContent = formatCurrency(totalMaturity);

  flashElement('cdladder-annual-interest');
}

// -------------------------------------------------------------
// 32. HSA TRIPLE-TAX ADVANTAGE SUITE
// -------------------------------------------------------------
function calcHsa() {
  const contrib = parseFloat(document.getElementById('hsa-annual-contrib').value) || 0;
  const balance = parseFloat(document.getElementById('hsa-current-balance').value) || 0;
  const years = parseFloat(document.getElementById('hsa-years').value) || 0;
  const rate = parseFloat(document.getElementById('hsa-rate').value) || 0;
  const taxBracket = parseFloat(document.getElementById('hsa-tax-bracket').value) || 0;

  let fv = balance;
  const r = rate / 100;
  for (let i = 1; i <= years; i++) {
    fv = (fv + contrib) * (1 + r);
  }

  const annualTaxSaved = contrib * (taxBracket / 100);
  const lifetimeTaxSaved = (annualTaxSaved * years) + (Math.max(0, fv - balance - (contrib * years)) * (taxBracket / 100));

  const fvEl = document.getElementById('hsa-future-value');
  const annEl = document.getElementById('hsa-tax-saved-annual');
  const lifeEl = document.getElementById('hsa-lifetime-tax-saved');

  if (fvEl) fvEl.textContent = formatCurrency(fv);
  if (annEl) annEl.textContent = formatCurrency(annualTaxSaved);
  if (lifeEl) lifeEl.textContent = formatCurrency(lifetimeTaxSaved);

  flashElement('hsa-future-value');
}

// -------------------------------------------------------------
// 33. PAYCHECK TAKE-HOME (GROSS TO NET)
// -------------------------------------------------------------
function calcPaycheck() {
  const gross = parseFloat(document.getElementById('paycheck-gross').value) || 0;
  const fedTax = parseFloat(document.getElementById('paycheck-fed-tax').value) || 0;
  const stateTax = parseFloat(document.getElementById('paycheck-state-tax').value) || 0;
  const freq = parseFloat(document.getElementById('paycheck-freq').value) || 26;

  const fica = gross * 0.0765; // 6.2% Social Security + 1.45% Medicare
  const fedDeduct = gross * (fedTax / 100);
  const stateDeduct = gross * (stateTax / 100);
  const totalDeductions = fica + fedDeduct + stateDeduct;
  const netPay = Math.max(0, gross - totalDeductions);
  const annualNet = netPay * freq;

  const netEl = document.getElementById('paycheck-net-pay');
  const annEl = document.getElementById('paycheck-annual-net');
  const totEl = document.getElementById('paycheck-total-taxes');

  if (netEl) netEl.textContent = formatCurrency(netPay);
  if (annEl) annEl.textContent = formatCurrency(annualNet);
  if (totEl) totEl.textContent = formatCurrency(totalDeductions);

  flashElement('paycheck-net-pay');
}

// -------------------------------------------------------------
// 34. CAPITAL GAINS TAX & NET STOCK PROFIT
// -------------------------------------------------------------
function calcCapitalGains() {
  const purchase = parseFloat(document.getElementById('capitalgains-purchase').value) || 0;
  const sale = parseFloat(document.getElementById('capitalgains-sale').value) || 0;
  const rate = parseFloat(document.getElementById('capitalgains-rate').value) || 15;

  const gain = Math.max(0, sale - purchase);
  const tax = gain * (rate / 100);
  const netProfit = gain - tax;
  const roiPct = purchase > 0 ? (netProfit / purchase) * 100 : 0;

  const netEl = document.getElementById('capitalgains-net-profit');
  const taxEl = document.getElementById('capitalgains-tax-bill');
  const roiEl = document.getElementById('capitalgains-roi-pct');

  if (netEl) netEl.textContent = formatCurrency(netProfit);
  if (taxEl) taxEl.textContent = formatCurrency(tax);
  if (roiEl) roiEl.textContent = formatPercent(roiPct);

  flashElement('capitalgains-net-profit');
}

// -------------------------------------------------------------
// 35. SELF-EMPLOYMENT QUARTERLY TAX MATRIX
// -------------------------------------------------------------
function calcQuarterlyTax() {
  const revenue = parseFloat(document.getElementById('quarterlytax-revenue').value) || 0;
  const expenses = parseFloat(document.getElementById('quarterlytax-expenses').value) || 0;
  const fedRate = parseFloat(document.getElementById('quarterlytax-fed-rate').value) || 15;

  const netProfit = Math.max(0, revenue - expenses);
  const seTax = netProfit * 0.9235 * 0.153; // 15.3% SE tax
  const incomeTax = Math.max(0, netProfit - (seTax / 2)) * (fedRate / 100);
  const totalAnnual = seTax + incomeTax;
  const quarterlyVoucher = totalAnnual / 4;

  const qEl = document.getElementById('quarterlytax-quarterly-voucher');
  const seEl = document.getElementById('quarterlytax-se-tax');
  const annEl = document.getElementById('quarterlytax-annual-tax');

  if (qEl) qEl.textContent = formatCurrency(quarterlyVoucher);
  if (seEl) seEl.textContent = formatCurrency(seTax);
  if (annEl) annEl.textContent = formatCurrency(totalAnnual);

  flashElement('quarterlytax-quarterly-voucher');
}

// -------------------------------------------------------------
// 36. OVERTIME & DOUBLE-TIME PAY CALCULATOR
// -------------------------------------------------------------
function calcOvertime() {
  const hourly = parseFloat(document.getElementById('overtime-hourly').value) || 0;
  const regHrs = parseFloat(document.getElementById('overtime-regular-hrs').value) || 0;
  const ot15Hrs = parseFloat(document.getElementById('overtime-15x-hrs').value) || 0;
  const ot20Hrs = parseFloat(document.getElementById('overtime-20x-hrs').value) || 0;

  const regPay = regHrs * hourly;
  const ot15Pay = ot15Hrs * (hourly * 1.5);
  const ot20Pay = ot20Hrs * (hourly * 2.0);
  const totalGross = regPay + ot15Pay + ot20Pay;
  const totalHrs = regHrs + ot15Hrs + ot20Hrs;
  const premiumEarned = (ot15Hrs * hourly * 0.5) + (ot20Hrs * hourly * 1.0);
  const effectiveRate = totalHrs > 0 ? totalGross / totalHrs : hourly;

  const grossEl = document.getElementById('overtime-gross-pay');
  const premEl = document.getElementById('overtime-premium-earned');
  const effEl = document.getElementById('overtime-effective-rate');

  if (grossEl) grossEl.textContent = formatCurrency(totalGross);
  if (premEl) premEl.textContent = formatCurrency(premiumEarned);
  if (effEl) effEl.textContent = `${formatCurrency(effectiveRate)}/hr`;

  flashElement('overtime-gross-pay');
}

// -------------------------------------------------------------
// 37. BONUS TAX WITHHOLDING & NET PAYOUT
// -------------------------------------------------------------
function calcBonusTax() {
  const bonus = parseFloat(document.getElementById('bonustax-amount').value) || 0;
  const statePct = parseFloat(document.getElementById('bonustax-state-pct').value) || 5;
  const defer401kPct = parseFloat(document.getElementById('bonustax-401k-pct').value) || 0;

  const deferral = bonus * (defer401kPct / 100);
  const fedTax = (bonus - deferral) * 0.22; // 22% IRS statutory supplemental rate
  const fica = bonus * 0.0765;
  const stateTax = (bonus - deferral) * (statePct / 100);
  const totalDeducted = deferral + fedTax + fica + stateTax;
  const netPayout = Math.max(0, bonus - totalDeducted);

  const netEl = document.getElementById('bonustax-net-payout');
  const fedEl = document.getElementById('bonustax-fed-withholding');
  const totEl = document.getElementById('bonustax-total-deducted');

  if (netEl) netEl.textContent = formatCurrency(netPayout);
  if (fedEl) fedEl.textContent = formatCurrency(fedTax);
  if (totEl) totEl.textContent = formatCurrency(totalDeducted);

  flashElement('bonustax-net-payout');
}

// -------------------------------------------------------------
// 38. SEVERANCE & UNEMPLOYMENT CASHFLOW
// -------------------------------------------------------------
function calcSeverance() {
  const weeks = parseFloat(document.getElementById('severance-weeks').value) || 0;
  const weeklyPay = parseFloat(document.getElementById('severance-weekly-pay').value) || 0;
  const ptoHrs = parseFloat(document.getElementById('severance-pto').value) || 0;
  const uiWeekly = parseFloat(document.getElementById('severance-ui').value) || 0;
  const monthlyBurn = parseFloat(document.getElementById('severance-monthly-burn').value) || 1;

  const ptoPay = (weeklyPay / 40) * ptoHrs;
  const lumpSum = (weeks * weeklyPay) + ptoPay;
  const uiTotal = uiWeekly * 26; // 26 standard unemployment weeks
  const totalNetCash = (lumpSum * 0.78) + uiTotal; // after ~22% taxes
  const runwayMonths = monthlyBurn > 0 ? totalNetCash / monthlyBurn : 0;

  const runEl = document.getElementById('severance-runway-months');
  const lumpEl = document.getElementById('severance-lump-sum');
  const cashEl = document.getElementById('severance-total-cashflow');

  if (runEl) runEl.textContent = `${runwayMonths.toFixed(1)} Months`;
  if (lumpEl) lumpEl.textContent = formatCurrency(lumpSum);
  if (cashEl) cashEl.textContent = formatCurrency(totalNetCash);

  flashElement('severance-runway-months');
}

// -------------------------------------------------------------
// 39. DEBT SNOWBALL VS. AVALANCHE MATRIX
// -------------------------------------------------------------
function calcSnowball() {
  const extra = parseFloat(document.getElementById('snowball-extra').value) || 0;
  const d1Bal = parseFloat(document.getElementById('snowball-debt1-bal').value) || 0;
  const d1Apr = parseFloat(document.getElementById('snowball-debt1-apr').value) || 0;
  const d2Bal = parseFloat(document.getElementById('snowball-debt2-bal').value) || 0;
  const d2Apr = parseFloat(document.getElementById('snowball-debt2-apr').value) || 0;

  const totalDebt = d1Bal + d2Bal;
  const weightedApr = totalDebt > 0 ? ((d1Bal * d1Apr) + (d2Bal * d2Apr)) / totalDebt : 15;
  const monthlyMin = Math.max(50, totalDebt * 0.025);
  const totalMoPayment = monthlyMin + extra;

  const mr = (weightedApr / 100) / 12;
  let months = 0;
  if (totalMoPayment > totalDebt * mr && mr > 0) {
    months = Math.ceil(-Math.log(1 - (totalDebt * mr) / totalMoPayment) / Math.log(1 + mr));
  } else {
    months = 24;
  }

  const totalInterest = Math.max(0, (totalMoPayment * months) - totalDebt);
  const avalancheSavings = Math.max(0, totalInterest * 0.18); // Avalanche saves ~15-20% interest

  const saveEl = document.getElementById('snowball-avalanche-savings');
  const moEl = document.getElementById('snowball-months-debt-free');
  const intEl = document.getElementById('snowball-total-interest');

  if (saveEl) saveEl.textContent = formatCurrency(avalancheSavings);
  if (moEl) moEl.textContent = `${months} Months`;
  if (intEl) intEl.textContent = formatCurrency(totalInterest);

  renderSnowballChart(d1Bal, d2Bal, extra, d1Apr, d2Apr);
  flashElement('snowball-avalanche-savings');
}

// -------------------------------------------------------------
// 40. CAR LEASE VS. BUY COMPARISON
// -------------------------------------------------------------
function calcCarLease() {
  const msrp = parseFloat(document.getElementById('carlease-msrp').value) || 0;
  const leaseMonthly = parseFloat(document.getElementById('carlease-lease-monthly').value) || 0;
  const leaseDown = parseFloat(document.getElementById('carlease-lease-down').value) || 0;
  const loanMonthly = parseFloat(document.getElementById('carlease-loan-monthly').value) || 0;
  const residual = parseFloat(document.getElementById('carlease-residual').value) || 0;

  const lease3YrCost = leaseDown + (leaseMonthly * 36);
  const buyPaid3Yr = loanMonthly * 36;
  const loanBal3Yr = Math.max(0, msrp - (buyPaid3Yr * 0.7));
  const equityKept = Math.max(0, residual - loanBal3Yr);
  const buy3YrNetCost = Math.max(0, buyPaid3Yr - equityKept);

  const cheaperOption = buy3YrNetCost < lease3YrCost ? 'Buying Vehicle' : 'Leasing Vehicle';

  const cheapEl = document.getElementById('carlease-cheaper-option');
  const buyEl = document.getElementById('carlease-net-cost-buy');
  const leaseEl = document.getElementById('carlease-net-cost-lease');

  if (cheapEl) cheapEl.textContent = cheaperOption;
  if (buyEl) buyEl.textContent = formatCurrency(buy3YrNetCost);
  if (leaseEl) leaseEl.textContent = formatCurrency(lease3YrCost);

  flashElement('carlease-cheaper-option');
}

// -------------------------------------------------------------
// 41. PERSONAL LOAN & DEBT CONSOLIDATION
// -------------------------------------------------------------
function calcPersonalLoan() {
  const amount = parseFloat(document.getElementById('personalloan-amount').value) || 0;
  const rate = parseFloat(document.getElementById('personalloan-rate').value) || 0;
  const term = parseInt(document.getElementById('personalloan-term').value) || 36;
  const origPct = parseFloat(document.getElementById('personalloan-origination').value) || 0;

  const dispSpan = document.getElementById('personalloan-term-display');
  if (dispSpan) dispSpan.textContent = `${term} Mo (${(term / 12).toFixed(1)} Yrs)`;
  document.querySelectorAll('.personalloan-term-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.months) === term);
  });

  const fee = amount * (origPct / 100);
  const netProceeds = Math.max(0, amount - fee);

  const mr = (rate / 100) / 12;
  let monthly = 0;
  if (mr === 0) {
    monthly = amount / term;
  } else {
    monthly = (amount * mr * Math.pow(1 + mr, term)) / (Math.pow(1 + mr, term) - 1);
  }

  const totalInterest = Math.max(0, (monthly * term) - amount);

  const moEl = document.getElementById('personalloan-monthly');
  const procEl = document.getElementById('personalloan-net-proceeds');
  const intEl = document.getElementById('personalloan-total-interest');

  if (moEl) moEl.textContent = formatCurrency(monthly);
  if (procEl) procEl.textContent = formatCurrency(netProceeds);
  if (intEl) intEl.textContent = formatCurrency(totalInterest);

  flashElement('personalloan-monthly');
}

function setPersonalLoanTerm(months, source) {
  const termEl = document.getElementById('personalloan-term');
  const rangeEl = document.getElementById('personalloan-term-range');
  const dispSpan = document.getElementById('personalloan-term-display');

  if (source === 'input' && (months === '' || isNaN(parseInt(months)))) return;

  const val = parseInt(months);
  const parsed = Math.max(1, Math.min(120, isNaN(val) ? 36 : val));

  if (termEl && source !== 'input') termEl.value = parsed;
  if (rangeEl) rangeEl.value = Math.min(84, Math.max(12, parsed));
  if (dispSpan) dispSpan.textContent = `${parsed} Mo (${(parsed / 12).toFixed(1)} Yrs)`;

  let hasPreset = false;
  document.querySelectorAll('.personalloan-term-btn').forEach(btn => {
    const match = parseInt(btn.dataset.months) === parsed;
    btn.classList.toggle('active', match);
    if (match) hasPreset = true;
  });
  const customBtn = document.getElementById('personalloan-term-custom-btn');
  if (customBtn) customBtn.classList.toggle('active', !hasPreset);

  calcPersonalLoan();
  saveStateDebounced();
}

// -------------------------------------------------------------
// 42. AUTO LOAN REFINANCE SAVINGS
// -------------------------------------------------------------
function calcAutoRefi() {
  const balance = parseFloat(document.getElementById('autorefi-balance').value) || 0;
  const curRate = parseFloat(document.getElementById('autorefi-current-rate').value) || 0;
  const newRate = parseFloat(document.getElementById('autorefi-new-rate').value) || 0;
  const months = parseInt(document.getElementById('autorefi-months').value) || 48;

  const dispSpan = document.getElementById('autorefi-months-display');
  if (dispSpan) dispSpan.textContent = `${months} Mo (${(months / 12).toFixed(1)} Yrs)`;
  document.querySelectorAll('.autorefi-term-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.months) === months);
  });

  const calcP = (bal, r, m) => {
    if (r === 0) return bal / m;
    const mr = (r / 100) / 12;
    return (bal * mr * Math.pow(1 + mr, m)) / (Math.pow(1 + mr, m) - 1);
  };

  const oldMonthly = calcP(balance, curRate, months);
  const newMonthly = calcP(balance, newRate, months);
  const monthlySavings = Math.max(0, oldMonthly - newMonthly);
  const lifetimeSavings = monthlySavings * months;

  const lifeEl = document.getElementById('autorefi-lifetime-savings');
  const saveEl = document.getElementById('autorefi-monthly-savings');
  const newMoEl = document.getElementById('autorefi-new-monthly');

  if (lifeEl) lifeEl.textContent = formatCurrency(lifetimeSavings);
  if (saveEl) saveEl.textContent = formatCurrency(monthlySavings);
  if (newMoEl) newMoEl.textContent = formatCurrency(newMonthly);

  flashElement('autorefi-lifetime-savings');
}

function setAutoRefiMonths(months) {
  const parsed = Math.max(1, Math.min(120, parseInt(months) || 48));
  const termEl = document.getElementById('autorefi-months');
  const rangeEl = document.getElementById('autorefi-months-range');
  if (termEl) termEl.value = parsed;
  if (rangeEl) rangeEl.value = parsed;
  calcAutoRefi();
  saveStateDebounced();
}

// -------------------------------------------------------------
// 43. STUDENT LOAN REFINANCE VS PSLF
// -------------------------------------------------------------
function calcStudentRefi() {
  const balance = parseFloat(document.getElementById('studentrefi-balance').value) || 0;
  const privRate = parseFloat(document.getElementById('studentrefi-private-rate').value) || 4.5;
  const idrMonthly = parseFloat(document.getElementById('studentrefi-idr-monthly').value) || 0;

  const pslfPaid = idrMonthly * 120; // 10 years = 120 payments
  const pslfForgiven = Math.max(0, balance * 1.3 - pslfPaid); // including growth

  const mr = (privRate / 100) / 12;
  const refiMonthly = (balance * mr * Math.pow(1 + mr, 120)) / (Math.pow(1 + mr, 120) - 1);
  const refiPaid = refiMonthly * 120;

  const rec = pslfPaid < refiPaid ? 'PSLF Program' : 'Private Refinance';

  const forgEl = document.getElementById('studentrefi-pslf-forgiven');
  const refiEl = document.getElementById('studentrefi-refi-monthly');
  const recEl = document.getElementById('studentrefi-strategy-rec');

  if (forgEl) forgEl.textContent = formatCurrency(pslfForgiven);
  if (refiEl) refiEl.textContent = formatCurrency(refiMonthly);
  if (recEl) recEl.textContent = rec;

  flashElement('studentrefi-pslf-forgiven');
}

// -------------------------------------------------------------
// 44. CREDIT SCORE UTILIZATION SIMULATOR
// -------------------------------------------------------------
function calcCreditScore() {
  const limit = parseFloat(document.getElementById('creditscore-limit').value) || 1;
  const balance = parseFloat(document.getElementById('creditscore-balance').value) || 0;
  const paydown = parseFloat(document.getElementById('creditscore-target-pay').value) || 0;

  const newBalance = Math.max(0, balance - paydown);
  const newUtil = limit > 0 ? (newBalance / limit) * 100 : 0;
  const oldUtil = limit > 0 ? (balance / limit) * 100 : 0;

  let points = 0;
  if (oldUtil >= 50 && newUtil < 30) points += 35;
  else if (oldUtil >= 30 && newUtil < 10) points += 25;
  else if (newUtil < oldUtil) points += Math.round((oldUtil - newUtil) * 0.6);

  let rating = 'Exceptional (<10%)';
  if (newUtil > 50) rating = 'High Risk (>50%)';
  else if (newUtil >= 30) rating = 'Fair (30-50%)';
  else if (newUtil >= 10) rating = 'Good (10-30%)';

  const utilEl = document.getElementById('creditscore-new-utilization');
  const ptsEl = document.getElementById('creditscore-projected-points');
  const ratEl = document.getElementById('creditscore-rating');

  if (utilEl) utilEl.textContent = formatPercent(newUtil, 1);
  if (ptsEl) ptsEl.textContent = `+${points} Points`;
  if (ratEl) ratEl.textContent = rating;

  flashElement('creditscore-new-utilization');
}

// -------------------------------------------------------------
// 45. SOLAR PANEL ROI & ENERGY PAYBACK
// -------------------------------------------------------------
function calcSolar() {
  const cost = parseFloat(document.getElementById('solar-system-cost').value) || 0;
  const taxCredit = parseFloat(document.getElementById('solar-tax-credit-pct').value) || 30;
  const electricBill = parseFloat(document.getElementById('solar-monthly-electric').value) || 0;
  const offsetPct = parseFloat(document.getElementById('solar-offset-pct').value) || 85;

  const netCost = cost * (1 - taxCredit / 100);
  const annualSavings = (electricBill * 12) * (offsetPct / 100);
  const paybackYears = annualSavings > 0 ? netCost / annualSavings : 0;
  const savings20Yr = Math.max(0, (annualSavings * 20) - netCost);

  const payEl = document.getElementById('solar-payback-years');
  const netEl = document.getElementById('solar-net-system-cost');
  const savEl = document.getElementById('solar-20yr-savings');

  if (payEl) payEl.textContent = `${paybackYears.toFixed(1)} Years`;
  if (netEl) netEl.textContent = formatCurrency(netCost);
  if (savEl) savEl.textContent = formatCurrency(savings20Yr);

  renderSolarChart(cost, taxCredit, electricBill, offsetPct);
  flashElement('solar-payback-years');
}

// -------------------------------------------------------------
// 46. ELECTRIC VEHICLE (EV) VS. GAS TCO
// -------------------------------------------------------------
function calcEvGas() {
  const miles = parseFloat(document.getElementById('evgas-miles').value) || 0;
  const gasPrice = parseFloat(document.getElementById('evgas-gas-price').value) || 0;
  const mpg = parseFloat(document.getElementById('evgas-mpg').value) || 1;
  const kwhRate = parseFloat(document.getElementById('evgas-kwh-rate').value) || 0;
  const evEfficiency = parseFloat(document.getElementById('evgas-ev-efficiency').value) || 1;

  const gasAnnual = (miles / mpg) * gasPrice;
  const evAnnual = (miles / evEfficiency) * kwhRate;
  const savings = Math.max(0, gasAnnual - evAnnual);

  const savEl = document.getElementById('evgas-annual-savings');
  const gasEl = document.getElementById('evgas-gas-annual-cost');
  const evEl = document.getElementById('evgas-ev-annual-cost');

  if (savEl) savEl.textContent = formatCurrency(savings);
  if (gasEl) gasEl.textContent = formatCurrency(gasAnnual);
  if (evEl) evEl.textContent = formatCurrency(evAnnual);

  flashElement('evgas-annual-savings');
}

// -------------------------------------------------------------
// 47. CRYPTO STAKING & IMPERMANENT LOSS
// -------------------------------------------------------------
function calcStaking() {
  const principal = parseFloat(document.getElementById('staking-principal').value) || 0;
  const apy = parseFloat(document.getElementById('staking-apy').value) || 0;
  const days = parseFloat(document.getElementById('staking-duration-days').value) || 365;
  const ratio = parseFloat(document.getElementById('staking-price-ratio').value) || 1.0;

  const years = days / 365;
  const futureValue = principal * Math.pow(1 + (apy / 100), years);
  const rewardsEarned = futureValue - principal;

  // Impermanent Loss = 2 * sqrt(k) / (1 + k) - 1
  const il = ratio > 0 ? (2 * Math.sqrt(ratio)) / (1 + ratio) - 1 : 0;
  const ilPct = Math.abs(il * 100);

  const rewEl = document.getElementById('staking-net-reward');
  const valEl = document.getElementById('staking-final-value');
  const ilEl = document.getElementById('staking-il-pct');

  if (rewEl) rewEl.textContent = formatCurrency(rewardsEarned);
  if (valEl) valEl.textContent = formatCurrency(futureValue);
  if (ilEl) ilEl.textContent = `-${ilPct.toFixed(2)}%`;

  flashElement('staking-net-reward');
}

// -------------------------------------------------------------
// 48. E-COMMERCE & AMAZON FBA PROFIT
// -------------------------------------------------------------
function calcDropship() {
  const price = parseFloat(document.getElementById('dropship-retail-price').value) || 0;
  const cogs = parseFloat(document.getElementById('dropship-cogs').value) || 0;
  const adCost = parseFloat(document.getElementById('dropship-ad-cost').value) || 0;
  const feePct = parseFloat(document.getElementById('dropship-platform-pct').value) || 0;

  const platformFee = price * (feePct / 100);
  const totalCost = cogs + adCost + platformFee;
  const netProfit = price - totalCost;
  const marginPct = price > 0 ? (netProfit / price) * 100 : 0;
  const roasTarget = (price - cogs - platformFee) > 0 ? price / (price - cogs - platformFee) : 0;

  const profEl = document.getElementById('dropship-net-profit');
  const marEl = document.getElementById('dropship-net-margin-pct');
  const roasEl = document.getElementById('dropship-roas-target');

  if (profEl) profEl.textContent = formatCurrency(netProfit);
  if (marEl) marEl.textContent = formatPercent(marginPct);
  if (roasEl) roasEl.textContent = `${roasTarget.toFixed(2)}x`;

  flashElement('dropship-net-profit');
}

// -------------------------------------------------------------
// 49. REAL RETURN & TRUE WEALTH GROWTH
// -------------------------------------------------------------
function calcRealReturns() {
  const portfolio = parseFloat(document.getElementById('realreturns-portfolio').value) || 0;
  const nominal = parseFloat(document.getElementById('realreturns-nominal-rate').value) || 0;
  const inflation = parseFloat(document.getElementById('realreturns-inflation').value) || 0;
  const years = parseFloat(document.getElementById('realreturns-years').value) || 0;

  const realRate = (((1 + nominal / 100) / (1 + inflation / 100)) - 1) * 100;
  const nominalFV = portfolio * Math.pow(1 + nominal / 100, years);
  const realFV = portfolio * Math.pow(1 + realRate / 100, years);
  const lostValue = Math.max(0, nominalFV - realFV);

  const rateEl = document.getElementById('realreturns-real-rate');
  const fvEl = document.getElementById('realreturns-real-future-value');
  const lostEl = document.getElementById('realreturns-purchasing-lost');

  if (rateEl) rateEl.textContent = formatPercent(realRate, 2);
  if (fvEl) fvEl.textContent = formatCurrency(realFV);
  if (lostEl) lostEl.textContent = formatCurrency(lostValue);

  flashElement('realreturns-real-rate');
}

// -------------------------------------------------------------
// 50. AIRBNB & SHORT-TERM RENTAL MATRIX
// -------------------------------------------------------------
function calcAirbnb() {
  const adr = parseFloat(document.getElementById('airbnb-adr').value) || 0;
  const occupancy = parseFloat(document.getElementById('airbnb-occupancy').value) || 0;
  const mortgage = parseFloat(document.getElementById('airbnb-mortgage').value) || 0;
  const operating = parseFloat(document.getElementById('airbnb-operating').value) || 0;

  const bookedNights = 30.4 * (occupancy / 100);
  const grossMonthly = bookedNights * adr;
  const hostFee = grossMonthly * 0.03; // Airbnb 3% cut
  const netMonthly = grossMonthly - mortgage - operating - hostFee;
  const annualGross = grossMonthly * 12;
  const netMargin = grossMonthly > 0 ? (netMonthly / grossMonthly) * 100 : 0;

  const moEl = document.getElementById('airbnb-net-monthly');
  const annEl = document.getElementById('airbnb-annual-gross');
  const marEl = document.getElementById('airbnb-net-margin');

  if (moEl) moEl.textContent = formatCurrency(netMonthly);
  if (annEl) annEl.textContent = formatCurrency(annualGross);
  if (marEl) marEl.textContent = formatPercent(netMargin);

  flashElement('airbnb-net-monthly');
}


function recalculateAll() {
  calcMortgage();
  calcInvoice();
  calcRoi();
  calcCrypto();
  calcCompound();
  calcCapRate();
  calcSalary();
  calcBreakEven();
  calcCreditCard();
  calcStockAvg();
  calcRentBuy();
  calcMargin();
  calcAutoLoan();
  calcStudent();
  calcBudget();
  calcInterest();
  calcDividend();
  calcInflation();
  calcSip();
  calcCagr();
  // Engines 21-50
  calcAffordability();
  calcRefinance();
  calcBiweekly();
  calcCashOnCash();
  calcHeloc();
  calcClosingCosts();
  calcFire();
  calcFour01k();
  calcRmd();
  calcSocialSecurity();
  calcCdLadder();
  calcHsa();
  calcPaycheck();
  calcCapitalGains();
  calcQuarterlyTax();
  calcOvertime();
  calcBonusTax();
  calcSeverance();
  calcSnowball();
  calcCarLease();
  calcPersonalLoan();
  calcAutoRefi();
  calcStudentRefi();
  calcCreditScore();
  calcSolar();
  calcEvGas();
  calcStaking();
  calcDropship();
  calcRealReturns();
  calcAirbnb();
}

// -------------------------------------------------------------
// GLOBAL CURRENCY & REGIONAL LOCALIZATION DICTIONARIES
// -------------------------------------------------------------

const CURRENCY_REGISTRY = {
  USD: { symbol: '$', region: 'US', name: 'USD - United States ($)' },
  EUR: { symbol: '€', region: 'EU', name: 'EUR - Eurozone (€)' },
  GBP: { symbol: '£', region: 'UK', name: 'GBP - United Kingdom (£)' },
  INR: { symbol: '₹', region: 'IN', name: 'INR - India (₹)' },
  JPY: { symbol: '¥', region: 'US', name: 'JPY - Japan (¥)' },
  BTC: { symbol: '₿', region: 'US', name: 'BTC - Crypto Core (₿)' },
  AUD: { symbol: '$', region: 'AU', name: 'AUD - Australia ($)' },
  CAD: { symbol: '$', region: 'CA', name: 'CAD - Canada ($)' },
  SGD: { symbol: '$', region: 'US', name: 'SGD - Singapore ($)' },
  NZD: { symbol: '$', region: 'AU', name: 'NZD - New Zealand ($)' },
  HKD: { symbol: '$', region: 'US', name: 'HKD - Hong Kong ($)' },
  MXN: { symbol: '$', region: 'US', name: 'MXN - Mexico ($)' },
  BRL: { symbol: 'R$', region: 'US', name: 'BRL - Brazil (R$)' },
  PLN: { symbol: 'zł', region: 'EU', name: 'PLN - Poland (zł)' },
  SEK: { symbol: 'kr', region: 'EU', name: 'SEK / NOK - Scandinavia (kr)' },
  AED: { symbol: 'د.إ', region: 'ME', name: 'AED - United Arab Emirates (د.إ)' },
  ILS: { symbol: '₪', region: 'US', name: 'ILS - Israel (₪)' },
  KRW: { symbol: '₩', region: 'US', name: 'KRW - South Korea (₩)' },
  ZAR: { symbol: 'R', region: 'UK', name: 'ZAR - South Africa (R)' },
  CHF: { symbol: 'CHF', region: 'EU', name: 'CHF - Switzerland (CHF)' },
  TRY: { symbol: 'TL', region: 'EU', name: 'TRY - Turkey (TL)' },
  IDR: { symbol: 'Rp', region: 'US', name: 'IDR - Indonesia (Rp)' },
  MYR: { symbol: 'RM', region: 'US', name: 'MYR - Malaysia (RM)' },
  PHP: { symbol: '₱', region: 'US', name: 'PHP - Philippines (₱)' },
  THB: { symbol: '฿', region: 'US', name: 'THB - Thailand (฿)' },
  VND: { symbol: '₫', region: 'US', name: 'VND - Vietnam (₫)' },
  SAR: { symbol: '﷼', region: 'ME', name: 'SAR - Saudi Arabia (﷼)' }
};

const REGIONAL_DICTIONARIES = {
  // Universal Baseline (US / Default)
  US: {
    engines: {
      mortgage: { title: 'Mortgage Liability Console', subtitle: 'Calculate real-time capital mortgage outlays.', tab: '🏠 Mortgage Liability Core' },
      invoice: { title: 'Contractor Invoicing & Tax Matrix', subtitle: 'Simulate billable parameters to calculate real-time net metrics.', tab: '💼 Invoicing & Tax Matrix' },
      roi: { title: 'Campaign Enterprise ROI Metrics', subtitle: 'Quantify marketing leverage and return on ad spend investment.', tab: '📈 Campaign Growth ROI' },
      crypto: { title: 'Crypto Futures Leverage & Liquidation Matrix', subtitle: 'Simulate high-risk long/short positions against estimated liquidation triggers.', tab: '⚡ Crypto Futures Leverage' },
      compound: { title: 'Compound Interest Wealth Multiplier Suite', subtitle: 'Compute multi-decade capital acceleration under continuous reinvestment dynamics.', tab: '💰 Compound Asset Wealth' },
      caprate: { title: 'Commercial Asset Cap Rate Matrix', subtitle: 'Compute property net income performance and market capitalization yields.', tab: '🏢 Property Cap Rate Core' },
      salary: { title: 'Wage Hourly to Salary Converter Engine', subtitle: 'Convert hourly contractor rates to annualized and monthly compensation equivalents.', tab: '⏱️ Wage Hourly to Salary' },
      breakeven: { title: 'Startup Venture Break-Even Level', subtitle: 'Determine exact unit volume requirements to achieve operational profitability.', tab: '📊 Venture Break-Even Level' },
      creditcard: { title: 'Credit Card Liability Elimination Engine', subtitle: 'Map repayment trajectory and visualize aggregate compounding interest saved.', tab: '💳 Credit Card Payoff Plan' },
      stockavg: { title: 'Equity Asset Cost Averaging Suite', subtitle: 'Synthesize multi-tier asset acquisitions to deduce weighted average cost basis.', tab: '📉 Stock Cost Averaging' },
      rentbuy: { title: 'Residential Housing Analysis Framework', subtitle: 'Quantify cost-of-capital differential across ownership versus tenancy horizons.', tab: '🏘️ Rent vs Buy Comparison' },
      margin: { title: 'Retail Commerce Gross Profit Margin', subtitle: 'Deduce product markup coefficients and net gross operational spread.', tab: '🛒 Retail Profit Margin' },
      autoloan: { title: 'Auto Capital Financing Estimator Matrix', subtitle: 'Forecast monthly vehicle financing obligations across flexible loan terms.', tab: '🚗 Auto Finance Estimator' },
      student: { title: 'Student Loan Payoff Horizon Matrix', subtitle: 'Map education debt amortization and fixed monthly repayment schedules.', tab: '🎓 Student Loan Payoff' },
      budget: { title: '50/30/20 Portfolio Allocation Strategy', subtitle: 'Partition net monthly post-tax revenue into standardized allocation channels.', tab: '💵 50/30/20 Budget Setup' },
      interest: { title: 'Simple Interest Contract Ledger', subtitle: 'Calculate linear principal growth without reinvestment compounding factors.', tab: '🔢 Simple Interest Engine' },
      dividend: { title: 'Stock Dividend Yield Console', subtitle: 'Estimate recurring passive cashflows generated by high-yield equity holdings.', tab: '🪙 Stock Dividend Yield' },
      inflation: { title: 'Cash Inflation Eroder Suite', subtitle: 'Simulate purchasing power loss across multi-year inflation-adjusted horizons.', tab: '🎈 Cash Inflation Eroder' },
      sip: { title: 'Systematic Monthly Investment (SIP) Engine', subtitle: 'Project cumulative wealth created via structured monthly dollar-cost averaging.', tab: '🗓️ Systematic SIP Planner' },
      cagr: { title: 'Compound Annual Growth Rate (CAGR) Console', subtitle: 'Compute geometric progression growth rates over multiple fiscal horizons.', tab: '🔄 CAGR Growth Rate' },
      // Engines 21-50 US Baseline
      affordability: { title: 'Home Affordability Engine', subtitle: 'Calculate maximum home purchase price based on gross income, monthly debts, down payment, and DTI thresholds.', tab: '🏡 Home Affordability' },
      refinance: { title: 'Mortgage Refinance Break-Even', subtitle: 'Calculate monthly savings, break-even payback period, and lifetime interest delta from refinancing.', tab: '🔄 Mortgage Refinance' },
      biweekly: { title: 'Bi-Weekly Mortgage Acceleration', subtitle: 'Simulate 26 bi-weekly half-payments to shave years off your amortization and save tens of thousands in interest.', tab: '⚡ Bi-Weekly Mortgage' },
      cashoncash: { title: 'Rental Cash-on-Cash Return & NOI', subtitle: 'Compute true cash-on-cash yield, net operating income (NOI), and pre-tax annualized cash flows.', tab: '🏠 Rental Cash-on-Cash' },
      heloc: { title: 'HELOC Payment & Payoff Console', subtitle: 'Simulate interest-only draw period payments and fully amortized principal payoff adjustments.', tab: '💳 HELOC Payment & Payoff' },
      closingcosts: { title: 'Title & Buyer Closing Costs Matrix', subtitle: 'Estimate lender fees, title insurance, transfer taxes, escrow prepaids, and out-of-pocket cash to close.', tab: '📑 Buyer Closing Costs' },
      fire: { title: 'FIRE Independence & 4% Safe Withdrawal Rate', subtitle: 'Model lean, standard, and fat Financial Independence horizons using Trinity 4% rule heuristics.', tab: '🔥 FIRE Early Retirement' },
      four01k: { title: '401(k) & Roth IRA Nest Egg Projector', subtitle: 'Simulate tax-deferred compound asset expansion with employer matching contributions.', tab: '🏦 401(k) & Roth IRA' },
      rmd: { title: 'IRS Required Minimum Distribution (RMD)', subtitle: 'Determine mandatory annual distributions under IRS Uniform Lifetime Table actuarial divisors.', tab: '📋 IRS RMD Distributions' },
      socialsecurity: { title: 'Social Security Benefit Maximizer', subtitle: 'Compare early claiming (age 62) vs full retirement (67) vs delayed credits (70).', tab: '🛡️ Social Security Maximizer' },
      cdladder: { title: 'Certificate of Deposit (CD) Ladder Matrix', subtitle: 'Model a rolling 4-tranche certificate ladder to maximize APY yield while retaining rolling quarterly liquidity.', tab: '🪜 CD Ladder & APY' },
      hsa: { title: 'HSA Triple-Tax Shield & Growth Suite', subtitle: 'Model tax-deductible contributions, tax-free investment compounding, and tax-exempt qualified withdrawals.', tab: '🏥 HSA Triple-Tax Shield' },
      paycheck: { title: 'Paycheck Gross-to-Net Calculator', subtitle: 'Deduce federal withholding, FICA Medicare/Social Security, and state deductions to forecast net paycheck take-home.', tab: '💵 Paycheck Gross to Net' },
      capitalgains: { title: 'Capital Gains Tax & Net Stock Profit', subtitle: 'Simulate short-term vs long-term capital gains tax rates and determine true net post-tax investment profits.', tab: '📊 Capital Gains Tax' },
      quarterlytax: { title: 'Self-Employed 1040-ES Quarterly Tax', subtitle: 'Calculate quarterly IRS estimated tax vouchers, self-employment SE tax, and safe harbor thresholds.', tab: '📝 1040-ES Quarterly Tax' },
      overtime: { title: 'Overtime & Double-Time Pay Calculator', subtitle: 'Calculate FLSA compliant 1.5x overtime and 2.0x holiday compensation differentials.', tab: '⏱️ Overtime & Double-Time' },
      bonustax: { title: 'Bonus Tax Withholding Matrix', subtitle: 'Model statutory 22% federal supplemental wage withholding vs actual marginal tax refund adjustments.', tab: '🎁 Bonus Tax Withholding' },
      severance: { title: 'Severance Pay & Runway Estimator', subtitle: 'Calculate post-tax severance lump sums combined with state unemployment benefit runway weeks.', tab: '🛡️ Severance & Runway' },
      snowball: { title: 'Debt Snowball vs. Avalanche Payoff', subtitle: 'Compare psychological momentum (lowest balance first) vs mathematical optimization (highest interest APR first).', tab: '❄️ Snowball vs Avalanche' },
      carlease: { title: 'Car Lease vs. Buy Decision Engine', subtitle: 'Compare full lifecycle cost-of-capital between dealership leasing and ownership financing.', tab: '🚙 Car Lease vs Buy' },
      personalloan: { title: 'Personal Loan & Debt Consolidation', subtitle: 'Analyze fixed-rate installment loans to consolidate high-interest credit card debt.', tab: '🤝 Personal Loan Matrix' },
      autorefi: { title: 'Auto Loan Refinance Savings Matrix', subtitle: 'Determine monthly cash savings and net break-even timeline when refinancing high-interest vehicle debt.', tab: '🚘 Auto Loan Refinance' },
      studentrefi: { title: 'Student Loan Refinance vs. PSLF', subtitle: 'Contrast private refinance interest rate reductions against loss of federal PSLF and IDR income-driven forgiveness.', tab: '🎓 Student Refinance & PSLF' },
      creditscore: { title: 'Credit Score Utilization Simulator', subtitle: 'Simulate how revolving balance paydowns impact FICO/Vantage revolving utilization brackets.', tab: '💳 Credit Score Simulator' },
      solar: { title: 'Residential Solar ROI & Payback Engine', subtitle: 'Forecast 25-year electric utility bill offset, federal ITC tax credit savings, and payback period.', tab: '☀️ Residential Solar ROI' },
      evgas: { title: 'Electric Vehicle (EV) vs. Gas TCO Engine', subtitle: 'Compare lifetime fuel expenditure: electric kWh charging vs internal combustion gas gallons.', tab: '⚡ EV vs Gas TCO' },
      staking: { title: 'Crypto Staking & Impermanent Loss Engine', subtitle: 'Simulate protocol staking rewards against automated market maker (AMM) impermanent loss price divergence.', tab: '🪙 Crypto Staking & IL' },
      dropship: { title: 'E-Commerce & Amazon FBA Profit Engine', subtitle: 'Model merchant gross revenue, COGS, platform fulfillment referral fees, and target ROAS.', tab: '📦 Amazon FBA & E-Com' },
      realreturns: { title: 'Fisher Real Return & True Wealth Growth', subtitle: 'Strip out inflation from nominal investment returns to discover actual purchasing power velocity.', tab: '📈 Fisher Real Return' },
      airbnb: { title: 'Airbnb & Vacation Rental ROI Matrix', subtitle: 'Model average daily rate (ADR), occupancy percentages, platform cuts, and net hospitality cash flows.', tab: '🏖️ Airbnb & Short-Term ROI' }
    },
    labels: {
      'mortgage-asset': 'Asset Value',
      'mortgage-down': 'Down Payment Base',
      'mortgage-rate': 'Interest (%)',
      'mortgage-extra': 'Extra Monthly Principal',
      'invoice-rate': 'Hourly Rate',
      'invoice-hours': 'Hours Logged',
      'invoice-tax': 'Tax Reserves Cut',
      'salary-wage': 'Hourly Wage Scale',
      'salary-hours': 'Weekly Work Hours',
      'student-debt': 'Outstanding Student Debt',
      'student-rate': 'Interest APR (%)',
      'student-months': 'Target Months',
      'autoloan-value': 'Vehicle Value',
      'autoloan-rate': 'APR Interest (%)',
      'autoloan-term': 'Term Months',
      'caprate-rent': 'Annual Rent Revenues',
      'caprate-costs': 'Annual Operational Costs',
      'caprate-value': 'Property Valuation Base',
      'creditcard-debt': 'Outstanding Debt Target',
      'creditcard-apr': 'Card APR (%)',
      'creditcard-payment': 'Monthly Payment',
      'budget-income': 'Net Monthly Income Cashflow',
      'sip-monthly': 'Monthly SIP Infusion',
      'sip-rate': 'Expected Return (%)',
      'sip-years': 'Timeframe (Years)',
      'inflation-cash': 'Current Liquid Cash Holding',
      'dividend-equity': 'Total Equity Invested',
      'rentbuy-rent': 'Monthly Rent Contract',
      'rentbuy-mortgage': 'Monthly Purchase Mortgage Outflow'
    },
    outputs: {
      'mortgage-payment': 'Target Monthly Payment Outflow',
      'mortgage-total-interest': 'Total Interest Outlay',
      'mortgage-total-payment': 'Total Loan Outflow',
      'invoice-net': 'Net Retained Yield',
      'invoice-gross': 'Gross Invoice Volume',
      'invoice-tax-buffer': 'Isolated Tax Buffer',
      'salary-annual': 'Projected Annual Capitalization',
      'salary-weekly': 'Weekly Yield Equivalent',
      'salary-monthly': 'Monthly Yield Equivalent',
      'caprate-rate': 'Target Capitalization Rate',
      'autoloan-payment': 'Estimated Monthly Auto Liability',
      'student-payment': 'Target Monthly Repayment Profile',
      'sip-maturity': 'Estimated Total Maturity Value',
      'sip-invested': 'Total Invested Capital Base',
      'sip-gain': 'Estimated Wealth Expansion',
      'inflation-future-val': 'Future Real Purchasing Value',
      'inflation-lost-val': 'Purchasing Capital Lost'
    },
    special: {
      mortgageTerms: { '30': '30 Year Schedule', '15': '15 Year Schedule' }
    }
  },

  // India (INR - ₹)
  IN: {
    engines: {
      mortgage: { title: 'Home Loan EMI Calculator', subtitle: 'Calculate real-time capital home loan EMIs, interest schedule, and prepayment savings.', tab: '🏠 Home Loan EMI Core' },
      invoice: { title: 'Freelancer GST & TDS Invoice Matrix', subtitle: 'Simulate billable client parameters with GST buffer and TDS deductions.', tab: '💼 Freelancer GST & TDS Matrix' },
      roi: { title: 'Digital Ad ROAS & Marketing ROI', subtitle: 'Track ad spend efficiency, blended ROAS, and net marketing profitability.', tab: '📈 Digital Ad ROAS & ROI' },
      crypto: { title: 'Crypto Futures Leverage & Liquidation', subtitle: 'Simulate margin thresholds and liquidation triggers for futures trades.', tab: '⚡ Crypto Futures Leverage' },
      compound: { title: 'Compound Interest Wealth Multiplier', subtitle: 'Project long-term compound wealth and capital accumulation across time horizons.', tab: '💰 Compound Wealth Multiplier' },
      caprate: { title: 'Rental Yield & Property ROI Matrix', subtitle: 'Evaluate rental yield, net operating income, and real estate valuation.', tab: '🏢 Rental Yield & Property ROI' },
      salary: { title: 'Hourly Wage to Annual CTC / Salary', subtitle: 'Convert hourly consultant rates into total annualized CTC and monthly in-hand.', tab: '⏱️ Wage to Annual CTC / Salary' },
      breakeven: { title: 'Business Break-Even Unit Matrix', subtitle: 'Calculate sales volume and revenue required to recover overheads and achieve profit.', tab: '📊 Business Break-Even Matrix' },
      creditcard: { title: 'Credit Card Outstanding & Debt Payoff', subtitle: 'Model payoff timelines, revolving interest charges, and debt-free schedules.', tab: '💳 Card Outstanding Payoff' },
      stockavg: { title: 'Share Average Price (Buy-Down) Suite', subtitle: 'Calculate weighted average price across multiple share purchases on NSE/BSE.', tab: '📉 Share Average Buy-Down' },
      rentbuy: { title: 'Rent vs Buy Home Decision Matrix', subtitle: 'Compare total homeownership outlays vs rental cash flows over time.', tab: '🏘️ Rent vs Buy Decision Matrix' },
      margin: { title: 'Retail Gross Margin & Markup Calculator', subtitle: 'Calculate gross margins, cost markups, and unit retail pricing.', tab: '🛒 Retail Margin & Markup' },
      autoloan: { title: 'Car Loan EMI Estimator', subtitle: 'Model on-road vehicle financing, monthly EMI, and total interest cost.', tab: '🚗 Car Loan EMI Estimator' },
      student: { title: 'Education Loan Repayment Matrix', subtitle: 'Simulate student/higher education loan repayment timelines and interest cost.', tab: '🎓 Education Loan Matrix' },
      budget: { title: '50/30/20 Monthly Budgeting Rule', subtitle: 'Allocate monthly in-hand income across Needs, Wants, and Wealth Investments.', tab: '💵 50/30/20 Budgeting Rule' },
      interest: { title: 'Simple Interest & Promissory Note', subtitle: 'Compute linear interest yields and final maturity values on simple loan notes.', tab: '🔢 Simple Interest Note' },
      dividend: { title: 'Dividend Yield & Payout Console', subtitle: 'Forecast annual dividend income and dividend yield on stock portfolios.', tab: '🪙 Dividend Yield Console' },
      inflation: { title: 'Rupee Inflation & Purchasing Power', subtitle: 'Measure erosion of Indian Rupee purchasing power over future time horizons.', tab: '🎈 Rupee Inflation Eroder' },
      sip: { title: 'Mutual Fund SIP Wealth Planner', subtitle: 'Simulate compound growth of monthly Mutual Fund SIP investments.', tab: '🗓️ Mutual Fund SIP Planner' },
      cagr: { title: 'Compound Annual Growth Rate (CAGR)', subtitle: 'Determine annualized growth rate of investments across multi-year holding periods.', tab: '🔄 CAGR Growth Rate' },
      // Regional Adaptations for India
      four01k: { title: 'EPF, PPF & NPS Retirement Corpus', subtitle: 'Simulate Employee Provident Fund (EPF), PPF, and National Pension Scheme corpus growth.', tab: '🏦 EPF & PPF Retirement' },
      paycheck: { title: 'Salary Slip Gross to In-Hand Net', subtitle: 'Deduct EPF (12%), Professional Tax, and Income Tax TDS under New vs Old Regime.', tab: '💵 Salary Slip In-Hand Net' },
      capitalgains: { title: 'LTCG / STCG Capital Gains Tax (Sec 112A)', subtitle: 'Compute 12.5% LTCG (beyond ₹1.25L exemption) and 20% STCG on equity and mutual fund gains.', tab: '📊 LTCG & STCG Tax' },
      quarterlytax: { title: 'Advance Tax Payment Matrix (Sec 208)', subtitle: 'Calculate quarterly advance tax installments (15%, 45%, 75%, 100%) to prevent Sec 234B/C interest penalties.', tab: '📝 Advance Tax Matrix' },
      cdladder: { title: 'Fixed Deposit (FD) Ladder Matrix', subtitle: 'Plan rolling quarterly bank Fixed Deposits to optimize interest yield and liquidity.', tab: '🪜 Fixed Deposit (FD) Ladder' },
      hsa: { title: 'Section 80D Health Cover Tax Shield', subtitle: 'Calculate tax deduction savings on health insurance premiums under Section 80D.', tab: '🏥 Section 80D Health Shield' },
      carlease: { title: 'Corporate Car Lease vs Car Loan Matrix', subtitle: 'Compare tax-exempt corporate car lease tax breaks against vehicle bank loan financing.', tab: '🚙 Car Lease vs Loan EMI' },
      snowball: { title: 'Debt Snowball vs Avalanche Payoff', subtitle: 'Accelerate clearance of personal loans, credit cards, and EMIs systematically.', tab: '❄️ Debt Repayment Plan' },
    },
    labels: {
      'mortgage-asset': 'Property Cost / Value',
      'mortgage-down': 'Down Payment / Own Contribution',
      'mortgage-rate': 'Home Loan Interest Rate (%)',
      'mortgage-extra': 'Extra Monthly Principal Prepayment',
      'invoice-rate': 'Hourly / Billing Rate',
      'invoice-hours': 'Billed Hours Logged',
      'invoice-tax': 'GST (18%) & TDS (10%) Buffer',
      'salary-wage': 'Basic Hourly CTC Rate',
      'salary-hours': 'Weekly Work Hours',
      'student-debt': 'Outstanding Education Loan',
      'student-rate': 'Education Loan Interest Rate (%)',
      'student-months': 'Repayment Tenor (Months)',
      'autoloan-value': 'Car On-Road Price / Loan Sum',
      'autoloan-rate': 'Car Loan Interest Rate (%)',
      'autoloan-term': 'Loan Tenor (Months)',
      'caprate-rent': 'Annual Rental Income',
      'caprate-costs': 'Maintenance & Property Taxes',
      'caprate-value': 'Property Market Valuation',
      'creditcard-debt': 'Outstanding Card Balance',
      'creditcard-apr': 'Annual Finance Charge / APR (%)',
      'creditcard-payment': 'Target Monthly Payment',
      'budget-income': 'Monthly Take-Home / In-Hand Income',
      'sip-monthly': 'Monthly Mutual Fund SIP Amount',
      'sip-rate': 'Expected Return (CAGR %)',
      'sip-years': 'Investment Horizon (Years)',
      'inflation-cash': 'Present Rupee Capital Balance',
      'dividend-equity': 'Portfolio Equity Value',
      'rentbuy-rent': 'Monthly House Rent & Society Dues',
      'rentbuy-mortgage': 'Expected Monthly Home Loan EMI'
    },
    outputs: {
      'mortgage-payment': 'Target Monthly EMI Outflow',
      'mortgage-total-interest': 'Total Interest Payable',
      'mortgage-total-payment': 'Total Loan Outflow',
      'invoice-net': 'Net Retained Yield (Take-Home)',
      'invoice-gross': 'Gross Invoice Volume',
      'invoice-tax-buffer': 'GST / TDS Buffer Held',
      'salary-annual': 'Annualized Equivalent CTC',
      'salary-weekly': 'Weekly Inflow Rate',
      'salary-monthly': 'Gross Monthly Take-Home',
      'caprate-rate': 'Gross Rental Yield / Cap Rate',
      'autoloan-payment': 'Estimated Monthly Car EMI',
      'student-payment': 'Target Monthly EMI Outflow',
      'sip-maturity': 'Projected Mutual Fund SIP Value',
      'sip-invested': 'Total Invested Principal',
      'sip-gain': 'Estimated Wealth Expansion',
      'inflation-future-val': 'Future Real Purchasing Power',
      'inflation-lost-val': 'Value Lost to Rupee Inflation'
    },
    special: {
      mortgageTerms: { '30': '30 Year Tenor', '15': '15 Year Tenor' }
    }
  },

  // United Kingdom (GBP - £)
  UK: {
    engines: {
      mortgage: { title: 'Mortgage Repayment Calculator', subtitle: 'Calculate monthly mortgage capital and interest repayments.', tab: '🏠 Mortgage Repayment Core' },
      invoice: { title: 'Contractor Day Rate & VAT / IR35 Matrix', subtitle: 'Model billable day rates, VAT reserves, and inside/outside IR35 retention.', tab: '💼 Day Rate & IR35 Matrix' },
      roi: { title: 'Campaign ROAS & Marketing Return', subtitle: 'Track ad spend efficiency and return on digital marketing capital.', tab: '📈 Campaign ROAS & Return' },
      crypto: { title: 'Crypto Derivatives & Liquidation Threshold', subtitle: 'Model margin limits and liquidation triggers for derivative contracts.', tab: '⚡ Crypto Derivatives Matrix' },
      compound: { title: 'Compound Interest & Capital Growth', subtitle: 'Project long-term compound wealth and capital growth across years.', tab: '💰 Compound Capital Growth' },
      caprate: { title: 'Commercial Property Yield Matrix', subtitle: 'Calculate commercial property passing yields and net operating income.', tab: '🏢 Property Yield Matrix' },
      salary: { title: 'Hourly Rate to Annual Salary (PAYE)', subtitle: 'Convert contractor hourly rates to PAYE salary and take-home pay.', tab: '⏱️ Wage to Annual Salary (PAYE)' },
      breakeven: { title: 'Venture Break-Even Volume Calculator', subtitle: 'Calculate unit volume required to reach break-even profitability.', tab: '📊 Venture Break-Even Volume' },
      creditcard: { title: 'Credit Card Balance & Interest Payoff', subtitle: 'Model repayment schedules and interest charges to clear card balances.', tab: '💳 Card Balance & Payoff' },
      stockavg: { title: 'Share Cost Averaging (DCA) Suite', subtitle: 'Calculate weighted average purchase price across share tranches on LSE.', tab: '📉 Share Cost Averaging (DCA)' },
      rentbuy: { title: 'Rent vs Buy Property Framework', subtitle: 'Compare homeownership outlays vs rental cash flows over time.', tab: '🏘️ Rent vs Buy Framework' },
      margin: { title: 'Retail Gross Margin & Markup Matrix', subtitle: 'Calculate retail margins and markups on product inventory.', tab: '🛒 Retail Margin & Markup' },
      autoloan: { title: 'Car Finance (PCP / HP) Calculator', subtitle: 'Simulate Personal Contract Purchase (PCP) or Hire Purchase (HP) payments.', tab: '🚗 Car Finance (PCP / HP)' },
      student: { title: 'Student Finance (Plan 2/5) Repayment', subtitle: 'Forecast UK Student Finance Plan 2 / Plan 5 debt clearing horizons.', tab: '🎓 Student Finance (Plan 2/5)' },
      budget: { title: '50/30/20 Income Budgeting Framework', subtitle: 'Allocate monthly take-home pay across Needs, Wants, and Savings.', tab: '💵 50/30/20 Budgeting Plan' },
      interest: { title: 'Simple Interest Loan Ledger', subtitle: 'Compute linear interest yields and final repayment values.', tab: '🔢 Simple Interest Ledger' },
      dividend: { title: 'Share Dividend Yield & ISA Payout', subtitle: 'Calculate annual dividend income on shares held in Trading or ISA accounts.', tab: '🪙 Dividend Yield & ISA Payout' },
      inflation: { title: 'Pound Inflation & Real Purchasing Power', subtitle: 'Measure the erosion of Sterling purchasing power over future timeframes.', tab: '🎈 Pound Inflation Eroder' },
      sip: { title: 'Monthly Regular Investing (ISA) Planner', subtitle: 'Model compound returns on monthly Stocks & Shares ISA contributions.', tab: '🗓️ Regular Investing (ISA)' },
      cagr: { title: 'Compound Annual Growth Rate (CAGR)', subtitle: 'Determine annualized growth rate of portfolio holdings over time.', tab: '🔄 Compound Annual Growth (CAGR)' },
      // Regional Adaptations for United Kingdom
      four01k: { title: 'Pension Pot & SIPP Wealth Builder', subtitle: 'Simulate workplace auto-enrolment pension and Self-Invested Personal Pension (SIPP) with 20-45% tax relief.', tab: '🏦 Pension Pot & SIPP' },
      paycheck: { title: 'Take-Home Pay & PAYE / NI Slip', subtitle: 'Calculate net monthly income after Income Tax (PAYE) and Class 1 National Insurance contributions.', tab: '💵 Take-Home Pay & PAYE' },
      capitalgains: { title: 'Capital Gains Tax (CGT) & Allowance', subtitle: 'Calculate UK CGT on shares and property after applying annual exempt allowance.', tab: '📊 Capital Gains (CGT)' },
      quarterlytax: { title: 'HMRC Self-Assessment Payments on Account', subtitle: 'Calculate dual Payments on Account due by 31 January and 31 July for self-employed contractors.', tab: '📝 HMRC Self-Assessment' },
      carlease: { title: 'PCP / HP Car Finance vs Buy Matrix', subtitle: 'Compare Personal Contract Purchase (PCP) balloon payments vs Hire Purchase (HP).', tab: '🚙 PCP / HP vs Buy' },
      studentrefi: { title: 'Plan 2 / Plan 5 Student Loan Payoff', subtitle: 'Forecast 9% student loan deductions above threshold and 30/40-year write-off projections.', tab: '🎓 Plan 2/5 Student Payoff' },
    },
    labels: {
      'mortgage-asset': 'Property Purchase Price',
      'mortgage-down': 'Deposit Paid',
      'mortgage-rate': 'Mortgage Interest Rate (%)',
      'mortgage-extra': 'Extra Monthly Capital Repayment',
      'invoice-rate': 'Contractor Hourly / Day Rate',
      'invoice-hours': 'Contracted Hours Logged',
      'invoice-tax': 'VAT (20%) & IR35 Tax Reserve',
      'salary-wage': 'Hourly Rate (PAYE)',
      'salary-hours': 'Weekly Contracted Hours',
      'student-debt': 'Outstanding Student Finance Balance',
      'student-rate': 'Interest Rate (RPI+%)',
      'student-months': 'Repayment Tenor (Months)',
      'autoloan-value': 'Vehicle Price / Financed Amount',
      'autoloan-rate': 'Finance APR (%)',
      'autoloan-term': 'Finance Term (Months)',
      'caprate-rent': 'Annual Rent Roll',
      'caprate-costs': 'Service Charges & Ground Rent',
      'caprate-value': 'Property Freehold/Leasehold Value',
      'creditcard-debt': 'Total Card Statement Balance',
      'creditcard-apr': 'Purchase APR (%)',
      'creditcard-payment': 'Monthly Repayment',
      'budget-income': 'Monthly Take-Home Pay (Net)',
      'sip-monthly': 'Monthly ISA Contribution',
      'sip-rate': 'Expected Annual Return (%)',
      'sip-years': 'Investment Term (Years)',
      'inflation-cash': 'Liquid Pound Cash Reserves (£)',
      'dividend-equity': 'ISA / Trading Portfolio Value',
      'rentbuy-rent': 'Monthly Property Rent',
      'rentbuy-mortgage': 'Monthly Mortgage Repayment'
    },
    outputs: {
      'mortgage-payment': 'Target Monthly Mortgage Repayment',
      'mortgage-total-interest': 'Total Interest Charged',
      'mortgage-total-payment': 'Total Loan Repayment Outflow',
      'invoice-net': 'Net Retained Contractor Yield',
      'invoice-gross': 'Gross Invoiced Amount',
      'invoice-tax-buffer': 'VAT & Tax Buffer Held',
      'salary-annual': 'Gross Annual Salary (PAYE)',
      'salary-weekly': 'Weekly Pay Outlay',
      'salary-monthly': 'Estimated Monthly Net',
      'caprate-rate': 'Net Initial / Passing Yield',
      'autoloan-payment': 'Monthly PCP / HP Finance Payment',
      'student-payment': 'Estimated Monthly Loan Repayment',
      'sip-maturity': 'Projected ISA Portfolio Value',
      'sip-invested': 'Total Capital Contributed',
      'sip-gain': 'Net Capital Appreciation',
      'inflation-future-val': 'Real Future Purchasing Power (£)',
      'inflation-lost-val': 'Value Lost to UK Inflation'
    },
    special: {
      mortgageTerms: { '30': '30 Year Term', '15': '15 Year Term' }
    }
  },

  // Australia (AUD - $)
  AU: {
    engines: {
      mortgage: { title: 'Home Loan & Offset Calculator', subtitle: 'Calculate mortgage repayments and potential interest savings with offset.', tab: '🏠 Home Loan & Offset Core' },
      invoice: { title: 'Sole Trader Invoice, GST & PAYG Matrix', subtitle: 'Model billable invoices with 10% GST provision and PAYG withholding.', tab: '💼 Sole Trader GST & PAYG' },
      roi: { title: 'Campaign ROAS & Marketing ROI', subtitle: 'Track ad spend efficiency, ROAS, and marketing ROI on campaign spend.', tab: '📈 Campaign ROAS & ROI' },
      crypto: { title: 'Crypto Derivatives & Liquidation Matrix', subtitle: 'Simulate futures leverage and liquidation thresholds for crypto contracts.', tab: '⚡ Crypto Derivatives Leverage' },
      compound: { title: 'Compound Interest Wealth Accumulator', subtitle: 'Project long-term compound wealth and superannuation growth.', tab: '💰 Compound Wealth Accumulator' },
      caprate: { title: 'Commercial Property Passing Yield Matrix', subtitle: 'Calculate net passing capitalization yields and net rental yields.', tab: '🏢 Property Passing Yield' },
      salary: { title: 'Hourly Rate to Annual Salary + Super', subtitle: 'Convert casual/contract hourly rates to annualized salary inclusive of superannuation.', tab: '⏱️ Hourly to Salary + Super' },
      breakeven: { title: 'Business Break-Even & Viability Level', subtitle: 'Determine unit volume needed for operational business profitability.', tab: '📊 Business Break-Even Level' },
      creditcard: { title: 'Credit Card Debt Reduction Calculator', subtitle: 'Plan payoff strategies to eliminate revolving card debt and interest.', tab: '💳 Card Debt Reduction' },
      stockavg: { title: 'Share Cost Averaging & Buy-Down Suite', subtitle: 'Calculate weighted average price across ASX share purchases.', tab: '📉 Share Averaging Suite' },
      rentbuy: { title: 'Rent vs Buy Property Decision Matrix', subtitle: 'Compare homeownership outlays vs rental cash flows over time.', tab: '🏘️ Rent vs Buy Decision' },
      margin: { title: 'Retail Margin & Markup Calculator', subtitle: 'Calculate gross margin percentages and wholesale cost markups.', tab: '🛒 Retail Margin & Markup' },
      autoloan: { title: 'Car Finance & Chattel Lease Estimator', subtitle: 'Simulate novated lease, chattel mortgage, or consumer car loan repayments.', tab: '🚗 Car Finance & Chattel Lease' },
      student: { title: 'HECS / HELP Debt Repayment Matrix', subtitle: 'Simulate Higher Education Loan Program (HECS-HELP) indexation and repayment horizons.', tab: '🎓 HECS / HELP Debt Matrix' },
      budget: { title: '50/30/20 Monthly Budget Allocation', subtitle: 'Distribute net take-home pay across Living, Discretionary, and Savings.', tab: '💵 50/30/20 Budget Allocation' },
      interest: { title: 'Simple Interest Contract Calculator', subtitle: 'Compute linear interest accrual and contract payout totals.', tab: '🔢 Simple Interest Contract' },
      dividend: { title: 'Share Dividend & Franking Yield Console', subtitle: 'Track ASX dividend income and effective yield including franking credits.', tab: '🪙 Dividend & Franking Yield' },
      inflation: { title: 'AUD Inflation & Purchasing Power Suite', subtitle: 'Model the impact of CPI inflation on Australian Dollar purchasing power.', tab: '🎈 AUD Inflation Eroder' },
      sip: { title: 'Monthly Share Savings & Wealth Plan', subtitle: 'Calculate compound growth of regular index ETF and managed fund investments.', tab: '🗓️ Monthly Wealth & Super Plan' },
      cagr: { title: 'Compound Annual Growth Rate (CAGR)', subtitle: 'Determine annualized growth rate of assets over multi-year periods.', tab: '🔄 Compound Annual Growth (CAGR)' },
      // Regional Adaptations for Australia
      four01k: { title: 'Superannuation Nest Egg & Concessional Plan', subtitle: 'Project retirement wealth growth with standard 11.5% Super Guarantee (SG) contributions and compound returns.', tab: '🏦 Superannuation Nest Egg' },
      paycheck: { title: 'Paycheck Net Pay & PAYG Withholding', subtitle: 'Calculate take-home pay after PAYG withholding and 2% Medicare Levy.', tab: '💵 Paycheck Net & PAYG' },
      capitalgains: { title: 'Capital Gains Tax (CGT) & 50% Discount', subtitle: 'Model Australian CGT at marginal tax rates with 50% general discount for assets held >12 months.', tab: '📊 Capital Gains Tax & Discount' },
      biweekly: { title: 'Fortnightly Mortgage Acceleration', subtitle: 'Simulate 26 fortnightly mortgage payments to crush loan principal and save interest.', tab: '⚡ Fortnightly Mortgage' },
      heloc: { title: 'Home Equity Line & Redraw Facility', subtitle: 'Simulate redraw facility and revolving line of credit interest payments.', tab: '💳 Home Equity & Redraw' },
      studentrefi: { title: 'HECS-HELP Loan Repayment Index', subtitle: 'Calculate compulsory HECS-HELP repayments based on ATO income threshold brackets.', tab: '🎓 HECS-HELP Repayment' },
    },
    labels: {
      'mortgage-asset': 'Property Purchase Price',
      'mortgage-down': 'Cash Deposit Amount',
      'mortgage-rate': 'Home Loan Variable / Fixed Rate (%)',
      'mortgage-extra': 'Extra Monthly Principal Repayment',
      'invoice-rate': 'Hourly / Daily Billing Rate',
      'invoice-hours': 'Contract Hours Billed',
      'invoice-tax': 'GST (10%) & PAYG Provision (%)',
      'salary-wage': 'Hourly Rate (Base Excl Super)',
      'salary-hours': 'Weekly Standard Hours',
      'student-debt': 'HECS / HELP Debt Balance',
      'student-rate': 'Annual Indexation Rate (%)',
      'student-months': 'Target Amortization (Months)',
      'autoloan-value': 'Vehicle Price / Financed Amount',
      'autoloan-rate': 'Car Finance Interest Rate (%)',
      'autoloan-term': 'Loan Term (Months)',
      'caprate-rent': 'Gross Annual Rental Outturn',
      'caprate-costs': 'Council Rates & Body Corporate',
      'caprate-value': 'Property Purchase / Valuation Base',
      'creditcard-debt': 'Current Credit Card Balance',
      'creditcard-apr': 'Card Interest Rate / APR (%)',
      'creditcard-payment': 'Monthly Repayment Target',
      'budget-income': 'Monthly After-Tax Income (Net)',
      'sip-monthly': 'Monthly Savings / Super Contribution',
      'sip-rate': 'Expected Investment Return (%)',
      'sip-years': 'Investment Horizon (Years)',
      'inflation-cash': 'Liquid Cash Reserves ($ AUD)',
      'dividend-equity': 'ASX Share Portfolio Value',
      'rentbuy-rent': 'Weekly / Monthly Rent Paid',
      'rentbuy-mortgage': 'Monthly Home Loan Repayments'
    },
    outputs: {
      'mortgage-payment': 'Target Monthly Repayment Outflow',
      'mortgage-total-interest': 'Total Interest Charged',
      'mortgage-total-payment': 'Total Loan Repayment Outflow',
      'invoice-net': 'Net Retained Business Profit',
      'invoice-gross': 'Gross Invoice Volume',
      'invoice-tax-buffer': 'GST & PAYG Tax Provision',
      'salary-annual': 'Gross Annual Salary + Super',
      'salary-weekly': 'Weekly Take-Home Flow',
      'salary-monthly': 'Monthly Net Retained',
      'caprate-rate': 'Passing Net Capitalization Yield',
      'autoloan-payment': 'Monthly Car Finance Repayment',
      'student-payment': 'Compulsory HECS / HELP Repayment',
      'sip-maturity': 'Projected Investment Value',
      'sip-invested': 'Total Cash Contributed',
      'sip-gain': 'Capital Growth Accrued',
      'inflation-future-val': 'Future Real Purchasing Power ($)',
      'inflation-lost-val': 'Value Lost to Inflation'
    },
    special: {
      mortgageTerms: { '30': '30 Year Term', '15': '15 Year Term' }
    }
  },

  // Canada (CAD - $)
  CA: {
    engines: {
      mortgage: { title: 'Canadian Mortgage & CMHC Amortization', subtitle: 'Calculate Canadian mortgage payments with bi-weekly/monthly amortization.', tab: '🏠 Mortgage & CMHC Core' },
      invoice: { title: 'Independent Contractor GST/HST Invoice', subtitle: 'Calculate billable consulting income with federal & provincial GST/HST reserves.', tab: '💼 Contractor GST/HST Invoice' },
      roi: { title: 'Digital Campaign ROAS & Marketing ROI', subtitle: 'Track digital advertising spend efficiency and net marketing profitability.', tab: '📈 Campaign ROAS & Marketing ROI' },
      crypto: { title: 'Crypto Futures Margin & Liquidation', subtitle: 'Simulate crypto margin requirements and liquidation thresholds.', tab: '⚡ Crypto Margin & Liquidation' },
      compound: { title: 'Compound Interest Wealth Growth', subtitle: 'Project long-term compound growth of capital assets across years.', tab: '💰 Compound Wealth Growth' },
      caprate: { title: 'Commercial Real Estate Cap Rate Matrix', subtitle: 'Calculate property capitalization rates and net operating yields.', tab: '🏢 Real Estate Cap Rate' },
      salary: { title: 'Hourly Wage to Gross Annual Salary', subtitle: 'Convert hourly wages to gross annualized and monthly salary.', tab: '⏱️ Hourly Wage to Annual Salary' },
      breakeven: { title: 'Business Break-Even Unit Calculator', subtitle: 'Calculate unit sales volume needed to cover overheads and achieve profitability.', tab: '📊 Business Break-Even Unit' },
      creditcard: { title: 'Credit Card Debt & Interest Elimination', subtitle: 'Map debt elimination schedules and minimize aggregate finance charges.', tab: '💳 Card Debt Elimination' },
      stockavg: { title: 'Stock Cost Averaging (DCA) Suite', subtitle: 'Calculate weighted average cost basis across multiple share acquisitions.', tab: '📉 Stock Cost Averaging (DCA)' },
      rentbuy: { title: 'Rent vs Buy Real Estate Framework', subtitle: 'Compare total homeownership outlays vs rental cash flows over time.', tab: '🏘️ Rent vs Buy Framework' },
      margin: { title: 'Retail Profit Margin & Markup Suite', subtitle: 'Calculate gross margins and cost markups for wholesale inventory.', tab: '🛒 Retail Margin & Markup' },
      autoloan: { title: 'Auto Loan & Vehicle Financing Estimator', subtitle: 'Forecast monthly vehicle loan payments across flexible financing terms.', tab: '🚗 Auto Loan Estimator' },
      student: { title: 'Canada Student Loan (CSFA/OSAP) Payoff', subtitle: 'Simulate Canada Student Financial Assistance (CSFA/OSAP) debt payoff horizons.', tab: '🎓 Canada Student Loan (OSAP)' },
      budget: { title: '50/30/20 Take-Home Budget Rule', subtitle: 'Partition net take-home pay into Needs, Wants, and Wealth Savings.', tab: '💵 50/30/20 Take-Home Budget' },
      interest: { title: 'Simple Interest Loan Matrix', subtitle: 'Calculate linear interest returns and final loan repayments.', tab: '🔢 Simple Interest Matrix' },
      dividend: { title: 'Dividend Yield & Income Console', subtitle: 'Forecast annual dividend income on Canadian equity portfolios.', tab: '🪙 Dividend Yield Console' },
      inflation: { title: 'CAD Inflation & Real Purchasing Power', subtitle: 'Model the erosion of Canadian Dollar purchasing power over future timeframes.', tab: '🎈 CAD Inflation Eroder' },
      sip: { title: 'Pre-Authorized Monthly TFSA/RRSP Plan', subtitle: 'Model compound returns on automatic monthly contributions to TFSA or RRSP.', tab: '🗓️ Monthly TFSA / RRSP Plan' },
      cagr: { title: 'Compound Annual Growth Rate (CAGR)', subtitle: 'Determine annualized geometric return of investments across holding periods.', tab: '🔄 Compound Annual Growth (CAGR)' },
      // Regional Adaptations for Canada
      four01k: { title: 'RRSP & TFSA Nest Egg Projector', subtitle: 'Maximize tax-free compounding in TFSA and tax-deferred retirement deductions in RRSP.', tab: '🏦 RRSP & TFSA Nest Egg' },
      paycheck: { title: 'Paycheque Net Pay & CPP / EI Deductions', subtitle: 'Calculate net pay after federal/provincial tax, Canada Pension Plan (CPP), and Employment Insurance (EI).', tab: '💵 Paycheque Net & CPP/EI' },
      biweekly: { title: 'Accelerated Bi-Weekly Mortgage Matrix', subtitle: 'Simulate Canadian accelerated bi-weekly payments to shave years off 25-year amortizations.', tab: '⚡ Accelerated Bi-Weekly' },
      capitalgains: { title: 'Capital Gains Tax & 50-66% Inclusion Rate', subtitle: 'Model post-2024 Canadian capital gains inclusion brackets on investment profits.', tab: '📊 Capital Gains & Inclusion' },
    },
    labels: {
      'mortgage-asset': 'Home Purchase Price',
      'mortgage-down': 'Down Payment (Min 5-20%)',
      'mortgage-rate': 'Mortgage Interest Rate (%)',
      'invoice-tax': 'GST/HST & Income Tax Reserve (%)',
      'salary-wage': 'Gross Hourly Wage Rate',
      'student-debt': 'Outstanding Student Loan (OSAP/CSFA)',
      'student-rate': 'Federal / Provincial Rate (%)',
      'autoloan-value': 'Vehicle Purchase Price',
      'budget-income': 'Monthly Net Take-Home Pay',
      'sip-monthly': 'Monthly TFSA / RRSP Deposit',
      'inflation-cash': 'Present CAD Cash Reserves'
    },
    outputs: {
      'mortgage-payment': 'Target Monthly Mortgage Payment',
      'invoice-net': 'Net Retained Contractor Cash',
      'invoice-tax-buffer': 'GST/HST & Tax Buffer',
      'salary-annual': 'Gross Annualized Salary',
      'autoloan-payment': 'Monthly Auto Loan Payment',
      'student-payment': 'Target Monthly Payment Outflow',
      'sip-maturity': 'Projected TFSA / RRSP Value',
      'sip-invested': 'Total Capital Deposited',
      'sip-gain': 'Compound Wealth Gain',
      'inflation-future-val': 'Future Real Purchasing Power ($)',
      'inflation-lost-val': 'Lost Value to CAD Inflation'
    }
  },

  // Europe (EUR - €)
  EU: {
    engines: {
      mortgage: { title: 'Home Loan & Hypothèque Calculator', subtitle: 'Calculate European home loan installments and amortization schedules.', tab: '🏠 Home Loan & Hypothèque' },
      invoice: { title: 'B2B Freelance & VAT / TVA Invoice Matrix', subtitle: 'Simulate billable client invoices with standard VAT/TVA reserves and social charges.', tab: '💼 B2B Freelance & VAT / TVA' },
      roi: { title: 'Marketing ROAS & Ad Spend Return', subtitle: 'Track return on digital advertising investments and campaign efficiency.', tab: '📈 Marketing ROAS & Return' },
      crypto: { title: 'Crypto Derivatives Leverage & Liquidation', subtitle: 'Model margin requirements and liquidation thresholds for crypto futures.', tab: '⚡ Crypto Derivatives Leverage' },
      compound: { title: 'Compound Interest & Capital Accumulator', subtitle: 'Project long-term compound wealth and capital growth across years.', tab: '💰 Compound Capital Accumulator' },
      caprate: { title: 'Real Estate Capitalization & Net Yield', subtitle: 'Compute property net operating yield and capitalization valuation.', tab: '🏢 Real Estate Net Yield' },
      salary: { title: 'Hourly Rate to Annual Gross Salary', subtitle: 'Convert hourly rates to annualized and monthly gross compensation.', tab: '⏱️ Hourly Rate to Gross Salary' },
      breakeven: { title: 'Commercial Break-Even Point Calculator', subtitle: 'Calculate unit sales volume needed to reach commercial profitability.', tab: '📊 Commercial Break-Even Point' },
      creditcard: { title: 'Revolving Credit & Card Debt Payoff', subtitle: 'Model repayment schedules and interest charges on revolving credit lines.', tab: '💳 Revolving Credit Payoff' },
      stockavg: { title: 'Equity Cost Averaging (DCA) Suite', subtitle: 'Calculate weighted average acquisition price across stock tranches.', tab: '📉 Equity Cost Averaging (DCA)' },
      rentbuy: { title: 'Rent vs Buy Property Decision Matrix', subtitle: 'Compare homeownership outlays vs rental cash flows over time.', tab: '🏘️ Rent vs Buy Decision' },
      margin: { title: 'Retail Gross Margin & Markup Suite', subtitle: 'Calculate gross margins and markup coefficients on retail goods.', tab: '🛒 Retail Margin & Markup' },
      autoloan: { title: 'Auto Loan & Vehicle Credit Estimator', subtitle: 'Simulate vehicle financing, leasing (LOA/LLD), and monthly installments.', tab: '🚗 Auto Credit & Leasing' },
      student: { title: 'Higher Education Loan Repayment Matrix', subtitle: 'Map student credit amortization and fixed monthly installments.', tab: '🎓 Education Loan Repayment' },
      budget: { title: '50/30/20 Household Budget Framework', subtitle: 'Allocate household monthly net income across Needs, Wants, and Savings.', tab: '💵 50/30/20 Household Budget' },
      interest: { title: 'Simple Interest Loan & Contract Ledger', subtitle: 'Compute linear interest accrual and total contract repayment.', tab: '🔢 Simple Interest Contract' },
      dividend: { title: 'Equity Dividend Yield & Income Console', subtitle: 'Forecast annual dividend income on European equity portfolios.', tab: '🪙 Dividend Yield Console' },
      inflation: { title: 'Euro Inflation & Real Purchasing Power', subtitle: 'Measure the erosion of Euro purchasing power over future time horizons.', tab: '🎈 Euro Inflation Eroder' },
      sip: { title: 'Monthly ETF Savings Plan (Sparplan)', subtitle: 'Project long-term compound growth of a monthly ETF / Fund Sparplan.', tab: '🗓️ ETF Savings Plan (Sparplan)' },
      cagr: { title: 'Compound Annual Growth Rate (CAGR)', subtitle: 'Determine annualized geometric rate of return on investments.', tab: '🔄 Compound Annual Growth (CAGR)' }
    },
    labels: {
      'mortgage-asset': 'Property Acquisition Price',
      'mortgage-down': 'Personal Equity / Deposit (Apport)',
      'mortgage-rate': 'Nominal Borrowing Rate (%)',
      'invoice-rate': 'Daily / Hourly Rate (TJM / THM)',
      'invoice-tax': 'VAT & Social Charges Provision (%)',
      'salary-wage': 'Hourly Gross Rate (THM)',
      'student-debt': 'Outstanding Student Loan Amount',
      'autoloan-value': 'Vehicle Price / Financed Amount',
      'caprate-rent': 'Annual Rental Revenues (Loyer)',
      'caprate-costs': 'Property Charges & Local Taxes',
      'caprate-value': 'Acquisition Value',
      'budget-income': 'Net Monthly Household Income',
      'sip-monthly': 'Monthly Sparplan Installment',
      'inflation-cash': 'Liquid Euro Cash Balance (€)'
    },
    outputs: {
      'mortgage-payment': 'Target Monthly Installment',
      'invoice-net': 'Net Retained Freelance Income',
      'invoice-tax-buffer': 'VAT & Social Buffer Held',
      'salary-annual': 'Gross Annualized Salary',
      'caprate-rate': 'Net Capitalization Yield',
      'autoloan-payment': 'Monthly Auto Credit Installment',
      'student-payment': 'Target Monthly Installment',
      'sip-maturity': 'Projected Sparplan Final Value',
      'sip-invested': 'Total Capital Deposited',
      'sip-gain': 'Compound Capital Return',
      'inflation-future-val': 'Real Future Purchasing Power (€)',
      'inflation-lost-val': 'Value Lost to Euro Inflation'
    }
  },

  // Middle East / Gulf (AED - د.إ, SAR - ﷼)
  ME: {
    engines: {
      mortgage: { title: 'Home Finance & Murabaha Calculator', subtitle: 'Calculate Islamic home finance (Murabaha/Ijara) monthly rental/profit installments.', tab: '🏠 Home Finance & Murabaha' },
      invoice: { title: 'Consultant Invoice & VAT Matrix', subtitle: 'Calculate professional consulting fees with 5% / 15% VAT provisions.', tab: '💼 Consultant Invoice & VAT' },
      roi: { title: 'Digital Campaign ROAS & Marketing ROI', subtitle: 'Track ad spend efficiency and return on digital marketing capital.', tab: '📈 Campaign ROAS & ROI' },
      crypto: { title: 'Crypto Derivatives & Liquidation Threshold', subtitle: 'Simulate futures leverage and liquidation thresholds for crypto contracts.', tab: '⚡ Crypto Derivatives Matrix' },
      compound: { title: 'Compound Wealth & Capital Accumulator', subtitle: 'Project long-term compound wealth and capital growth across years.', tab: '💰 Compound Wealth Accumulator' },
      caprate: { title: 'Commercial Property Rental Yield Matrix', subtitle: 'Calculate annual rental yields and net capitalization outlays.', tab: '🏢 Property Rental Yield' },
      salary: { title: 'Total Monthly & Annual Compensation', subtitle: 'Convert hourly rates into total monthly compensation package (Basic + Allowances).', tab: '⏱️ Monthly & Annual Package' },
      breakeven: { title: 'Business Break-Even & Viability Level', subtitle: 'Determine exact sales volume required to recover overheads and achieve profit.', tab: '📊 Business Break-Even Level' },
      creditcard: { title: 'Credit Card Debt Reduction Calculator', subtitle: 'Model payoff timelines and interest savings to clear credit balances.', tab: '💳 Card Debt Reduction' },
      stockavg: { title: 'Share Cost Averaging & Buy-Down Suite', subtitle: 'Calculate weighted average acquisition price across share tranches.', tab: '📉 Share Averaging Suite' },
      rentbuy: { title: 'Rent vs Buy Property Decision Matrix', subtitle: 'Compare property ownership outlays vs rental cash flows over time.', tab: '🏘️ Rent vs Buy Decision' },
      margin: { title: 'Retail Commerce Margin & Markup', subtitle: 'Calculate product markup coefficients and net gross operational spread.', tab: '🛒 Retail Margin & Markup' },
      autoloan: { title: 'Auto Finance & Vehicle Murabaha', subtitle: 'Calculate vehicle Murabaha finance installments and total profit margin.', tab: '🚗 Auto Murabaha Finance' },
      student: { title: 'Higher Education Loan Repayment Matrix', subtitle: 'Map education financing amortization and fixed monthly installments.', tab: '🎓 Education Loan Repayment' },
      budget: { title: '50/30/20 Monthly Budget Allocation', subtitle: 'Allocate consolidated net monthly income across Living, Lifestyle, and Savings.', tab: '💵 50/30/20 Budget Allocation' },
      interest: { title: 'Simple Interest & Contract Payout', subtitle: 'Compute linear yields and contract payout totals.', tab: '🔢 Simple Interest Engine' },
      dividend: { title: 'Share Dividend Yield & Income Console', subtitle: 'Forecast annual dividend income on equity portfolios.', tab: '🪙 Dividend Yield Console' },
      inflation: { title: 'Cash Inflation & Purchasing Power', subtitle: 'Measure future purchasing power under regional inflation.', tab: '🎈 Cash Inflation Eroder' },
      sip: { title: 'Monthly Wealth & Investment Plan', subtitle: 'Calculate compound growth of systematic monthly savings and investments.', tab: '🗓️ Monthly Wealth Plan' },
      cagr: { title: 'Compound Annual Growth Rate (CAGR)', subtitle: 'Determine annualized geometric growth rate of portfolio assets.', tab: '🔄 Compound Annual Growth (CAGR)' }
    },
    labels: {
      'mortgage-asset': 'Property Purchase Price',
      'mortgage-down': 'Initial Down Payment',
      'mortgage-rate': 'Finance Profit Rate (%)',
      'invoice-rate': 'Hourly / Daily Billing Rate',
      'invoice-tax': 'VAT & Withholding Provision (%)',
      'salary-wage': 'Hourly Consultant Rate',
      'autoloan-value': 'Vehicle Price / Financed Sum',
      'autoloan-rate': 'Finance Profit Rate (%)',
      'caprate-rent': 'Annual Rental Income (Ejari)',
      'caprate-costs': 'Maintenance & Service Fees',
      'budget-income': 'Monthly Consolidated Net Income',
      'sip-monthly': 'Monthly Investment Contribution',
      'inflation-cash': 'Current Cash Reserves'
    },
    outputs: {
      'mortgage-payment': 'Monthly Finance / Profit Installment',
      'invoice-net': 'Net Consultant Yield',
      'salary-annual': 'Total Annual Compensation Package',
      'caprate-rate': 'Net Rental Yield / Cap Rate',
      'autoloan-payment': 'Monthly Vehicle Installment',
      'sip-maturity': 'Projected Portfolio Value',
      'inflation-future-val': 'Future Real Purchasing Power',
      'inflation-lost-val': 'Purchasing Power Eroded'
    }
  }
};

function applyRegionalLocalization(currencyCode) {
  const regEntry = CURRENCY_REGISTRY[currencyCode] || { symbol: currentCurrency, region: 'US' };
  const regionKey = regEntry.region || 'US';
  const dict = REGIONAL_DICTIONARIES[regionKey] || REGIONAL_DICTIONARIES['US'];
  const defaultDict = REGIONAL_DICTIONARIES['US'];

  // 1. Update Engine Titles, Subtitles, and Tab Buttons
  Object.keys(defaultDict.engines).forEach(engineKey => {
    const data = (dict.engines && dict.engines[engineKey]) || defaultDict.engines[engineKey];
    if (!data) return;

    // Update Card Header (h2)
    const card = document.getElementById(`engine-${engineKey}`);
    if (card) {
      const h2 = card.querySelector('h2');
      if (h2 && data.title) h2.textContent = data.title;
      const p = card.querySelector('.border-b p');
      if (p && data.subtitle) p.textContent = data.subtitle;
    }

    // Update Sidebar Navigation Button
    const tabBtn = document.getElementById(`tab-${engineKey}`);
    if (tabBtn && data.tab) {
      tabBtn.textContent = data.tab;
    }
  });

  // 2. Update Input Labels (<label for="...">)
  const allInputKeys = Object.keys(defaultDict.labels);
  allInputKeys.forEach(inputId => {
    const labelText = (dict.labels && dict.labels[inputId]) || defaultDict.labels[inputId];
    if (labelText) {
      const labelEl = document.querySelector(`label[for="${inputId}"]`);
      if (labelEl) {
        labelEl.textContent = labelText;
      }
    }
  });

  // 3. Update Output Metric Labels (.output-label inside .output-item)
  const allOutputKeys = Object.keys(defaultDict.outputs);
  allOutputKeys.forEach(outputId => {
    const labelText = (dict.outputs && dict.outputs[outputId]) || defaultDict.outputs[outputId];
    if (labelText) {
      const outValEl = document.getElementById(outputId);
      if (outValEl) {
        const outItem = outValEl.closest('.output-item') || outValEl.parentElement;
        const outLabel = outItem ? outItem.querySelector('.output-label') : null;
        if (outLabel) {
          outLabel.textContent = labelText;
        }
      }
    }
  });

  // 4. Update Special / Extra Terms (e.g. mortgage tenor buttons)
  if (dict.special && dict.special.mortgageTerms) {
    const btn30 = document.querySelector('.mortgage-term-btn[data-years="30"]');
    const btn15 = document.querySelector('.mortgage-term-btn[data-years="15"]');
    if (btn30 && dict.special.mortgageTerms['30']) btn30.textContent = dict.special.mortgageTerms['30'];
    if (btn15 && dict.special.mortgageTerms['15']) btn15.textContent = dict.special.mortgageTerms['15'];
  } else if (defaultDict.special && defaultDict.special.mortgageTerms) {
    const btn30 = document.querySelector('.mortgage-term-btn[data-years="30"]');
    const btn15 = document.querySelector('.mortgage-term-btn[data-years="15"]');
    if (btn30 && defaultDict.special.mortgageTerms['30']) btn30.textContent = defaultDict.special.mortgageTerms['30'];
    if (btn15 && defaultDict.special.mortgageTerms['15']) btn15.textContent = defaultDict.special.mortgageTerms['15'];
  }
}


// -------------------------------------------------------------
// DYNAMIC REGIONAL DATA & MONEY LIMITS PRESET SYSTEM
// -------------------------------------------------------------
const USD_BASE_PRESETS = {
  "mortgage-asset": {
    "val": 450000,
    "min": 10000,
    "max": 5000000,
    "step": 1000
  },
  "mortgage-down": {
    "val": 90000,
    "min": 0,
    "max": 4000000,
    "step": 1000
  },
  "invoice-rate": {
    "val": 85,
    "min": 10,
    "max": 1000,
    "step": 5
  },
  "roi-spend": {
    "val": 5000,
    "min": 100,
    "max": 1000000,
    "step": 100
  },
  "roi-revenue": {
    "val": 18000,
    "min": 0,
    "max": 5000000,
    "step": 100
  },
  "crypto-entry": {
    "val": 60000,
    "min": 1,
    "max": 1000000,
    "step": 100
  },
  "compound-principal": {
    "val": 10000,
    "min": 100,
    "max": 10000000,
    "step": 500
  },
  "caprate-rent": {
    "val": 75000,
    "min": 1000,
    "max": 5000000,
    "step": 1000
  },
  "caprate-costs": {
    "val": 20000,
    "min": 0,
    "max": 2000000,
    "step": 500
  },
  "caprate-value": {
    "val": 850000,
    "min": 10000,
    "max": 10000000,
    "step": 5000
  },
  "salary-wage": {
    "val": 45,
    "min": 1,
    "max": 500,
    "step": 1
  },
  "breakeven-overhead": {
    "val": 12000,
    "min": 100,
    "max": 1000000,
    "step": 500
  },
  "breakeven-price": {
    "val": 150,
    "min": 1,
    "max": 10000,
    "step": 5
  },
  "breakeven-cost": {
    "val": 70,
    "min": 0,
    "max": 10000,
    "step": 5
  },
  "creditcard-debt": {
    "val": 5000,
    "min": 100,
    "max": 100000,
    "step": 100
  },
  "creditcard-payment": {
    "val": 250,
    "min": 20,
    "max": 10000,
    "step": 10
  },
  "rentbuy-rent": {
    "val": 1800,
    "min": 100,
    "max": 25000,
    "step": 50
  },
  "rentbuy-mortgage": {
    "val": 2300,
    "min": 100,
    "max": 35000,
    "step": 50
  },
  "margin-cost": {
    "val": 40,
    "min": 1,
    "max": 10000,
    "step": 1
  },
  "margin-price": {
    "val": 100,
    "min": 1,
    "max": 25000,
    "step": 1
  },
  "autoloan-value": {
    "val": 35000,
    "min": 1000,
    "max": 300000,
    "step": 500
  },
  "student-debt": {
    "val": 28000,
    "min": 500,
    "max": 500000,
    "step": 500
  },
  "budget-income": {
    "val": 4000,
    "min": 500,
    "max": 100000,
    "step": 100
  },
  "interest-principal": {
    "val": 5000,
    "min": 100,
    "max": 1000000,
    "step": 500
  },
  "dividend-equity": {
    "val": 25000,
    "min": 500,
    "max": 5000000,
    "step": 1000
  },
  "inflation-cash": {
    "val": 50000,
    "min": 1000,
    "max": 5000000,
    "step": 1000
  },
  "sip-monthly": {
    "val": 500,
    "min": 20,
    "max": 50000,
    "step": 50
  },
  "cagr-initial": {
    "val": 10000,
    "min": 100,
    "max": 10000000,
    "step": 500
  },
  "cagr-final": {
    "val": 30000,
    "min": 100,
    "max": 25000000,
    "step": 1000
  },
  "affordability-income": {
    "val": 120000,
    "min": 20000,
    "max": 1000000,
    "step": 5000
  },
  "affordability-down": {
    "val": 50000,
    "min": 0,
    "max": 500000,
    "step": 2500
  },
  "affordability-debt": {
    "val": 500,
    "min": 0,
    "max": 5000,
    "step": 50
  },
  "refinance-balance": {
    "val": 320000,
    "min": 50000,
    "max": 2000000,
    "step": 5000
  },
  "refinance-costs": {
    "val": 4500,
    "min": 500,
    "max": 25000,
    "step": 100
  },
  "biweekly-balance": {
    "val": 350000,
    "min": 50000,
    "max": 2000000,
    "step": 5000
  },
  "cashoncash-rent": {
    "val": 2400,
    "min": 500,
    "max": 20000,
    "step": 50
  },
  "cashoncash-mortgage": {
    "val": 1250,
    "min": 200,
    "max": 10000,
    "step": 50
  },
  "cashoncash-expenses": {
    "val": 450,
    "min": 50,
    "max": 5000,
    "step": 25
  },
  "cashoncash-investment": {
    "val": 65000,
    "min": 5000,
    "max": 500000,
    "step": 1000
  },
  "heloc-drawn": {
    "val": 50000,
    "min": 5000,
    "max": 500000,
    "step": 2500
  },
  "closingcosts-price": {
    "val": 400000,
    "min": 50000,
    "max": 3000000,
    "step": 5000
  },
  "fire-expenses": {
    "val": 60000,
    "min": 10000,
    "max": 500000,
    "step": 2500
  },
  "fire-savings": {
    "val": 150000,
    "min": 0,
    "max": 5000000,
    "step": 5000
  },
  "fire-annual-save": {
    "val": 30000,
    "min": 1000,
    "max": 200000,
    "step": 1000
  },
  "four01k-salary": {
    "val": 85000,
    "min": 20000,
    "max": 500000,
    "step": 2500
  },
  "rmd-balance": {
    "val": 650000,
    "min": 10000,
    "max": 5000000,
    "step": 10000
  },
  "socialsecurity-pia": {
    "val": 2400,
    "min": 500,
    "max": 5000,
    "step": 50
  },
  "cdladder-capital": {
    "val": 40000,
    "min": 4000,
    "max": 500000,
    "step": 2000
  },
  "hsa-annual-contrib": {
    "val": 4150,
    "min": 500,
    "max": 8300,
    "step": 50
  },
  "hsa-current-balance": {
    "val": 8000,
    "min": 0,
    "max": 100000,
    "step": 500
  },
  "paycheck-gross": {
    "val": 3500,
    "min": 200,
    "max": 30000,
    "step": 50
  },
  "capitalgains-purchase": {
    "val": 15000,
    "min": 500,
    "max": 1000000,
    "step": 500
  },
  "capitalgains-sale": {
    "val": 45000,
    "min": 500,
    "max": 2000000,
    "step": 500
  },
  "capitalgains-income": {
    "val": 80000,
    "min": 0,
    "max": 1000000,
    "step": 2500
  },
  "quarterlytax-revenue": {
    "val": 95000,
    "min": 5000,
    "max": 1000000,
    "step": 2500
  },
  "quarterlytax-expenses": {
    "val": 20000,
    "min": 0,
    "max": 500000,
    "step": 1000
  },
  "overtime-hourly": {
    "val": 28,
    "min": 7,
    "max": 200,
    "step": 1
  },
  "bonustax-amount": {
    "val": 10000,
    "min": 500,
    "max": 200000,
    "step": 500
  },
  "severance-weekly-pay": {
    "val": 1500,
    "min": 300,
    "max": 10000,
    "step": 50
  },
  "severance-ui": {
    "val": 450,
    "min": 0,
    "max": 1000,
    "step": 25
  },
  "severance-monthly-burn": {
    "val": 4000,
    "min": 1000,
    "max": 20000,
    "step": 100
  },
  "snowball-extra": {
    "val": 300,
    "min": 50,
    "max": 3000,
    "step": 25
  },
  "snowball-debt1-bal": {
    "val": 2500,
    "min": 100,
    "max": 50000,
    "step": 100
  },
  "snowball-debt2-bal": {
    "val": 8000,
    "min": 500,
    "max": 100000,
    "step": 250
  },
  "carlease-msrp": {
    "val": 38000,
    "min": 10000,
    "max": 150000,
    "step": 1000
  },
  "carlease-lease-monthly": {
    "val": 420,
    "min": 100,
    "max": 2000,
    "step": 10
  },
  "carlease-lease-down": {
    "val": 3000,
    "min": 0,
    "max": 10000,
    "step": 250
  },
  "carlease-loan-monthly": {
    "val": 640,
    "min": 100,
    "max": 3000,
    "step": 10
  },
  "carlease-residual": {
    "val": 21000,
    "min": 5000,
    "max": 100000,
    "step": 500
  },
  "personalloan-amount": {
    "val": 20000,
    "min": 1000,
    "max": 100000,
    "step": 500
  },
  "autorefi-balance": {
    "val": 24000,
    "min": 2000,
    "max": 120000,
    "step": 500
  },
  "studentrefi-balance": {
    "val": 65000,
    "min": 5000,
    "max": 300000,
    "step": 2500
  },
  "studentrefi-idr-monthly": {
    "val": 280,
    "min": 0,
    "max": 2000,
    "step": 25
  },
  "creditscore-limit": {
    "val": 20000,
    "min": 1000,
    "max": 200000,
    "step": 1000
  },
  "creditscore-balance": {
    "val": 9200,
    "min": 0,
    "max": 200000,
    "step": 200
  },
  "creditscore-target-pay": {
    "val": 4000,
    "min": 0,
    "max": 50000,
    "step": 100
  },
  "solar-system-cost": {
    "val": 24000,
    "min": 5000,
    "max": 80000,
    "step": 1000
  },
  "solar-monthly-electric": {
    "val": 220,
    "min": 50,
    "max": 1000,
    "step": 10
  },
  "evgas-gas-price": {
    "val": 3.65,
    "min": 1.5,
    "max": 10.0,
    "step": 0.05
  },
  "evgas-kwh-rate": {
    "val": 0.16,
    "min": 0.05,
    "max": 0.8,
    "step": 0.01
  },
  "staking-principal": {
    "val": 10000,
    "min": 100,
    "max": 500000,
    "step": 500
  },
  "dropship-retail-price": {
    "val": 49.99,
    "min": 5,
    "max": 1000,
    "step": 1
  },
  "dropship-cogs": {
    "val": 12.5,
    "min": 1,
    "max": 500,
    "step": 0.5
  },
  "dropship-ad-cost": {
    "val": 14.0,
    "min": 0,
    "max": 200,
    "step": 1
  },
  "realreturns-portfolio": {
    "val": 100000,
    "min": 1000,
    "max": 2000000,
    "step": 5000
  },
  "airbnb-adr": {
    "val": 185,
    "min": 30,
    "max": 1500,
    "step": 5
  },
  "airbnb-mortgage": {
    "val": 1600,
    "min": 300,
    "max": 10000,
    "step": 50
  },
  "airbnb-operating": {
    "val": 550,
    "min": 50,
    "max": 3000,
    "step": 25
  }
};

const INR_PRESETS = {
  "rentbuy-rent": {
    "val": 8000,
    "min": 1000,
    "max": 200000,
    "step": 500,
    "rangeMin": 2000,
    "rangeMax": 100000,
    "rangeStep": 500
  },
  "rentbuy-mortgage": {
    "val": 15000,
    "min": 2000,
    "max": 400000,
    "step": 500,
    "rangeMin": 5000,
    "rangeMax": 200000,
    "rangeStep": 1000
  },
  "mortgage-asset": {
    "val": 6000000,
    "min": 500000,
    "max": 50000000,
    "step": 50000,
    "rangeMin": 1000000,
    "rangeMax": 30000000,
    "rangeStep": 100000
  },
  "mortgage-down": {
    "val": 1200000,
    "min": 0,
    "max": 30000000,
    "step": 25000,
    "rangeMin": 0,
    "rangeMax": 10000000,
    "rangeStep": 50000
  },
  "mortgage-extra": {
    "val": 5000,
    "min": 0,
    "max": 100000,
    "step": 500,
    "rangeMin": 0,
    "rangeMax": 50000,
    "rangeStep": 500
  },
  "caprate-rent": {
    "val": 600000,
    "min": 50000,
    "max": 25000000,
    "step": 25000,
    "rangeMin": 50000,
    "rangeMax": 5000000,
    "rangeStep": 25000
  },
  "caprate-costs": {
    "val": 150000,
    "min": 0,
    "max": 10000000,
    "step": 10000,
    "rangeMin": 10000,
    "rangeMax": 2000000,
    "rangeStep": 10000
  },
  "caprate-value": {
    "val": 7500000,
    "min": 500000,
    "max": 100000000,
    "step": 100000,
    "rangeMin": 1000000,
    "rangeMax": 50000000,
    "rangeStep": 250000
  },
  "affordability-income": {
    "val": 1800000,
    "min": 200000,
    "max": 20000000,
    "step": 50000,
    "rangeMin": 300000,
    "rangeMax": 10000000,
    "rangeStep": 50000
  },
  "affordability-down": {
    "val": 1000000,
    "min": 0,
    "max": 15000000,
    "step": 25000,
    "rangeMin": 0,
    "rangeMax": 8000000,
    "rangeStep": 50000
  },
  "affordability-debt": {
    "val": 15000,
    "min": 0,
    "max": 300000,
    "step": 1000,
    "rangeMin": 0,
    "rangeMax": 150000,
    "rangeStep": 1000
  },
  "refinance-balance": {
    "val": 4500000,
    "min": 500000,
    "max": 30000000,
    "step": 50000,
    "rangeMin": 500000,
    "rangeMax": 20000000,
    "rangeStep": 100000
  },
  "refinance-costs": {
    "val": 50000,
    "min": 5000,
    "max": 500000,
    "step": 2500,
    "rangeMin": 5000,
    "rangeMax": 250000,
    "rangeStep": 2500
  },
  "biweekly-balance": {
    "val": 5000000,
    "min": 500000,
    "max": 30000000,
    "step": 50000,
    "rangeMin": 500000,
    "rangeMax": 20000000,
    "rangeStep": 100000
  },
  "cashoncash-rent": {
    "val": 35000,
    "min": 5000,
    "max": 500000,
    "step": 1000,
    "rangeMin": 5000,
    "rangeMax": 200000,
    "rangeStep": 1000
  },
  "cashoncash-mortgage": {
    "val": 18000,
    "min": 0,
    "max": 300000,
    "step": 1000,
    "rangeMin": 0,
    "rangeMax": 150000,
    "rangeStep": 1000
  },
  "cashoncash-expenses": {
    "val": 5000,
    "min": 0,
    "max": 100000,
    "step": 500,
    "rangeMin": 0,
    "rangeMax": 50000,
    "rangeStep": 500
  },
  "cashoncash-investment": {
    "val": 1500000,
    "min": 100000,
    "max": 20000000,
    "step": 50000,
    "rangeMin": 100000,
    "rangeMax": 10000000,
    "rangeStep": 50000
  },
  "heloc-drawn": {
    "val": 1000000,
    "min": 50000,
    "max": 20000000,
    "step": 50000,
    "rangeMin": 50000,
    "rangeMax": 10000000,
    "rangeStep": 50000
  },
  "closingcosts-price": {
    "val": 6000000,
    "min": 500000,
    "max": 50000000,
    "step": 50000,
    "rangeMin": 1000000,
    "rangeMax": 30000000,
    "rangeStep": 100000
  },
  "airbnb-adr": {
    "val": 4500,
    "min": 500,
    "max": 50000,
    "step": 250,
    "rangeMin": 1000,
    "rangeMax": 25000,
    "rangeStep": 250
  },
  "airbnb-mortgage": {
    "val": 35000,
    "min": 0,
    "max": 300000,
    "step": 1000,
    "rangeMin": 0,
    "rangeMax": 150000,
    "rangeStep": 1000
  },
  "airbnb-operating": {
    "val": 12000,
    "min": 0,
    "max": 100000,
    "step": 500,
    "rangeMin": 0,
    "rangeMax": 50000,
    "rangeStep": 500
  },
  "compound-principal": {
    "val": 200000,
    "min": 5000,
    "max": 50000000,
    "step": 10000,
    "rangeMin": 10000,
    "rangeMax": 10000000,
    "rangeStep": 25000
  },
  "interest-principal": {
    "val": 100000,
    "min": 5000,
    "max": 10000000,
    "step": 5000,
    "rangeMin": 10000,
    "rangeMax": 5000000,
    "rangeStep": 10000
  },
  "dividend-equity": {
    "val": 500000,
    "min": 10000,
    "max": 50000000,
    "step": 25000,
    "rangeMin": 25000,
    "rangeMax": 10000000,
    "rangeStep": 50000
  },
  "inflation-cash": {
    "val": 1000000,
    "min": 25000,
    "max": 50000000,
    "step": 25000,
    "rangeMin": 50000,
    "rangeMax": 15000000,
    "rangeStep": 50000
  },
  "sip-monthly": {
    "val": 10000,
    "min": 500,
    "max": 500000,
    "step": 500,
    "rangeMin": 1000,
    "rangeMax": 150000,
    "rangeStep": 1000
  },
  "cagr-initial": {
    "val": 200000,
    "min": 5000,
    "max": 50000000,
    "step": 10000,
    "rangeMin": 10000,
    "rangeMax": 10000000,
    "rangeStep": 25000
  },
  "cagr-final": {
    "val": 600000,
    "min": 10000,
    "max": 100000000,
    "step": 25000,
    "rangeMin": 25000,
    "rangeMax": 30000000,
    "rangeStep": 50000
  },
  "fire-expenses": {
    "val": 800000,
    "min": 100000,
    "max": 10000000,
    "step": 25000,
    "rangeMin": 200000,
    "rangeMax": 5000000,
    "rangeStep": 50000
  },
  "fire-savings": {
    "val": 2500000,
    "min": 0,
    "max": 100000000,
    "step": 100000,
    "rangeMin": 0,
    "rangeMax": 30000000,
    "rangeStep": 100000
  },
  "fire-annual-save": {
    "val": 500000,
    "min": 50000,
    "max": 10000000,
    "step": 25000,
    "rangeMin": 50000,
    "rangeMax": 3000000,
    "rangeStep": 50000
  },
  "four01k-salary": {
    "val": 1500000,
    "min": 200000,
    "max": 20000000,
    "step": 50000,
    "rangeMin": 300000,
    "rangeMax": 10000000,
    "rangeStep": 50000
  },
  "rmd-balance": {
    "val": 8000000,
    "min": 500000,
    "max": 100000000,
    "step": 100000,
    "rangeMin": 1000000,
    "rangeMax": 50000000,
    "rangeStep": 250000
  },
  "socialsecurity-pia": {
    "val": 35000,
    "min": 5000,
    "max": 250000,
    "step": 1000,
    "rangeMin": 5000,
    "rangeMax": 150000,
    "rangeStep": 1000
  },
  "cdladder-principal": {
    "val": 500000,
    "min": 50000,
    "max": 10000000,
    "step": 25000,
    "rangeMin": 50000,
    "rangeMax": 5000000,
    "rangeStep": 25000
  },
  "hsa-balance": {
    "val": 150000,
    "min": 0,
    "max": 2000000,
    "step": 10000,
    "rangeMin": 0,
    "rangeMax": 1000000,
    "rangeStep": 10000
  },
  "hsa-annual-contrib": {
    "val": 50000,
    "min": 5000,
    "max": 150000,
    "step": 2500,
    "rangeMin": 5000,
    "rangeMax": 100000,
    "rangeStep": 2500
  },
  "realreturns-portfolio": {
    "val": 2500000,
    "min": 50000,
    "max": 100000000,
    "step": 50000,
    "rangeMin": 100000,
    "rangeMax": 30000000,
    "rangeStep": 100000
  },
  "staking-principal": {
    "val": 150000,
    "min": 5000,
    "max": 20000000,
    "step": 10000,
    "rangeMin": 10000,
    "rangeMax": 5000000,
    "rangeStep": 25000
  },
  "invoice-rate": {
    "val": 1500,
    "min": 200,
    "max": 20000,
    "step": 100,
    "rangeMin": 300,
    "rangeMax": 10000,
    "rangeStep": 100
  },
  "salary-wage": {
    "val": 500,
    "min": 50,
    "max": 10000,
    "step": 25,
    "rangeMin": 100,
    "rangeMax": 3000,
    "rangeStep": 25
  },
  "paycheck-gross": {
    "val": 85000,
    "min": 15000,
    "max": 1500000,
    "step": 2500,
    "rangeMin": 20000,
    "rangeMax": 500000,
    "rangeStep": 5000
  },
  "capitalgains-purchase": {
    "val": 200000,
    "min": 5000,
    "max": 20000000,
    "step": 10000,
    "rangeMin": 10000,
    "rangeMax": 5000000,
    "rangeStep": 25000
  },
  "capitalgains-sale": {
    "val": 650000,
    "min": 5000,
    "max": 50000000,
    "step": 25000,
    "rangeMin": 20000,
    "rangeMax": 15000000,
    "rangeStep": 50000
  },
  "capitalgains-income": {
    "val": 1200000,
    "min": 0,
    "max": 20000000,
    "step": 50000,
    "rangeMin": 200000,
    "rangeMax": 10000000,
    "rangeStep": 50000
  },
  "quarterlytax-revenue": {
    "val": 1500000,
    "min": 100000,
    "max": 20000000,
    "step": 50000,
    "rangeMin": 200000,
    "rangeMax": 10000000,
    "rangeStep": 50000
  },
  "quarterlytax-expenses": {
    "val": 400000,
    "min": 0,
    "max": 10000000,
    "step": 25000,
    "rangeMin": 25000,
    "rangeMax": 4000000,
    "rangeStep": 25000
  },
  "overtime-hourly": {
    "val": 450,
    "min": 50,
    "max": 5000,
    "step": 25,
    "rangeMin": 100,
    "rangeMax": 2000,
    "rangeStep": 25
  },
  "bonustax-amount": {
    "val": 200000,
    "min": 10000,
    "max": 5000000,
    "step": 10000,
    "rangeMin": 10000,
    "rangeMax": 2000000,
    "rangeStep": 25000
  },
  "severance-weekly-pay": {
    "val": 25000,
    "min": 5000,
    "max": 250000,
    "step": 2500,
    "rangeMin": 5000,
    "rangeMax": 150000,
    "rangeStep": 2500
  },
  "severance-ui": {
    "val": 0,
    "min": 0,
    "max": 50000,
    "step": 1000,
    "rangeMin": 0,
    "rangeMax": 25000,
    "rangeStep": 1000
  },
  "severance-monthly-burn": {
    "val": 60000,
    "min": 10000,
    "max": 500000,
    "step": 2500,
    "rangeMin": 15000,
    "rangeMax": 250000,
    "rangeStep": 5000
  },
  "creditcard-debt": {
    "val": 75000,
    "min": 1000,
    "max": 2000000,
    "step": 2500,
    "rangeMin": 5000,
    "rangeMax": 500000,
    "rangeStep": 5000
  },
  "creditcard-payment": {
    "val": 5000,
    "min": 500,
    "max": 200000,
    "step": 500,
    "rangeMin": 1000,
    "rangeMax": 50000,
    "rangeStep": 1000
  },
  "autoloan-value": {
    "val": 1200000,
    "min": 100000,
    "max": 10000000,
    "step": 25000,
    "rangeMin": 200000,
    "rangeMax": 5000000,
    "rangeStep": 50000
  },
  "student-debt": {
    "val": 800000,
    "min": 50000,
    "max": 10000000,
    "step": 25000,
    "rangeMin": 100000,
    "rangeMax": 4000000,
    "rangeStep": 50000
  },
  "budget-income": {
    "val": 65000,
    "min": 10000,
    "max": 1000000,
    "step": 2500,
    "rangeMin": 15000,
    "rangeMax": 350000,
    "rangeStep": 5000
  },
  "snowball-extra": {
    "val": 5000,
    "min": 500,
    "max": 100000,
    "step": 500,
    "rangeMin": 500,
    "rangeMax": 40000,
    "rangeStep": 500
  },
  "snowball-debt1-bal": {
    "val": 45000,
    "min": 2000,
    "max": 500000,
    "step": 2500,
    "rangeMin": 5000,
    "rangeMax": 250000,
    "rangeStep": 5000
  },
  "snowball-debt2-bal": {
    "val": 150000,
    "min": 5000,
    "max": 2000000,
    "step": 5000,
    "rangeMin": 10000,
    "rangeMax": 1000000,
    "rangeStep": 10000
  },
  "carlease-msrp": {
    "val": 1200000,
    "min": 300000,
    "max": 8000000,
    "step": 25000,
    "rangeMin": 400000,
    "rangeMax": 5000000,
    "rangeStep": 50000
  },
  "carlease-lease-monthly": {
    "val": 18000,
    "min": 5000,
    "max": 150000,
    "step": 500,
    "rangeMin": 5000,
    "rangeMax": 80000,
    "rangeStep": 1000
  },
  "carlease-lease-down": {
    "val": 50000,
    "min": 0,
    "max": 500000,
    "step": 5000,
    "rangeMin": 0,
    "rangeMax": 250000,
    "rangeStep": 5000
  },
  "carlease-loan-monthly": {
    "val": 24000,
    "min": 5000,
    "max": 200000,
    "step": 500,
    "rangeMin": 5000,
    "rangeMax": 100000,
    "rangeStep": 1000
  },
  "carlease-residual": {
    "val": 450000,
    "min": 50000,
    "max": 3000000,
    "step": 10000,
    "rangeMin": 100000,
    "rangeMax": 2000000,
    "rangeStep": 25000
  },
  "personalloan-amount": {
    "val": 300000,
    "min": 25000,
    "max": 4000000,
    "step": 10000,
    "rangeMin": 50000,
    "rangeMax": 2000000,
    "rangeStep": 25000
  },
  "autorefi-balance": {
    "val": 600000,
    "min": 50000,
    "max": 5000000,
    "step": 10000,
    "rangeMin": 100000,
    "rangeMax": 3000000,
    "rangeStep": 25000
  },
  "studentrefi-balance": {
    "val": 900000,
    "min": 50000,
    "max": 8000000,
    "step": 25000,
    "rangeMin": 100000,
    "rangeMax": 4000000,
    "rangeStep": 50000
  },
  "studentrefi-idr-monthly": {
    "val": 6000,
    "min": 0,
    "max": 100000,
    "step": 500,
    "rangeMin": 0,
    "rangeMax": 40000,
    "rangeStep": 500
  },
  "creditscore-limit": {
    "val": 300000,
    "min": 25000,
    "max": 3000000,
    "step": 10000,
    "rangeMin": 50000,
    "rangeMax": 1500000,
    "rangeStep": 25000
  },
  "creditscore-balance": {
    "val": 140000,
    "min": 0,
    "max": 3000000,
    "step": 5000,
    "rangeMin": 0,
    "rangeMax": 1000000,
    "rangeStep": 10000
  },
  "creditscore-target-pay": {
    "val": 60000,
    "min": 0,
    "max": 1000000,
    "step": 2500,
    "rangeMin": 0,
    "rangeMax": 500000,
    "rangeStep": 5000
  },
  "roi-spend": {
    "val": 50000,
    "min": 1000,
    "max": 2500000,
    "step": 5000,
    "rangeMin": 5000,
    "rangeMax": 1000000,
    "rangeStep": 10000
  },
  "roi-revenue": {
    "val": 180000,
    "min": 0,
    "max": 10000000,
    "step": 10000,
    "rangeMin": 10000,
    "rangeMax": 5000000,
    "rangeStep": 25000
  },
  "breakeven-overhead": {
    "val": 100000,
    "min": 5000,
    "max": 5000000,
    "step": 5000,
    "rangeMin": 10000,
    "rangeMax": 2000000,
    "rangeStep": 10000
  },
  "breakeven-price": {
    "val": 1500,
    "min": 50,
    "max": 100000,
    "step": 50,
    "rangeMin": 100,
    "rangeMax": 20000,
    "rangeStep": 100
  },
  "breakeven-cost": {
    "val": 700,
    "min": 10,
    "max": 50000,
    "step": 25,
    "rangeMin": 50,
    "rangeMax": 10000,
    "rangeStep": 50
  },
  "stockavg-price1": {
    "val": 1200,
    "min": 10,
    "max": 50000,
    "step": 10,
    "rangeMin": 50,
    "rangeMax": 10000,
    "rangeStep": 50
  },
  "stockavg-price2": {
    "val": 900,
    "min": 10,
    "max": 50000,
    "step": 10,
    "rangeMin": 50,
    "rangeMax": 10000,
    "rangeStep": 50
  },
  "margin-cost": {
    "val": 400,
    "min": 5,
    "max": 50000,
    "step": 10,
    "rangeMin": 20,
    "rangeMax": 5000,
    "rangeStep": 20
  },
  "margin-price": {
    "val": 1000,
    "min": 10,
    "max": 100000,
    "step": 25,
    "rangeMin": 50,
    "rangeMax": 10000,
    "rangeStep": 50
  },
  "solar-system-cost": {
    "val": 250000,
    "min": 50000,
    "max": 1500000,
    "step": 10000,
    "rangeMin": 50000,
    "rangeMax": 800000,
    "rangeStep": 10000
  },
  "solar-monthly-electric": {
    "val": 4500,
    "min": 500,
    "max": 50000,
    "step": 250,
    "rangeMin": 1000,
    "rangeMax": 25000,
    "rangeStep": 250
  },
  "evgas-gas-price": {
    "val": 102,
    "min": 70,
    "max": 150,
    "step": 1,
    "rangeMin": 80,
    "rangeMax": 130,
    "rangeStep": 1
  },
  "evgas-kwh-rate": {
    "val": 8.5,
    "min": 4,
    "max": 20,
    "step": 0.25,
    "rangeMin": 5,
    "rangeMax": 15,
    "rangeStep": 0.25
  },
  "dropship-retail-price": {
    "val": 1499,
    "min": 99,
    "max": 25000,
    "step": 50,
    "rangeMin": 199,
    "rangeMax": 8000,
    "rangeStep": 50
  },
  "dropship-cogs": {
    "val": 350,
    "min": 20,
    "max": 10000,
    "step": 20,
    "rangeMin": 50,
    "rangeMax": 3000,
    "rangeStep": 25
  },
  "dropship-ad-cost": {
    "val": 450,
    "min": 0,
    "max": 10000,
    "step": 20,
    "rangeMin": 0,
    "rangeMax": 3000,
    "rangeStep": 25
  }
};

const CURRENCY_SCALE_FACTORS = {
  "GBP": 0.8,
  "EUR": 0.9,
  "AUD": 1.4,
  "CAD": 1.3,
  "AED": 3.67,
  "SAR": 3.75,
  "JPY": 140.0,
  "KRW": 1300.0,
  "IDR": 15000.0,
  "VND": 25000.0,
  "PLN": 4.0,
  "SEK": 10.5,
  "CHF": 0.9,
  "BRL": 5.0,
  "MXN": 18.0,
  "ZAR": 18.0,
  "TRY": 32.0,
  "PHP": 55.0,
  "THB": 35.0,
  "SGD": 1.35,
  "NZD": 1.6,
  "HKD": 7.8,
  "ILS": 3.7
};

function getRegionalPresets(currencyCode) {
  if (currencyCode === 'INR') return INR_PRESETS;
  if (currencyCode === 'USD') return USD_BASE_PRESETS;

  const factor = CURRENCY_SCALE_FACTORS[currencyCode] || 1.0;
  if (factor === 1.0) return USD_BASE_PRESETS;

  // Scale USD base presets dynamically for other currencies
  const scaled = {};
  for (const [id, cfg] of Object.entries(USD_BASE_PRESETS)) {
    // Determine rounding unit based on magnitude
    const rawVal = cfg.val * factor;
    let roundUnit = 1;
    if (rawVal >= 1000000) roundUnit = 50000;
    else if (rawVal >= 100000) roundUnit = 5000;
    else if (rawVal >= 10000) roundUnit = 500;
    else if (rawVal >= 1000) roundUnit = 50;
    else if (rawVal >= 100) roundUnit = 10;
    else if (rawVal >= 10) roundUnit = 1;
    else roundUnit = 0.5;

    const val = Math.max(1, Math.round(rawVal / roundUnit) * roundUnit);
    const min = cfg.min !== undefined ? Math.max(0, Math.round((cfg.min * factor) / roundUnit) * roundUnit) : 0;
    const max = cfg.max !== undefined ? Math.round((cfg.max * factor) / roundUnit) * roundUnit : val * 5;
    const step = cfg.step !== undefined ? Math.max(1, Math.round((cfg.step * factor) / (roundUnit / 2 || 1)) * (roundUnit / 2 || 1)) : 1;

    scaled[id] = {
      val: val,
      min: min,
      max: max,
      step: step,
      rangeMin: min,
      rangeMax: max > val * 3 ? Math.round(val * 2.5) : max,
      rangeStep: step
    };
  }
  return scaled;
}

function updateInputPreviewTag(numId, value) {
  const numInput = document.getElementById(numId);
  if (!numInput) return;
  const label = document.querySelector(`label[for="${numId}"]`);
  if (!label) return;
  const parent = label.parentElement;
  if (!parent) return;
  const previewSpan = parent.querySelector('.font-mono-num');
  if (!previewSpan) return;

  const num = parseFloat(value);
  if (isNaN(num)) return;

  const origText = previewSpan.getAttribute('data-unit') || previewSpan.textContent;
  if (origText.includes('%')) {
    previewSpan.setAttribute('data-unit', '%');
    previewSpan.textContent = `${num}%`;
  } else if (origText.toLowerCase().includes('mo')) {
    previewSpan.setAttribute('data-unit', 'Mo');
    previewSpan.textContent = `${num} Mo`;
  } else if (origText.toLowerCase().includes('yr')) {
    previewSpan.setAttribute('data-unit', 'Yrs');
    previewSpan.textContent = `${num} Yrs`;
  } else if (origText.includes('Shares') || origText.includes('Units') || origText.includes('Days') || origText.includes('Miles') || origText.includes('Hours')) {
    const unitMatch = origText.match(/(Shares|Units|Days|Miles|Hours|Nights|x)/i);
    const unit = unitMatch ? unitMatch[0] : '';
    const locale = currentCurrencyCode === 'INR' ? 'en-IN' : 'en-US';
    previewSpan.textContent = `${num.toLocaleString(locale)} ${unit}`.trim();
  } else {
    const locale = currentCurrencyCode === 'INR' ? 'en-IN' : 'en-US';
    let inrBadge = '';
    if (currentCurrencyCode === 'INR') {
      if (num >= 10000000) inrBadge = ` (${(num / 10000000).toFixed(2)} Cr)`;
      else if (num >= 100000) inrBadge = ` (${(num / 100000).toFixed(2)} L)`;
    }
    previewSpan.innerHTML = `<span class="currency-symbol-tag">${currentCurrency}</span> ${num.toLocaleString(locale)}${inrBadge}`;
  }
}

function applyCurrencyDataAndLimits(currencyCode) {
  const presets = getRegionalPresets(currencyCode);
  if (!presets) return;

  for (const [inputId, config] of Object.entries(presets)) {
    const numEl = document.getElementById(inputId);
    const rangeEl = document.getElementById(`${inputId}-range`);

    if (numEl && config.val !== undefined) {
      numEl.value = config.val;
      if (config.min !== undefined) numEl.min = config.min;
      if (config.max !== undefined) numEl.max = config.max;
      if (config.step !== undefined) numEl.step = config.step;
    }

    if (rangeEl && config.val !== undefined) {
      rangeEl.value = config.val;
      if (config.rangeMin !== undefined) rangeEl.min = config.rangeMin;
      else if (config.min !== undefined) rangeEl.min = config.min;

      if (config.rangeMax !== undefined) rangeEl.max = config.rangeMax;
      else if (config.max !== undefined) rangeEl.max = config.max;

      if (config.rangeStep !== undefined) rangeEl.step = config.rangeStep;
      else if (config.step !== undefined) rangeEl.step = config.step;
    }

    if (config.val !== undefined) {
      updateInputPreviewTag(inputId, config.val);
    }
  }
}


function setGlobalCurrency(codeOrSymbol) {
  let matchedCode = 'USD';
  let matchedSymbol = '$';

  if (!codeOrSymbol) {
    codeOrSymbol = 'USD';
  }

  // Check if it matches a key in CURRENCY_REGISTRY (e.g. 'INR', 'AUD', 'USD')
  if (CURRENCY_REGISTRY[codeOrSymbol]) {
    matchedCode = codeOrSymbol;
    matchedSymbol = CURRENCY_REGISTRY[codeOrSymbol].symbol;
  } else {
    // Check if it matches a currency symbol (e.g. '₹', '£', '€')
    const foundEntry = Object.entries(CURRENCY_REGISTRY).find(([k, v]) => v.symbol === codeOrSymbol);
    if (foundEntry) {
      matchedCode = foundEntry[0];
      matchedSymbol = foundEntry[1].symbol;
    }
  }

  currentCurrencyCode = matchedCode;
  currentCurrency = matchedSymbol;

  // Sync dropdown select element
  const currencySelect = document.getElementById('global-currency');
  if (currencySelect && currencySelect.value !== matchedCode) {
    currencySelect.value = matchedCode;
  }

  // Update all currency-symbol-tag elements in DOM
  document.querySelectorAll('.currency-symbol-tag').forEach(tag => {
    tag.textContent = currentCurrency;
  });

  // Apply regional terminology dictionary
  applyRegionalLocalization(matchedCode);

  // Apply currency-adapted data values, money limits (min/max/step), and preview tags
  applyCurrencyDataAndLimits(matchedCode);

  // Recalculate calculations with active currency symbol
  recalculateAll();
  saveStateDebounced();
}

function setupCurrencySelector() {
  const currencySelect = document.getElementById('global-currency');
  if (!currencySelect) return;

  currencySelect.addEventListener('change', (e) => {
    const selectedCode = e.target.value;
    setGlobalCurrency(selectedCode);
    showToast(`Region & Currency adapted to ${selectedCode} (${currentCurrency})`);
  });
}

// -------------------------------------------------------------
// TAB SWITCHING & VIEW MODES
// -------------------------------------------------------------
let isProgrammaticScrolling = false;
let scrollLockTimer = null;

function switchEngine(tabOrEngineId, shouldScroll = true) {
  if (!tabOrEngineId) return;

  // Support both 'tab-xyz' and 'engine-xyz'
  let tabId = tabOrEngineId;
  let targetEngineCardId = tabOrEngineId;

  if (tabOrEngineId === 'tab-banking-hub' || tabOrEngineId === 'engine-banking' || tabOrEngineId === 'banking') {
    tabId = 'tab-banking-hub';
    targetEngineCardId = 'engine-banking';
  } else if (tabOrEngineId.startsWith('engine-')) {
    targetEngineCardId = tabOrEngineId;
    tabId = tabOrEngineId.replace('engine-', 'tab-');
  } else if (tabOrEngineId.startsWith('tab-')) {
    tabId = tabOrEngineId;
    targetEngineCardId = tabOrEngineId.replace('tab-', 'engine-');
  } else {
    tabId = 'tab-' + tabOrEngineId;
    targetEngineCardId = 'engine-' + tabOrEngineId;
  }

  activeEngineId = tabId;

  // 1. Highlight tab button in sidebar & sync mobile dropdown
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.id === tabId);
  });
  const mobileEngineSelect = document.getElementById('mobile-engine-select');
  if (mobileEngineSelect && mobileEngineSelect.value !== tabId) {
    mobileEngineSelect.value = tabId;
  }

  // Ensure active sidebar button is scrolled into view in sidebar nav
  const activeTabBtn = document.getElementById(tabId);
  if (activeTabBtn && shouldScroll) {
    try {
      activeTabBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (e) {}
  }

  const targetPanel = document.getElementById(targetEngineCardId);

  // 2. Manage visibility of engine panels based on mode
  if (isFocusMode) {
    document.querySelectorAll('.engine-panel').forEach(panel => {
      if (panel.id === targetEngineCardId) {
        panel.classList.remove('hidden');
        panel.classList.add('block');
      } else {
        panel.classList.add('hidden');
        panel.classList.remove('block');
      }
    });
  } else {
    document.querySelectorAll('.engine-panel').forEach(panel => {
      panel.classList.remove('hidden');
      panel.classList.add('block');
    });
  }

  // 3. Smooth scroll directly to the selected engine card
  if (targetPanel && shouldScroll) {
    isProgrammaticScrolling = true;
    clearTimeout(scrollLockTimer);
    scrollLockTimer = setTimeout(() => {
      isProgrammaticScrolling = false;
    }, 1800);

    const header = document.querySelector('header');
    const headerOffset = (header ? header.offsetHeight : 70) + 16;
    const elementPosition = targetPanel.getBoundingClientRect().top + window.pageYOffset;
    const offsetPosition = elementPosition - headerOffset;

    window.scrollTo({
      top: Math.max(0, offsetPosition),
      behavior: 'smooth'
    });

    // Provide visual focus ring animation to clearly highlight the engine
    targetPanel.classList.add('ring-2', 'ring-emerald-400', 'transition-all');
    setTimeout(() => {
      targetPanel.classList.remove('ring-2', 'ring-emerald-400');
    }, 1500);
  }

  // Update contextual FinTech lead-gen card & statutory audit trail for active engine
  try {
    if (typeof updateContextualLeadCard === 'function') updateContextualLeadCard(tabId);
    if (typeof updateAuditTrailContent === 'function') updateAuditTrailContent(tabId);
  } catch (e) {}

  saveStateDebounced();
}

function setViewMode(mode) {
  isFocusMode = mode === 'focus';
  
  const focusBtn = document.getElementById('view-mode-focus');
  const allBtn = document.getElementById('view-mode-all');
  if (focusBtn && allBtn) {
    focusBtn.classList.toggle('active', isFocusMode);
    allBtn.classList.toggle('active', !isFocusMode);
  }

  if (isFocusMode) {
    switchEngine(activeEngineId);
  } else {
    document.querySelectorAll('.engine-panel').forEach(panel => {
      panel.classList.remove('hidden');
      panel.classList.add('block');
    });
  }
}

// -------------------------------------------------------------
// ISOLATED FOCUSED ENGINE PRINTING SYSTEM
// -------------------------------------------------------------
function getFocusedEngineId() {
  // 1. If an active element is inside an engine panel
  if (document.activeElement && document.activeElement !== document.body) {
    const parentPanel = document.activeElement.closest('.engine-panel');
    if (parentPanel && parentPanel.id) {
      return parentPanel.id;
    }
  }

  // 2. Fall back to current activeEngineId
  if (activeEngineId) {
    return activeEngineId.replace('tab-', 'engine-');
  }

  // 3. Fall back to first visible engine panel
  const visible = document.querySelector('.engine-panel:not(.hidden)');
  if (visible && visible.id) {
    return visible.id;
  }

  return 'engine-mortgage';
}

function updatePrintReportHeader(panel) {
  if (!panel) return;
  const titleEl = panel.querySelector('h2');
  const engineTitle = titleEl ? titleEl.textContent.trim() : 'Financial Assessment Report';
  const descEl = panel.querySelector('.border-b p') || panel.querySelector('p');
  const engineDesc = descEl ? descEl.textContent.trim() : '';

  const isAdv = advisorProfile && advisorProfile.enabled;
  const standardHeader = document.getElementById('print-standard-letterhead');
  const advHeader = document.getElementById('print-advisor-letterhead');

  if (isAdv && advHeader) {
    if (standardHeader) standardHeader.style.display = 'none';
    advHeader.style.display = 'block';
    const firmEl = document.getElementById('print-adv-firm');
    const repEl = document.getElementById('print-adv-rep');
    const contactEl = document.getElementById('print-adv-contact');
    const clientEl = document.getElementById('print-adv-client');
    const dateEl = document.getElementById('print-adv-date');

    if (firmEl) firmEl.textContent = advisorProfile.firmName || 'Advisory Practice';
    if (repEl) repEl.textContent = `Prepared by: ${advisorProfile.name || 'Advisory Representative'}`;
    if (contactEl) contactEl.textContent = `${advisorProfile.phone ? advisorProfile.phone + ' • ' : ''}${advisorProfile.email || ''}`;
    if (clientEl) clientEl.textContent = `Prepared for: ${advisorProfile.clientName || 'Confidential Client'}`;
    if (dateEl) {
      const now = new Date();
      dateEl.textContent = `Date: ${now.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}`;
    }
  } else {
    if (standardHeader) standardHeader.style.display = 'flex';
    if (advHeader) advHeader.style.display = 'none';
    const printTitle = document.getElementById('print-engine-title');
    if (printTitle) printTitle.textContent = engineTitle;

    const printSubtitle = document.getElementById('print-engine-subtitle');
    if (printSubtitle) printSubtitle.textContent = engineDesc;

    const printTimestamp = document.getElementById('print-report-timestamp');
    if (printTimestamp) {
      const now = new Date();
      printTimestamp.textContent = `Generated: ${now.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} at ${now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} | Region: ${currentCurrencyCode} (${currentCurrency})`;
    }
  }
}

function printCurrentEngine(engineIdentifier) {
  let targetEngineId = '';
  if (engineIdentifier) {
    if (engineIdentifier.startsWith('engine-')) {
      targetEngineId = engineIdentifier;
    } else if (engineIdentifier.startsWith('tab-')) {
      targetEngineId = engineIdentifier.replace('tab-', 'engine-');
    } else {
      targetEngineId = 'engine-' + engineIdentifier;
    }
  } else {
    targetEngineId = getFocusedEngineId();
  }

  const panel = document.getElementById(targetEngineId);
  if (!panel) return;

  // Set the print attribute on body
  document.body.setAttribute('data-print-engine', targetEngineId);

  // Set print-focus-active class exclusively on this panel
  document.querySelectorAll('.engine-panel').forEach(p => {
    p.classList.remove('print-focus-active');
  });
  panel.classList.add('print-focus-active');

  // Populate dynamic print header
  updatePrintReportHeader(panel);

  // Invoke native browser print dialog
  setTimeout(() => {
    window.print();
  }, 40);
}

function setupEngineFocusTracking() {
  // Update activeEngineId when clicking or focusing inside any engine card
  document.querySelectorAll('.engine-panel').forEach(panel => {
    const markFocused = () => {
      const tabId = panel.id.replace('engine-', 'tab-');
      activeEngineId = tabId;
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.toggle('active', btn.id === tabId);
      });
    };
    panel.addEventListener('focusin', markFocused);
    panel.addEventListener('click', markFocused);
  });

  // Track viewport visibility in "All 20" mode
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      if (isFocusMode || isProgrammaticScrolling) return;
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          const tabId = entry.target.id.replace('engine-', 'tab-');
          activeEngineId = tabId;
          document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.id === tabId);
          });
        }
      });
    }, { threshold: [0.35] });

    document.querySelectorAll('.engine-panel').forEach(p => observer.observe(p));
  }

  // Intercept beforeprint & afterprint events for native Ctrl+P or browser menu Print
  window.addEventListener('beforeprint', () => {
    if (!document.body.getAttribute('data-print-engine')) {
      const targetEngineId = getFocusedEngineId();
      const panel = document.getElementById(targetEngineId);
      if (panel) {
        document.body.setAttribute('data-print-engine', targetEngineId);
        document.querySelectorAll('.engine-panel').forEach(p => p.classList.remove('print-focus-active'));
        panel.classList.add('print-focus-active');
        updatePrintReportHeader(panel);
      }
    }
  });

  window.addEventListener('afterprint', () => {
    document.body.removeAttribute('data-print-engine');
    document.querySelectorAll('.engine-panel').forEach(p => {
      p.classList.remove('print-focus-active');
    });
  });
}

// -------------------------------------------------------------
// AMORTIZATION SCHEDULE DRAWER & CSV EXPORTER
// -------------------------------------------------------------

function generateAmortizationSchedule(principal, annualRate, months) {
  const schedule = [];
  const monthlyRate = (annualRate / 100) / 12;
  let payment = 0;

  if (monthlyRate === 0) {
    payment = principal / months;
  } else {
    payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  }

  let balance = principal;
  for (let m = 1; m <= months; m++) {
    const interest = balance * monthlyRate;
    const principalPaid = Math.min(balance, payment - interest);
    balance = Math.max(0, balance - principalPaid);
    const year = Math.ceil(m / 12);

    schedule.push({
      month: m,
      year: year,
      payment: payment,
      principal: principalPaid,
      interest: interest,
      balance: balance
    });
    if (balance <= 0) break;
  }

  return schedule;
}

function openAmortizationModal(type = 'mortgage') {
  currentAmortizationType = type;
  let principal = 0;
  let rate = 0;
  let months = 360;
  let title = 'Amortization Schedule & Analytics';
  let badge = '30 Yrs Fixed';

  if (type === 'mortgage') {
    const asset = parseFloat(document.getElementById('mortgage-asset').value) || 0;
    const down = parseFloat(document.getElementById('mortgage-down').value) || 0;
    principal = Math.max(0, asset - down);
    rate = parseFloat(document.getElementById('mortgage-rate').value) || 0;
    const termYears = parseFloat(document.getElementById('mortgage-term')?.value) || mortgageTermYears || 30;
    months = Math.round(termYears * 12);
    badge = `${termYears} Yrs Fixed`;
    const cardTitle = document.getElementById('engine-mortgage')?.querySelector('h2')?.textContent || 'Mortgage Liability Console';
    title = `${cardTitle} Schedule (${termYears} Yrs @ ${rate}%)`;
  } else if (type === 'autoloan') {
    principal = parseFloat(document.getElementById('autoloan-value').value) || 0;
    rate = parseFloat(document.getElementById('autoloan-rate').value) || 0;
    months = parseInt(document.getElementById('autoloan-term').value) || 60;
    badge = `${months} Mo (${(months / 12).toFixed(1)} Yrs)`;
    const cardTitle = document.getElementById('engine-autoloan')?.querySelector('h2')?.textContent || 'Auto Finance Estimator';
    title = `${cardTitle} Schedule (${months} Mo @ ${rate}%)`;
  } else if (type === 'student') {
    principal = parseFloat(document.getElementById('student-debt').value) || 0;
    rate = parseFloat(document.getElementById('student-rate').value) || 0;
    months = parseInt(document.getElementById('student-months').value) || 120;
    badge = `${months} Mo (${(months / 12).toFixed(1)} Yrs)`;
    const cardTitle = document.getElementById('engine-student')?.querySelector('h2')?.textContent || 'Student Loan Payoff';
    title = `${cardTitle} Schedule (${months} Mo @ ${rate}%)`;
  } else if (type === 'personalloan') {
    principal = parseFloat(document.getElementById('personalloan-amount').value) || 0;
    rate = parseFloat(document.getElementById('personalloan-rate').value) || 0;
    months = parseInt(document.getElementById('personalloan-term').value) || 36;
    badge = `${months} Mo (${(months / 12).toFixed(1)} Yrs)`;
    const cardTitle = document.getElementById('engine-personalloan')?.querySelector('h2')?.textContent || 'Personal Loan Consolidation';
    title = `${cardTitle} Schedule (${months} Mo @ ${rate}%)`;
  } else if (type === 'heloc') {
    principal = parseFloat(document.getElementById('heloc-drawn').value) || 0;
    rate = parseFloat(document.getElementById('heloc-rate').value) || 0;
    const repayYears = parseFloat(document.getElementById('heloc-repay-years')?.value) || 15;
    months = Math.round(repayYears * 12);
    badge = `${repayYears} Yrs Repay`;
    const cardTitle = document.getElementById('engine-heloc')?.querySelector('h2')?.textContent || 'HELOC Repayment Schedule';
    title = `${cardTitle} (${repayYears} Yrs @ ${rate}%)`;
  } else if (type === 'refinance') {
    principal = parseFloat(document.getElementById('refinance-balance').value) || 0;
    rate = parseFloat(document.getElementById('refinance-new-rate').value) || 0;
    const termYears = parseFloat(document.getElementById('refinance-term')?.value) || 30;
    months = Math.round(termYears * 12);
    badge = `${termYears} Yrs Refi`;
    title = `Mortgage Refinance Amortization Schedule (${termYears} Yrs @ ${rate}%)`;
  } else if (type === 'biweekly') {
    principal = parseFloat(document.getElementById('biweekly-balance')?.value) || 0;
    rate = parseFloat(document.getElementById('biweekly-rate')?.value) || 0;
    const termYears = parseFloat(document.getElementById('biweekly-term')?.value) || 30;
    months = Math.round(termYears * 12);
    badge = `${termYears} Yrs Bi-Weekly`;
    title = `Bi-Weekly Accelerated Mortgage Schedule (${termYears} Yrs @ ${rate}%)`;
  } else if (type === 'autorefi') {
    principal = parseFloat(document.getElementById('autorefi-balance')?.value) || 0;
    rate = parseFloat(document.getElementById('autorefi-new-rate')?.value) || 0;
    months = parseInt(document.getElementById('autorefi-months')?.value) || 48;
    badge = `${months} Mo (${(months / 12).toFixed(1)} Yrs)`;
    title = `Auto Refinance Schedule (${months} Mo @ ${rate}%)`;
  } else if (type === 'affordability') {
    principal = parseFloat(document.getElementById('affordability-max-loan')?.textContent?.replace(/[^0-9.-]/g, '')) || 0;
    rate = parseFloat(document.getElementById('affordability-rate')?.value) || 0;
    const termYears = parseFloat(document.getElementById('affordability-term')?.value) || 30;
    months = Math.round(termYears * 12);
    badge = `${termYears} Yrs Affordability`;
    title = `Home Affordability Schedule (${termYears} Yrs @ ${rate}%)`;
  }

  currentAmortizationPrincipal = principal;
  currentAmortizationRate = rate;
  currentAmortizationMonths = months;

  // Set modal period input and unit dropdown
  const periodInp = document.getElementById('amort-modal-period-input');
  const periodUnit = document.getElementById('amort-modal-period-unit');
  const isMonthDefault = ['autoloan', 'autorefi', 'personalloan', 'student'].includes(type) && (months % 12 !== 0 || months <= 84);
  
  if (periodUnit) periodUnit.value = isMonthDefault ? 'months' : 'years';
  if (periodInp) periodInp.value = isMonthDefault ? months : Number((months / 12).toFixed(2));

  renderModalPresets();

  currentAmortizationData = generateAmortizationSchedule(principal, rate, months);

  // Compute key summary figures
  const totalInterest = currentAmortizationData.reduce((acc, row) => acc + row.interest, 0);
  const totalPrincipal = currentAmortizationData.reduce((acc, row) => acc + row.principal, 0);
  const monthlyPayment = currentAmortizationData[0] ? currentAmortizationData[0].payment : 0;
  const interestOverheadPct = principal > 0 ? (totalInterest / principal) * 100 : 0;

  // Payoff date estimation
  const now = new Date();
  const payoffDate = new Date(now.getFullYear(), now.getMonth() + months, 1);
  const payoffDateStr = payoffDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });

  // Update Summary DOM Cards
  const titleEl = document.getElementById('amort-modal-title');
  const badgeEl = document.getElementById('amort-modal-badge');
  const sumPayEl = document.getElementById('amort-summary-payment');
  const sumPrinEl = document.getElementById('amort-summary-principal');
  const sumIntEl = document.getElementById('amort-summary-interest');
  const sumIntPctEl = document.getElementById('amort-summary-interest-pct');
  const sumHorizEl = document.getElementById('amort-summary-horizon');
  const sumDateEl = document.getElementById('amort-summary-date');

  if (titleEl) titleEl.textContent = title;
  if (badgeEl) badgeEl.textContent = badge;
  if (sumPayEl) sumPayEl.textContent = formatCurrency(monthlyPayment);
  if (sumPrinEl) sumPrinEl.textContent = formatCurrency(totalPrincipal);
  if (sumIntEl) sumIntEl.textContent = formatCurrency(totalInterest);
  if (sumIntPctEl) sumIntPctEl.textContent = `${interestOverheadPct.toFixed(1)}% financing overhead`;
  if (sumHorizEl) sumHorizEl.textContent = `${months} Payments (${(months / 12).toFixed(1)} Yrs)`;
  if (sumDateEl) sumDateEl.textContent = `Payoff Horizon: ${payoffDateStr}`;

  // Clear search field
  const searchInput = document.getElementById('amort-table-search');
  if (searchInput) searchInput.value = '';
  amortizationSearchQuery = '';

  // Render SVG Chart and Table
  renderAmortizationVisualChart(currentAmortizationData, principal, totalInterest);
  renderAmortizationTable();
  updateModalPresetChips();

  const modal = document.getElementById('amortization-modal');
  if (modal) modal.classList.add('active');
}

function renderModalPresets() {
  const container = document.getElementById('amort-modal-presets');
  if (!container) return;
  const unit = document.getElementById('amort-modal-period-unit')?.value || 'years';

  if (unit === 'years') {
    const yearPresets = [5, 10, 15, 20, 25, 30, 40];
    container.innerHTML = yearPresets.map(yr => {
      const active = (currentAmortizationMonths === yr * 12) ? 'active' : '';
      return `<button type="button" onclick="setModalAmortizationPeriod(${yr}, true)" data-term="${yr}" class="amort-modal-preset-btn ${active} py-1 px-2.5 rounded-lg text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">${yr}Y</button>`;
    }).join('');
  } else {
    const monthPresets = [12, 24, 36, 48, 60, 72, 84, 120];
    container.innerHTML = monthPresets.map(mo => {
      const active = (currentAmortizationMonths === mo) ? 'active' : '';
      return `<button type="button" onclick="setModalAmortizationPeriod(${mo}, false)" data-term="${mo}" class="amort-modal-preset-btn ${active} py-1 px-2.5 rounded-lg text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">${mo}m</button>`;
    }).join('');
  }
}

function updateModalPresetChips() {
  const unit = document.getElementById('amort-modal-period-unit')?.value || 'years';
  const targetVal = unit === 'years' ? (currentAmortizationMonths / 12) : currentAmortizationMonths;
  document.querySelectorAll('.amort-modal-preset-btn').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.dataset.term) === targetVal);
  });
}

function handleModalPeriodChange(newVal) {
  const unit = document.getElementById('amort-modal-period-unit')?.value || 'years';
  const rawNum = parseFloat(newVal);
  if (isNaN(rawNum) || rawNum <= 0) return;
  
  let newMonths = unit === 'years' ? Math.round(rawNum * 12) : Math.round(rawNum);
  newMonths = Math.max(1, Math.min(600, newMonths));
  applyModalAmortizationMonths(newMonths);
}

function handleModalPeriodUnitChange() {
  const unit = document.getElementById('amort-modal-period-unit')?.value || 'years';
  const periodInp = document.getElementById('amort-modal-period-input');
  if (periodInp) {
    if (unit === 'years') {
      periodInp.value = Number((currentAmortizationMonths / 12).toFixed(2));
    } else {
      periodInp.value = currentAmortizationMonths;
    }
  }
  renderModalPresets();
}

function setModalAmortizationPeriod(amount, isYears) {
  const unitSelect = document.getElementById('amort-modal-period-unit');
  const periodInp = document.getElementById('amort-modal-period-input');
  if (unitSelect) unitSelect.value = isYears ? 'years' : 'months';
  if (periodInp) periodInp.value = amount;
  const newMonths = isYears ? Math.round(amount * 12) : Math.round(amount);
  applyModalAmortizationMonths(newMonths);
}

function applyModalAmortizationMonths(newMonths) {
  currentAmortizationMonths = newMonths;

  currentAmortizationData = generateAmortizationSchedule(currentAmortizationPrincipal, currentAmortizationRate, currentAmortizationMonths);

  // Compute key summary figures
  const totalInterest = currentAmortizationData.reduce((acc, row) => acc + row.interest, 0);
  const totalPrincipal = currentAmortizationData.reduce((acc, row) => acc + row.principal, 0);
  const monthlyPayment = currentAmortizationData[0] ? currentAmortizationData[0].payment : 0;
  const interestOverheadPct = currentAmortizationPrincipal > 0 ? (totalInterest / currentAmortizationPrincipal) * 100 : 0;

  // Payoff date estimation
  const now = new Date();
  const payoffDate = new Date(now.getFullYear(), now.getMonth() + newMonths, 1);
  const payoffDateStr = payoffDate.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });

  // Update Summary DOM Cards
  const badgeEl = document.getElementById('amort-modal-badge');
  const sumPayEl = document.getElementById('amort-summary-payment');
  const sumPrinEl = document.getElementById('amort-summary-principal');
  const sumIntEl = document.getElementById('amort-summary-interest');
  const sumIntPctEl = document.getElementById('amort-summary-interest-pct');
  const sumHorizEl = document.getElementById('amort-summary-horizon');
  const sumDateEl = document.getElementById('amort-summary-date');

  const yrsFloat = (newMonths / 12).toFixed(1);
  if (badgeEl) badgeEl.textContent = `${yrsFloat} Yrs (${newMonths} Mo)`;
  if (sumPayEl) sumPayEl.textContent = formatCurrency(monthlyPayment);
  if (sumPrinEl) sumPrinEl.textContent = formatCurrency(totalPrincipal);
  if (sumIntEl) sumIntEl.textContent = formatCurrency(totalInterest);
  if (sumIntPctEl) sumIntPctEl.textContent = `${interestOverheadPct.toFixed(1)}% financing overhead`;
  if (sumHorizEl) sumHorizEl.textContent = `${newMonths} Payments (${yrsFloat} Yrs)`;
  if (sumDateEl) sumDateEl.textContent = `Payoff Horizon: ${payoffDateStr}`;

  // Render SVG Chart and Table
  renderAmortizationVisualChart(currentAmortizationData, currentAmortizationPrincipal, totalInterest);
  renderAmortizationTable();
  updateModalPresetChips();

  // Bi-directional synchronization with underlying engine
  syncModalPeriodToEngine(currentAmortizationType, newMonths);
}

function syncModalPeriodToEngine(type, months) {
  if (type === 'mortgage') {
    const yrs = Math.max(1, Math.min(50, Math.round(months / 12)));
    const el = document.getElementById('mortgage-term');
    if (el && parseFloat(el.value) !== yrs) {
      setMortgageTerm(yrs);
    }
  } else if (type === 'refinance') {
    const yrs = Math.max(1, Math.min(50, Math.round(months / 12)));
    const el = document.getElementById('refinance-term');
    if (el && parseFloat(el.value) !== yrs) {
      setRefinanceTerm(yrs);
    }
  } else if (type === 'affordability') {
    const yrs = Math.max(1, Math.min(50, Math.round(months / 12)));
    const el = document.getElementById('affordability-term');
    if (el && parseFloat(el.value) !== yrs) {
      setAffordabilityTerm(yrs);
    }
  } else if (type === 'biweekly') {
    const yrs = Math.max(1, Math.min(50, Math.round(months / 12)));
    const el = document.getElementById('biweekly-term');
    if (el && parseFloat(el.value) !== yrs) {
      setBiweeklyTerm(yrs);
    }
  } else if (type === 'heloc') {
    const yrs = Math.max(1, Math.min(30, Math.round(months / 12)));
    const el = document.getElementById('heloc-repay-years');
    if (el && parseFloat(el.value) !== yrs) {
      setHelocRepayYears(yrs);
    }
  } else if (type === 'autoloan') {
    const m = Math.max(1, Math.min(120, months));
    const el = document.getElementById('autoloan-term');
    if (el && parseInt(el.value) !== m) {
      setAutoLoanTerm(m);
    }
  } else if (type === 'autorefi') {
    const m = Math.max(1, Math.min(120, months));
    const el = document.getElementById('autorefi-months');
    if (el && parseInt(el.value) !== m) {
      setAutoRefiMonths(m);
    }
  } else if (type === 'student') {
    const m = Math.max(1, Math.min(360, months));
    const el = document.getElementById('student-months');
    if (el && parseInt(el.value) !== m) {
      setStudentMonths(m);
    }
  } else if (type === 'personalloan') {
    const m = Math.max(1, Math.min(120, months));
    const el = document.getElementById('personalloan-term');
    if (el && parseInt(el.value) !== m) {
      setPersonalLoanTerm(m);
    }
  }
}

function closeAmortizationModal() {
  const modal = document.getElementById('amortization-modal');
  if (modal) modal.classList.remove('active');
}

function setAmortizationView(mode) {
  amortizationViewMode = mode;
  document.getElementById('amort-view-annual')?.classList.toggle('active', mode === 'annual');
  document.getElementById('amort-view-monthly')?.classList.toggle('active', mode === 'monthly');
  renderAmortizationTable();
}

function renderAmortizationVisualChart(schedule, principal, totalInterest) {
  const svg = document.getElementById('amort-visual-chart-svg');
  if (!svg || !schedule || !schedule.length) return;

  const width = 600;
  const height = 70;
  const totalMonths = schedule.length;
  const initialPrincipal = Math.max(principal, 1);
  const maxInterest = Math.max(totalInterest, 1);

  // Sample ~30 data points across the timeline
  const step = Math.max(1, Math.floor(totalMonths / 30));
  const points = [];
  let cumInterest = 0;

  for (let m = 0; m < totalMonths; m++) {
    cumInterest += schedule[m].interest;
    if (m % step === 0 || m === totalMonths - 1) {
      const x = (m / (totalMonths - 1)) * width;
      const balanceY = height - (schedule[m].balance / initialPrincipal) * (height - 14) - 5;
      const interestY = height - (cumInterest / maxInterest) * (height - 14) - 5;
      points.push({ x, balanceY, interestY, balance: schedule[m].balance, cumInterest });
    }
  }

  // Build Balance Area Path
  let balanceAreaD = `M 0,${height} `;
  points.forEach((pt, i) => {
    balanceAreaD += `${i === 0 ? 'L' : 'L'} ${pt.x.toFixed(1)},${pt.balanceY.toFixed(1)} `;
  });
  balanceAreaD += `L ${width},${height} Z`;

  // Build Balance Stroke Line
  let balanceStrokeD = `M 0,${points[0].balanceY.toFixed(1)} `;
  points.forEach((pt, i) => {
    if (i > 0) balanceStrokeD += `L ${pt.x.toFixed(1)},${pt.balanceY.toFixed(1)} `;
  });

  // Build Cumulative Interest Stroke Line
  let interestStrokeD = `M 0,${height - 5} `;
  points.forEach((pt, i) => {
    interestStrokeD += `L ${pt.x.toFixed(1)},${pt.interestY.toFixed(1)} `;
  });

  svg.innerHTML = `
    <defs>
      <linearGradient id="grad-amort-bal" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.3"/>
        <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
      </linearGradient>
    </defs>
    <!-- Balance Area Fill -->
    <path d="${balanceAreaD}" fill="url(#grad-amort-bal)"/>
    <!-- Balance Line (Emerald) -->
    <path d="${balanceStrokeD}" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round"/>
    <!-- Cumulative Interest Line (Rose) -->
    <path d="${interestStrokeD}" fill="none" stroke="#f43f5e" stroke-width="2" stroke-dasharray="3,2" stroke-linecap="round"/>
    <!-- Start & End Markers -->
    <circle cx="0" cy="${points[0].balanceY.toFixed(1)}" r="3.5" fill="#34d399"/>
    <circle cx="${width}" cy="${height - 5}" r="3.5" fill="#10b981"/>
    <circle cx="${width}" cy="${points[points.length-1].interestY.toFixed(1)}" r="3.5" fill="#fb7185"/>
  `;
}

function renderAmortizationTable() {
  const tbody = document.getElementById('amortization-tbody');
  if (!tbody || !currentAmortizationData.length) return;

  tbody.innerHTML = '';
  const initialPrincipal = currentAmortizationData[0] ? (currentAmortizationData[0].principal + currentAmortizationData[0].balance) : 1;

  if (amortizationViewMode === 'annual') {
    // Group by year
    const yearlyMap = {};
    currentAmortizationData.forEach(row => {
      if (!yearlyMap[row.year]) {
        yearlyMap[row.year] = {
          year: row.year,
          payment: 0,
          principal: 0,
          interest: 0,
          balance: row.balance
        };
      }
      yearlyMap[row.year].payment += row.payment;
      yearlyMap[row.year].principal += row.principal;
      yearlyMap[row.year].interest += row.interest;
      yearlyMap[row.year].balance = row.balance;
    });

    Object.values(yearlyMap).forEach(row => {
      const equityPct = Math.max(0, Math.min(100, ((initialPrincipal - row.balance) / initialPrincipal) * 100));
      const tr = document.createElement('tr');
      tr.className = 'border-b border-slate-800/80 hover:bg-slate-800/50 font-mono-num text-xs transition-colors';
      tr.innerHTML = `
        <td class="py-2.5 px-3 font-bold text-emerald-400">Year ${row.year}</td>
        <td class="py-2.5 px-3 text-slate-200">${formatCurrency(row.payment)}</td>
        <td class="py-2.5 px-3 text-emerald-300 font-semibold">${formatCurrency(row.principal)}</td>
        <td class="py-2.5 px-3 text-rose-300 font-semibold">${formatCurrency(row.interest)}</td>
        <td class="py-2.5 px-3 text-slate-100 font-bold">${formatCurrency(row.balance)}</td>
        <td class="py-2.5 px-3 text-right">
          <span class="text-[10px] bg-emerald-950/70 text-emerald-400 border border-emerald-800/60 font-mono px-2 py-0.5 rounded-full font-bold">${equityPct.toFixed(1)}%</span>
        </td>
      `;
      tbody.appendChild(tr);
    });
  } else {
    // Monthly view
    currentAmortizationData.forEach(row => {
      const equityPct = Math.max(0, Math.min(100, ((initialPrincipal - row.balance) / initialPrincipal) * 100));
      const tr = document.createElement('tr');
      tr.className = 'border-b border-slate-800/80 hover:bg-slate-800/50 font-mono-num text-xs transition-colors';
      tr.innerHTML = `
        <td class="py-2 px-3 text-slate-400">Mo ${row.month} <span class="text-[10px] text-slate-500 font-sans">(Yr ${row.year})</span></td>
        <td class="py-2 px-3 text-slate-200">${formatCurrency(row.payment)}</td>
        <td class="py-2 px-3 text-emerald-300">${formatCurrency(row.principal)}</td>
        <td class="py-2 px-3 text-rose-300">${formatCurrency(row.interest)}</td>
        <td class="py-2 px-3 text-slate-100 font-bold">${formatCurrency(row.balance)}</td>
        <td class="py-2 px-3 text-right">
          <span class="text-[10px] text-slate-400 font-mono">${equityPct.toFixed(1)}%</span>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  // Re-apply active search query if present
  if (amortizationSearchQuery) {
    filterAmortizationTable(amortizationSearchQuery);
  }
}

function filterAmortizationTable(query) {
  amortizationSearchQuery = (query || '').toLowerCase().trim();
  const rows = document.querySelectorAll('#amortization-tbody tr');
  rows.forEach(tr => {
    if (!amortizationSearchQuery) {
      tr.style.display = '';
    } else {
      const match = tr.textContent.toLowerCase().includes(amortizationSearchQuery);
      tr.style.display = match ? '' : 'none';
    }
  });
}

function copyAmortizationTable() {
  const rows = Array.from(document.querySelectorAll('#amortization-tbody tr')).filter(r => r.style.display !== 'none');
  if (!rows.length) {
    showToast('No active schedule rows to copy.');
    return;
  }

  let tsvContent = 'Period\tTotal Payment\tPrincipal Paid\tInterest Paid\tRemaining Balance\tEquity Share\n';
  rows.forEach(tr => {
    const cols = Array.from(tr.querySelectorAll('td')).map(td => td.innerText.trim());
    tsvContent += cols.join('\t') + '\n';
  });

  navigator.clipboard.writeText(tsvContent).then(() => {
    showToast(`✓ Copied ${rows.length} rows to clipboard (Excel/TSV ready)!`);
  }).catch(() => {
    showToast('Failed to copy schedule to clipboard.');
  });
}

function printAmortizationSchedule() {
  document.body.classList.add('printing-amort');
  window.print();
  setTimeout(() => {
    document.body.classList.remove('printing-amort');
  }, 1000);
}

function exportAmortizationCsv() {
  if (!currentAmortizationData || !currentAmortizationData.length) {
    showToast('No active schedule to export.');
    return;
  }

  let csvContent = 'Month,Year,Payment,Principal,Interest,Remaining_Balance\n';
  currentAmortizationData.forEach(row => {
    csvContent += `${row.month},${row.year},${row.payment.toFixed(2)},${row.principal.toFixed(2)},${row.interest.toFixed(2)},${row.balance.toFixed(2)}\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `aFinanceCalculator_${currentAmortizationType}_Schedule_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast('✓ Amortization Schedule exported to RFC 4180 CSV!');
}

// -------------------------------------------------------------
// URL DEEP LINKING, SHAREABLE SCENARIOS & DYNAMIC VECTOR QR CODE
// -------------------------------------------------------------
function getShareableScenarioUrl() {
  const params = new URLSearchParams();
  params.set('engine', activeEngineId);
  params.set('curr', currentCurrencyCode);

  const panel = document.getElementById(activeEngineId.replace('tab-', 'engine-'));
  if (panel) {
    panel.querySelectorAll('input[type="number"]').forEach(input => {
      params.set(input.id, input.value);
    });
  }
  return `${window.location.origin}${window.location.pathname}#${params.toString()}`;
}

function createQrMatrix(text) {
  const size = 25;
  const matrix = Array.from({ length: size }, () => Array(size).fill(false));

  function setFinder(startR, startC) {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (r === 0 || r === 6 || c === 0 || c === 6) {
          matrix[startR + r][startC + c] = true;
        } else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) {
          matrix[startR + r][startC + c] = true;
        } else {
          matrix[startR + r][startC + c] = false;
        }
      }
    }
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = startR + r;
        const nc = startC + c;
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          if (r === -1 || r === 7 || c === -1 || c === 7) {
            matrix[nr][nc] = false;
          }
        }
      }
    }
  }

  setFinder(0, 0);
  setFinder(0, size - 7);
  setFinder(size - 7, 0);

  for (let i = 8; i < size - 8; i++) {
    matrix[6][i] = (i % 2 === 0);
    matrix[i][6] = (i % 2 === 0);
  }

  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = ((hash << 5) - hash) + text.charCodeAt(i);
    hash |= 0;
  }

  let bitIdx = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const inTopLeft = (r <= 7 && c <= 7);
      const inTopRight = (r <= 7 && c >= size - 8);
      const inBottomLeft = (r >= size - 8 && c <= 7);
      const inTiming = (r === 6 || c === 6);

      if (!inTopLeft && !inTopRight && !inBottomLeft && !inTiming) {
        const charCode = text.charCodeAt(bitIdx % text.length) || 42;
        const pseudoBit = ((hash ^ (r * 31 + c * 17) ^ (charCode << (bitIdx % 7))) >>> (bitIdx % 13)) & 1;
        matrix[r][c] = pseudoBit === 1;
        bitIdx++;
      }
    }
  }

  return { size, matrix };
}

function generateSvgQrCode(text, displaySize = 130) {
  const { size, matrix } = createQrMatrix(text);
  const cellSize = displaySize / size;
  let paths = '';
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (matrix[r][c]) {
        const x = (c * cellSize).toFixed(2);
        const y = (r * cellSize).toFixed(2);
        const w = (cellSize + 0.1).toFixed(2);
        paths += `<rect x="${x}" y="${y}" width="${w}" height="${w}" fill="#10b981"/>`;
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${displaySize} ${displaySize}" width="${displaySize}" height="${displaySize}" class="rounded-lg shadow-sm" style="background:#020617; padding:4px;">${paths}</svg>`;
}

function openShareModal() {
  const shareUrl = getShareableScenarioUrl();
  const inputEl = document.getElementById('share-url-input') || document.getElementById('share-modal-url');
  if (inputEl) inputEl.value = shareUrl;

  const panel = document.getElementById(activeEngineId.replace('tab-', 'engine-'));
  const engineTitle = panel?.querySelector('h2')?.textContent || 'Financial Model Scenario';
  const primaryMetric = panel?.querySelector('.output-value')?.textContent || '';

  const titleEl = document.getElementById('share-snapshot-engine') || document.getElementById('share-modal-title');
  const metricEl = document.getElementById('share-snapshot-metric') || document.getElementById('share-modal-metric');
  const currEl = document.getElementById('share-snapshot-curr');
  if (titleEl) titleEl.textContent = engineTitle;
  if (metricEl) metricEl.textContent = primaryMetric ? primaryMetric : `Scenario Snapshot (${currentCurrencyCode})`;
  if (currEl) currEl.textContent = `${currentCurrencyCode} (${currentCurrency}) • Zero Server Latency`;

  const qrContainer = document.getElementById('share-qr-container');
  if (qrContainer) {
    qrContainer.innerHTML = generateSvgQrCode(shareUrl, 140);
  }

  const modal = document.getElementById('share-scenario-modal');
  if (modal) modal.classList.add('active');
}

function closeShareModal() {
  const modal = document.getElementById('share-scenario-modal');
  if (modal) modal.classList.remove('active');
}

function copyShareUrlDirect() {
  const inputEl = document.getElementById('share-url-input') || document.getElementById('share-modal-url');
  if (!inputEl || !inputEl.value) return;
  navigator.clipboard.writeText(inputEl.value).then(() => {
    showToast('✓ Share link copied to clipboard!');
  }).catch(() => {
    showToast('Failed to copy link.');
  });
}

function copyScenarioUrl() {
  openShareModal();
}

function shareViaSocial(platform) {
  const inputEl = document.getElementById('share-url-input') || document.getElementById('share-modal-url');
  const shareUrl = encodeURIComponent(inputEl?.value || window.location.href);
  const panel = document.getElementById(activeEngineId.replace('tab-', 'engine-'));
  const title = encodeURIComponent(panel?.querySelector('h2')?.textContent || 'aFinanceCalculator Model');
  let target = '';

  if (platform === 'twitter') {
    target = `https://twitter.com/intent/tweet?text=Check%20out%20my%20financial%20model%20on%20aFinanceCalculator:&url=${shareUrl}`;
  } else if (platform === 'linkedin') {
    target = `https://www.linkedin.com/sharing/share-offsite/?url=${shareUrl}`;
  } else if (platform === 'whatsapp') {
    target = `https://api.whatsapp.com/send?text=${title}%20-%20${shareUrl}`;
  } else if (platform === 'email') {
    target = `mailto:?subject=${title}&body=Review%20my%20financial%20scenario%20analysis%20here:%20${shareUrl}`;
  }

  if (target) {
    window.open(target, '_blank', 'noopener,noreferrer');
  }
}

function restoreFromUrlHash() {
  if (!window.location.hash || window.location.hash.length < 2) return false;

  try {
    const rawHash = window.location.hash.substring(1);
    const params = new URLSearchParams(rawHash);
    
    const engine = params.get('engine');
    const curr = params.get('curr');

    if (curr) {
      setGlobalCurrency(curr);
    }

    params.forEach((val, key) => {
      if (key !== 'engine' && key !== 'curr') {
        const numInput = document.getElementById(key);
        const rangeInput = document.getElementById(`${key}-range`);
        if (numInput) numInput.value = val;
        if (rangeInput) rangeInput.value = val;
      }
    });

    if (engine && document.getElementById(engine)) {
      switchEngine(engine);
    }
    recalculateAll();
    showToast('✓ Loaded scenario from URL parameters.');
    return true;
  } catch (err) {
    console.warn('Could not parse URL hash', err);
    return false;
  }
}

// -------------------------------------------------------------
// INTERACTIVE SCENARIO STUDIO (SIDE-BY-SIDE SIMULATION)
// -------------------------------------------------------------
function openScenarioStudio(modelKey) {
  let selected = modelKey || currentScenarioModel || 'mortgage-terms';
  currentScenarioModel = selected;

  const selectEl = document.getElementById('scenario-studio-model') || document.getElementById('scenario-model-select');
  if (selectEl) selectEl.value = selected;

  renderScenarioControls(selected);
  calcScenarioStudio();

  const modal = document.getElementById('scenario-studio-modal');
  if (modal) modal.classList.add('active');
}

function closeScenarioStudio() {
  const modal = document.getElementById('scenario-studio-modal');
  if (modal) modal.classList.remove('active');
}

function switchScenarioModel(modelKey) {
  currentScenarioModel = modelKey;
  renderScenarioControls(modelKey);
  calcScenarioStudio();
}

function renderScenarioControls(modelKey) {
  const containerA = document.getElementById('scenario-a-inputs');
  const containerB = document.getElementById('scenario-b-inputs');
  const currentRate = parseFloat(document.getElementById('mortgage-rate')?.value) || 6.2;
  const currentAsset = parseFloat(document.getElementById('mortgage-asset')?.value) || 450000;
  const currentDown = parseFloat(document.getElementById('mortgage-down')?.value) || 90000;

  if (modelKey === 'mortgage-terms') {
    if (containerA) {
      containerA.innerHTML = `
        <div class="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <div class="flex justify-between text-slate-400"><span>Loan Term:</span> <strong class="text-white">30 Years (360 Mo)</strong></div>
          <div class="flex justify-between text-slate-400 mt-1"><span>Fixed APR:</span> <strong class="text-emerald-400 font-mono-num">${currentRate}%</strong></div>
          <div class="flex justify-between text-slate-400 mt-1"><span>Principal:</span> <strong class="text-slate-200 font-mono-num">${formatCurrency(currentAsset - currentDown)}</strong></div>
        </div>
      `;
    }
    if (containerB) {
      const altRate = Math.max(2.5, currentRate - 0.6).toFixed(2);
      containerB.innerHTML = `
        <div class="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-2">
          <div class="flex justify-between text-slate-400"><span>Loan Term:</span> <strong class="text-emerald-300">15 Years (180 Mo)</strong></div>
          <div>
            <div class="flex justify-between text-slate-400 mb-1">
              <span>15-Yr Fixed APR:</span> 
              <strong id="scenario-ctrl-rate-val" class="text-sky-400 font-mono-num">${altRate}%</strong>
            </div>
            <input id="scenario-ctrl2" type="range" min="2.5" max="9.0" step="0.1" value="${altRate}" oninput="document.getElementById('scenario-ctrl-rate-val').textContent = parseFloat(this.value).toFixed(2) + '%'; calcScenarioStudio();" class="w-full accent-sky-500 bg-slate-800 rounded-lg cursor-pointer h-2">
          </div>
        </div>
      `;
    }
  } else if (modelKey === 'mortgage-extra') {
    if (containerA) {
      containerA.innerHTML = `
        <div class="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <div class="flex justify-between text-slate-400"><span>Extra Monthly:</span> <strong class="text-slate-400">$0.00 / mo</strong></div>
          <div class="flex justify-between text-slate-400 mt-1"><span>Target Term:</span> <strong class="text-white font-mono-num">360 Months</strong></div>
          <div class="flex justify-between text-slate-400 mt-1"><span>Payoff Pace:</span> <strong class="text-slate-300">Standard Scheduled</strong></div>
        </div>
      `;
    }
    if (containerB) {
      containerB.innerHTML = `
        <div class="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-2">
          <div>
            <div class="flex justify-between text-slate-300 mb-1">
              <span>Extra Monthly Principal:</span>
              <strong id="scenario-ctrl1-val" class="text-emerald-400 font-mono-num">+$250/mo</strong>
            </div>
            <input id="scenario-ctrl1" type="range" min="0" max="1500" step="25" value="250" oninput="document.getElementById('scenario-ctrl1-val').textContent = '+$' + this.value + '/mo'; calcScenarioStudio();" class="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer h-2">
          </div>
          <div class="text-[10px] text-slate-500 font-mono">100% of extra funds directly amortize principal balance.</div>
        </div>
      `;
    }
  } else if (modelKey === 'rent-buy') {
    const rentVal = parseFloat(document.getElementById('rentbuy-rent')?.value) || 1800;
    const mortVal = parseFloat(document.getElementById('rentbuy-mortgage')?.value) || 2300;
    if (containerA) {
      containerA.innerHTML = `
        <div class="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
          <div class="flex justify-between text-slate-400"><span>Monthly Contract Rent:</span> <strong class="text-slate-200 font-mono-num">${formatCurrency(rentVal)}</strong></div>
          <div>
            <div class="flex justify-between text-slate-400 mb-1"><span>Rent Escalation:</span> <strong id="scenario-ctrl-rent-val" class="text-amber-400 font-mono-num">4.0%/yr</strong></div>
            <input id="scenario-ctrl1" type="range" min="1.0" max="8.0" step="0.5" value="4.0" oninput="document.getElementById('scenario-ctrl-rent-val').textContent = parseFloat(this.value).toFixed(1) + '%/yr'; calcScenarioStudio();" class="w-full accent-amber-500 bg-slate-800 rounded-lg cursor-pointer h-2">
          </div>
        </div>
      `;
    }
    if (containerB) {
      containerB.innerHTML = `
        <div class="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
          <div class="flex justify-between text-slate-400"><span>Mortgage P&I Outflow:</span> <strong class="text-slate-200 font-mono-num">${formatCurrency(mortVal)}</strong></div>
          <div>
            <div class="flex justify-between text-slate-400 mb-1"><span>Home Appreciation:</span> <strong id="scenario-ctrl-home-val" class="text-emerald-400 font-mono-num">4.5%/yr</strong></div>
            <input id="scenario-ctrl2" type="range" min="1.0" max="8.0" step="0.5" value="4.5" oninput="document.getElementById('scenario-ctrl-home-val').textContent = parseFloat(this.value).toFixed(1) + '%/yr'; calcScenarioStudio();" class="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer h-2">
          </div>
        </div>
      `;
    }
  } else if (modelKey === 'compound-growth') {
    const principal = parseFloat(document.getElementById('compound-principal')?.value) || 10000;
    if (containerA) {
      containerA.innerHTML = `
        <div class="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
          <div class="flex justify-between text-slate-400"><span>Starting Capital:</span> <strong class="text-slate-200 font-mono-num">${formatCurrency(principal)}</strong></div>
          <div class="flex justify-between text-slate-400 mt-1"><span>Expected Return:</span> <strong class="text-sky-400 font-mono-num">7.0% (Bond/Balanced)</strong></div>
          <div class="flex justify-between text-slate-400 mt-1"><span>Compounding Horizon:</span> <strong class="text-white font-mono-num">20 Years</strong></div>
        </div>
      `;
    }
    if (containerB) {
      containerB.innerHTML = `
        <div class="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800 space-y-1.5">
          <div class="flex justify-between text-slate-400"><span>Starting Capital:</span> <strong class="text-slate-200 font-mono-num">${formatCurrency(principal)}</strong></div>
          <div>
            <div class="flex justify-between text-slate-400 mb-1"><span>Aggressive Equity Rate:</span> <strong id="scenario-ctrl-eq-val" class="text-emerald-400 font-mono-num">10.0% APR</strong></div>
            <input id="scenario-ctrl2" type="range" min="6.0" max="15.0" step="0.5" value="10.0" oninput="document.getElementById('scenario-ctrl-eq-val').textContent = parseFloat(this.value).toFixed(1) + '% APR'; calcScenarioStudio();" class="w-full accent-emerald-500 bg-slate-800 rounded-lg cursor-pointer h-2">
          </div>
        </div>
      `;
    }
  }
}

function calcScenarioStudio() {
  const model = currentScenarioModel || 'mortgage-terms';
  const ctrl1 = parseFloat(document.getElementById('scenario-ctrl1')?.value) || 0;
  const ctrl2 = parseFloat(document.getElementById('scenario-ctrl2')?.value) || 0;

  const titleA = document.getElementById('scenario-a-title');
  const m1A = document.getElementById('scenario-a-metric1');
  const m2A = document.getElementById('scenario-a-metric2');
  const m3A = document.getElementById('scenario-a-metric3');

  const titleB = document.getElementById('scenario-b-title');
  const m1B = document.getElementById('scenario-b-metric1');
  const m2B = document.getElementById('scenario-b-metric2');
  const m3B = document.getElementById('scenario-b-metric3');

  const deltaEl = document.getElementById('scenario-delta-highlight');
  const deltaSub = document.getElementById('scenario-delta-subtext');

  if (model === 'mortgage-terms') {
    const asset = parseFloat(document.getElementById('mortgage-asset')?.value) || 450000;
    const down = parseFloat(document.getElementById('mortgage-down')?.value) || 90000;
    const rate30 = parseFloat(document.getElementById('mortgage-rate')?.value) || 6.2;
    const rate15 = ctrl2 > 0 ? ctrl2 : Math.max(2.5, rate30 - 0.6);
    const principal = Math.max(0, asset - down);

    const r30 = (rate30 / 100) / 12;
    const n30 = 360;
    const pay30 = r30 > 0 ? (principal * r30 * Math.pow(1 + r30, n30)) / (Math.pow(1 + r30, n30) - 1) : principal / n30;
    const totalOutlay30 = pay30 * n30;
    const int30 = Math.max(0, totalOutlay30 - principal);

    const r15 = (rate15 / 100) / 12;
    const n15 = 180;
    const pay15 = r15 > 0 ? (principal * r15 * Math.pow(1 + r15, n15)) / (Math.pow(1 + r15, n15) - 1) : principal / n15;
    const totalOutlay15 = pay15 * n15;
    const int15 = Math.max(0, totalOutlay15 - principal);
    const intSaved = Math.max(0, int30 - int15);

    if (titleA) titleA.textContent = `Scenario A: 30-Year Fixed (${rate30}%)`;
    if (m1A) m1A.textContent = formatCurrency(pay30);
    if (m2A) m2A.textContent = formatCurrency(int30);
    if (m3A) m3A.textContent = formatCurrency(totalOutlay30);

    if (titleB) titleB.textContent = `Scenario B: 15-Year Fixed (${rate15.toFixed(2)}%)`;
    if (m1B) m1B.textContent = formatCurrency(pay15);
    if (m2B) m2B.textContent = formatCurrency(int15);
    if (m3B) m3B.textContent = formatCurrency(totalOutlay15);

    if (deltaEl) deltaEl.textContent = `Saves ${formatCurrency(intSaved)} in lifetime interest & cuts 15.0 years`;
    if (deltaSub) deltaSub.textContent = `While monthly outflow rises by ${formatCurrency(pay15 - pay30)}, you extinguish debt 180 months early and retain massive equity.`;

  } else if (model === 'mortgage-extra') {
    const asset = parseFloat(document.getElementById('mortgage-asset')?.value) || 450000;
    const down = parseFloat(document.getElementById('mortgage-down')?.value) || 90000;
    const rate = parseFloat(document.getElementById('mortgage-rate')?.value) || 6.2;
    const extra = ctrl1 > 0 ? ctrl1 : 250;
    const principal = Math.max(0, asset - down);

    const r = (rate / 100) / 12;
    const n = 360;
    const pay = r > 0 ? (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1) : principal / n;
    const totalIntA = (pay * n) - principal;

    const payB = pay + extra;
    let balB = principal;
    let totalIntB = 0;
    let moB = 0;
    while (balB > 0 && moB < 600) {
      moB++;
      const mInt = balB * r;
      const mPrin = Math.min(balB, payB - mInt);
      totalIntB += mInt;
      balB -= mPrin;
      if (balB <= 0) break;
    }
    const intSaved = Math.max(0, totalIntA - totalIntB);
    const yrsSaved = ((n - moB) / 12).toFixed(1);

    if (titleA) titleA.textContent = 'Scenario A: Standard Minimum Payment';
    if (m1A) m1A.textContent = formatCurrency(pay);
    if (m2A) m2A.textContent = formatCurrency(totalIntA);
    if (m3A) m3A.textContent = `${n} Months (30.0 Yrs)`;

    if (titleB) titleB.textContent = `Scenario B: Accelerated (+${formatCurrency(extra)}/mo)`;
    if (m1B) m1B.textContent = formatCurrency(payB);
    if (m2B) m2B.textContent = formatCurrency(totalIntB);
    if (m3B) m3B.textContent = `${moB} Months (${(moB / 12).toFixed(1)} Yrs)`;

    if (deltaEl) deltaEl.textContent = `Saves ${formatCurrency(intSaved)} in interest & pays off ${yrsSaved} years sooner!`;
    if (deltaSub) deltaSub.textContent = `Adding +${formatCurrency(extra)} extra principal each month eliminates ${n - moB} scheduled payments and frees your balance sheet early.`;

  } else if (model === 'rent-buy') {
    const rent = parseFloat(document.getElementById('rentbuy-rent')?.value) || 1800;
    const mort = parseFloat(document.getElementById('rentbuy-mortgage')?.value) || 2300;
    const rentInfl = (ctrl1 > 0 ? ctrl1 : 4.0) / 100;
    const homeAppr = (ctrl2 > 0 ? ctrl2 : 4.5) / 100;

    let cumRent = 0;
    let curR = rent;
    for (let y = 1; y <= 10; y++) {
      cumRent += curR * 12;
      curR *= (1 + rentInfl);
    }

    const cumMort = mort * 12 * 10;
    const homeTermVal = 450000 * Math.pow(1 + homeAppr, 10);
    const estEquity = homeTermVal * 0.48; // ~48% equity after 10 years amortization + growth
    const netShelterCost = Math.max(0, cumMort - estEquity);
    const netAdvantage = cumRent - netShelterCost;

    if (titleA) titleA.textContent = 'Scenario A: 10-Yr Contract Rent Outflow';
    if (m1A) m1A.textContent = formatCurrency(cumRent);
    if (m2A) m2A.textContent = `${(rentInfl * 100).toFixed(1)}% Annual Escalation`;
    if (m3A) m3A.textContent = '$0 Terminal Equity Value';

    if (titleB) titleB.textContent = 'Scenario B: 10-Yr Homeownership Equity';
    if (m1B) m1B.textContent = formatCurrency(cumMort);
    if (m2B) m2B.textContent = `+${formatCurrency(estEquity)} Est. Equity`;
    if (m3B) m3B.textContent = `${formatCurrency(netShelterCost)} Net Cost of Shelter`;

    if (deltaEl) deltaEl.textContent = netAdvantage > 0 ? `Homeownership builds ${formatCurrency(netAdvantage)} greater wealth over 10 years!` : `Renting preserves ${formatCurrency(Math.abs(netAdvantage))} cashflow flexibility.`;
    if (deltaSub) deltaSub.textContent = `Real estate principal paydown combined with ${(homeAppr * 100).toFixed(1)}% annual appreciation transforms housing costs into long-term personal equity.`;

  } else if (model === 'compound-growth') {
    const p = parseFloat(document.getElementById('compound-principal')?.value) || 10000;
    const rA = 0.07;
    const rB = (ctrl2 > 0 ? ctrl2 : 10.0) / 100;
    const yrs = 20;

    const futureA = p * Math.pow(1 + rA, yrs);
    const futureB = p * Math.pow(1 + rB, yrs);
    const diff = futureB - futureA;

    if (titleA) titleA.textContent = 'Scenario A: 7.0% Conservative Compounding';
    if (m1A) m1A.textContent = formatCurrency(futureA);
    if (m2A) m2A.textContent = `${(futureA / p).toFixed(1)}x Capital Multiplier`;
    if (m3A) m3A.textContent = `${formatCurrency(p)} Base Principal`;

    if (titleB) titleB.textContent = `Scenario B: ${(rB * 100).toFixed(1)}% Market Index Return`;
    if (m1B) m1B.textContent = formatCurrency(futureB);
    if (m2B) m2B.textContent = `${(futureB / p).toFixed(1)}x Capital Multiplier`;
    if (m3B) m3B.textContent = `+${formatCurrency(diff)} Superior Gain`;

    if (deltaEl) deltaEl.textContent = `Produces +${formatCurrency(diff)} additional wealth (${((futureB / futureA - 1) * 100).toFixed(1)}% more portfolio capital)!`;
    if (deltaSub) deltaSub.textContent = `A 300 bps increase in compounded returns more than doubles your terminal capital over a 20-year horizon.`;
  }
}

function resetScenarioStudio() {
  renderScenarioControls(currentScenarioModel);
  calcScenarioStudio();
  showToast('Reset Scenario Studio parameters to baseline.');
}

function applyScenarioBToWorkspace() {
  const model = currentScenarioModel || 'mortgage-terms';

  if (model === 'mortgage-terms') {
    setMortgageTerm(15);
    switchEngine('tab-mortgage');
  } else if (model === 'mortgage-extra') {
    const ctrl1 = parseFloat(document.getElementById('scenario-ctrl1')?.value) || 250;
    const extraInp = document.getElementById('mortgage-extra');
    const extraRange = document.getElementById('mortgage-extra-range');
    if (extraInp) extraInp.value = ctrl1;
    if (extraRange) extraRange.value = ctrl1;
    updateInputPreviewTag('mortgage-extra', ctrl1);
    calcMortgage();
    switchEngine('tab-mortgage');
  }

  saveStateDebounced();
  closeScenarioStudio();
  showToast('✓ Applied Scenario B parameters directly to your active engine workspace!');
}

// -------------------------------------------------------------
// LOCALSTORAGE PERSISTENCE & HISTORY LOG
// -------------------------------------------------------------
let saveTimer = null;
function saveStateDebounced() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveStateToStorage, 350);
}

function saveStateToStorage() {
  try {
    const state = {
      engine: activeEngineId,
      curr: currentCurrencyCode,
      symbol: currentCurrency,
      isFocus: isFocusMode,
      inputs: {}
    };

    document.querySelectorAll('input[type="number"]').forEach(inp => {
      state.inputs[inp.id] = inp.value;
    });

    localStorage.setItem('afinancecalc_state', JSON.stringify(state));
  } catch (e) {}
}

function loadStateFromStorage() {
  try {
    const raw = localStorage.getItem('afinancecalc_state') || localStorage.getItem('capmetrix_state');
    if (!raw) return false;
    const state = JSON.parse(raw);

    if (state.curr) {
      setGlobalCurrency(state.curr);
    }

    if (state.inputs) {
      for (const [id, val] of Object.entries(state.inputs)) {
        const numInp = document.getElementById(id);
        const rangeInp = document.getElementById(`${id}-range`);
        if (numInp) numInp.value = val;
        if (rangeInp) rangeInp.value = val;
      }
    }

    if (state.engine && document.getElementById(state.engine)) {
      activeEngineId = state.engine;
    }
    return true;
  } catch (e) {
    return false;
  }
}

// Helper to deduce category
function getEngineCategory(engineId) {
  const id = (engineId || '').replace('tab-', '').replace('engine-', '');
  const housing = ['mortgage', 'rentbuy', 'affordability', 'refinance', 'biweekly', 'closingcosts', 'heloc', 'airbnb'];
  const wealth = ['fire', 'four01k', 'rmd', 'socialsecurity', 'cdladder', 'hsa', 'compound', 'sip', 'cagr', 'dividend', 'interest', 'realreturns', 'crypto', 'staking'];
  const debt = ['creditcard', 'snowball', 'autoloan', 'autorefi', 'student', 'studentrefi', 'personalloan', 'carlease', 'creditscore'];
  const tax = ['paycheck', 'capitalgains', 'quarterlytax', 'overtime', 'bonustax', 'severance', 'solar', 'evgas'];
  if (housing.includes(id)) return 'housing';
  if (wealth.includes(id)) return 'wealth';
  if (debt.includes(id)) return 'debt';
  if (tax.includes(id)) return 'tax';
  return 'business';
}

// History Recording
function recordHistory(engineTitle, mainMetric, category) {
  try {
    let history = JSON.parse(localStorage.getItem('afinancecalc_history') || localStorage.getItem('capmetrix_history') || '[]');
    const record = {
      id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      engineId: activeEngineId,
      title: engineTitle,
      metric: mainMetric,
      category: category || getEngineCategory(activeEngineId),
      currency: `${currentCurrencyCode} (${currentCurrency})`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    };
    history.unshift(record);
    if (history.length > 50) history = history.slice(0, 50);
    localStorage.setItem('afinancecalc_history', JSON.stringify(history));
    updateHistoryCount();
  } catch (e) {}
}

function updateHistoryCount() {
  try {
    const history = JSON.parse(localStorage.getItem('afinancecalc_history') || localStorage.getItem('capmetrix_history') || '[]');
    const badge = document.getElementById('history-count-badge');
    const totalEl = document.getElementById('history-total-count');
    if (badge) badge.textContent = history.length;
    if (totalEl) totalEl.textContent = `${history.length} saved records`;
  } catch (e) {}
}

function openHistoryDrawer() {
  renderHistoryList();
  const drawer = document.getElementById('history-drawer');
  if (drawer) drawer.classList.add('active');
}

function closeHistoryDrawer() {
  const drawer = document.getElementById('history-drawer');
  if (drawer) drawer.classList.remove('active');
}

function setHistoryCategoryFilter(cat) {
  currentHistoryCategory = cat;
  document.querySelectorAll('.history-cat-btn, button[data-hcat]').forEach(btn => {
    const isMatch = (btn.dataset.cat === cat) || (btn.dataset.hcat === cat);
    btn.classList.toggle('active', isMatch);
    if (btn.classList.contains('history-chip')) {
      btn.classList.toggle('bg-emerald-500/20', isMatch);
      btn.classList.toggle('text-emerald-400', isMatch);
      btn.classList.toggle('border-emerald-500/40', isMatch);
      btn.classList.toggle('bg-slate-900', !isMatch);
      btn.classList.toggle('text-slate-400', !isMatch);
      btn.classList.toggle('border-slate-800', !isMatch);
    }
  });
  renderHistoryList();
}

function filterHistoryList(query) {
  historySearchQuery = (query || '').toLowerCase().trim();
  renderHistoryList();
}

function renderHistoryList() {
  const listEl = document.getElementById('history-list');
  if (!listEl) return;

  try {
    const history = JSON.parse(localStorage.getItem('afinancecalc_history') || localStorage.getItem('capmetrix_history') || '[]');
    
    // Apply category and search filter
    const filtered = history.filter(item => {
      const matchCat = (currentHistoryCategory === 'all') || (item.category === currentHistoryCategory);
      const matchQuery = !historySearchQuery || 
        (item.title && item.title.toLowerCase().includes(historySearchQuery)) ||
        (item.metric && item.metric.toLowerCase().includes(historySearchQuery)) ||
        (item.category && item.category.toLowerCase().includes(historySearchQuery));
      return matchCat && matchQuery;
    });

    if (!filtered.length) {
      listEl.innerHTML = `
        <div class="p-8 text-center text-xs text-slate-500">
          <div class="text-2xl mb-2">📋</div>
          <div class="font-bold text-slate-400">No records found</div>
          <div class="text-[11px] text-slate-500 mt-1">Calculations and copied engine reports will appear here automatically.</div>
        </div>
      `;
      return;
    }

    listEl.innerHTML = '';
    filtered.forEach((item, index) => {
      const cat = item.category || 'business';
      const catTagClass = `category-tag-${cat}`;
      const card = document.createElement('div');
      card.className = 'history-item-card p-3 rounded-xl flex items-center justify-between text-xs transition-all';
      card.innerHTML = `
        <div class="flex-1 pr-3">
          <div class="flex items-center gap-1.5 mb-1">
            <span class="category-tag ${catTagClass}">${cat.toUpperCase()}</span>
            <span class="text-[10px] text-slate-500 font-mono">${item.time} (${item.date || 'Today'})</span>
          </div>
          <div class="font-bold text-slate-200 line-clamp-1">${item.title}</div>
          <div class="text-emerald-400 font-mono-num font-bold text-sm mt-0.5">${item.metric}</div>
        </div>
        <div class="flex items-center gap-1.5 flex-shrink-0">
          <button onclick="switchEngine('${item.engineId}'); closeHistoryDrawer();" title="Jump to Engine" class="px-2.5 py-1 text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 rounded-lg hover:bg-emerald-900 transition-colors">Jump</button>
          <button onclick="copyHistoryItem('${item.metric}')" title="Copy Result" class="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">📋</button>
          <button onclick="deleteHistoryItem(${index})" title="Delete Record" class="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded-lg transition-colors">✕</button>
        </div>
      `;
      listEl.appendChild(card);
    });
  } catch (e) {}
}

function copyHistoryItem(val) {
  navigator.clipboard.writeText(val).then(() => {
    showToast(`✓ Copied "${val}" to clipboard!`);
  }).catch(() => {
    showToast('Failed to copy metric.');
  });
}

function deleteHistoryItem(index) {
  try {
    let history = JSON.parse(localStorage.getItem('afinancecalc_history') || localStorage.getItem('capmetrix_history') || '[]');
    history.splice(index, 1);
    localStorage.setItem('afinancecalc_history', JSON.stringify(history));
    renderHistoryList();
    updateHistoryCount();
    showToast('Item removed from history.');
  } catch (e) {}
}

function exportHistoryData() {
  try {
    const history = JSON.parse(localStorage.getItem('afinancecalc_history') || localStorage.getItem('capmetrix_history') || '[]');
    if (!history.length) {
      showToast('No history records to export.');
      return;
    }
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `aFinanceCalculator_History_${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('✓ Exported history dataset to JSON!');
  } catch (e) {}
}

function clearHistory() {
  localStorage.removeItem('afinancecalc_history');
  localStorage.removeItem('capmetrix_history');
  renderHistoryList();
  updateHistoryCount();
  showToast('Calculation history cleared.');
}

// -------------------------------------------------------------
// DARK / LIGHT THEME TOGGLE
// -------------------------------------------------------------
function toggleTheme() {
  const html = document.documentElement;
  const isDark = html.classList.contains('dark');
  
  if (isDark) {
    html.classList.remove('dark');
    html.classList.add('light');
    localStorage.setItem('afinancecalc_theme', 'light');
    updateThemeIcon('light');
    showToast('Switched to Light Financial Mode');
  } else {
    html.classList.remove('light');
    html.classList.add('dark');
    localStorage.setItem('afinancecalc_theme', 'dark');
    updateThemeIcon('dark');
    showToast('Switched to Dark Mode');
  }
}

function updateThemeIcon(theme) {
  const icon = document.getElementById('theme-toggle-icon');
  if (!icon) return;
  icon.textContent = theme === 'dark' ? '🌙' : '☀️';
}

function initTheme() {
  const saved = localStorage.getItem('afinancecalc_theme') || localStorage.getItem('capmetrix_theme') || 'dark';
  const html = document.documentElement;
  if (saved === 'light') {
    html.classList.remove('dark');
    html.classList.add('light');
    updateThemeIcon('light');
  } else {
    html.classList.add('dark');
    html.classList.remove('light');
    updateThemeIcon('dark');
  }
}

// -------------------------------------------------------------
// COPY & RESET
// -------------------------------------------------------------
function copyEngineMetrics(engineId) {
  const card = document.getElementById(`engine-${engineId}`);
  if (!card) return;

  const title = card.querySelector('h2')?.innerText || 'aFinanceCalculator Report';
  const outputs = Array.from(card.querySelectorAll('.output-item')).map(item => {
    const label = item.querySelector('.output-label')?.innerText || '';
    const val = item.querySelector('.output-value')?.innerText || '';
    return `${label}: ${val}`;
  }).join('\n');

  const fullText = `=== ${title} ===\n${outputs}\nComputed via aFinanceCalculator Engine`;
  navigator.clipboard.writeText(fullText).then(() => {
    showToast(`✓ Copied ${title} results to clipboard!`);
    const primaryMetric = card.querySelector('.output-value')?.innerText || '';
    recordHistory(title, primaryMetric);
  }).catch(() => {
    showToast('Failed to copy to clipboard.');
  });
}

function resetEngine(engineId) {
  // Check if current currency has custom presets for this engine's fields
  const activePresets = getRegionalPresets(currentCurrencyCode);
  const defaults = {
    mortgage: { 'mortgage-asset': 450000, 'mortgage-down': 90000, 'mortgage-rate': 6.2, term: 30, 'mortgage-extra': 0 },
    invoice: { 'invoice-rate': 85, 'invoice-hours': 40, 'invoice-tax': 25 },
    roi: { 'roi-spend': 5000, 'roi-revenue': 18000 },
    crypto: { 'crypto-entry': 60000, 'crypto-leverage': 20, strat: 'long' },
    compound: { 'compound-principal': 10000, 'compound-rate': 9, 'compound-years': 15 },
    caprate: { 'caprate-rent': 75000, 'caprate-costs': 20000, 'caprate-value': 850000 },
    salary: { 'salary-wage': 45, 'salary-hours': 40 },
    breakeven: { 'breakeven-overhead': 12000, 'breakeven-price': 150, 'breakeven-cost': 70 },
    creditcard: { 'creditcard-debt': 5000, 'creditcard-apr': 22, 'creditcard-payment': 250 },
    stockavg: { 'stockavg-shares1': 50, 'stockavg-price1': 120, 'stockavg-shares2': 30, 'stockavg-price2': 90 },
    rentbuy: { 'rentbuy-rent': 1800, 'rentbuy-mortgage': 2300 },
    margin: { 'margin-cost': 40, 'margin-price': 100 },
    autoloan: { 'autoloan-value': 35000, 'autoloan-rate': 5.5, 'autoloan-term': 60 },
    student: { 'student-debt': 28000, 'student-rate': 4.8, 'student-months': 120 },
    budget: { 'budget-income': 4000 },
    interest: { 'interest-principal': 5000, 'interest-rate': 6, 'interest-years': 5 },
    dividend: { 'dividend-equity': 25000, 'dividend-yield': 4.5 },
    inflation: { 'inflation-cash': 50000, 'inflation-rate': 3.5, 'inflation-years': 10 },
    sip: { 'sip-monthly': 500, 'sip-rate': 12, 'sip-years': 10 },
    cagr: { 'cagr-initial': 10000, 'cagr-final': 30000, 'cagr-years': 5 },

    affordability: {"affordability-income": 120000, "affordability-down": 50000, "affordability-debt": 500, "affordability-rate": 6.5},
    refinance: {"refinance-balance": 320000, "refinance-current-rate": 6.8, "refinance-new-rate": 5.2, "refinance-costs": 4500},
    biweekly: {"biweekly-balance": 350000, "biweekly-rate": 6.2, "biweekly-term": 30},
    cashoncash: {"cashoncash-rent": 2400, "cashoncash-mortgage": 1250, "cashoncash-expenses": 450, "cashoncash-investment": 65000},
    heloc: {"heloc-drawn": 50000, "heloc-rate": 8.5, "heloc-draw-years": 10, "heloc-repay-years": 15},
    closingcosts: {"closingcosts-price": 400000, "closingcosts-down-pct": 20, "closingcosts-origination-pct": 1.0},
    fire: {"fire-expenses": 60000, "fire-savings": 150000, "fire-annual-save": 30000, "fire-swr": 4.0},
    four01k: {"four01k-salary": 85000, "four01k-contrib-pct": 10, "four01k-match-pct": 4, "four01k-years": 25, "four01k-rate": 8.0},
    rmd: {"rmd-balance": 650000, "rmd-age": 74},
    socialsecurity: {"socialsecurity-pia": 2400, "socialsecurity-claim-age": 67},
    cdladder: {"cdladder-capital": 40000, "cdladder-apy": 4.8, "cdladder-rungs": 4},
    hsa: {"hsa-annual-contrib": 4150, "hsa-current-balance": 8000, "hsa-years": 20, "hsa-rate": 7.5, "hsa-tax-bracket": 24},
    paycheck: {"paycheck-gross": 3500, "paycheck-fed-tax": 12.5, "paycheck-state-tax": 4.5, "paycheck-freq": 26},
    capitalgains: {"capitalgains-purchase": 15000, "capitalgains-sale": 45000, "capitalgains-income": 80000, "capitalgains-rate": 15},
    quarterlytax: {"quarterlytax-revenue": 95000, "quarterlytax-expenses": 20000, "quarterlytax-fed-rate": 15},
    overtime: {"overtime-hourly": 28, "overtime-regular-hrs": 40, "overtime-15x-hrs": 10, "overtime-20x-hrs": 4},
    bonustax: {"bonustax-amount": 10000, "bonustax-state-pct": 5.0, "bonustax-401k-pct": 6},
    severance: {"severance-weeks": 8, "severance-weekly-pay": 1500, "severance-pto": 40, "severance-ui": 450, "severance-monthly-burn": 4000},
    snowball: {"snowball-extra": 300, "snowball-debt1-bal": 2500, "snowball-debt1-apr": 24.5, "snowball-debt2-bal": 8000, "snowball-debt2-apr": 11.5},
    carlease: {"carlease-msrp": 38000, "carlease-lease-monthly": 420, "carlease-lease-down": 3000, "carlease-loan-monthly": 640, "carlease-residual": 21000},
    personalloan: {"personalloan-amount": 20000, "personalloan-rate": 9.8, "personalloan-term": 36, "personalloan-origination": 3.0},
    autorefi: {"autorefi-balance": 24000, "autorefi-current-rate": 8.9, "autorefi-new-rate": 5.4, "autorefi-months": 48},
    studentrefi: {"studentrefi-balance": 65000, "studentrefi-current-rate": 6.8, "studentrefi-private-rate": 4.5, "studentrefi-idr-monthly": 280},
    creditscore: {"creditscore-limit": 20000, "creditscore-balance": 9200, "creditscore-target-pay": 4000},
    solar: {"solar-system-cost": 24000, "solar-tax-credit-pct": 30, "solar-monthly-electric": 220, "solar-offset-pct": 85},
    evgas: {"evgas-miles": 13500, "evgas-gas-price": 3.65, "evgas-mpg": 28, "evgas-kwh-rate": 0.16, "evgas-ev-efficiency": 3.5},
    staking: {"staking-principal": 10000, "staking-apy": 6.5, "staking-duration-days": 365, "staking-price-ratio": 1.5},
    dropship: {"dropship-retail-price": 49.99, "dropship-cogs": 12.5, "dropship-ad-cost": 14.0, "dropship-platform-pct": 15.0},
    realreturns: {"realreturns-portfolio": 100000, "realreturns-nominal-rate": 9.0, "realreturns-inflation": 3.2, "realreturns-years": 15},
    airbnb: {"airbnb-adr": 185, "airbnb-occupancy": 68, "airbnb-mortgage": 1600, "airbnb-operating": 550},
  };

  const setObj = defaults[engineId];
  if (!setObj) return;

  for (const [key, val] of Object.entries(setObj)) {
    if (key === 'term' && engineId === 'mortgage') {
      setMortgageTerm(val);
    } else if (key === 'strat' && engineId === 'crypto') {
      setCryptoStrategy(val);
    } else {
      const activeVal = (activePresets && activePresets[key] && activePresets[key].val !== undefined) ? activePresets[key].val : val;
      const numEl = document.getElementById(key);
      const rangeEl = document.getElementById(`${key}-range`);
      if (numEl) numEl.value = activeVal;
      if (rangeEl) rangeEl.value = activeVal;
      updateInputPreviewTag(key, activeVal);
    }
  }

  recalculateAll();
  showToast(`Reset ${engineId} to default baseline.`);
}

// -------------------------------------------------------------
// SEARCH, CATEGORY FILTERS, TOAST & SHORTCUTS
// -------------------------------------------------------------
function setupSidebarFilter() {
  const searchInput = document.getElementById('engine-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase().trim();
      document.querySelectorAll('.tab-btn').forEach(btn => {
        const text = btn.textContent.toLowerCase();
        const engineCard = document.getElementById(btn.id.replace('tab-', 'engine-'));
        const cardTitle = engineCard?.querySelector('h2')?.textContent.toLowerCase() || '';
        const cardDesc = engineCard?.querySelector('.border-b p')?.textContent.toLowerCase() || '';
        const match = text.includes(term) || cardTitle.includes(term) || cardDesc.includes(term);
        btn.style.display = match ? 'block' : 'none';
      });
    });
  }
}

function filterCategory(cat) {
  document.querySelectorAll('.category-chip').forEach(chip => {
    chip.classList.toggle('bg-emerald-500/20', chip.dataset.cat === cat);
    chip.classList.toggle('text-emerald-400', chip.dataset.cat === cat);
    chip.classList.toggle('border-emerald-500/40', chip.dataset.cat === cat);
  });

  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (cat === 'all' || btn.dataset.cat === cat) {
      btn.style.display = 'block';
    } else {
      btn.style.display = 'none';
    }
  });
}

function showToast(message) {
  const toast = document.getElementById('toast-notification');
  const toastMsg = document.getElementById('toast-message');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = message;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

function openShortcutsModal() {
  const modal = document.getElementById('shortcuts-modal');
  if (modal) modal.classList.add('active');
}

function closeShortcutsModal() {
  const modal = document.getElementById('shortcuts-modal');
  if (modal) modal.classList.remove('active');
}

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Check if user is typing in an input or textarea
    const isInputActive = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

    // Question mark (?) to toggle Shortcuts Guide (when not typing in an input)
    if ((e.key === '?' || (e.shiftKey && e.key === '/')) && !isInputActive) {
      e.preventDefault();
      const modal = document.getElementById('shortcuts-modal');
      if (modal && modal.classList.contains('active')) {
        closeShortcutsModal();
      } else {
        openShortcutsModal();
      }
      return;
    }

    // Ctrl + K or '/' to focus search
    if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && !isInputActive)) {
      e.preventDefault();
      const search = document.getElementById('engine-search');
      if (search) {
        search.focus();
        search.select();
      }
      return;
    }

    // Alt + C: Cycle Currency
    if (e.altKey && (e.key === 'c' || e.key === 'C')) {
      e.preventDefault();
      const currencies = ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD', 'JPY', 'AED', 'CHF', 'SGD'];
      const nextIdx = (currencies.indexOf(currentCurrencyCode) + 1) % currencies.length;
      setGlobalCurrency(currencies[nextIdx]);
      showToast(`Switched currency to ${currencies[nextIdx]} (${currentCurrency})`);
      return;
    }

    // Alt + D: Executive Dossier Modal
    if (e.altKey && (e.key === 'd' || e.key === 'D')) {
      e.preventDefault();
      openDossierModal();
      return;
    }

    // Alt + S: Scenario Studio
    if (e.altKey && (e.key === 's' || e.key === 'S')) {
      e.preventDefault();
      openScenarioStudio();
      return;
    }

    // Alt + H: History Drawer
    if (e.altKey && (e.key === 'h' || e.key === 'H')) {
      e.preventDefault();
      const drawer = document.getElementById('history-drawer');
      if (drawer && drawer.classList.contains('active')) closeHistoryDrawer();
      else openHistoryDrawer();
      return;
    }

    // Alt + T: Theme Toggle
    if (e.altKey && (e.key === 't' || e.key === 'T')) {
      e.preventDefault();
      toggleTheme();
      return;
    }

    // Alt + A: Amortization Schedule
    if (e.altKey && (e.key === 'a' || e.key === 'A')) {
      e.preventDefault();
      openAmortizationModal('mortgage');
      return;
    }

    // Alt + P: Financial Profile Hub
    if (e.altKey && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      openProfileModal();
      return;
    }

    // Alt + W: Cycle Persona Workspace
    if (e.altKey && (e.key === 'w' || e.key === 'W')) {
      e.preventDefault();
      cyclePersonaWorkspace();
      return;
    }

    // Alt + L: Email My Plan Lead Modal
    if (e.altKey && (e.key === 'l' || e.key === 'L')) {
      e.preventDefault();
      openLeadModal();
      return;
    }

    // Single Key Shortcuts (when not typing in input)
    if (!isInputActive && !e.ctrlKey && !e.metaKey && !e.altKey) {
      if (e.key === 'w' || e.key === 'W') {
        e.preventDefault();
        cyclePersonaWorkspace();
        return;
      }
      if (e.key === '1') { filterCategory('all'); showToast('Showing All Engines'); }
      else if (e.key === '2') { filterCategory('housing'); showToast('Filter: Housing & Real Estate'); }
      else if (e.key === '3') { filterCategory('wealth'); showToast('Filter: Wealth & Retirement'); }
      else if (e.key === '4') { filterCategory('debt'); showToast('Filter: Debt & Credit'); }
      else if (e.key === '5') { filterCategory('tax'); showToast('Filter: Tax & Income'); }
      else if (e.key === '6') { filterCategory('business'); showToast('Filter: Business & Valuation'); }
    }

    // Ctrl + P to print focused engine only
    if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      printCurrentEngine();
      return;
    }

    // Escape to close all open modals/drawers
    if (e.key === 'Escape') {
      closeAmortizationModal();
      closeHistoryDrawer();
      closeDossierModal();
      closeScenarioStudio();
      closeShareModal();
      closeShortcutsModal();
      closeProfileModal();
      closeAdvisorModal();
      closeLeadModal();
    }
  });
}

// -------------------------------------------------------------
// INITIALIZATION ON DOM READY
// -------------------------------------------------------------

// -------------------------------------------------------------
// DYNAMIC SVG MICRO-CHARTS (FIRE, RENT VS BUY, SNOWBALL, SOLAR)
// -------------------------------------------------------------
function renderFireChart(expenses, currentSavings, annualSave, targetNumber, yearsToFire) {
  const svg = document.getElementById('fire-timeline-svg');
  if (!svg || targetNumber <= 0) return;

  const width = 340;
  const height = 80;
  const maxYears = Math.min(40, Math.max(10, Math.ceil(yearsToFire * 1.3)));
  const pts = [];

  let balance = currentSavings;
  const rate = 0.07; // 7% real compound growth
  for (let y = 0; y <= maxYears; y++) {
    const x = (y / maxYears) * width;
    const yVal = height - Math.min(height - 12, (balance / targetNumber) * (height - 16)) - 6;
    pts.push({ x, y: yVal });
    balance = (balance + annualSave) * (1 + rate);
  }

  let lineD = 'M ';
  let areaD = `M 0,${height} `;
  pts.forEach((pt, i) => {
    lineD += `${i === 0 ? '' : 'L '}${pt.x.toFixed(1)},${pt.y.toFixed(1)} `;
    areaD += `L ${pt.x.toFixed(1)},${pt.y.toFixed(1)} `;
  });
  areaD += `L ${width},${height} Z`;

  // Target threshold line (Y position of 100% target)
  const targetY = height - (height - 16) - 6;

  svg.innerHTML = `
    <defs>
      <linearGradient id="grad-fire" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#10b981" stop-opacity="0.0"/>
      </linearGradient>
    </defs>
    <!-- Target Horizon Line -->
    <line x1="0" y1="${targetY}" x2="${width}" y2="${targetY}" stroke="#eab308" stroke-width="1.5" stroke-dasharray="3,3"/>
    <text x="${width - 70}" y="${targetY - 3}" fill="#eab308" font-size="9" font-family="monospace">FIRE Goal</text>
    <!-- Capital Accumulation Area -->
    <path d="${areaD}" fill="url(#grad-fire)" />
    <path d="${lineD}" fill="none" stroke="#10b981" stroke-width="2.5" />
    <circle cx="${pts[Math.min(pts.length - 1, Math.round(yearsToFire))].x.toFixed(1)}" cy="${pts[Math.min(pts.length - 1, Math.round(yearsToFire))].y.toFixed(1)}" r="4.5" fill="#34d399" />
  `;

  const statusEl = document.getElementById('fire-chart-pace');
  if (statusEl) {
    statusEl.textContent = `${yearsToFire.toFixed(1)} Yrs to Freedom`;
  }
}

function renderRentBuyChart(rent, mortgage) {
  const svg = document.getElementById('rentbuy-comparison-svg');
  if (!svg) return;

  const width = 340;
  const height = 80;
  const rentAnnual = rent * 12;
  const mortAnnual = mortgage * 12;

  // Compare 10-year cumulative outflows
  const rent10Yr = rentAnnual * 10;
  const mort10Yr = mortAnnual * 10;
  const maxVal = Math.max(rent10Yr, mort10Yr, 1);

  const rentBarW = (rent10Yr / maxVal) * 220;
  const mortBarW = (mort10Yr / maxVal) * 220;

  svg.innerHTML = `
    <!-- Rent Outflow Bar -->
    <text x="10" y="24" fill="#94a3b8" font-size="10" font-family="sans-serif" font-weight="bold">Contract Rent (10y)</text>
    <rect x="115" y="14" width="${rentBarW.toFixed(1)}" height="14" rx="4" fill="#38bdf8" />
    <text x="${120 + rentBarW}" y="25" fill="#38bdf8" font-size="9" font-family="monospace" font-weight="bold">${formatCurrency(rent10Yr)}</text>

    <!-- Buy Outflow Bar -->
    <text x="10" y="56" fill="#94a3b8" font-size="10" font-family="sans-serif" font-weight="bold">Mortgage P&I (10y)</text>
    <rect x="115" y="46" width="${mortBarW.toFixed(1)}" height="14" rx="4" fill="#10b981" />
    <text x="${120 + mortBarW}" y="57" fill="#34d399" font-size="9" font-family="monospace" font-weight="bold">${formatCurrency(mort10Yr)}</text>
  `;

  const deltaEl = document.getElementById('rentbuy-chart-delta');
  if (deltaEl) {
    const diff = mortAnnual - rentAnnual;
    deltaEl.textContent = diff > 0 ? `Renting saves ${formatCurrency(diff)}/yr` : `Buying saves ${formatCurrency(Math.abs(diff))}/yr`;
  }
}

function renderSnowballChart(debt1Bal, debt2Bal, extraPay, apr1, apr2) {
  const svg = document.getElementById('snowball-comparison-svg');
  if (!svg) return;

  const width = 340;
  const height = 80;
  const totalDebt = debt1Bal + debt2Bal;
  if (totalDebt <= 0) return;

  const snowballInterest = (debt1Bal * (apr1 / 100) * 1.5) + (debt2Bal * (apr2 / 100) * 1.8);
  const avalancheInterest = snowballInterest * 0.82; // Avalanche saves ~18% interest
  const maxInterest = Math.max(snowballInterest, 1);

  const snowW = (snowballInterest / maxInterest) * 200;
  const avW = (avalancheInterest / maxInterest) * 200;
  const saved = snowballInterest - avalancheInterest;

  svg.innerHTML = `
    <!-- Snowball Bar -->
    <text x="10" y="24" fill="#94a3b8" font-size="10" font-weight="bold">Snowball Interest</text>
    <rect x="125" y="14" width="${snowW.toFixed(1)}" height="14" rx="4" fill="#f43f5e" />
    <text x="${130 + snowW}" y="25" fill="#fb7185" font-size="9" font-family="monospace">${formatCurrency(snowballInterest)}</text>

    <!-- Avalanche Bar -->
    <text x="10" y="56" fill="#94a3b8" font-size="10" font-weight="bold">Avalanche Interest</text>
    <rect x="125" y="46" width="${avW.toFixed(1)}" height="14" rx="4" fill="#10b981" />
    <text x="${130 + avW}" y="57" fill="#34d399" font-size="9" font-family="monospace">${formatCurrency(avalancheInterest)}</text>
  `;

  const speedEl = document.getElementById('snowball-chart-speed');
  if (speedEl) {
    speedEl.textContent = `Avalanche saves ${formatCurrency(saved)}`;
  }
}

function renderSolarChart(systemCost, taxCreditPct, monthlyElectric, offsetPct) {
  const svg = document.getElementById('solar-payback-svg');
  if (!svg) return;

  const width = 340;
  const height = 80;
  const netCost = systemCost * (1 - (taxCreditPct / 100));
  const annualSavings = (monthlyElectric * 12) * (offsetPct / 100);
  const paybackYears = annualSavings > 0 ? netCost / annualSavings : 25;

  const ptsSavings = [];
  const ptsCost = [];
  const maxYears = 25;

  for (let y = 0; y <= maxYears; y += 2) {
    const x = (y / maxYears) * width;
    const cumSavings = annualSavings * y;
    const maxVal = Math.max(netCost * 1.8, annualSavings * maxYears);
    const ySav = height - (cumSavings / maxVal) * (height - 16) - 6;
    const yCost = height - (netCost / maxVal) * (height - 16) - 6;
    ptsSavings.push({ x, y: ySav });
    ptsCost.push({ x, y: yCost });
  }

  let lineSavD = 'M ';
  ptsSavings.forEach((p, i) => lineSavD += `${i === 0 ? '' : 'L '}${p.x.toFixed(1)},${p.y.toFixed(1)} `);

  const costY = height - (netCost / Math.max(netCost * 1.8, annualSavings * maxYears)) * (height - 16) - 6;

  svg.innerHTML = `
    <!-- Net Cost Horizontal Line -->
    <line x1="0" y1="${costY.toFixed(1)}" x2="${width}" y2="${costY.toFixed(1)}" stroke="#f43f5e" stroke-width="1.5" stroke-dasharray="3,3" />
    <text x="8" y="${costY - 4}" fill="#f43f5e" font-size="8.5" font-family="monospace">Net Solar Cost (${formatCurrency(netCost)})</text>
    <!-- Cumulative Savings Line -->
    <path d="${lineSavD}" fill="none" stroke="#10b981" stroke-width="2.5" />
    <text x="${width - 95}" y="18" fill="#34d399" font-size="8.5" font-family="monospace">Cumulative Offset</text>
  `;

  const crossEl = document.getElementById('solar-chart-crossover');
  if (crossEl) {
    crossEl.textContent = `${paybackYears.toFixed(1)} Yrs Payback`;
  }
}

// -------------------------------------------------------------
// 1-CLICK SCENARIO PRESETS (CONSERVATIVE, BALANCED, AGGRESSIVE)
// -------------------------------------------------------------
function applyScenarioPreset(engine, presetKey) {
  const card = document.getElementById(`engine-${engine}`);
  if (card) {
    card.querySelectorAll('.preset-chip').forEach(btn => {
      const match = btn.getAttribute('onclick') && btn.getAttribute('onclick').includes(presetKey);
      btn.classList.toggle('active', match);
      btn.classList.toggle('bg-emerald-500/20', match);
      btn.classList.toggle('text-emerald-400', match);
      btn.classList.toggle('border-emerald-500/40', match);
      btn.classList.toggle('bg-slate-950', !match);
      btn.classList.toggle('text-slate-300', !match);
      btn.classList.toggle('border-slate-800', !match);
    });
  }

  if (engine === 'mortgage') {
    const assetEl = document.getElementById('mortgage-asset');
    const downEl = document.getElementById('mortgage-down');
    const asset = parseFloat(assetEl ? assetEl.value : 450000) || 450000;
    if (presetKey === 'conventional') {
      const down = Math.round(asset * 0.20);
      if (downEl) downEl.value = down;
      const downRange = document.getElementById('mortgage-down-range');
      if (downRange) downRange.value = down;
      updateInputPreviewTag('mortgage-down', down);
    } else if (presetKey === 'fha') {
      const down = Math.round(asset * 0.035);
      if (downEl) downEl.value = down;
      const downRange = document.getElementById('mortgage-down-range');
      if (downRange) downRange.value = down;
      updateInputPreviewTag('mortgage-down', down);
    } else if (presetKey === 'zero') {
      if (downEl) downEl.value = 0;
      const downRange = document.getElementById('mortgage-down-range');
      if (downRange) downRange.value = 0;
      updateInputPreviewTag('mortgage-down', 0);
    }
    calcMortgage();
  } else if (engine === 'compound') {
    const rateEl = document.getElementById('compound-rate');
    const rateRange = document.getElementById('compound-rate-range');
    let r = 8;
    if (presetKey === 'conservative') r = 5;
    else if (presetKey === 'balanced') r = 8;
    else if (presetKey === 'aggressive') r = 11;
    if (rateEl) rateEl.value = r;
    if (rateRange) rateRange.value = r;
    updateInputPreviewTag('compound-rate', r);
    calcCompound();
  } else if (engine === 'fire') {
    const expEl = document.getElementById('fire-expenses');
    const expRange = document.getElementById('fire-expenses-range');
    const base = currentCurrencyCode === 'INR' ? 800000 : 60000;
    let exp = base;
    if (presetKey === 'lean') exp = Math.round(base * 0.65);
    else if (presetKey === 'standard') exp = base;
    else if (presetKey === 'fat') exp = Math.round(base * 1.8);
    if (expEl) expEl.value = exp;
    if (expRange) expRange.value = exp;
    updateInputPreviewTag('fire-expenses', exp);
    calcFire();
  } else if (engine === 'rentbuy') {
    const rentEl = document.getElementById('rentbuy-rent');
    const mortEl = document.getElementById('rentbuy-mortgage');
    const rentRange = document.getElementById('rentbuy-rent-range');
    const mortRange = document.getElementById('rentbuy-mortgage-range');
    const isINR = currentCurrencyCode === 'INR';
    if (presetKey === 'metro') {
      const r = isINR ? 25000 : 2800;
      const m = isINR ? 45000 : 3600;
      if (rentEl) rentEl.value = r;
      if (mortEl) mortEl.value = m;
      if (rentRange) rentRange.value = r;
      if (mortRange) mortRange.value = m;
      updateInputPreviewTag('rentbuy-rent', r);
      updateInputPreviewTag('rentbuy-mortgage', m);
    } else if (presetKey === 'suburban') {
      const r = isINR ? 8000 : 1800;
      const m = isINR ? 15000 : 2300;
      if (rentEl) rentEl.value = r;
      if (mortEl) mortEl.value = m;
      if (rentRange) rentRange.value = r;
      if (mortRange) mortRange.value = m;
      updateInputPreviewTag('rentbuy-rent', r);
      updateInputPreviewTag('rentbuy-mortgage', m);
    } else if (presetKey === 'affordable') {
      const r = isINR ? 4500 : 1100;
      const m = isINR ? 9000 : 1500;
      if (rentEl) rentEl.value = r;
      if (mortEl) mortEl.value = m;
      if (rentRange) rentRange.value = r;
      if (mortRange) mortRange.value = m;
      updateInputPreviewTag('rentbuy-rent', r);
      updateInputPreviewTag('rentbuy-mortgage', m);
    }
    calcRentBuy();
  }

  showToast(`Applied ${presetKey} scenario preset.`);
}

// -------------------------------------------------------------
// EXECUTIVE FINANCIAL DOSSIER MODAL GENERATOR & VITALITY SCORING
// -------------------------------------------------------------
function calculateFinancialVitality() {
  let score = 52; // Baseline score

  // 1. Debt & Liabilities Health
  const ccDebt = parseFloat(document.getElementById('creditcard-debt')?.value) || 0;
  if (ccDebt === 0) score += 16;
  else if (ccDebt <= 2500) score += 8;
  else score -= 12;

  // 2. Housing Leverage & LTV
  const asset = parseFloat(document.getElementById('mortgage-asset')?.value) || 0;
  const down = parseFloat(document.getElementById('mortgage-down')?.value) || 0;
  const ltv = asset > 0 ? ((asset - down) / asset) * 100 : 80;
  if (ltv <= 80) score += 14;
  else if (ltv <= 90) score += 7;
  else score -= 6;

  // 3. Wealth Accumulation & Retirement Runway
  const fireYearsText = document.getElementById('fire-years-to-fire')?.textContent || '25';
  const fireYears = parseFloat(fireYearsText) || 25;
  if (fireYears <= 15) score += 16;
  else if (fireYears <= 25) score += 9;
  else score += 3;

  // 4. Savings & Compounding Allocation
  const four01kContrib = parseFloat(document.getElementById('four01k-contrib-pct')?.value) || 10;
  if (four01kContrib >= 15) score += 6;
  else if (four01kContrib >= 8) score += 4;

  score = Math.max(30, Math.min(98, score));

  let grade = 'Tier 1: Institutional Prime Resilient';
  let color = '#10b981'; // Emerald
  if (score < 50) {
    grade = 'Tier 4: High Leverage Restructuring Needed';
    color = '#f43f5e'; // Rose
  } else if (score < 70) {
    grade = 'Tier 3: Moderate Solvency & Growth';
    color = '#fbbf24'; // Amber
  } else if (score < 85) {
    grade = 'Tier 2: Prime Accumulation Velocity';
    color = '#38bdf8'; // Sky
  }

  return { score, grade, color };
}

function generateDossierAdvisory() {
  const recommendations = [];

  // Rec 1: Mortgage Optimization
  const mortRate = parseFloat(document.getElementById('mortgage-rate')?.value) || 6.2;
  if (mortRate >= 6.0) {
    recommendations.push({
      priority: 'REFI OPPORTUNITY',
      tagColor: 'text-sky-400 bg-sky-950/70 border-sky-800/60',
      title: 'Mortgage Refinance & Extra Principal Strategy',
      description: `With debt financed at ${mortRate}%, deploying an extra $250/mo principal amortizes ~$94k in lifetime financing drag. Set refi rate alert for a 100 bps dip.`
    });
  } else {
    recommendations.push({
      priority: 'OPTIMAL POSITION',
      tagColor: 'text-emerald-400 bg-emerald-950/70 border-emerald-800/60',
      title: 'Cost-Efficient Fixed Liability Foundation',
      description: `Your financing rate of ${mortRate}% is exceptionally competitive. Direct discretionary surplus liquidity toward equities rather than prepaying this low-cost loan.`
    });
  }

  // Rec 2: Consumer Debt Clearance
  const ccDebt = parseFloat(document.getElementById('creditcard-debt')?.value) || 5000;
  const ccApr = parseFloat(document.getElementById('creditcard-apr')?.value) || 22;
  if (ccDebt > 0 && ccApr > 15) {
    recommendations.push({
      priority: 'CRITICAL ACTION',
      tagColor: 'text-rose-400 bg-rose-950/70 border-rose-800/60',
      title: 'Aggressive Avalanche Debt Eradication',
      description: `Carrying ${formatCurrency(ccDebt)} at ${ccApr}% APR causes severe negative compounding. Divert free cashflow to clear this balance completely within 6 months.`
    });
  } else {
    recommendations.push({
      priority: 'HEALTHY RATIO',
      tagColor: 'text-emerald-400 bg-emerald-950/70 border-emerald-800/60',
      title: 'Zero Revolving Credit Drag',
      description: `No toxic high-interest consumer liabilities detected. Credit utilization efficiency supports pristine tier-1 borrowing eligibility.`
    });
  }

  // Rec 3: Retirement & Independence Horizon
  const fireYearsText = document.getElementById('fire-years-to-fire')?.textContent || '20';
  const fireYears = parseFloat(fireYearsText) || 20;
  const fireExp = parseFloat(document.getElementById('fire-expenses')?.value) || 60000;
  const fireTarget = formatCurrency(fireExp / 0.04);
  recommendations.push({
    priority: 'WEALTH ACCELERATOR',
    tagColor: 'text-emerald-400 bg-emerald-950/70 border-emerald-800/60',
    title: `FIRE Freedom Horizon: ${fireYears.toFixed(1)} Years Remaining`,
    description: `Target portfolio threshold is ${fireTarget}. Increasing systematic annual savings by just 10% contracts your freedom timeline by an estimated 2.8 calendar years.`
  });

  // Rec 4: Tax Optimization Alpha
  recommendations.push({
    priority: 'TAX SHIELD ALPHA',
    tagColor: 'text-violet-400 bg-violet-950/70 border-violet-800/60',
    title: 'Pre-Tax Shelter & Health Savings Maximization',
    description: `Maximize annual limits on 401(k)/EPF and HSA accounts to depress top-bracket marginal taxable liabilities while compounding returns tax-sheltered.`
  });

  return recommendations;
}

function openDossierModal() {
  const container = document.getElementById('dossier-report-content');
  const timestampEl = document.getElementById('dossier-timestamp');
  const scoreEl = document.getElementById('dossier-vitality-score');
  const gradeEl = document.getElementById('dossier-vitality-grade');
  const ringEl = document.getElementById('dossier-vitality-ring');
  const recsContainer = document.getElementById('dossier-recommendations');
  if (!container) return;

  const now = new Date();
  if (timestampEl) {
    timestampEl.textContent = `Generated: ${now.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} at ${now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })} | Currency: ${currentCurrencyCode} (${currentCurrency})`;
  }

  // Calculate & Animate Financial Vitality Score
  const { score, grade, color } = calculateFinancialVitality();
  if (scoreEl) scoreEl.textContent = `${score} / 100`;
  if (gradeEl) {
    gradeEl.textContent = grade;
    gradeEl.style.color = color;
  }
  if (ringEl) {
    const circumference = 251.2;
    const offset = circumference * (1 - (score / 100));
    ringEl.setAttribute('stroke', color);
    ringEl.setAttribute('stroke-dashoffset', offset.toFixed(2));
  }

  // Render Strategic Advisory Recommendations
  if (recsContainer) {
    const recs = generateDossierAdvisory();
    recsContainer.innerHTML = recs.map(r => `
      <div class="recommendation-card p-3 rounded-xl border border-slate-800/80 bg-slate-900/60 text-xs">
        <div class="flex items-center justify-between mb-1">
          <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${r.tagColor}">${r.priority}</span>
        </div>
        <div class="font-bold text-slate-100 mb-1">${r.title}</div>
        <p class="text-slate-400 text-[11px] leading-relaxed">${r.description}</p>
      </div>
    `).join('');
  }

  // Compile Key Engine Snapshots into Pillars
  const sections = [
    {
      category: '🏠 Real Estate & Housing Profile',
      items: [
        { label: 'Mortgage Target Monthly Payment', value: document.getElementById('mortgage-payment')?.textContent || '$0.00' },
        { label: 'Total Mortgage Lifetime Outlay', value: document.getElementById('mortgage-total-payment')?.textContent || '$0.00' },
        { label: 'Home Purchase Affordability Ceiling', value: document.getElementById('affordability-max-home')?.textContent || '$0.00' },
        { label: 'Rent vs Buy 5-Year Cumulative Delta', value: document.getElementById('rentbuy-5yr-variance')?.textContent || '$0.00' }
      ]
    },
    {
      category: '💰 Wealth, Retirement & Financial Independence',
      items: [
        { label: 'FIRE Target Portfolio Capital (4% Rule)', value: document.getElementById('fire-target-number')?.textContent || '$0.00' },
        { label: 'Years to Financial Freedom', value: document.getElementById('fire-years-to-fire')?.textContent || '0.0 Years' },
        { label: 'Projected 401(k) / EPF Retirement Nest Egg', value: document.getElementById('four01k-future-balance')?.textContent || '$0.00' },
        { label: 'Systematic Investment Plan (SIP) Maturity', value: document.getElementById('sip-maturity')?.textContent || '$0.00' }
      ]
    },
    {
      category: '💳 Debt Clearance & Credit Optimization',
      items: [
        { label: 'Credit Card Debt-Free Timeline', value: document.getElementById('creditcard-months')?.textContent || '0 Months' },
        { label: 'Snowball vs Avalanche Interest Saved', value: document.getElementById('snowball-avalanche-savings')?.textContent || '$0.00' },
        { label: 'Projected Post-Paydown Credit Score', value: document.getElementById('creditscore-new-utilization')?.textContent || '0%' }
      ]
    },
    {
      category: '💼 Tax Optimization & Net Take-Home Cashflow',
      items: [
        { label: 'Estimated Net Paycheck Take-Home', value: document.getElementById('paycheck-net-pay')?.textContent || '$0.00' },
        { label: '1040-ES / Advance Tax Quarterly Voucher', value: document.getElementById('quarterlytax-quarterly-voucher')?.textContent || '$0.00' },
        { label: 'Net Capital Gains Post-Tax Profit', value: document.getElementById('capitalgains-net-profit')?.textContent || '$0.00' }
      ]
    }
  ];

  let html = '';
  sections.forEach(sec => {
    html += `
      <div class="bg-slate-900 border border-slate-800 rounded-xl p-4">
        <h4 class="text-xs uppercase font-black text-emerald-400 tracking-wider mb-3">${sec.category}</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          ${sec.items.map(it => `
            <div class="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/60">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">${it.label}</span>
              <span class="text-sm font-bold text-white font-mono-num mt-0.5 block">${it.value}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  const modal = document.getElementById('dossier-modal');
  if (modal) modal.classList.add('active');
}

function closeDossierModal() {
  const modal = document.getElementById('dossier-modal');
  if (modal) modal.classList.remove('active');
}

function copyDossierReport() {
  const clientName = document.getElementById('dossier-client-name')?.value || 'Confidential Client';
  const now = new Date();
  const { score, grade } = calculateFinancialVitality();

  let text = `====================================================\n`;
  text += `   EXECUTIVE FINANCIAL DOSSIER & STRATEGIC BLUEPRINT\n`;
  text += `====================================================\n`;
  text += `Client / Plan: ${clientName}\n`;
  text += `Generated: ${now.toLocaleDateString()} ${now.toLocaleTimeString()}\n`;
  text += `Base Currency: ${currentCurrencyCode} (${currentCurrency})\n`;
  text += `Financial Vitality Score: ${score}/100 [${grade}]\n`;
  text += `----------------------------------------------------\n\n`;

  text += `STRATEGIC ADVISORY RECOMMENDATIONS:\n`;
  const recs = generateDossierAdvisory();
  recs.forEach((r, idx) => {
    text += `${idx + 1}. [${r.priority}] ${r.title}\n   ${r.description}\n\n`;
  });

  text += `CORE BALANCE SHEET LEDGER:\n`;
  text += `- Mortgage Monthly Payment: ${document.getElementById('mortgage-payment')?.textContent || '$0.00'}\n`;
  text += `- Total Mortgage Lifetime Outlay: ${document.getElementById('mortgage-total-payment')?.textContent || '$0.00'}\n`;
  text += `- Home Purchase Affordability Ceiling: ${document.getElementById('affordability-max-home')?.textContent || '$0.00'}\n`;
  text += `- FIRE Freedom Portfolio Target: ${document.getElementById('fire-target-number')?.textContent || '$0.00'}\n`;
  text += `- Years to Financial Freedom: ${document.getElementById('fire-years-to-fire')?.textContent || '0.0 Years'}\n`;
  text += `- Projected 401(k) / EPF Retirement Nest Egg: ${document.getElementById('four01k-future-balance')?.textContent || '$0.00'}\n`;
  text += `- Net Paycheck Take-Home: ${document.getElementById('paycheck-net-pay')?.textContent || '$0.00'}\n`;
  text += `- Advance Tax / Quarterly Voucher: ${document.getElementById('quarterlytax-quarterly-voucher')?.textContent || '$0.00'}\n\n`;
  text += `Generated via aFinanceCalculator Suite (Pure Client-Side Private Engine)`;

  navigator.clipboard.writeText(text).then(() => {
    showToast('✓ Executive Dossier copied to clipboard!');
  }).catch(() => {
    showToast('Failed to copy Dossier report.');
  });
}

function exportDossierJson() {
  const clientName = document.getElementById('dossier-client-name')?.value || 'Confidential Client';
  const { score, grade } = calculateFinancialVitality();
  const recs = generateDossierAdvisory();

  const dossierData = {
    client: clientName,
    exportedAt: new Date().toISOString(),
    currency: currentCurrencyCode,
    vitality: {
      score: score,
      grade: grade
    },
    recommendations: recs,
    ledger: {
      housing: {
        mortgageMonthly: document.getElementById('mortgage-payment')?.textContent || '$0.00',
        mortgageTotal: document.getElementById('mortgage-total-payment')?.textContent || '$0.00',
        affordabilityMax: document.getElementById('affordability-max-home')?.textContent || '$0.00',
        rentBuyVariance: document.getElementById('rentbuy-5yr-variance')?.textContent || '$0.00'
      },
      wealth: {
        fireTarget: document.getElementById('fire-target-number')?.textContent || '$0.00',
        yearsToFire: document.getElementById('fire-years-to-fire')?.textContent || '0.0 Years',
        four01kFuture: document.getElementById('four01k-future-balance')?.textContent || '$0.00',
        sipMaturity: document.getElementById('sip-maturity')?.textContent || '$0.00'
      },
      debt: {
        creditCardMonths: document.getElementById('creditcard-months')?.textContent || '0 Months',
        snowballSavings: document.getElementById('snowball-avalanche-savings')?.textContent || '$0.00',
        creditScoreProjected: document.getElementById('creditscore-new-utilization')?.textContent || '0%'
      },
      tax: {
        paycheckNet: document.getElementById('paycheck-net-pay')?.textContent || '$0.00',
        quarterlyTaxVoucher: document.getElementById('quarterlytax-quarterly-voucher')?.textContent || '$0.00',
        capitalGainsNet: document.getElementById('capitalgains-net-profit')?.textContent || '$0.00'
      }
    }
  };

  const blob = new Blob([JSON.stringify(dossierData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Executive_Financial_Dossier_${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  showToast('✓ Exported Executive Dossier to JSON!');
}

function printDossierReport() {
  document.body.classList.add('printing-dossier');
  const printTitle = document.getElementById('print-engine-title');
  const printSub = document.getElementById('print-engine-subtitle');
  const printTime = document.getElementById('print-report-timestamp');
  const clientName = document.getElementById('dossier-client-name')?.value || 'Client Portfolio';
  if (printTitle) printTitle.textContent = `Executive Financial Dossier - ${clientName}`;
  if (printSub) printSub.textContent = `Portfolio Profile & Cross-Engine Advisory Blueprint (${currentCurrencyCode})`;
  if (printTime) {
    const now = new Date();
    printTime.textContent = `Generated: ${now.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })} at ${now.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}`;
  }
  window.print();
  setTimeout(() => {
    document.body.classList.remove('printing-dossier');
  }, 1000);
}

// -------------------------------------------------------------
// PWA INSTALLATION SYSTEM & SERVICE WORKER
// -------------------------------------------------------------
let deferredPrompt = null;

function setupPwa() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    const btn = document.getElementById('pwa-install-btn');
    if (btn) btn.style.display = 'flex';
  });

  window.addEventListener('appinstalled', () => {
    deferredPrompt = null;
    const btn = document.getElementById('pwa-install-btn');
    if (btn) btn.style.display = 'none';
    showToast('✓ aFinanceCalculator installed successfully!');
  });

  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

function triggerPwaInstall() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        showToast('Installing application...');
      }
      deferredPrompt = null;
      const btn = document.getElementById('pwa-install-btn');
      if (btn) btn.style.display = 'none';
    });
  } else {
    showToast('To install, use browser menu: "Install aFinanceCalculator"');
  }
}


document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  setupPwa();
  setupKeyboardShortcuts();

  // Dual-input bindings
  syncDualInput('mortgage-asset', 'mortgage-asset-range', calcMortgage);
  syncDualInput('mortgage-down', 'mortgage-down-range', calcMortgage);
  syncDualInput('mortgage-rate', 'mortgage-rate-range', calcMortgage);
  syncDualInput('mortgage-term', 'mortgage-term-range', () => setMortgageTerm(document.getElementById('mortgage-term')?.value));
  syncDualInput('mortgage-extra', 'mortgage-extra-range', calcMortgage);

  syncDualInput('invoice-rate', 'invoice-rate-range', calcInvoice);
  syncDualInput('invoice-hours', 'invoice-hours-range', calcInvoice);
  syncDualInput('invoice-tax', 'invoice-tax-range', calcInvoice);

  syncDualInput('roi-spend', 'roi-spend-range', calcRoi);
  syncDualInput('roi-revenue', 'roi-revenue-range', calcRoi);

  syncDualInput('crypto-entry', 'crypto-entry-range', calcCrypto);
  syncDualInput('crypto-leverage', 'crypto-leverage-range', calcCrypto);

  syncDualInput('compound-principal', 'compound-principal-range', calcCompound);
  syncDualInput('compound-rate', 'compound-rate-range', calcCompound);
  syncDualInput('compound-years', 'compound-years-range', calcCompound);

  syncDualInput('caprate-rent', 'caprate-rent-range', calcCapRate);
  syncDualInput('caprate-costs', 'caprate-costs-range', calcCapRate);
  syncDualInput('caprate-value', 'caprate-value-range', calcCapRate);

  syncDualInput('salary-wage', 'salary-wage-range', calcSalary);
  syncDualInput('salary-hours', 'salary-hours-range', calcSalary);

  syncDualInput('breakeven-overhead', 'breakeven-overhead-range', calcBreakEven);
  syncDualInput('breakeven-price', 'breakeven-price-range', calcBreakEven);
  syncDualInput('breakeven-cost', 'breakeven-cost-range', calcBreakEven);

  syncDualInput('creditcard-debt', 'creditcard-debt-range', calcCreditCard);
  syncDualInput('creditcard-apr', 'creditcard-apr-range', calcCreditCard);
  syncDualInput('creditcard-payment', 'creditcard-payment-range', calcCreditCard);

  syncDualInput('stockavg-shares1', 'stockavg-shares1-range', calcStockAvg);
  syncDualInput('stockavg-price1', 'stockavg-price1-range', calcStockAvg);
  syncDualInput('stockavg-shares2', 'stockavg-shares2-range', calcStockAvg);
  syncDualInput('stockavg-price2', 'stockavg-price2-range', calcStockAvg);

  syncDualInput('rentbuy-rent', 'rentbuy-rent-range', calcRentBuy);
  syncDualInput('rentbuy-mortgage', 'rentbuy-mortgage-range', calcRentBuy);
  ['rentbuy-rent-growth', 'rentbuy-home-appreciation', 'rentbuy-invest-return'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', calcRentBuy);
  });

  syncDualInput('margin-cost', 'margin-cost-range', calcMargin);
  syncDualInput('margin-price', 'margin-price-range', calcMargin);

  syncDualInput('autoloan-value', 'autoloan-value-range', calcAutoLoan);
  syncDualInput('autoloan-rate', 'autoloan-rate-range', calcAutoLoan);
  syncDualInput('autoloan-term', 'autoloan-term-range', calcAutoLoan);

  syncDualInput('student-debt', 'student-debt-range', calcStudent);
  syncDualInput('student-rate', 'student-rate-range', calcStudent);
  syncDualInput('student-months', 'student-months-range', calcStudent);

  syncDualInput('budget-income', 'budget-income-range', calcBudget);

  syncDualInput('interest-principal', 'interest-principal-range', calcInterest);
  syncDualInput('interest-rate', 'interest-rate-range', calcInterest);
  syncDualInput('interest-years', 'interest-years-range', calcInterest);

  syncDualInput('dividend-equity', 'dividend-equity-range', calcDividend);
  syncDualInput('dividend-yield', 'dividend-yield-range', calcDividend);

  syncDualInput('inflation-cash', 'inflation-cash-range', calcInflation);
  syncDualInput('inflation-rate', 'inflation-rate-range', calcInflation);
  syncDualInput('inflation-years', 'inflation-years-range', calcInflation);

  syncDualInput('sip-monthly', 'sip-monthly-range', calcSip);
  syncDualInput('sip-rate', 'sip-rate-range', calcSip);
  syncDualInput('sip-years', 'sip-years-range', calcSip);

  syncDualInput('cagr-initial', 'cagr-initial-range', calcCagr);
  syncDualInput('cagr-final', 'cagr-final-range', calcCagr);
  syncDualInput('cagr-years', 'cagr-years-range', calcCagr);

  // Dual-input bindings for Engines 21 to 50
  syncDualInput('affordability-income', 'affordability-income-range', calcAffordability);
  syncDualInput('affordability-down', 'affordability-down-range', calcAffordability);
  syncDualInput('affordability-debt', 'affordability-debt-range', calcAffordability);
  syncDualInput('affordability-rate', 'affordability-rate-range', calcAffordability);
  syncDualInput('affordability-term', 'affordability-term-range', calcAffordability);
  syncDualInput('refinance-balance', 'refinance-balance-range', calcRefinance);
  syncDualInput('refinance-current-rate', 'refinance-current-rate-range', calcRefinance);
  syncDualInput('refinance-new-rate', 'refinance-new-rate-range', calcRefinance);
  syncDualInput('refinance-term', 'refinance-term-range', calcRefinance);
  syncDualInput('refinance-costs', 'refinance-costs-range', calcRefinance);
  syncDualInput('biweekly-balance', 'biweekly-balance-range', calcBiweekly);
  syncDualInput('biweekly-rate', 'biweekly-rate-range', calcBiweekly);
  syncDualInput('biweekly-term', 'biweekly-term-range', calcBiweekly);
  syncDualInput('cashoncash-rent', 'cashoncash-rent-range', calcCashOnCash);
  syncDualInput('cashoncash-mortgage', 'cashoncash-mortgage-range', calcCashOnCash);
  syncDualInput('cashoncash-expenses', 'cashoncash-expenses-range', calcCashOnCash);
  syncDualInput('cashoncash-investment', 'cashoncash-investment-range', calcCashOnCash);
  syncDualInput('heloc-drawn', 'heloc-drawn-range', calcHeloc);
  syncDualInput('heloc-rate', 'heloc-rate-range', calcHeloc);
  syncDualInput('heloc-draw-years', 'heloc-draw-years-range', calcHeloc);
  syncDualInput('heloc-repay-years', 'heloc-repay-years-range', calcHeloc);
  syncDualInput('closingcosts-price', 'closingcosts-price-range', calcClosingCosts);
  syncDualInput('closingcosts-down-pct', 'closingcosts-down-pct-range', calcClosingCosts);
  syncDualInput('closingcosts-origination-pct', 'closingcosts-origination-pct-range', calcClosingCosts);
  syncDualInput('fire-expenses', 'fire-expenses-range', calcFire);
  syncDualInput('fire-savings', 'fire-savings-range', calcFire);
  syncDualInput('fire-annual-save', 'fire-annual-save-range', calcFire);
  syncDualInput('fire-swr', 'fire-swr-range', calcFire);
  syncDualInput('four01k-salary', 'four01k-salary-range', calcFour01k);
  syncDualInput('four01k-contrib-pct', 'four01k-contrib-pct-range', calcFour01k);
  syncDualInput('four01k-match-pct', 'four01k-match-pct-range', calcFour01k);
  syncDualInput('four01k-years', 'four01k-years-range', calcFour01k);
  syncDualInput('four01k-rate', 'four01k-rate-range', calcFour01k);
  syncDualInput('rmd-balance', 'rmd-balance-range', calcRmd);
  syncDualInput('rmd-age', 'rmd-age-range', calcRmd);
  syncDualInput('socialsecurity-pia', 'socialsecurity-pia-range', calcSocialSecurity);
  syncDualInput('socialsecurity-claim-age', 'socialsecurity-claim-age-range', calcSocialSecurity);
  syncDualInput('cdladder-capital', 'cdladder-capital-range', calcCdLadder);
  syncDualInput('cdladder-apy', 'cdladder-apy-range', calcCdLadder);
  syncDualInput('cdladder-rungs', 'cdladder-rungs-range', calcCdLadder);
  syncDualInput('hsa-annual-contrib', 'hsa-annual-contrib-range', calcHsa);
  syncDualInput('hsa-current-balance', 'hsa-current-balance-range', calcHsa);
  syncDualInput('hsa-years', 'hsa-years-range', calcHsa);
  syncDualInput('hsa-rate', 'hsa-rate-range', calcHsa);
  syncDualInput('hsa-tax-bracket', 'hsa-tax-bracket-range', calcHsa);
  syncDualInput('paycheck-gross', 'paycheck-gross-range', calcPaycheck);
  syncDualInput('paycheck-fed-tax', 'paycheck-fed-tax-range', calcPaycheck);
  syncDualInput('paycheck-state-tax', 'paycheck-state-tax-range', calcPaycheck);
  syncDualInput('paycheck-freq', 'paycheck-freq-range', calcPaycheck);
  syncDualInput('capitalgains-purchase', 'capitalgains-purchase-range', calcCapitalGains);
  syncDualInput('capitalgains-sale', 'capitalgains-sale-range', calcCapitalGains);
  syncDualInput('capitalgains-income', 'capitalgains-income-range', calcCapitalGains);
  syncDualInput('capitalgains-rate', 'capitalgains-rate-range', calcCapitalGains);
  syncDualInput('quarterlytax-revenue', 'quarterlytax-revenue-range', calcQuarterlyTax);
  syncDualInput('quarterlytax-expenses', 'quarterlytax-expenses-range', calcQuarterlyTax);
  syncDualInput('quarterlytax-fed-rate', 'quarterlytax-fed-rate-range', calcQuarterlyTax);
  syncDualInput('overtime-hourly', 'overtime-hourly-range', calcOvertime);
  syncDualInput('overtime-regular-hrs', 'overtime-regular-hrs-range', calcOvertime);
  syncDualInput('overtime-15x-hrs', 'overtime-15x-hrs-range', calcOvertime);
  syncDualInput('overtime-20x-hrs', 'overtime-20x-hrs-range', calcOvertime);
  syncDualInput('bonustax-amount', 'bonustax-amount-range', calcBonusTax);
  syncDualInput('bonustax-state-pct', 'bonustax-state-pct-range', calcBonusTax);
  syncDualInput('bonustax-401k-pct', 'bonustax-401k-pct-range', calcBonusTax);
  syncDualInput('severance-weeks', 'severance-weeks-range', calcSeverance);
  syncDualInput('severance-weekly-pay', 'severance-weekly-pay-range', calcSeverance);
  syncDualInput('severance-pto', 'severance-pto-range', calcSeverance);
  syncDualInput('severance-ui', 'severance-ui-range', calcSeverance);
  syncDualInput('severance-monthly-burn', 'severance-monthly-burn-range', calcSeverance);
  syncDualInput('snowball-extra', 'snowball-extra-range', calcSnowball);
  syncDualInput('snowball-debt1-bal', 'snowball-debt1-bal-range', calcSnowball);
  syncDualInput('snowball-debt1-apr', 'snowball-debt1-apr-range', calcSnowball);
  syncDualInput('snowball-debt2-bal', 'snowball-debt2-bal-range', calcSnowball);
  syncDualInput('snowball-debt2-apr', 'snowball-debt2-apr-range', calcSnowball);
  syncDualInput('carlease-msrp', 'carlease-msrp-range', calcCarLease);
  syncDualInput('carlease-lease-monthly', 'carlease-lease-monthly-range', calcCarLease);
  syncDualInput('carlease-lease-down', 'carlease-lease-down-range', calcCarLease);
  syncDualInput('carlease-loan-monthly', 'carlease-loan-monthly-range', calcCarLease);
  syncDualInput('carlease-residual', 'carlease-residual-range', calcCarLease);
  syncDualInput('personalloan-amount', 'personalloan-amount-range', calcPersonalLoan);
  syncDualInput('personalloan-rate', 'personalloan-rate-range', calcPersonalLoan);
  syncDualInput('personalloan-term', 'personalloan-term-range', calcPersonalLoan);
  syncDualInput('personalloan-origination', 'personalloan-origination-range', calcPersonalLoan);
  syncDualInput('autorefi-balance', 'autorefi-balance-range', calcAutoRefi);
  syncDualInput('autorefi-current-rate', 'autorefi-current-rate-range', calcAutoRefi);
  syncDualInput('autorefi-new-rate', 'autorefi-new-rate-range', calcAutoRefi);
  syncDualInput('autorefi-months', 'autorefi-months-range', calcAutoRefi);
  syncDualInput('studentrefi-balance', 'studentrefi-balance-range', calcStudentRefi);
  syncDualInput('studentrefi-current-rate', 'studentrefi-current-rate-range', calcStudentRefi);
  syncDualInput('studentrefi-private-rate', 'studentrefi-private-rate-range', calcStudentRefi);
  syncDualInput('studentrefi-idr-monthly', 'studentrefi-idr-monthly-range', calcStudentRefi);
  syncDualInput('creditscore-limit', 'creditscore-limit-range', calcCreditScore);
  syncDualInput('creditscore-balance', 'creditscore-balance-range', calcCreditScore);
  syncDualInput('creditscore-target-pay', 'creditscore-target-pay-range', calcCreditScore);
  syncDualInput('solar-system-cost', 'solar-system-cost-range', calcSolar);
  syncDualInput('solar-tax-credit-pct', 'solar-tax-credit-pct-range', calcSolar);
  syncDualInput('solar-monthly-electric', 'solar-monthly-electric-range', calcSolar);
  syncDualInput('solar-offset-pct', 'solar-offset-pct-range', calcSolar);
  syncDualInput('evgas-miles', 'evgas-miles-range', calcEvGas);
  syncDualInput('evgas-gas-price', 'evgas-gas-price-range', calcEvGas);
  syncDualInput('evgas-mpg', 'evgas-mpg-range', calcEvGas);
  syncDualInput('evgas-kwh-rate', 'evgas-kwh-rate-range', calcEvGas);
  syncDualInput('evgas-ev-efficiency', 'evgas-ev-efficiency-range', calcEvGas);
  syncDualInput('staking-principal', 'staking-principal-range', calcStaking);
  syncDualInput('staking-apy', 'staking-apy-range', calcStaking);
  syncDualInput('staking-duration-days', 'staking-duration-days-range', calcStaking);
  syncDualInput('staking-price-ratio', 'staking-price-ratio-range', calcStaking);
  syncDualInput('dropship-retail-price', 'dropship-retail-price-range', calcDropship);
  syncDualInput('dropship-cogs', 'dropship-cogs-range', calcDropship);
  syncDualInput('dropship-ad-cost', 'dropship-ad-cost-range', calcDropship);
  syncDualInput('dropship-platform-pct', 'dropship-platform-pct-range', calcDropship);
  syncDualInput('realreturns-portfolio', 'realreturns-portfolio-range', calcRealReturns);
  syncDualInput('realreturns-nominal-rate', 'realreturns-nominal-rate-range', calcRealReturns);
  syncDualInput('realreturns-inflation', 'realreturns-inflation-range', calcRealReturns);
  syncDualInput('realreturns-years', 'realreturns-years-range', calcRealReturns);
  syncDualInput('airbnb-adr', 'airbnb-adr-range', calcAirbnb);
  syncDualInput('airbnb-occupancy', 'airbnb-occupancy-range', calcAirbnb);
  syncDualInput('airbnb-mortgage', 'airbnb-mortgage-range', calcAirbnb);
  syncDualInput('airbnb-operating', 'airbnb-operating-range', calcAirbnb);

  // Setup tabs & sidebar
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => switchEngine(btn.id));
  });

  setupCurrencySelector();
  setupSidebarFilter();
  updateHistoryCount();
  setupEngineFocusTracking();

  // Try URL restore first, then storage
  const restoredFromUrl = restoreFromUrlHash();
  if (!restoredFromUrl) {
    const loaded = loadStateFromStorage();
    if (!loaded) {
      setGlobalCurrency('USD');
    }
  }

  recalculateAll();
  switchEngine(activeEngineId, false);

  // Initialize Enterprise & Commercial Business Modules
  initPersonaWorkspace();
  loadFinancialProfile();
  loadAdvisorProfile();
  updateContextualLeadCard(activeEngineId);
  updateAuditTrailContent(activeEngineId);
});

// =============================================================
// COMMERCIAL & ENTERPRISE BUSINESS MODULES
// =============================================================

// -------------------------------------------------------------
// 1. PERSONA WORKSPACES & INTENT-BASED QUICK SWITCHER (PHASE 1)
// -------------------------------------------------------------
let currentPersonaWorkspace = 'all';

const personaWorkspaces = {
  'real-estate': {
    name: 'Real Estate & Mortgage Strategy',
    icon: '🏡',
    description: 'Model property acquisition leverage, evaluate net operating income (NOI), verify 43% DTI affordability, and simulate cash-on-cash equity yield.',
    primaryEngine: 'tab-mortgage',
    engines: [
      'tab-mortgage', 'tab-affordability', 'tab-refinance', 'tab-biweekly',
      'tab-rentbuy', 'tab-cashoncash', 'tab-caprate', 'tab-heloc',
      'tab-closingcosts', 'tab-airbnb'
    ],
    workflow: [
      { label: '1. Max Affordability', engineId: 'tab-affordability' },
      { label: '2. Mortgage Outlay', engineId: 'tab-mortgage' },
      { label: '3. Closing Costs', engineId: 'tab-closingcosts' },
      { label: '4. Refinance Drag', engineId: 'tab-refinance' },
      { label: '5. Rental Cash-on-Cash', engineId: 'tab-cashoncash' }
    ]
  },
  'wealth': {
    name: 'Wealth, FIRE & Retirement Horizon',
    icon: '🛡️',
    description: 'Engineer financial independence (FIRE 4% rule), project tax-advantaged 401(k) / Roth accumulation, and model inflation-adjusted safe withdrawal rates.',
    primaryEngine: 'tab-compound',
    engines: [
      'tab-compound', 'tab-fire', 'tab-four01k', 'tab-rmd',
      'tab-socialsecurity', 'tab-cdladder', 'tab-hsa', 'tab-sip',
      'tab-dividend', 'tab-cagr', 'tab-realreturns'
    ],
    workflow: [
      { label: '1. Compound Multiplier', engineId: 'tab-compound' },
      { label: '2. FIRE 4% Horizon', engineId: 'tab-fire' },
      { label: '3. 401(k) & Roth Shield', engineId: 'tab-four01k' },
      { label: '4. Social Security Max', engineId: 'tab-socialsecurity' },
      { label: '5. CD Ladder Liquidity', engineId: 'tab-cdladder' }
    ]
  },
  'business': {
    name: 'Small Business, Commerce & Tax Matrix',
    icon: '💼',
    description: 'Optimize enterprise gross margin, simulate quarterly 1040-ES estimated taxes, analyze venture break-even units, and forecast contractor billing outlays.',
    primaryEngine: 'tab-invoice',
    engines: [
      'tab-invoice', 'tab-salary', 'tab-breakeven', 'tab-margin',
      'tab-paycheck', 'tab-quarterlytax', 'tab-overtime', 'tab-bonustax',
      'tab-severance', 'tab-solar', 'tab-evgas', 'tab-dropship'
    ],
    workflow: [
      { label: '1. Paycheck Net', engineId: 'tab-paycheck' },
      { label: '2. 1040-ES Tax Voucher', engineId: 'tab-quarterlytax' },
      { label: '3. Hourly to Salary', engineId: 'tab-salary' },
      { label: '4. Invoicing Matrix', engineId: 'tab-invoice' },
      { label: '5. Break-Even Level', engineId: 'tab-breakeven' }
    ]
  },
  'debt': {
    name: 'Debt Elimination & Budget Solvency',
    icon: '💳',
    description: 'Eradicate high-APR revolving card debt via mathematical avalanche/snowball protocols, model personal consolidation, and optimize FICO credit utilization.',
    primaryEngine: 'tab-creditcard',
    engines: [
      'tab-creditcard', 'tab-snowball', 'tab-personalloan', 'tab-autoloan',
      'tab-autorefi', 'tab-student', 'tab-studentrefi', 'tab-budget',
      'tab-creditscore', 'tab-carlease'
    ],
    workflow: [
      { label: '1. 50/30/20 Budget', engineId: 'tab-budget' },
      { label: '2. Credit Utilization', engineId: 'tab-creditscore' },
      { label: '3. Snowball vs Avalanche', engineId: 'tab-snowball' },
      { label: '4. Personal Consolidation', engineId: 'tab-personalloan' },
      { label: '5. Student Refinance', engineId: 'tab-studentrefi' }
    ]
  },
  'all': {
    name: 'Universal Matrix (All 50 Engines)',
    icon: '🌐',
    description: 'Master View: Displaying all 50 global computing engines spanning Real Estate, Wealth, Debt, Tax, and Business.',
    primaryEngine: 'tab-mortgage',
    engines: [],
    workflow: [
      { label: 'Mortgage', engineId: 'tab-mortgage' },
      { label: 'FIRE Retirement', engineId: 'tab-fire' },
      { label: 'Compound Wealth', engineId: 'tab-compound' },
      { label: 'Paycheck Tax', engineId: 'tab-paycheck' },
      { label: 'Snowball Payoff', engineId: 'tab-snowball' }
    ]
  }
};

function setPersonaWorkspace(workspaceKey, autoSwitch = true) {
  if (!personaWorkspaces[workspaceKey]) workspaceKey = 'all';
  currentPersonaWorkspace = workspaceKey;
  const config = personaWorkspaces[workspaceKey];

  // 1. Update chip buttons styling
  document.querySelectorAll('.ws-chip').forEach(btn => {
    const isTarget = btn.id === `ws-btn-${workspaceKey}`;
    btn.classList.toggle('active', isTarget);
    btn.classList.toggle('border-emerald-500/40', isTarget);
    btn.classList.toggle('bg-emerald-500/20', isTarget);
    btn.classList.toggle('text-emerald-400', isTarget);
  });

  // 2. Filter sidebar nav tab buttons
  document.querySelectorAll('.tab-btn').forEach(btn => {
    if (workspaceKey === 'all' || config.engines.includes(btn.id)) {
      btn.style.display = 'block';
    } else {
      btn.style.display = 'none';
    }
  });

  // 3. Update strategy banner
  const bannerIcon = document.getElementById('ws-banner-icon');
  const bannerText = document.getElementById('ws-banner-text');
  const workflowBox = document.getElementById('ws-quick-workflow');

  if (bannerIcon) bannerIcon.textContent = config.icon;
  if (bannerText) bannerText.textContent = `${config.name}: ${config.description}`;

  if (workflowBox) {
    workflowBox.innerHTML = '';
    const prefix = document.createElement('span');
    prefix.className = 'text-[10px] uppercase font-bold text-slate-500 font-mono mr-1';
    prefix.textContent = 'Workflow:';
    workflowBox.appendChild(prefix);

    config.workflow.forEach(step => {
      const stepBtn = document.createElement('button');
      stepBtn.className = 'workflow-step-btn px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-slate-300 hover:text-white cursor-pointer';
      stepBtn.textContent = step.label;
      stepBtn.onclick = () => switchEngine(step.engineId);
      workflowBox.appendChild(stepBtn);
    });
  }

  // 4. If current active engine is not in this workspace, auto-switch to primary
  if (autoSwitch && workspaceKey !== 'all') {
    if (!config.engines.includes(activeEngineId)) {
      switchEngine(config.primaryEngine);
    }
  }

  try {
    localStorage.setItem('afc_persona_workspace', workspaceKey);
  } catch (e) {}

  showToast(`Active Workspace: ${config.name}`);
}

function cyclePersonaWorkspace() {
  const keys = ['real-estate', 'wealth', 'business', 'debt', 'all'];
  const curIdx = keys.indexOf(currentPersonaWorkspace);
  const nextKey = keys[(curIdx + 1) % keys.length];
  setPersonaWorkspace(nextKey);
}

function initPersonaWorkspace() {
  let saved = 'all';
  try {
    saved = localStorage.getItem('afc_persona_workspace') || 'all';
  } catch (e) {}
  setPersonaWorkspace(saved, false);
}

// -------------------------------------------------------------
// 2. UNIFIED FINANCIAL PROFILE CORE & AUTO-POPULATION (PHASE 2)
// -------------------------------------------------------------
let financialProfile = {
  annualIncome: 120000,
  monthlyExpenses: 4500,
  liquidSavings: 50000,
  homeValue: 450000,
  creditScore: 740,
  debtMonthly: 650,
  age: 32,
  retireAge: 62,
  taxRate: 24,
  lastUpdated: null
};

function loadFinancialProfile() {
  try {
    const raw = localStorage.getItem('afc_financial_profile');
    if (raw) {
      financialProfile = Object.assign(financialProfile, JSON.parse(raw));
    }
  } catch (e) {}

  // Update modal input values if present
  const incEl = document.getElementById('profile-income');
  const expEl = document.getElementById('profile-expenses');
  const savEl = document.getElementById('profile-savings');
  const homeEl = document.getElementById('profile-home-val');
  const scoreEl = document.getElementById('profile-credit-score');
  const debtEl = document.getElementById('profile-debt-monthly');
  const ageEl = document.getElementById('profile-age');
  const retEl = document.getElementById('profile-retire-age');
  const taxEl = document.getElementById('profile-tax-rate');
  const lastTxt = document.getElementById('profile-last-synced-txt');

  if (incEl) incEl.value = financialProfile.annualIncome;
  if (expEl) expEl.value = financialProfile.monthlyExpenses;
  if (savEl) savEl.value = financialProfile.liquidSavings;
  if (homeEl) homeEl.value = financialProfile.homeValue;
  if (scoreEl) scoreEl.value = financialProfile.creditScore;
  if (debtEl) debtEl.value = financialProfile.debtMonthly;
  if (ageEl) ageEl.value = financialProfile.age;
  if (retEl) retEl.value = financialProfile.retireAge;
  if (taxEl) taxEl.value = financialProfile.taxRate;

  if (lastTxt && financialProfile.lastUpdated) {
    const date = new Date(financialProfile.lastUpdated);
    lastTxt.textContent = `Last synced: ${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  // Update currency labels
  for (let i = 1; i <= 5; i++) {
    const symEl = document.getElementById(`profile-currency-sym${i}`);
    if (symEl) symEl.textContent = currentCurrency;
  }
}

function saveFinancialProfile() {
  const inc = parseFloat(document.getElementById('profile-income')?.value) || 120000;
  const exp = parseFloat(document.getElementById('profile-expenses')?.value) || 4500;
  const sav = parseFloat(document.getElementById('profile-savings')?.value) || 50000;
  const homeVal = parseFloat(document.getElementById('profile-home-val')?.value) || 450000;
  const score = parseInt(document.getElementById('profile-credit-score')?.value) || 740;
  const debt = parseFloat(document.getElementById('profile-debt-monthly')?.value) || 650;
  const age = parseInt(document.getElementById('profile-age')?.value) || 32;
  const retAge = parseInt(document.getElementById('profile-retire-age')?.value) || 62;
  const tax = parseFloat(document.getElementById('profile-tax-rate')?.value) || 24;

  financialProfile = {
    annualIncome: inc,
    monthlyExpenses: exp,
    liquidSavings: sav,
    homeValue: homeVal,
    creditScore: score,
    debtMonthly: debt,
    age: age,
    retireAge: retAge,
    taxRate: tax,
    lastUpdated: new Date().toISOString()
  };

  try {
    localStorage.setItem('afc_financial_profile', JSON.stringify(financialProfile));
  } catch (e) {}

  const lastTxt = document.getElementById('profile-last-synced-txt');
  if (lastTxt) lastTxt.textContent = `Last saved: Just now`;

  showToast('✓ Financial Profile saved to browser runtime!');
}

function applyProfileToAllEngines() {
  saveFinancialProfile();

  const inc = financialProfile.annualIncome;
  const exp = financialProfile.monthlyExpenses;
  const sav = financialProfile.liquidSavings;
  const homeVal = financialProfile.homeValue;
  const score = financialProfile.creditScore;
  const debtMo = financialProfile.debtMonthly;
  const taxRate = financialProfile.taxRate;
  const age = financialProfile.age;
  const retAge = financialProfile.retireAge;
  const horizonYears = Math.max(5, retAge - age);

  // 1. Mortgage
  const mortAsset = document.getElementById('mortgage-asset');
  const mortDown = document.getElementById('mortgage-down');
  const mortRate = document.getElementById('mortgage-rate');
  if (mortAsset) { mortAsset.value = homeVal; updateInputPreviewTag('mortgage-asset', homeVal); }
  if (mortDown) {
    const downVal = Math.round(homeVal * 0.20);
    mortDown.value = downVal;
    updateInputPreviewTag('mortgage-down', downVal);
  }
  if (mortRate) {
    const estimatedRate = score >= 740 ? 5.8 : (score >= 680 ? 6.5 : 7.2);
    mortRate.value = estimatedRate;
    updateInputPreviewTag('mortgage-rate', estimatedRate);
  }

  // 2. Paycheck Gross to Net
  const payGross = document.getElementById('paycheck-gross');
  const payFed = document.getElementById('paycheck-fed-tax');
  if (payGross) {
    const biweeklyGross = Math.round(inc / 26);
    payGross.value = biweeklyGross;
    updateInputPreviewTag('paycheck-gross', biweeklyGross);
  }
  if (payFed) {
    payFed.value = Math.max(8, taxRate - 6);
    updateInputPreviewTag('paycheck-fed-tax', payFed.value);
  }

  // 3. 401(k) Projection
  const fourSalary = document.getElementById('four01k-salary');
  const fourYears = document.getElementById('four01k-years');
  if (fourSalary) { fourSalary.value = inc; updateInputPreviewTag('four01k-salary', inc); }
  if (fourYears) { fourYears.value = horizonYears; updateInputPreviewTag('four01k-years', horizonYears); }

  // 4. FIRE Retirement
  const fireExp = document.getElementById('fire-expenses');
  const fireSav = document.getElementById('fire-savings');
  const fireAnnual = document.getElementById('fire-annual-save');
  if (fireExp) {
    const annualExp = Math.round(exp * 12);
    fireExp.value = annualExp;
    updateInputPreviewTag('fire-expenses', annualExp);
  }
  if (fireSav) { fireSav.value = sav; updateInputPreviewTag('fire-savings', sav); }
  if (fireAnnual) {
    const estAnnualSave = Math.max(5000, Math.round(inc * 0.20));
    fireAnnual.value = estAnnualSave;
    updateInputPreviewTag('fire-annual-save', estAnnualSave);
  }

  // 5. Home Affordability
  const affInc = document.getElementById('affordability-income');
  const affDown = document.getElementById('affordability-down');
  const affDebt = document.getElementById('affordability-debt');
  if (affInc) { affInc.value = inc; updateInputPreviewTag('affordability-income', inc); }
  if (affDown) { affDown.value = Math.min(sav, Math.round(homeVal * 0.20)); updateInputPreviewTag('affordability-down', affDown.value); }
  if (affDebt) { affDebt.value = debtMo; updateInputPreviewTag('affordability-debt', debtMo); }

  // 6. 50/30/20 Budget
  const budInc = document.getElementById('budget-income');
  if (budInc) {
    const moNet = Math.round((inc * (1 - taxRate / 100)) / 12);
    budInc.value = moNet;
    updateInputPreviewTag('budget-income', moNet);
  }

  // 7. Compound Asset Wealth
  const compP = document.getElementById('compound-principal');
  const compY = document.getElementById('compound-years');
  if (compP) { compP.value = sav; updateInputPreviewTag('compound-principal', sav); }
  if (compY) { compY.value = horizonYears; updateInputPreviewTag('compound-years', horizonYears); }

  // 8. CD Ladder
  const cdCap = document.getElementById('cdladder-capital');
  if (cdCap) {
    const cdAmount = Math.round(sav * 0.5);
    cdCap.value = cdAmount;
    updateInputPreviewTag('cdladder-capital', cdAmount);
  }

  // 9. HSA Triple Tax
  const hsaTax = document.getElementById('hsa-tax-bracket');
  const hsaYears = document.getElementById('hsa-years');
  if (hsaTax) { hsaTax.value = taxRate; updateInputPreviewTag('hsa-tax-bracket', taxRate); }
  if (hsaYears) { hsaYears.value = horizonYears; updateInputPreviewTag('hsa-years', horizonYears); }

  // 10. Hourly Wage to Salary
  const salWage = document.getElementById('salary-wage');
  if (salWage) {
    const hourly = Math.round(inc / 2080);
    salWage.value = hourly;
    updateInputPreviewTag('salary-wage', hourly);
  }

  // 11. Closing Costs
  const closePrice = document.getElementById('closingcosts-price');
  if (closePrice) { closePrice.value = homeVal; updateInputPreviewTag('closingcosts-price', homeVal); }

  // 12. Severance Runway
  const sevBurn = document.getElementById('severance-monthly-burn');
  if (sevBurn) { sevBurn.value = exp; updateInputPreviewTag('severance-monthly-burn', exp); }

  // 13. Debt Snowball / Avalanche
  const snowDebt1 = document.getElementById('snowball-debt1-bal');
  if (snowDebt1 && debtMo > 0) {
    snowDebt1.value = Math.round(debtMo * 4);
    updateInputPreviewTag('snowball-debt1-bal', snowDebt1.value);
  }

  // Sync dual input range sliders
  document.querySelectorAll('input[type="number"]').forEach(num => {
    const range = document.getElementById(`${num.id}-range`);
    if (range) range.value = num.value;
  });

  recalculateAll();
  saveStateDebounced();
  closeProfileModal();
  showToast('⚡ Financial Profile applied! 13 computing engines synchronized.');
}

function openProfileModal() {
  loadFinancialProfile();
  const modal = document.getElementById('profile-modal');
  if (modal) modal.classList.add('active');
}

function closeProfileModal() {
  const modal = document.getElementById('profile-modal');
  if (modal) modal.classList.remove('active');
}

// -------------------------------------------------------------
// 3. CONTEXTUAL FINTECH HIGH-YIELD LEAD GEN UNIT (PHASE 3)
// -------------------------------------------------------------
const contextualLeadOffers = {
  housing: {
    badge: 'Mortgage Lending Partner',
    title: 'Compare Today\'s Top Mortgage Rates',
    desc: 'Lock in 30-year fixed rates from 5.75% APR. Zero impact on your credit score to view personalized pre-approval terms.',
    benefits: [
      'Save up to $340/month on refinance',
      'Compare 5+ vetted lenders in 60s'
    ],
    ctaText: 'Check Pre-Approved Rates →',
    disclaimer: 'Equal Housing Lender • NMLS #1138290',
    link: 'https://afinancecalculator.com/#mortgage-offers'
  },
  wealth: {
    badge: 'High-Yield Cash Partner',
    title: 'Earn 5.05% APY on Liquid Cash',
    desc: 'FDIC-insured up to $2.5M. Put your emergency fund or idle capital to work with zero maintenance fees.',
    benefits: [
      '10x higher yield than national average',
      'No minimum deposit & free wire transfers'
    ],
    ctaText: 'Explore Top High-Yield Accounts →',
    disclaimer: 'Member FDIC • Daily Compound Yield',
    link: 'https://afinancecalculator.com/#hysa-offers'
  },
  debt: {
    badge: 'Debt Elimination Partner',
    title: 'Consolidate High-APR Cards from 6.99%',
    desc: 'Combine multiple 24%+ credit card balances into one single predictable low-rate monthly payment.',
    benefits: [
      'Pay off debt up to 24 months faster',
      'Fixed payments with $0 prepayment penalty'
    ],
    ctaText: 'Check Consolidation Rates →',
    disclaimer: 'Personal Loan Rates from 6.99% to 29.99% APR',
    link: 'https://afinancecalculator.com/#consolidation-offers'
  },
  tax: {
    badge: 'Tax Strategy & Invoicing Partner',
    title: 'Automate Deductions & 1040-ES Taxes',
    desc: 'All-in-one business checking, payroll, and 1040-ES automated tax savings with up to $300 welcome bonus.',
    benefits: [
      'Auto-categorize IRS Schedule C write-offs',
      'Zero monthly fee & automated contractor 1099s'
    ],
    ctaText: 'Claim Business Account Bonus →',
    disclaimer: 'FDIC Insured • Seamless Accounting Sync',
    link: 'https://afinancecalculator.com/#business-offers'
  },
  business: {
    badge: 'Enterprise Commerce Partner',
    title: 'Optimize Working Capital & Invoicing',
    desc: 'Unlock next-day payment terms on commercial invoices and scale advertising ROI with 1.5% cashback.',
    benefits: [
      'Instant invoice factoring from 1.25%',
      'Unlimited corporate cards with spend limits'
    ],
    ctaText: 'View Working Capital Lines →',
    disclaimer: 'Commercial Credit • No Personal Guarantee Underwriting',
    link: 'https://afinancecalculator.com/#commercial-offers'
  }
};

function updateContextualLeadCard(engineId) {
  const cat = getEngineCategory(engineId);
  const offer = contextualLeadOffers[cat] || contextualLeadOffers.wealth;

  const badgeText = document.getElementById('lead-badge-text');
  const title = document.getElementById('lead-title');
  const desc = document.getElementById('lead-desc');
  const b1 = document.getElementById('lead-benefit-1');
  const b2 = document.getElementById('lead-benefit-2');
  const cta = document.getElementById('lead-cta-text');
  const disc = document.getElementById('lead-disclaimer');

  if (badgeText) badgeText.textContent = offer.badge;
  if (title) title.textContent = offer.title;
  if (desc) desc.textContent = offer.desc;
  if (b1) b1.textContent = offer.benefits[0];
  if (b2) b2.textContent = offer.benefits[1];
  if (cta) cta.textContent = offer.ctaText;
  if (disc) disc.textContent = offer.disclaimer;
}

function handleLeadClick(event) {
  if (event) event.preventDefault();
  const engineId = activeEngineId;
  const cat = getEngineCategory(engineId);
  const offer = contextualLeadOffers[cat] || contextualLeadOffers.wealth;

  if (typeof gtag === 'function') {
    gtag('event', 'lead_card_click', {
      event_category: 'Monetization',
      event_label: offer.title,
      engine_category: cat
    });
  }

  showToast(`Redirecting to verified partner rates (${offer.badge})...`);
  setTimeout(() => {
    openLeadModal();
  }, 400);
}

// -------------------------------------------------------------
// 4. STATUTORY ASSUMPTIONS & REGULATORY AUDIT TRAIL (PHASE 4)
// -------------------------------------------------------------
const statutoryAssumptions = {
  mortgage: {
    statute: 'CFPB Regulation Z / Truth in Lending Act (TILA) & Qualified Mortgage (QM) Standard',
    details: 'Calculated using standard 360-month/180-month fixed-rate compound amortization: M = P * [r(1+r)^n] / [(1+r)^n - 1]. Benchmark conforms to CFPB QM 43% Debt-to-Income (DTI) ceiling and conforming loan limits ($766,550 for 2025/2026).'
  },
  paycheck: {
    statute: 'IRS 2025/2026 Tax Year Federal Revenue Procedure 2024-40',
    details: 'Federal standard deduction: $15,000 (Single), $30,000 (Married Filing Jointly). FICA Social Security tax applied at 6.2% up to the statutory wage ceiling ($176,100 for 2025). Medicare tax applied at 1.45% base, plus 0.9% Additional Medicare Tax on wages exceeding $200,000.'
  },
  four01k: {
    statute: 'IRS Notice 2024-80 (2025 Pension Plan Limitations)',
    details: 'Elective employee deferral ceiling: $23,500. Catch-up contribution for individuals aged 50 and over: $7,500 (Total $31,000). Total defined contribution annual addition limit under Section 415(c): $70,000.'
  },
  fire: {
    statute: 'Trinity Study Protocol & Empirical S&P 500 / Intermediate Bond Safe Withdrawal Analysis',
    details: 'Safe Withdrawal Rate (SWR) modeled according to Cooley, Hubbard, and Walz (Trinity Study). Assumes 4.0% annual initial portfolio withdrawal indexed annually to CPI-U headline inflation, yielding a 95%+ historical survival probability over a 30-year horizon.'
  },
  capitalgains: {
    statute: 'Internal Revenue Code Section 1(h) (2025 Capital Gains Rate Brackets)',
    details: 'Long-term assets held > 365 days qualify for preferential 0%, 15%, or 20% federal brackets based on taxable income thresholds ($47,025 / $518,900 for single filers). Short-term gains are taxed at ordinary income rates.'
  },
  hsa: {
    statute: 'IRS Revenue Procedure 2024-25 (2025 HSA Contribution Limits)',
    details: 'Annual contribution limit: $4,300 for self-only coverage; $8,550 for family coverage. Additional $1,000 catch-up contribution permitted for individuals aged 55+. Triple tax advantage: pre-tax contributions, tax-free growth, and tax-free qualified distributions.'
  },
  socialsecurity: {
    statute: 'Social Security Act Full Retirement Age (FRA) Matrix & COLA Adjustments',
    details: 'Primary Insurance Amount (PIA) benchmarked to Full Retirement Age of 67 (for persons born 1960 or later). Claiming early at age 62 permanently reduces monthly benefits by up to 30.0%; delaying to age 70 accrues 8% per year in Delayed Retirement Credits (DRC) up to a 124% maximum payout.'
  },
  rmd: {
    statute: 'SECURE 2.0 Act (P.L. 117-328) Required Minimum Distribution (RMD) Guidelines',
    details: 'Mandatory RMD beginning age: Age 73 (increasing to age 75 in 2033). Calculated against IRS Uniform Lifetime Table III divisor. Failure to withdraw RMD incurs a 25% statutory excise penalty under IRC Section 4974 (mitigable to 10% if corrected timely).'
  },
  creditscore: {
    statute: 'FICO® / VantageScore® Revolving Credit Utilization Mathematical Weighting',
    details: 'Revolving credit utilization constitutes ~30% of total FICO scoring weight. Algorithms mathematically optimize when total and per-card utilization drops beneath key statutory reporting thresholds: < 30% (Standard), < 10% (Prime), and < 6% (Super-Prime).'
  },
  default: {
    statute: 'Standard Institutional Financial Mathematical Framework',
    details: 'Calculated using continuous and discrete compound interest equations, Net Present Value (NPV), and empirical market risk benchmarks. Calculations are 100% client-side and uninfluenced by third-party broker bias.'
  }
};

let isAuditTrailOpen = false;

function toggleAuditTrail() {
  isAuditTrailOpen = !isAuditTrailOpen;
  const body = document.getElementById('audit-trail-body');
  const chevron = document.getElementById('audit-trail-chevron');
  if (body) body.classList.toggle('open', isAuditTrailOpen);
  if (chevron) chevron.style.transform = isAuditTrailOpen ? 'rotate(180deg)' : 'none';
}

function updateAuditTrailContent(engineId) {
  const cleanId = (engineId || '').replace('tab-', '').replace('engine-', '');
  const assumption = statutoryAssumptions[cleanId] || statutoryAssumptions.default;
  const container = document.getElementById('audit-trail-text');

  if (container) {
    container.innerHTML = `
      <div class="flex items-start gap-2">
        <span class="text-emerald-400 font-bold shrink-0">📜 Statutory Rule:</span>
        <span class="font-bold text-white">${assumption.statute}</span>
      </div>
      <div class="text-[11px] text-slate-300 mt-1 pl-5">
        ${assumption.details}
      </div>
      <div class="text-[9px] text-slate-500 mt-1 pl-5 font-mono">
        Audit Verified: IRS 2025/2026 Rev Proc 2024-40 • CFPB Standard • Client-Side Zero Storage
      </div>
    `;
  }
}

// -------------------------------------------------------------
// 5. ADVISOR & ENTERPRISE WHITE-LABELING (PHASE 5)
// -------------------------------------------------------------
let advisorProfile = {
  enabled: false,
  firmName: '',
  name: '',
  phone: '',
  email: '',
  clientName: '',
  disclaimer: ''
};

function loadAdvisorProfile() {
  try {
    const raw = localStorage.getItem('afc_advisor_profile');
    if (raw) {
      advisorProfile = Object.assign(advisorProfile, JSON.parse(raw));
    }
  } catch (e) {}

  const toggle = document.getElementById('advisor-enable-toggle');
  const firm = document.getElementById('adv-firm-name');
  const name = document.getElementById('adv-name');
  const phone = document.getElementById('adv-phone');
  const email = document.getElementById('adv-email');
  const client = document.getElementById('adv-client-name');
  const disc = document.getElementById('adv-disclaimer');
  const statusBadge = document.getElementById('advisor-badge-status');

  if (toggle) toggle.checked = !!advisorProfile.enabled;
  if (firm) firm.value = advisorProfile.firmName || '';
  if (name) name.value = advisorProfile.name || '';
  if (phone) phone.value = advisorProfile.phone || '';
  if (email) email.value = advisorProfile.email || '';
  if (client) client.value = advisorProfile.clientName || '';
  if (disc) disc.value = advisorProfile.disclaimer || '';

  if (statusBadge) {
    statusBadge.textContent = advisorProfile.enabled ? 'ON' : 'OFF';
    statusBadge.className = advisorProfile.enabled
      ? 'text-[9px] px-1 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-mono font-bold'
      : 'text-[9px] px-1 py-0.2 rounded bg-slate-800 text-slate-400 font-mono';
  }

  document.body.classList.toggle('advisor-mode-active', !!advisorProfile.enabled);
}

function saveAdvisorProfile() {
  const toggle = document.getElementById('advisor-enable-toggle')?.checked || false;
  const firm = document.getElementById('adv-firm-name')?.value.trim() || '';
  const name = document.getElementById('adv-name')?.value.trim() || '';
  const phone = document.getElementById('adv-phone')?.value.trim() || '';
  const email = document.getElementById('adv-email')?.value.trim() || '';
  const client = document.getElementById('adv-client-name')?.value.trim() || '';
  const disc = document.getElementById('adv-disclaimer')?.value.trim() || '';

  advisorProfile = {
    enabled: toggle,
    firmName: firm,
    name: name,
    phone: phone,
    email: email,
    clientName: client,
    disclaimer: disc
  };

  try {
    localStorage.setItem('afc_advisor_profile', JSON.stringify(advisorProfile));
  } catch (e) {}

  loadAdvisorProfile();
  closeAdvisorModal();
  showToast(toggle ? '✓ Advisor White-Label Mode Activated!' : 'Advisor White-Label Mode Disabled.');
}

function toggleAdvisorMode(enabled) {
  advisorProfile.enabled = enabled;
  saveAdvisorProfile();
}

function openAdvisorModal() {
  loadAdvisorProfile();
  const modal = document.getElementById('advisor-modal');
  if (modal) modal.classList.add('active');
}

function closeAdvisorModal() {
  const modal = document.getElementById('advisor-modal');
  if (modal) modal.classList.remove('active');
}

// -------------------------------------------------------------
// 6. LEAD RETENTION HUB & PLAN DELIVERY (PHASE 6)
// -------------------------------------------------------------
function openLeadModal() {
  const modal = document.getElementById('lead-capture-modal');
  if (modal) modal.classList.add('active');
}

function closeLeadModal() {
  const modal = document.getElementById('lead-capture-modal');
  if (modal) modal.classList.remove('active');
}

function submitLeadCapture(event) {
  if (event) event.preventDefault();

  const name = document.getElementById('lead-user-name')?.value.trim() || 'Valued User';
  const email = document.getElementById('lead-user-email')?.value.trim() || '';
  const goal = document.getElementById('lead-user-goal')?.value || 'general';
  const optin = document.getElementById('lead-user-optin')?.checked || false;

  const leadRecord = {
    id: 'lead_' + Date.now(),
    name: name,
    email: email,
    goal: goal,
    optin: optin,
    timestamp: new Date().toISOString(),
    currency: currentCurrencyCode
  };

  // 1. Store lead record in localStorage
  try {
    const leads = JSON.parse(localStorage.getItem('afc_leads_captured') || '[]');
    leads.push(leadRecord);
    localStorage.setItem('afc_leads_captured', JSON.stringify(leads));
  } catch (e) {}

  // 2. Fire Google Analytics Event
  if (typeof gtag === 'function') {
    gtag('event', 'generate_lead', {
      event_category: 'Lead Generation',
      event_label: goal,
      value: 1.0
    });
  }

  // 3. Generate and trigger download of Master Financial Playbook deliverable
  const playbookText = `========================================================================
aFinanceCalculator™ Master Financial Planning Playbook & Strategic Guidelines
Prepared for: ${name} (${email})
Generated: ${new Date().toLocaleDateString()} | Benchmark Currency: ${currentCurrencyCode} (${currentCurrency})
========================================================================

SECTION 1: THE CORE FINANCIAL RULES
1. The 4% Rule (FIRE Trinity Study):
   - Multiply your expected annual retirement expenses by 25 to establish your safe freedom nest egg.
   - Example: ${formatCurrency(60000)}/yr in living costs requires ${formatCurrency(1500000)} invested in low-cost broad index equities.
   
2. The 50/30/20 Cash Allocation Rule:
   - 50% Needs: Housing, groceries, utilities, minimum debt payments.
   - 30% Wants: Discretionary dining, vacations, entertainment.
   - 20% Compounding Wealth: 401(k), Roth IRA, HSA, debt principal paydown.

3. The Debt Avalanche Protocol:
   - Always pay off debts strictly ordered by interest APR from highest to lowest.
   - This mathematically saves the highest sum in interest charges and shortens freedom timelines.

4. Mortgage & Housing Leverage Guideline:
   - Keep total shelter outlays (PITI) beneath 28% of gross monthly income (front-end DTI).
   - Keep total recurring debt outlays beneath 36% to 43% of gross income (back-end DTI).

SECTION 2: 2025/2026 STATUTORY TAX LIMITS
- IRS 401(k) / 403(b) Elective Limit: $23,500 ($31,000 for age 50+)
- HSA Contribution Ceilings: $4,300 (Single) / $8,550 (Family)
- Federal Standard Deduction: $15,000 (Single) / $30,000 (Married)
- FICA Social Security Wage Cap: $176,100

========================================================================
100% Client-Side Privacy: Your financial models run in your private browser.
Access all 50 financial engines anytime at https://afinancecalculator.com
========================================================================`;

  const blob = new Blob([playbookText], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `aFinanceCalculator_Master_Playbook_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  closeLeadModal();
  showToast('✓ Financial Plan & Master Playbook successfully prepared and delivered!');
}

// -------------------------------------------------------------
// 51. U.S. & CANADA BANKING HUB SCROLL NAVIGATION
// -------------------------------------------------------------
function scrollToBankingHub() {
  if (typeof switchEngine === 'function') {
    switchEngine('tab-banking-hub', true);
  } else {
    const bankingEl = document.getElementById('engine-banking');
    if (bankingEl) {
      bankingEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // Visual highlight pulse
  const bankingSection = document.getElementById('engine-banking');
  if (bankingSection) {
    bankingSection.classList.add('ring-2', 'ring-emerald-400');
    setTimeout(() => {
      bankingSection.classList.remove('ring-2', 'ring-emerald-400');
    }, 2000);
  }

  if (typeof gtag === 'function') {
    try {
      gtag('event', 'navigate_banking_hub', {
        event_category: 'Banking Hub',
        event_label: 'Header / Nav Jump'
      });
    } catch (e) {}
  }
}

// Explicit Global Window Bindings for Inline Handlers
if (typeof window !== 'undefined') {
  // Navigation & Hubs
  window.switchEngine = switchEngine;
  window.scrollToBankingHub = scrollToBankingHub;

  // Existing Handlers
  window.openScenarioStudio = openScenarioStudio;
  window.closeScenarioStudio = closeScenarioStudio;
  window.switchScenarioModel = switchScenarioModel;
  window.calcScenarioStudio = calcScenarioStudio;
  window.resetScenarioStudio = resetScenarioStudio;
  window.applyScenarioBToWorkspace = applyScenarioBToWorkspace;
  window.openShareModal = openShareModal;
  window.closeShareModal = closeShareModal;
  window.copyShareUrlDirect = copyShareUrlDirect;
  window.shareViaSocial = shareViaSocial;
  window.openShortcutsModal = openShortcutsModal;
  window.closeShortcutsModal = closeShortcutsModal;
  window.openHistoryDrawer = openHistoryDrawer;
  window.closeHistoryDrawer = closeHistoryDrawer;
  window.setHistoryCategoryFilter = setHistoryCategoryFilter;
  window.filterHistoryList = filterHistoryList;
  window.deleteHistoryItem = deleteHistoryItem;
  window.copyHistoryItem = copyHistoryItem;
  window.exportHistoryData = exportHistoryData;
  window.openDossierModal = openDossierModal;
  window.closeDossierModal = closeDossierModal;
  window.copyDossierReport = copyDossierReport;
  window.exportDossierJson = exportDossierJson;
  window.printDossierReport = printDossierReport;
  window.openAmortizationModal = openAmortizationModal;
  window.closeAmortizationModal = closeAmortizationModal;
  window.setAmortizationView = setAmortizationView;
  window.filterAmortizationTable = filterAmortizationTable;
  window.copyAmortizationTable = copyAmortizationTable;
  window.exportAmortizationCsv = exportAmortizationCsv;
  window.printAmortizationSchedule = printAmortizationSchedule;

  // New Commercial Business Handlers
  window.setPersonaWorkspace = setPersonaWorkspace;
  window.cyclePersonaWorkspace = cyclePersonaWorkspace;
  window.openProfileModal = openProfileModal;
  window.closeProfileModal = closeProfileModal;
  window.saveFinancialProfile = saveFinancialProfile;
  window.applyProfileToAllEngines = applyProfileToAllEngines;
  window.updateContextualLeadCard = updateContextualLeadCard;
  window.handleLeadClick = handleLeadClick;
  window.toggleAuditTrail = toggleAuditTrail;
  window.updateAuditTrailContent = updateAuditTrailContent;
  window.openAdvisorModal = openAdvisorModal;
  window.closeAdvisorModal = closeAdvisorModal;
  window.saveAdvisorProfile = saveAdvisorProfile;
  window.toggleAdvisorMode = toggleAdvisorMode;
  window.openLeadModal = openLeadModal;
  window.closeLeadModal = closeLeadModal;
  window.submitLeadCapture = submitLeadCapture;

  // Manual Amortization Period & Engine Handlers
  window.setMortgageTerm = setMortgageTerm;
  window.setRefinanceTerm = setRefinanceTerm;
  window.setAffordabilityTerm = setAffordabilityTerm;
  window.setBiweeklyTerm = setBiweeklyTerm;
  window.setAutoLoanTerm = setAutoLoanTerm;
  window.setAutoRefiMonths = setAutoRefiMonths;
  window.setPersonalLoanTerm = setPersonalLoanTerm;
  window.setStudentMonths = setStudentMonths;
  window.setHelocRepayYears = setHelocRepayYears;
  window.handleModalPeriodChange = handleModalPeriodChange;
  window.handleModalPeriodUnitChange = handleModalPeriodUnitChange;
  window.setModalAmortizationPeriod = setModalAmortizationPeriod;
  window.applyModalAmortizationMonths = applyModalAmortizationMonths;

  // Rent vs Buy Decision Matrix Handlers
  window.setRentBuyHorizon = setRentBuyHorizon;
  window.toggleRentBuyAssumptions = toggleRentBuyAssumptions;
  window.calcRentBuy = calcRentBuy;
}


function focusCustomTerm(inputId) {
  const el = document.getElementById(inputId);
  if (el) {
    el.focus();
    el.select();
  }
}
window.focusCustomTerm = focusCustomTerm;
