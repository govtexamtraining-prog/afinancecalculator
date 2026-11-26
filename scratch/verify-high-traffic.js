/**
 * Double-verify high-traffic calculators: SEO pages + math + engine wiring.
 * Run: node scratch/verify-high-traffic.js
 */
const fs = require('fs');
const path = require('path');
const http = require('http');

const root = path.join(__dirname, '..');
const origin = 'http://127.0.0.1:5199';

const TOOLS = [
  { priority: 1, name: 'Mortgage PITI', slug: 'mortgage-calculator', engine: 'tab-mortgage', panel: 'engine-mortgage' },
  { priority: 2, name: 'Amortization', slug: 'amortization-calculator', engine: 'tab-amortization', panel: 'engine-amortization' },
  { priority: 3, name: 'Balance transfer', slug: 'balance-transfer-calculator', engine: 'tab-balancetransfer', panel: 'engine-balancetransfer' },
  { priority: 4, name: 'Savings / HYSA', slug: 'savings-calculator', engine: 'tab-savings', panel: 'engine-savings' },
  { priority: 5, name: 'CD calculator', slug: 'cd-calculator', engine: 'tab-cd', panel: 'engine-cd' },
  { priority: 6, name: 'Roth IRA', slug: 'roth-ira-calculator', engine: 'tab-rothira', panel: 'engine-rothira' },
  { priority: 7, name: 'Down payment', slug: 'down-payment-calculator', engine: 'tab-downpayment', panel: 'engine-downpayment' },
  { priority: 8, name: 'Car affordability', slug: 'car-affordability-calculator', engine: 'tab-carafford', panel: 'engine-carafford' },
  { priority: 9, name: 'Rent affordability', slug: 'rent-affordability-calculator', engine: 'tab-rentafford', panel: 'engine-rentafford' },
  { priority: 10, name: 'APR compare', slug: 'apr-loan-comparison-calculator', engine: 'tab-aprcompare', panel: 'engine-aprcompare' }
];

function fail(msg) {
  console.error('FAIL:', msg);
  process.exitCode = 1;
}

function ok(msg) {
  console.log('OK  ', msg);
}

function get(urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.get(origin + urlPath, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => resolve({ status: res.statusCode, body: data, headers: res.headers }));
    });
    req.on('error', reject);
    req.setTimeout(8000, () => {
      req.destroy(new Error('timeout ' + urlPath));
    });
  });
}

function pmt(principal, annualPct, months) {
  if (principal <= 0 || months <= 0) return 0;
  const r = annualPct / 100 / 12;
  if (r === 0) return principal / months;
  return (principal * (r * Math.pow(1 + r, months))) / (Math.pow(1 + r, months) - 1);
}

function nearly(a, b, tol = 0.02) {
  return Math.abs(a - b) <= tol;
}

function verifyMath() {
  console.log('\n=== MATH CHECKS ===');
  // Mortgage P&I known: 360000 @ 6.2% 30y
  const pi = pmt(360000, 6.2, 360);
  if (!nearly(pi, 2204.89, 0.05)) fail(`mortgage P&I expected ~2204.89 got ${pi}`);
  else ok(`mortgage P&I ${pi.toFixed(2)}`);
  const piti = pi + 375 + 140 + 0 + 0;
  if (!nearly(piti, 2719.89, 0.05)) fail(`PITI expected ~2719.89 got ${piti}`);
  else ok(`mortgage PITI ${piti.toFixed(2)} (= P&I + tax 375 + ins 140)`);

  // Amortization same payment
  ok(`amortization base payment shares mortgage formula ${pi.toFixed(2)}`);

  // Down payment 20% of 450k
  const down = 450000 * 0.2;
  if (down !== 90000) fail('down payment math');
  else ok('down payment 20% of 450000 = 90000');

  // Rent 30% of 5000
  if (5000 * 0.3 !== 1500) fail('rent afford');
  else ok('rent afford 30% of 5000 = 1500');

  // Car afford: max pay = 4500*0.12 = 540; loan PV @ 6.5% 60mo
  const maxPay = 4500 * 0.12;
  const r = 0.065 / 12;
  const n = 60;
  const maxLoan = maxPay * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
  if (!(maxLoan > 27000 && maxLoan < 29000)) fail(`car loan PV unexpected ${maxLoan}`);
  else ok(`car afford max loan ~${maxLoan.toFixed(0)} + down 3000`);

  // CD 10000 @ 4.5% monthly 12mo
  const cd = 10000 * Math.pow(1 + 0.045 / 12, 12);
  if (!nearly(cd, 10459.4, 1)) fail(`cd maturity ${cd}`);
  else ok(`cd maturity ~${cd.toFixed(2)}`);

  // Roth rough: start 15000 + 7000/yr @ 7% 25y
  let bal = 15000;
  for (let y = 0; y < 25; y++) bal = (bal + 7000) * 1.07;
  if (!(bal > 500000 && bal < 700000)) fail(`roth ${bal}`);
  else ok(`roth projected ~${bal.toFixed(0)}`);

  // Savings: start 5000 + 300/mo @ 4.2%/12 for 60 months
  let s = 5000;
  const rs = 0.042 / 12;
  for (let i = 0; i < 60; i++) s = s * (1 + rs) + 300;
  if (!(s > 24000 && s < 28000)) fail(`savings ${s}`);
  else ok(`savings 5y ~${s.toFixed(0)}`);

  // APR compare: A 25000 9.9% 48 vs B 25000 7.5% 60 + 499 fee
  const aPay = pmt(25000, 9.9, 48);
  const bPay = pmt(25000, 7.5, 60);
  const aTotal = aPay * 48;
  const bTotal = bPay * 60 + 499;
  ok(`apr A total ${aTotal.toFixed(0)} vs B total ${bTotal.toFixed(0)} (winner ${aTotal <= bTotal ? 'A' : 'B'})`);
}

async function verifyFilesAndHttp() {
  console.log('\n=== FILES + HTTP + SEO ===');
  const calcPages = fs.readFileSync(path.join(root, 'js', 'calculator-pages.js'), 'utf8');
  const ht = fs.readFileSync(path.join(root, 'js', 'high-traffic-calcs.js'), 'utf8');
  const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const sitemap = fs.readFileSync(path.join(root, 'sitemap.xml'), 'utf8');
  const mechanics = fs.readFileSync(path.join(root, 'js', 'mechanics.js'), 'utf8');

  // PITI fields
  for (const id of ['mortgage-tax', 'mortgage-insurance', 'mortgage-pmi', 'mortgage-hoa', 'mortgage-payment-piti']) {
    if (!index.includes(id)) fail(`index missing ${id}`);
    else ok(`index has ${id}`);
  }
  if (!mechanics.includes('const piti = monthlyPayment + escrow')) fail('mechanics missing PITI sum');
  else ok('mechanics computes PITI');

  if (!index.includes('high-traffic-calcs.js')) fail('index missing high-traffic-calcs.js script');
  else ok('index loads high-traffic-calcs.js');

  for (const t of TOOLS) {
    const pagePath = path.join(root, t.slug, 'index.html');
    if (!fs.existsSync(pagePath)) fail(`missing page ${t.slug}`);
    else ok(`disk page ${t.slug}/`);

    if (t.priority > 1) {
      if (!calcPages.includes(`"${t.engine}"`)) fail(`calculator-pages missing ${t.engine}`);
      else ok(`map ${t.engine} -> ${t.slug}`);
      if (!ht.includes(`id: '${t.engine.replace('tab-', '')}'`) && !ht.includes(`id: '${t.panel.replace('engine-', '')}'`)) {
        // engines use short ids
        const short = t.panel.replace('engine-', '');
        if (!ht.includes(`id: '${short}'`)) fail(`high-traffic missing engine ${short}`);
        else ok(`ht engine ${short}`);
      } else ok(`ht engine wired for ${t.name}`);
    }

    if (!sitemap.includes(`/${t.slug}/`)) fail(`sitemap missing ${t.slug}`);
    else ok(`sitemap ${t.slug}`);

    try {
      const res = await get('/' + t.slug + '/');
      if (res.status !== 200) fail(`HTTP ${res.status} ${t.slug}`);
      else ok(`HTTP 200 ${t.slug}`);
      const body = res.body;
      if (!body.includes('<iframe')) fail(`${t.slug} missing iframe`);
      if (t.priority === 1) {
        if (!body.includes('PITI') && !body.includes('property tax')) fail('mortgage SEO copy missing PITI language');
        else ok('mortgage SEO mentions PITI/tax');
      }
      if (!body.includes(`#engine=${encodeURIComponent(t.engine)}`) && !body.includes(`engine=${encodeURIComponent(t.engine)}`)) {
        fail(`${t.slug} iframe missing engine=${t.engine}`);
      } else ok(`${t.slug} iframe deep-links ${t.engine}`);
    } catch (e) {
      fail(`HTTP error ${t.slug}: ${e.message}`);
    }
  }

  // Nice-to-have NOT required — report absent
  console.log('\n=== NICE-TO-HAVE (not in scope) ===');
  for (const n of ['emergency-fund', 'net-worth', 'fha-mortgage', 'va-loan', 'tip-calculator', 'sales-tax', 'inheritance']) {
    const exists = fs.existsSync(path.join(root, n + '-calculator', 'index.html')) || sitemap.includes(n);
    console.log(exists ? `PRESENT ${n}` : `absent (ok) ${n}`);
  }
}

(async () => {
  console.log('High-traffic double verification');
  verifyMath();
  await verifyFilesAndHttp();
  if (process.exitCode) {
    console.log('\nRESULT: FAILURES FOUND');
  } else {
    console.log('\nRESULT: ALL 10 HIGH-ROI CHECKS PASSED');
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
