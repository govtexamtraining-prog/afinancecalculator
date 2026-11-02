const fs = require('fs');
const vm = require('vm');
const code = fs.readFileSync('js/mechanics.js', 'utf8');
const context = {
  console, Math, Number, Date, JSON, parseFloat, parseInt, isNaN, isFinite,
  document: {
    getElementById() { return null; },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    addEventListener() {},
    documentElement: { classList: { add() {}, remove() {}, toggle() {} } },
    body: { classList: { add() {}, remove() {}, toggle() {} } }
  },
  localStorage: { getItem() { return null; }, setItem() {}, removeItem() {} },
  navigator: { language: 'en-US' }
};
context.window = context;
vm.createContext(context);
vm.runInContext(code, context);

function assert(name, cond, detail) {
  if (!cond) {
    console.error('FAIL', name, detail || '');
    process.exitCode = 1;
  } else {
    console.log('PASS', name);
  }
}

const payment = context.fixedMonthlyPayment(360000, 6.2, 360);
assert('mortgage payment near 2204', Math.abs(payment - 2204.89) < 1, payment);

const low = context.amortizeBiweekly(350000, 3, context.fixedMonthlyPayment(350000, 3, 360) / 2, 2000);
const high = context.amortizeBiweekly(350000, 8, context.fixedMonthlyPayment(350000, 8, 360) / 2, 2000);
const lowSaved = 30 - low.periods / 26;
const highSaved = 30 - high.periods / 26;
assert('biweekly savings depend on rate', Math.abs(lowSaved - highSaved) > 0.4, `${lowSaved} vs ${highSaved}`);
assert('biweekly is not the old 4.5 constant at 3%', Math.abs(lowSaved - 4.5) > 0.3, lowSaved);

const debts = [
  { bal: 8000, apr: 24.5, min: context.fixedMonthlyPayment(8000, 24.5, 36) },
  { bal: 2500, apr: 11.5, min: context.fixedMonthlyPayment(2500, 11.5, 36) }
];
const snow = context.simulateTwoDebts(debts, 300, 'snowball');
const av = context.simulateTwoDebts(debts, 300, 'avalanche');
assert('avalanche interest is lower', av.interest < snow.interest - 1, `${av.interest} vs ${snow.interest}`);
assert('savings are not a flat 18%', Math.abs((snow.interest - av.interest) - snow.interest * 0.18) > 20, snow.interest - av.interest);

assert('RMD age 99 factor', context.getRmdFactor(99) === 6.8, context.getRmdFactor(99));
assert('RMD age 91 factor', context.getRmdFactor(91) === 11.5, context.getRmdFactor(91));

const fica = context.employeeFica(300000);
const expectedFica = 184500 * 0.062 + 300000 * 0.0145 + 100000 * 0.009;
assert('FICA wage base and extra Medicare', Math.abs(fica - expectedFica) < 0.01, fica);

const bonusTax = context.supplementalWithholding(1500000);
const expectedBonus = 1000000 * 0.22 + 500000 * 0.37;
assert('supplemental rate above $1M', Math.abs(bonusTax - expectedBonus) < 0.01, bonusTax);

let ladder = 0;
const per = 40000 / 4;
for (let year = 1; year <= 4; year++) ladder += per * Math.pow(1.048, year);
const oneYear = 40000 * 1.048;
assert('CD ladder is not one year of interest', Math.abs(ladder - oneYear) > 100, ladder);

const buy = context.amortizeWithPayment(38000, 6.9, 640, 36);
assert('lease balance is an amortization', buy.balance > 1000 && buy.balance < 30000 && !buy.shortfall, buy.balance);

console.log(process.exitCode ? 'MATH CHECK FAILED' : 'MATH CHECK PASSED');
