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
function setMortgageTerm(years) {
  mortgageTermYears = years;
  document.querySelectorAll('.mortgage-term-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.years) === years);
  });
  calcMortgage();
  saveStateDebounced();
}

function calcMortgage() {
  const asset = parseFloat(document.getElementById('mortgage-asset').value) || 0;
  const down = parseFloat(document.getElementById('mortgage-down').value) || 0;
  const rate = parseFloat(document.getElementById('mortgage-rate').value) || 0;
  const extraPay = parseFloat(document.getElementById('mortgage-extra')?.value) || 0;
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
  } else {
    const extraMonthsEl = document.getElementById('mortgage-extra-months-saved');
    if (extraMonthsEl) extraMonthsEl.textContent = `0 Months`;

    const extraIntEl = document.getElementById('mortgage-extra-int-saved');
    if (extraIntEl) extraIntEl.textContent = formatCurrency(0);
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
// 11. RESIDENTIAL HOUSING ANALYSIS FRAMEWORK
// -------------------------------------------------------------
function calcRentBuy() {
  const rent = parseFloat(document.getElementById('rentbuy-rent').value) || 0;
  const mortgage = parseFloat(document.getElementById('rentbuy-mortgage').value) || 0;

  const monthlyVariance = mortgage - rent;
  const annualVariance = monthlyVariance * 12;
  const fiveYearVariance = annualVariance * 5;

  const annEl = document.getElementById('rentbuy-annual-variance');
  if (annEl) annEl.textContent = `${formatCurrency(annualVariance)} / Annum`;

  const monEl = document.getElementById('rentbuy-monthly-variance');
  if (monEl) monEl.textContent = `${formatCurrency(monthlyVariance)} / Mo`;

  const fiveEl = document.getElementById('rentbuy-5yr-variance');
  if (fiveEl) fiveEl.textContent = formatCurrency(fiveYearVariance);

  const verdictEl = document.getElementById('rentbuy-verdict');
  if (verdictEl) {
    if (annualVariance > 0) {
      verdictEl.textContent = `Renting retains ${formatCurrency(monthlyVariance)}/mo positive operational cash flow over purchasing.`;
    } else if (annualVariance < 0) {
      verdictEl.textContent = `Mortgage is ${formatCurrency(Math.abs(monthlyVariance))}/mo cheaper than contractual leasing!`;
    } else {
      verdictEl.textContent = `Lease and purchase outlays are currently at cash-flow parity.`;
    }
  }

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

// -------------------------------------------------------------
// 14. STUDENT LOAN PAYOFF HORIZON MATRIX
// -------------------------------------------------------------
function calcStudent() {
  const debt = parseFloat(document.getElementById('student-debt').value) || 0;
  const apr = parseFloat(document.getElementById('student-rate').value) || 0;
  const months = parseFloat(document.getElementById('student-months').value) || 1;

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

  const monthlyGross = income / 12;
  const maxDebtAllowed = monthlyGross * 0.36; // 36% back-end DTI cap
  const taxInsBuffer = monthlyGross * 0.05;
  const maxMonthlyPI = Math.max(0, maxDebtAllowed - debt - taxInsBuffer);

  let loanSupported = 0;
  if (maxMonthlyPI > 0 && rate > 0) {
    const monthlyRate = (rate / 100) / 12;
    const n = 360; // 30-year schedule
    loanSupported = (maxMonthlyPI * (Math.pow(1 + monthlyRate, n) - 1)) / (monthlyRate * Math.pow(1 + monthlyRate, n));
  } else if (rate === 0 && maxMonthlyPI > 0) {
    loanSupported = maxMonthlyPI * 360;
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

// -------------------------------------------------------------
// 22. MORTGAGE REFINANCE BREAK-EVEN
// -------------------------------------------------------------
function calcRefinance() {
  const balance = parseFloat(document.getElementById('refinance-balance').value) || 0;
  const curRate = parseFloat(document.getElementById('refinance-current-rate').value) || 0;
  const newRate = parseFloat(document.getElementById('refinance-new-rate').value) || 0;
  const costs = parseFloat(document.getElementById('refinance-costs').value) || 0;
  const n = 360;

  const calcMo = (bal, r) => {
    if (r === 0) return bal / n;
    const mr = (r / 100) / 12;
    return (bal * mr * Math.pow(1 + mr, n)) / (Math.pow(1 + mr, n) - 1);
  };

  const oldMonthly = balance > 0 ? calcMo(balance, curRate) : 0;
  const newMonthly = balance > 0 ? calcMo(balance, newRate) : 0;
  const monthlySavings = Math.max(0, oldMonthly - newMonthly);

  const breakevenMonths = monthlySavings > 0 ? Math.ceil(costs / monthlySavings) : 0;
  const lifetimeSavings = Math.max(0, (monthlySavings * 360) - costs);

  const saveEl = document.getElementById('refinance-monthly-savings');
  const breakEl = document.getElementById('refinance-breakeven-months');
  const lifeEl = document.getElementById('refinance-lifetime-savings');

  if (saveEl) saveEl.textContent = formatCurrency(monthlySavings);
  if (breakEl) breakEl.textContent = `${breakevenMonths} Months`;
  if (lifeEl) lifeEl.textContent = formatCurrency(lifetimeSavings);

  flashElement('refinance-monthly-savings');
}

// -------------------------------------------------------------
// 23. BI-WEEKLY MORTGAGE ACCELERATION
// -------------------------------------------------------------
function calcBiweekly() {
  const balance = parseFloat(document.getElementById('biweekly-balance').value) || 0;
  const rate = parseFloat(document.getElementById('biweekly-rate').value) || 0;
  const termYears = parseFloat(document.getElementById('biweekly-term').value) || 30;
  const n = termYears * 12;

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
  const repayYears = parseFloat(document.getElementById('heloc-repay-years').value) || 15;

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

  renderSnowballChart(bal1, bal2, extra, apr1, apr2);
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

// -------------------------------------------------------------
// 42. AUTO LOAN REFINANCE SAVINGS
// -------------------------------------------------------------
function calcAutoRefi() {
  const balance = parseFloat(document.getElementById('autorefi-balance').value) || 0;
  const curRate = parseFloat(document.getElementById('autorefi-current-rate').value) || 0;
  const newRate = parseFloat(document.getElementById('autorefi-new-rate').value) || 0;
  const months = parseInt(document.getElementById('autorefi-months').value) || 48;

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

  renderSolarChart(cost, creditPct, monthlyElectric, offsetPct);
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

  if (tabOrEngineId.startsWith('engine-')) {
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
let amortizationViewMode = 'annual'; // 'annual' or 'monthly'

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
  let principal = 0;
  let rate = 0;
  let months = 360;
  let title = 'Amortization Schedule';

  if (type === 'mortgage') {
    const asset = parseFloat(document.getElementById('mortgage-asset').value) || 0;
    const down = parseFloat(document.getElementById('mortgage-down').value) || 0;
    principal = Math.max(0, asset - down);
    rate = parseFloat(document.getElementById('mortgage-rate').value) || 0;
    months = mortgageTermYears * 12;
    const cardTitle = document.getElementById('engine-mortgage')?.querySelector('h2')?.textContent || 'Mortgage';
    title = `${cardTitle} Schedule (${mortgageTermYears} Yrs @ ${rate}%)`;
  } else if (type === 'autoloan') {
    principal = parseFloat(document.getElementById('autoloan-value').value) || 0;
    rate = parseFloat(document.getElementById('autoloan-rate').value) || 0;
    months = parseInt(document.getElementById('autoloan-term').value) || 60;
    const cardTitle = document.getElementById('engine-autoloan')?.querySelector('h2')?.textContent || 'Auto Finance';
    title = `${cardTitle} Schedule (${months} Mo @ ${rate}%)`;
  } else if (type === 'student') {
    principal = parseFloat(document.getElementById('student-debt').value) || 0;
    rate = parseFloat(document.getElementById('student-rate').value) || 0;
    months = parseInt(document.getElementById('student-months').value) || 120;
    const cardTitle = document.getElementById('engine-student')?.querySelector('h2')?.textContent || 'Student Loan';
    title = `${cardTitle} Schedule (${months} Mo @ ${rate}%)`;
  }

  currentAmortizationData = generateAmortizationSchedule(principal, rate, months);
  document.getElementById('amort-modal-title').textContent = title;
  renderAmortizationTable();

  const modal = document.getElementById('amortization-modal');
  if (modal) modal.classList.add('active');
}

function closeAmortizationModal() {
  const modal = document.getElementById('amortization-modal');
  if (modal) modal.classList.remove('active');
}

function setAmortizationView(mode) {
  amortizationViewMode = mode;
  document.getElementById('amort-view-annual').classList.toggle('active', mode === 'annual');
  document.getElementById('amort-view-monthly').classList.toggle('active', mode === 'monthly');
  renderAmortizationTable();
}

function renderAmortizationTable() {
  const tbody = document.getElementById('amortization-tbody');
  if (!tbody || !currentAmortizationData.length) return;

  tbody.innerHTML = '';

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
      const tr = document.createElement('tr');
      tr.className = 'border-b border-slate-800 hover:bg-slate-800/40 font-mono-num text-xs';
      tr.innerHTML = `
        <td class="py-2.5 px-3 font-bold text-emerald-400">Year ${row.year}</td>
        <td class="py-2.5 px-3 text-slate-200">${formatCurrency(row.payment)}</td>
        <td class="py-2.5 px-3 text-emerald-300">${formatCurrency(row.principal)}</td>
        <td class="py-2.5 px-3 text-rose-300">${formatCurrency(row.interest)}</td>
        <td class="py-2.5 px-3 text-slate-100 font-bold">${formatCurrency(row.balance)}</td>
      `;
      tbody.appendChild(tr);
    });
  } else {
    // Monthly view (first 120 rows for performance with scroll)
    currentAmortizationData.forEach(row => {
      const tr = document.createElement('tr');
      tr.className = 'border-b border-slate-800 hover:bg-slate-800/40 font-mono-num text-xs';
      tr.innerHTML = `
        <td class="py-2 px-3 text-slate-400">Mo ${row.month}</td>
        <td class="py-2 px-3 text-slate-200">${formatCurrency(row.payment)}</td>
        <td class="py-2 px-3 text-emerald-300">${formatCurrency(row.principal)}</td>
        <td class="py-2 px-3 text-rose-300">${formatCurrency(row.interest)}</td>
        <td class="py-2 px-3 text-slate-100 font-bold">${formatCurrency(row.balance)}</td>
      `;
      tbody.appendChild(tr);
    });
  }
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
  link.setAttribute('download', `aFinanceCalculator_Amortization_Schedule_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  showToast('✓ Amortization Schedule exported to CSV!');
}

// -------------------------------------------------------------
// URL DEEP LINKING & SHAREABLE SCENARIOS
// -------------------------------------------------------------
function copyScenarioUrl() {
  const params = new URLSearchParams();
  params.set('engine', activeEngineId);
  params.set('curr', currentCurrencyCode);

  // Collect inputs of active panel
  const panel = document.getElementById(activeEngineId.replace('tab-', 'engine-'));
  if (panel) {
    panel.querySelectorAll('input[type="number"]').forEach(input => {
      params.set(input.id, input.value);
    });
  }

  const shareUrl = `${window.location.origin}${window.location.pathname}#${params.toString()}`;
  navigator.clipboard.writeText(shareUrl).then(() => {
    showToast('✓ Shareable scenario URL copied to clipboard!');
  }).catch(() => {
    showToast('Failed to copy scenario link.');
  });
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

// History Recording
function recordHistory(engineTitle, mainMetric) {
  try {
    let history = JSON.parse(localStorage.getItem('afinancecalc_history') || localStorage.getItem('capmetrix_history') || '[]');
    const record = {
      engineId: activeEngineId,
      title: engineTitle,
      metric: mainMetric,
      currency: `${currentCurrencyCode} (${currentCurrency})`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    history.unshift(record);
    if (history.length > 20) history = history.slice(0, 20);
    localStorage.setItem('afinancecalc_history', JSON.stringify(history));
    updateHistoryCount();
  } catch (e) {}
}

function updateHistoryCount() {
  try {
    const history = JSON.parse(localStorage.getItem('afinancecalc_history') || localStorage.getItem('capmetrix_history') || '[]');
    const badge = document.getElementById('history-count-badge');
    if (badge) badge.textContent = history.length;
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

function renderHistoryList() {
  const listEl = document.getElementById('history-list');
  if (!listEl) return;

  try {
    const history = JSON.parse(localStorage.getItem('afinancecalc_history') || localStorage.getItem('capmetrix_history') || '[]');
    if (!history.length) {
      listEl.innerHTML = `<div class="p-6 text-center text-xs text-slate-500">No calculation history yet. Calculations and copied reports will appear here.</div>`;
      return;
    }

    listEl.innerHTML = '';
    history.forEach((item, index) => {
      const card = document.createElement('div');
      card.className = 'p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs hover:border-slate-700 transition-all';
      card.innerHTML = `
        <div>
          <div class="font-bold text-slate-200">${item.title}</div>
          <div class="text-emerald-400 font-mono-num font-semibold text-sm mt-0.5">${item.metric}</div>
          <div class="text-[10px] text-slate-500 mt-0.5">${item.time}</div>
        </div>
        <button onclick="switchEngine('${item.engineId}'); closeHistoryDrawer();" class="px-2.5 py-1 text-[11px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 rounded-lg hover:bg-emerald-900 transition-colors">Jump</button>
      `;
      listEl.appendChild(card);
    });
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

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl + K or '/' to focus search
    if ((e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement.tagName !== 'INPUT')) {
      e.preventDefault();
      const search = document.getElementById('engine-search');
      if (search) search.focus();
    }
    // Ctrl + P to print focused engine only
    if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 'P')) {
      e.preventDefault();
      printCurrentEngine();
    }
    // Escape to close modals/drawers
    if (e.key === 'Escape') {
      closeAmortizationModal();
      closeHistoryDrawer();
      closeDossierModal();
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
// EXECUTIVE FINANCIAL DOSSIER MODAL GENERATOR
// -------------------------------------------------------------
function openDossierModal() {
  const container = document.getElementById('dossier-report-content');
  const timestampEl = document.getElementById('dossier-timestamp');
  if (!container) return;

  const now = new Date();
  if (timestampEl) {
    timestampEl.textContent = `Generated: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()} | Currency: ${currentCurrencyCode} (${currentCurrency})`;
  }

  // Compile Key Engine Snapshots
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

function printDossierReport() {
  document.body.classList.add('printing-dossier');
  const printTitle = document.getElementById('print-engine-title');
  const printSub = document.getElementById('print-engine-subtitle');
  const printTime = document.getElementById('print-report-timestamp');
  if (printTitle) printTitle.textContent = 'Consolidated Executive Financial Dossier';
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
  syncDualInput('refinance-balance', 'refinance-balance-range', calcRefinance);
  syncDualInput('refinance-current-rate', 'refinance-current-rate-range', calcRefinance);
  syncDualInput('refinance-new-rate', 'refinance-new-rate-range', calcRefinance);
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
});
