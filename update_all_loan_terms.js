const fs = require('fs');

// ==========================================
// 1. UPDATE JS/MECHANICS.JS
// ==========================================
let mechanics = fs.readFileSync('js/mechanics.js', 'utf8');

// A. Helper function focusCustomTerm
const focusCustomCode = `
function focusCustomTerm(inputId) {
  const el = document.getElementById(inputId);
  if (el) {
    el.focus();
    el.select();
  }
}
window.focusCustomTerm = focusCustomTerm;
`;

if (!mechanics.includes('function focusCustomTerm')) {
  mechanics += focusCustomCode;
  console.log('✓ Added focusCustomTerm helper to js/mechanics.js');
}

// B. Replace setMortgageTerm
const oldSetMortgage = `function setMortgageTerm(years) {
  const parsed = Math.max(1, Math.min(50, parseFloat(years) || 30));
  mortgageTermYears = parsed;
  
  const numInp = document.getElementById('mortgage-term');
  const rangeInp = document.getElementById('mortgage-term-range');
  const dispSpan = document.getElementById('mortgage-term-display');
  
  if (numInp && parseFloat(numInp.value) !== parsed) numInp.value = parsed;
  if (rangeInp && parseFloat(rangeInp.value) !== parsed) rangeInp.value = parsed;
  if (dispSpan) dispSpan.textContent = \`\${parsed} Year\${parsed === 1 ? '' : 's'}\`;

  document.querySelectorAll('.mortgage-term-btn').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.dataset.years) === parsed);
  });
  calcMortgage();`;

const newSetMortgage = `function setMortgageTerm(years, source) {
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
    dispSpan.textContent = \`\${parsed} Year\${parsed === 1 ? '' : 's'}\`;
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

  calcMortgage();`;

if (mechanics.includes(oldSetMortgage)) {
  mechanics = mechanics.replace(oldSetMortgage, newSetMortgage);
  console.log('✓ setMortgageTerm updated');
} else {
  const oldSetMortgageCRLF = oldSetMortgage.replace(/\n/g, '\r\n');
  if (mechanics.includes(oldSetMortgageCRLF)) {
    mechanics = mechanics.replace(oldSetMortgageCRLF, newSetMortgage.replace(/\n/g, '\r\n'));
    console.log('✓ setMortgageTerm updated (CRLF)');
  }
}

// C. Replace setAutoLoanTerm
const oldSetAuto = `function setAutoLoanTerm(months) {
  const parsed = Math.max(1, Math.min(120, parseInt(months) || 60));
  const termEl = document.getElementById('autoloan-term');
  const rangeEl = document.getElementById('autoloan-term-range');
  if (termEl) termEl.value = parsed;
  if (rangeEl) rangeEl.value = parsed;
  calcAutoLoan();
  saveStateDebounced();
}`;

const newSetAuto = `function setAutoLoanTerm(months, source) {
  const termEl = document.getElementById('autoloan-term');
  const rangeEl = document.getElementById('autoloan-term-range');
  const dispSpan = document.getElementById('autoloan-term-display');

  if (source === 'input' && (months === '' || isNaN(parseInt(months)))) return;

  const val = parseInt(months);
  const parsed = Math.max(1, Math.min(120, isNaN(val) ? 60 : val));

  if (termEl && source !== 'input') termEl.value = parsed;
  if (rangeEl) rangeEl.value = Math.min(84, Math.max(12, parsed));
  if (dispSpan) dispSpan.textContent = \`\${parsed} Mo (\${(parsed / 12).toFixed(1)} Yrs)\`;

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
}`;

if (mechanics.includes(oldSetAuto)) {
  mechanics = mechanics.replace(oldSetAuto, newSetAuto);
  console.log('✓ setAutoLoanTerm updated');
} else {
  const oldSetAutoCRLF = oldSetAuto.replace(/\n/g, '\r\n');
  if (mechanics.includes(oldSetAutoCRLF)) {
    mechanics = mechanics.replace(oldSetAutoCRLF, newSetAuto.replace(/\n/g, '\r\n'));
    console.log('✓ setAutoLoanTerm updated (CRLF)');
  }
}

// D. Replace setStudentMonths
const oldSetStudent = `function setStudentMonths(months) {
  const parsed = Math.max(1, Math.min(360, parseInt(months) || 120));
  const termEl = document.getElementById('student-months');
  const rangeEl = document.getElementById('student-months-range');
  if (termEl) termEl.value = parsed;
  if (rangeEl) rangeEl.value = parsed;
  calcStudent();
  saveStateDebounced();
}`;

const newSetStudent = `function setStudentMonths(months, source) {
  const termEl = document.getElementById('student-months');
  const rangeEl = document.getElementById('student-months-range');
  const dispSpan = document.getElementById('student-months-display');

  if (source === 'input' && (months === '' || isNaN(parseInt(months)))) return;

  const val = parseInt(months);
  const parsed = Math.max(1, Math.min(360, isNaN(val) ? 120 : val));

  if (termEl && source !== 'input') termEl.value = parsed;
  if (rangeEl) rangeEl.value = Math.min(240, Math.max(12, parsed));
  if (dispSpan) dispSpan.textContent = \`\${parsed} Mo (\${(parsed / 12).toFixed(1)} Yrs)\`;

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
}`;

if (mechanics.includes(oldSetStudent)) {
  mechanics = mechanics.replace(oldSetStudent, newSetStudent);
  console.log('✓ setStudentMonths updated');
} else {
  const oldSetStudentCRLF = oldSetStudent.replace(/\n/g, '\r\n');
  if (mechanics.includes(oldSetStudentCRLF)) {
    mechanics = mechanics.replace(oldSetStudentCRLF, newSetStudent.replace(/\n/g, '\r\n'));
    console.log('✓ setStudentMonths updated (CRLF)');
  }
}

// E. Replace setPersonalLoanTerm
const oldSetPersonal = `function setPersonalLoanTerm(months) {
  const parsed = Math.max(1, Math.min(120, parseInt(months) || 36));
  const termEl = document.getElementById('personalloan-term');
  const rangeEl = document.getElementById('personalloan-term-range');
  if (termEl) termEl.value = parsed;
  if (rangeEl) rangeEl.value = parsed;
  calcPersonalLoan();
  saveStateDebounced();
}`;

const newSetPersonal = `function setPersonalLoanTerm(months, source) {
  const termEl = document.getElementById('personalloan-term');
  const rangeEl = document.getElementById('personalloan-term-range');
  const dispSpan = document.getElementById('personalloan-term-display');

  if (source === 'input' && (months === '' || isNaN(parseInt(months)))) return;

  const val = parseInt(months);
  const parsed = Math.max(1, Math.min(120, isNaN(val) ? 36 : val));

  if (termEl && source !== 'input') termEl.value = parsed;
  if (rangeEl) rangeEl.value = Math.min(84, Math.max(12, parsed));
  if (dispSpan) dispSpan.textContent = \`\${parsed} Mo (\${(parsed / 12).toFixed(1)} Yrs)\`;

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
}`;

if (mechanics.includes(oldSetPersonal)) {
  mechanics = mechanics.replace(oldSetPersonal, newSetPersonal);
  console.log('✓ setPersonalLoanTerm updated');
} else {
  const oldSetPersonalCRLF = oldSetPersonal.replace(/\n/g, '\r\n');
  if (mechanics.includes(oldSetPersonalCRLF)) {
    mechanics = mechanics.replace(oldSetPersonalCRLF, newSetPersonal.replace(/\n/g, '\r\n'));
    console.log('✓ setPersonalLoanTerm updated (CRLF)');
  }
}

// F. Replace setRefinanceTerm
const oldSetRefi = `function setRefinanceTerm(years) {
  const parsed = Math.max(1, Math.min(50, parseFloat(years) || 30));
  const termEl = document.getElementById('refinance-term');
  const rangeEl = document.getElementById('refinance-term-range');
  if (termEl) termEl.value = parsed;
  if (rangeEl) rangeEl.value = parsed;
  calcRefinance();
  saveStateDebounced();
}`;

const newSetRefi = `function setRefinanceTerm(years, source) {
  const termEl = document.getElementById('refinance-term');
  const rangeEl = document.getElementById('refinance-term-range');
  const dispSpan = document.getElementById('refinance-term-display');

  if (source === 'input' && (years === '' || isNaN(parseFloat(years)))) return;

  const val = parseFloat(years);
  const parsed = Math.max(1, Math.min(50, isNaN(val) ? 30 : val));

  if (termEl && source !== 'input') termEl.value = parsed;
  if (rangeEl) rangeEl.value = Math.min(40, Math.max(5, parsed));
  if (dispSpan) dispSpan.textContent = \`\${parsed} Year\${parsed === 1 ? '' : 's'}\`;

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
}`;

if (mechanics.includes(oldSetRefi)) {
  mechanics = mechanics.replace(oldSetRefi, newSetRefi);
  console.log('✓ setRefinanceTerm updated');
} else {
  const oldSetRefiCRLF = oldSetRefi.replace(/\n/g, '\r\n');
  if (mechanics.includes(oldSetRefiCRLF)) {
    mechanics = mechanics.replace(oldSetRefiCRLF, newSetRefi.replace(/\n/g, '\r\n'));
    console.log('✓ setRefinanceTerm updated (CRLF)');
  }
}

fs.writeFileSync('js/mechanics.js', mechanics, 'utf8');
console.log('✓ js/mechanics.js successfully saved');

// ==========================================
// 2. UPDATE INDEX.HTML
// ==========================================
let html = fs.readFileSync('index.html', 'utf8');

// Title & Sidebar
html = html.replace('🏠 Mortgage & Monthly Payment', '🏠 Home Loan EMI &amp; Mortgage');
html = html.replace('Mortgage Calculator: What Will My Monthly Payment Be?', 'Home Loan EMI &amp; Mortgage Calculator: What Will My Monthly Payment Be?');

// Mortgage Term Section in index.html
const oldMortgageTermSection = `                        <div>
                            <div class="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                                <label for="mortgage-term">Loan Length (Years)</label>
                                <span id="mortgage-term-display" class="text-emerald-400 font-mono-num">30 Years</span>
                            </div>
                            <div class="relative">
                                <input type="number" id="mortgage-term" value="30" min="1" max="50" step="1" oninput="setMortgageTerm(this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-emerald-500">
                            </div>
                            <input type="range" id="mortgage-term-range" value="30" min="5" max="40" step="1" oninput="setMortgageTerm(this.value)" class="w-full mt-2">
                            <!-- Quick Presets -->
                            <div class="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mt-2">
                                <button type="button" onclick="setMortgageTerm(10)" data-years="10" class="mortgage-term-btn py-1.5 px-2 rounded-lg text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">10Y</button>
                                <button type="button" onclick="setMortgageTerm(15)" data-years="15" class="mortgage-term-btn py-1.5 px-2 rounded-lg text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">15Y</button>
                                <button type="button" onclick="setMortgageTerm(20)" data-years="20" class="mortgage-term-btn py-1.5 px-2 rounded-lg text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">20Y</button>
                                <button type="button" onclick="setMortgageTerm(25)" data-years="25" class="mortgage-term-btn py-1.5 px-2 rounded-lg text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">25Y</button>
                                <button type="button" onclick="setMortgageTerm(30)" data-years="30" class="mortgage-term-btn active py-1.5 px-2 rounded-lg text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">30Y</button>
                                <button type="button" onclick="setMortgageTerm(40)" data-years="40" class="mortgage-term-btn py-1.5 px-2 rounded-lg text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">40Y</button>
                            </div>
                        </div>`;

const newMortgageTermSection = `                        <div>
                            <div class="flex justify-between items-center text-xs font-bold text-slate-300 mb-1.5">
                                <label for="mortgage-term" class="flex items-center gap-1.5">
                                    <span>Loan Tenure / Amortization Period</span>
                                    <span class="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.2 rounded">Custom Value Allowed</span>
                                </label>
                                <span id="mortgage-term-display" class="text-emerald-400 font-mono-num font-bold">30 Years</span>
                            </div>
                            <div class="relative flex items-center">
                                <input type="number" id="mortgage-term" value="30" min="1" max="50" step="any" oninput="setMortgageTerm(this.value, 'input')" placeholder="Type custom years (e.g. 7, 12, 18, 22)" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 pr-16 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 font-mono">
                                <span class="absolute right-3 text-xs text-slate-400 font-bold pointer-events-none">Years</span>
                            </div>
                            <input type="range" id="mortgage-term-range" value="30" min="1" max="40" step="1" oninput="setMortgageTerm(this.value, 'range')" class="w-full mt-2">
                            <!-- Quick Presets + Custom Button -->
                            <div class="grid grid-cols-4 sm:grid-cols-7 gap-1.5 mt-2">
                                <button type="button" onclick="setMortgageTerm(10)" data-years="10" class="mortgage-term-btn py-1.5 px-2 rounded-lg text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">10Y</button>
                                <button type="button" onclick="setMortgageTerm(15)" data-years="15" class="mortgage-term-btn py-1.5 px-2 rounded-lg text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">15Y</button>
                                <button type="button" onclick="setMortgageTerm(20)" data-years="20" class="mortgage-term-btn py-1.5 px-2 rounded-lg text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">20Y</button>
                                <button type="button" onclick="setMortgageTerm(25)" data-years="25" class="mortgage-term-btn py-1.5 px-2 rounded-lg text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">25Y</button>
                                <button type="button" onclick="setMortgageTerm(30)" data-years="30" class="mortgage-term-btn active py-1.5 px-2 rounded-lg text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">30Y</button>
                                <button type="button" onclick="setMortgageTerm(40)" data-years="40" class="mortgage-term-btn py-1.5 px-2 rounded-lg text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">40Y</button>
                                <button type="button" id="mortgage-term-custom-btn" onclick="focusCustomTerm('mortgage-term')" class="mortgage-term-btn py-1.5 px-2 rounded-lg text-xs font-bold border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:text-white transition-all cursor-pointer">✏️ Custom</button>
                            </div>
                        </div>`;

if (html.includes(oldMortgageTermSection)) {
  html = html.replace(oldMortgageTermSection, newMortgageTermSection);
  console.log('✓ Mortgage term UI updated');
} else {
  const oldMortgageCRLF = oldMortgageTermSection.replace(/\n/g, '\r\n');
  if (html.includes(oldMortgageCRLF)) {
    html = html.replace(oldMortgageCRLF, newMortgageTermSection.replace(/\n/g, '\r\n'));
    console.log('✓ Mortgage term UI updated (CRLF)');
  }
}

// Auto Loan Term Section in index.html
const oldAutoTermSection = `                        <div>
                            <div class="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                                <label for="autoloan-term">Amortization Term (Months)</label>
                                <span id="autoloan-term-display" class="text-emerald-400 font-mono-num">60 Mo</span>
                            </div>
                            <input type="number" id="autoloan-term" value="60" min="6" max="120" step="1" oninput="setAutoLoanTerm(this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-emerald-500">
                            <input type="range" id="autoloan-term-range" value="60" min="12" max="84" step="1" oninput="setAutoLoanTerm(this.value)" class="w-full mt-2">
                            <div class="grid grid-cols-6 gap-1 mt-2">
                                <button type="button" onclick="setAutoLoanTerm(24)" data-months="24" class="autoloan-term-btn py-1 px-1.5 rounded-lg text-[11px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">24m</button>
                                <button type="button" onclick="setAutoLoanTerm(36)" data-months="36" class="autoloan-term-btn py-1 px-1.5 rounded-lg text-[11px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">36m</button>
                                <button type="button" onclick="setAutoLoanTerm(48)" data-months="48" class="autoloan-term-btn py-1 px-1.5 rounded-lg text-[11px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">48m</button>
                                <button type="button" onclick="setAutoLoanTerm(60)" data-months="60" class="autoloan-term-btn active py-1 px-1.5 rounded-lg text-[11px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">60m</button>
                                <button type="button" onclick="setAutoLoanTerm(72)" data-months="72" class="autoloan-term-btn py-1 px-1.5 rounded-lg text-[11px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">72m</button>
                                <button type="button" onclick="setAutoLoanTerm(84)" data-months="84" class="autoloan-term-btn py-1 px-1.5 rounded-lg text-[11px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">84m</button>
                            </div>
                        </div>`;

const newAutoTermSection = `                        <div>
                            <div class="flex justify-between items-center text-xs font-bold text-slate-300 mb-1.5">
                                <label for="autoloan-term" class="flex items-center gap-1.5">
                                    <span>Loan Term / Amortization</span>
                                    <span class="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.2 rounded">Custom Value Allowed</span>
                                </label>
                                <span id="autoloan-term-display" class="text-emerald-400 font-mono-num font-bold">60 Mo</span>
                            </div>
                            <div class="relative flex items-center">
                                <input type="number" id="autoloan-term" value="60" min="1" max="120" step="any" oninput="setAutoLoanTerm(this.value, 'input')" placeholder="Type custom months (e.g. 18, 42, 54)" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 pr-16 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 font-mono">
                                <span class="absolute right-3 text-xs text-slate-400 font-bold pointer-events-none">Months</span>
                            </div>
                            <input type="range" id="autoloan-term-range" value="60" min="12" max="84" step="1" oninput="setAutoLoanTerm(this.value, 'range')" class="w-full mt-2">
                            <div class="grid grid-cols-4 sm:grid-cols-7 gap-1 mt-2">
                                <button type="button" onclick="setAutoLoanTerm(24)" data-months="24" class="autoloan-term-btn py-1 px-1.5 rounded-lg text-[11px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">24m</button>
                                <button type="button" onclick="setAutoLoanTerm(36)" data-months="36" class="autoloan-term-btn py-1 px-1.5 rounded-lg text-[11px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">36m</button>
                                <button type="button" onclick="setAutoLoanTerm(48)" data-months="48" class="autoloan-term-btn py-1 px-1.5 rounded-lg text-[11px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">48m</button>
                                <button type="button" onclick="setAutoLoanTerm(60)" data-months="60" class="autoloan-term-btn active py-1 px-1.5 rounded-lg text-[11px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">60m</button>
                                <button type="button" onclick="setAutoLoanTerm(72)" data-months="72" class="autoloan-term-btn py-1 px-1.5 rounded-lg text-[11px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">72m</button>
                                <button type="button" onclick="setAutoLoanTerm(84)" data-months="84" class="autoloan-term-btn py-1 px-1.5 rounded-lg text-[11px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">84m</button>
                                <button type="button" id="autoloan-term-custom-btn" onclick="focusCustomTerm('autoloan-term')" class="autoloan-term-btn py-1 px-1.5 rounded-lg text-[11px] font-bold border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:text-white transition-all cursor-pointer">✏️ Custom</button>
                            </div>
                        </div>`;

if (html.includes(oldAutoTermSection)) {
  html = html.replace(oldAutoTermSection, newAutoTermSection);
  console.log('✓ Auto Loan term UI updated');
} else {
  const oldAutoCRLF = oldAutoTermSection.replace(/\n/g, '\r\n');
  if (html.includes(oldAutoCRLF)) {
    html = html.replace(oldAutoCRLF, newAutoTermSection.replace(/\n/g, '\r\n'));
    console.log('✓ Auto Loan term UI updated (CRLF)');
  }
}

// Personal Loan Term Section in index.html
const oldPersonalTermSection = `                        <div>
                            <div class="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                                <label for="personalloan-term">Amortization Term (Months)</label>
                                <span id="personalloan-term-display" class="text-emerald-400 font-mono-num">36 Mo</span>
                            </div>
                            <div class="relative">
                                <input type="number" id="personalloan-term" value="36" min="6" max="120" step="1" oninput="setPersonalLoanTerm(this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 pr-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-emerald-500">
                            </div>
                            <input type="range" id="personalloan-term-range" value="36" min="12" max="84" step="1" oninput="setPersonalLoanTerm(this.value)" class="w-full mt-2">
                            <div class="grid grid-cols-5 gap-1 mt-2">
                                <button type="button" onclick="setPersonalLoanTerm(12)" data-months="12" class="personalloan-term-btn py-1 px-1.5 rounded-lg text-[11px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">12m</button>
                                <button type="button" onclick="setPersonalLoanTerm(24)" data-months="24" class="personalloan-term-btn py-1 px-1.5 rounded-lg text-[11px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">24m</button>
                                <button type="button" onclick="setPersonalLoanTerm(36)" data-months="36" class="personalloan-term-btn active py-1 px-1.5 rounded-lg text-[11px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">36m</button>
                                <button type="button" onclick="setPersonalLoanTerm(48)" data-months="48" class="personalloan-term-btn py-1 px-1.5 rounded-lg text-[11px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">48m</button>
                                <button type="button" onclick="setPersonalLoanTerm(60)" data-months="60" class="personalloan-term-btn py-1 px-1.5 rounded-lg text-[11px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">60m</button>
                            </div>
                        </div>`;

const newPersonalTermSection = `                        <div>
                            <div class="flex justify-between items-center text-xs font-bold text-slate-300 mb-1.5">
                                <label for="personalloan-term" class="flex items-center gap-1.5">
                                    <span>Loan Term / Amortization</span>
                                    <span class="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.2 rounded">Custom Value Allowed</span>
                                </label>
                                <span id="personalloan-term-display" class="text-emerald-400 font-mono-num font-bold">36 Mo</span>
                            </div>
                            <div class="relative flex items-center">
                                <input type="number" id="personalloan-term" value="36" min="1" max="120" step="any" oninput="setPersonalLoanTerm(this.value, 'input')" placeholder="Type custom months (e.g. 18, 30, 42)" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 pr-16 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 font-mono">
                                <span class="absolute right-3 text-xs text-slate-400 font-bold pointer-events-none">Months</span>
                            </div>
                            <input type="range" id="personalloan-term-range" value="36" min="12" max="84" step="1" oninput="setPersonalLoanTerm(this.value, 'range')" class="w-full mt-2">
                            <div class="grid grid-cols-3 sm:grid-cols-6 gap-1 mt-2">
                                <button type="button" onclick="setPersonalLoanTerm(12)" data-months="12" class="personalloan-term-btn py-1 px-1.5 rounded-lg text-[11px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">12m</button>
                                <button type="button" onclick="setPersonalLoanTerm(24)" data-months="24" class="personalloan-term-btn py-1 px-1.5 rounded-lg text-[11px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">24m</button>
                                <button type="button" onclick="setPersonalLoanTerm(36)" data-months="36" class="personalloan-term-btn active py-1 px-1.5 rounded-lg text-[11px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">36m</button>
                                <button type="button" onclick="setPersonalLoanTerm(48)" data-months="48" class="personalloan-term-btn py-1 px-1.5 rounded-lg text-[11px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">48m</button>
                                <button type="button" onclick="setPersonalLoanTerm(60)" data-months="60" class="personalloan-term-btn py-1 px-1.5 rounded-lg text-[11px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">60m</button>
                                <button type="button" id="personalloan-term-custom-btn" onclick="focusCustomTerm('personalloan-term')" class="personalloan-term-btn py-1 px-1.5 rounded-lg text-[11px] font-bold border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:text-white transition-all cursor-pointer">✏️ Custom</button>
                            </div>
                        </div>`;

if (html.includes(oldPersonalTermSection)) {
  html = html.replace(oldPersonalTermSection, newPersonalTermSection);
  console.log('✓ Personal Loan term UI updated');
} else {
  const oldPersonalCRLF = oldPersonalTermSection.replace(/\n/g, '\r\n');
  if (html.includes(oldPersonalCRLF)) {
    html = html.replace(oldPersonalCRLF, newPersonalTermSection.replace(/\n/g, '\r\n'));
    console.log('✓ Personal Loan term UI updated (CRLF)');
  }
}

// Student Loan Term Section in index.html
const oldStudentTermSection = `                        <div>
                            <div class="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                                <label for="student-months">Repayment Term (Months)</label>
                                <span id="student-months-display" class="text-emerald-400 font-mono-num">120 Mo (10 Yrs)</span>
                            </div>
                            <input type="number" id="student-months" value="120" min="6" max="360" step="1" oninput="setStudentMonths(this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-emerald-500">
                            <input type="range" id="student-months-range" value="120" min="12" max="240" step="1" oninput="setStudentMonths(this.value)" class="w-full mt-2">
                            <div class="grid grid-cols-5 gap-1.5 mt-2">
                                <button type="button" onclick="setStudentMonths(36)" data-months="36" class="student-term-btn py-1 px-1 rounded-lg text-[10px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">36m (3Y)</button>
                                <button type="button" onclick="setStudentMonths(60)" data-months="60" class="student-term-btn py-1 px-1 rounded-lg text-[10px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">60m (5Y)</button>
                                <button type="button" onclick="setStudentMonths(120)" data-months="120" class="student-term-btn active py-1 px-1 rounded-lg text-[10px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">120m (10Y)</button>
                                <button type="button" onclick="setStudentMonths(180)" data-months="180" class="student-term-btn py-1 px-1 rounded-lg text-[10px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">180m (15Y)</button>
                                <button type="button" onclick="setStudentMonths(240)" data-months="240" class="student-term-btn py-1 px-1 rounded-lg text-[10px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">240m (20Y)</button>
                            </div>
                        </div>`;

const newStudentTermSection = `                        <div>
                            <div class="flex justify-between items-center text-xs font-bold text-slate-300 mb-1.5">
                                <label for="student-months" class="flex items-center gap-1.5">
                                    <span>Repayment Term / Amortization</span>
                                    <span class="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.2 rounded">Custom Value Allowed</span>
                                </label>
                                <span id="student-months-display" class="text-emerald-400 font-mono-num font-bold">120 Mo (10 Yrs)</span>
                            </div>
                            <div class="relative flex items-center">
                                <input type="number" id="student-months" value="120" min="1" max="360" step="any" oninput="setStudentMonths(this.value, 'input')" placeholder="Type custom months (e.g. 48, 84, 150)" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 pr-16 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 font-mono">
                                <span class="absolute right-3 text-xs text-slate-400 font-bold pointer-events-none">Months</span>
                            </div>
                            <input type="range" id="student-months-range" value="120" min="12" max="240" step="1" oninput="setStudentMonths(this.value, 'range')" class="w-full mt-2">
                            <div class="grid grid-cols-3 sm:grid-cols-6 gap-1.5 mt-2">
                                <button type="button" onclick="setStudentMonths(36)" data-months="36" class="student-term-btn py-1 px-1 rounded-lg text-[10px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">36m (3Y)</button>
                                <button type="button" onclick="setStudentMonths(60)" data-months="60" class="student-term-btn py-1 px-1 rounded-lg text-[10px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">60m (5Y)</button>
                                <button type="button" onclick="setStudentMonths(120)" data-months="120" class="student-term-btn active py-1 px-1 rounded-lg text-[10px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">120m (10Y)</button>
                                <button type="button" onclick="setStudentMonths(180)" data-months="180" class="student-term-btn py-1 px-1 rounded-lg text-[10px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">180m (15Y)</button>
                                <button type="button" onclick="setStudentMonths(240)" data-months="240" class="student-term-btn py-1 px-1 rounded-lg text-[10px] font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">240m (20Y)</button>
                                <button type="button" id="student-term-custom-btn" onclick="focusCustomTerm('student-months')" class="student-term-btn py-1 px-1 rounded-lg text-[10px] font-bold border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:text-white transition-all cursor-pointer">✏️ Custom</button>
                            </div>
                        </div>`;

if (html.includes(oldStudentTermSection)) {
  html = html.replace(oldStudentTermSection, newStudentTermSection);
  console.log('✓ Student Loan term UI updated');
} else {
  const oldStudentCRLF = oldStudentTermSection.replace(/\n/g, '\r\n');
  if (html.includes(oldStudentCRLF)) {
    html = html.replace(oldStudentCRLF, newStudentTermSection.replace(/\n/g, '\r\n'));
    console.log('✓ Student Loan term UI updated (CRLF)');
  }
}

// Refinance Term Section in index.html
const oldRefinanceTermSection = `                        <div>
                            <div class="flex justify-between text-xs font-bold text-slate-300 mb-1.5">
                                <label for="refinance-term">Amortization Period (Years)</label>
                                <span id="refinance-term-display" class="text-emerald-400 font-mono-num">30 Years</span>
                            </div>
                            <div class="relative">
                                <input type="number" id="refinance-term" value="30" min="1" max="50" step="1" oninput="setRefinanceTerm(this.value)" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 pr-3 py-2 text-sm font-bold text-white focus:outline-none focus:border-emerald-500">
                            </div>
                            <input type="range" id="refinance-term-range" value="30" min="5" max="40" step="1" oninput="setRefinanceTerm(this.value)" class="w-full mt-2">
                            <!-- Quick Presets -->
                            <div class="grid grid-cols-4 gap-1.5 mt-2">
                                <button type="button" onclick="setRefinanceTerm(15)" data-years="15" class="refinance-term-btn py-1 px-2 rounded-lg text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">15 Yrs</button>
                                <button type="button" onclick="setRefinanceTerm(20)" data-years="20" class="refinance-term-btn py-1 px-2 rounded-lg text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">20 Yrs</button>
                                <button type="button" onclick="setRefinanceTerm(25)" data-years="25" class="refinance-term-btn py-1 px-2 rounded-lg text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">25 Yrs</button>
                                <button type="button" onclick="setRefinanceTerm(30)" data-years="30" class="refinance-term-btn active py-1 px-2 rounded-lg text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">30 Yrs</button>
                            </div>
                        </div>`;

const newRefinanceTermSection = `                        <div>
                            <div class="flex justify-between items-center text-xs font-bold text-slate-300 mb-1.5">
                                <label for="refinance-term" class="flex items-center gap-1.5">
                                    <span>Amortization Period (Years)</span>
                                    <span class="text-[10px] text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/40 px-1.5 py-0.2 rounded">Custom Value Allowed</span>
                                </label>
                                <span id="refinance-term-display" class="text-emerald-400 font-mono-num font-bold">30 Years</span>
                            </div>
                            <div class="relative flex items-center">
                                <input type="number" id="refinance-term" value="30" min="1" max="50" step="any" oninput="setRefinanceTerm(this.value, 'input')" placeholder="Type custom years (e.g. 10, 18, 22)" class="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 pr-16 text-sm font-bold text-white focus:outline-none focus:border-emerald-500 font-mono">
                                <span class="absolute right-3 text-xs text-slate-400 font-bold pointer-events-none">Years</span>
                            </div>
                            <input type="range" id="refinance-term-range" value="30" min="5" max="40" step="1" oninput="setRefinanceTerm(this.value, 'range')" class="w-full mt-2">
                            <!-- Quick Presets + Custom Button -->
                            <div class="grid grid-cols-3 sm:grid-cols-5 gap-1.5 mt-2">
                                <button type="button" onclick="setRefinanceTerm(15)" data-years="15" class="refinance-term-btn py-1 px-2 rounded-lg text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">15 Yrs</button>
                                <button type="button" onclick="setRefinanceTerm(20)" data-years="20" class="refinance-term-btn py-1 px-2 rounded-lg text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">20 Yrs</button>
                                <button type="button" onclick="setRefinanceTerm(25)" data-years="25" class="refinance-term-btn py-1 px-2 rounded-lg text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">25 Yrs</button>
                                <button type="button" onclick="setRefinanceTerm(30)" data-years="30" class="refinance-term-btn active py-1 px-2 rounded-lg text-xs font-bold border border-slate-800 bg-slate-900 text-slate-300 hover:text-white transition-all cursor-pointer">30 Yrs</button>
                                <button type="button" id="refinance-term-custom-btn" onclick="focusCustomTerm('refinance-term')" class="refinance-term-btn py-1 px-2 rounded-lg text-xs font-bold border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 hover:text-white transition-all cursor-pointer">✏️ Custom</button>
                            </div>
                        </div>`;

if (html.includes(oldRefinanceTermSection)) {
  html = html.replace(oldRefinanceTermSection, newRefinanceTermSection);
  console.log('✓ Refinance term UI updated');
} else {
  const oldRefinanceCRLF = oldRefinanceTermSection.replace(/\n/g, '\r\n');
  if (html.includes(oldRefinanceCRLF)) {
    html = html.replace(oldRefinanceCRLF, newRefinanceTermSection.replace(/\n/g, '\r\n'));
    console.log('✓ Refinance term UI updated (CRLF)');
  }
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('✓ index.html successfully saved with custom loan term inputs');

