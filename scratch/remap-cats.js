const fs = require('fs');
const path = 'd:/Hari_files/FirstMoneyGold/software_apps/afinancecalculator/afinancecalculator/index.html';
let html = fs.readFileSync(path, 'utf8');
const map = {
  'tab-creditcard': 'credit-cards',
  'tab-creditscore': 'credit-cards',
  'tab-compound': 'banking',
  'tab-interest': 'banking',
  'tab-cdladder': 'banking',
  'tab-mortgage': 'home',
  'tab-affordability': 'home',
  'tab-refinance': 'home',
  'tab-biweekly': 'home',
  'tab-rentbuy': 'home',
  'tab-heloc': 'home',
  'tab-closingcosts': 'home',
  'tab-cashoncash': 'home',
  'tab-airbnb': 'home',
  'tab-caprate': 'home',
  'tab-personalloan': 'loans',
  'tab-autoloan': 'loans',
  'tab-student': 'loans',
  'tab-autorefi': 'loans',
  'tab-studentrefi': 'loans',
  'tab-carlease': 'loans',
  'tab-snowball': 'loans',
  'tab-hsa': 'insurance',
  'tab-budget': 'personal-finance',
  'tab-inflation': 'personal-finance',
  'tab-salary': 'personal-finance',
  'tab-severance': 'personal-finance',
  'tab-evgas': 'personal-finance',
  'tab-crypto': 'investing',
  'tab-stockavg': 'investing',
  'tab-dividend': 'investing',
  'tab-sip': 'investing',
  'tab-cagr': 'investing',
  'tab-fire': 'investing',
  'tab-four01k': 'investing',
  'tab-rmd': 'investing',
  'tab-socialsecurity': 'investing',
  'tab-staking': 'investing',
  'tab-realreturns': 'investing',
  'tab-roi': 'investing',
  'tab-invoice': 'small-business',
  'tab-breakeven': 'small-business',
  'tab-margin': 'small-business',
  'tab-dropship': 'small-business',
  'tab-solar': 'small-business',
  'tab-paycheck': 'taxes',
  'tab-capitalgains': 'taxes',
  'tab-quarterlytax': 'taxes',
  'tab-overtime': 'taxes',
  'tab-bonustax': 'taxes'
};
let n = 0;
for (const [id, cat] of Object.entries(map)) {
  const re = new RegExp('(id="' + id + '"[^>]*data-cat=")[^"]+(")', 'g');
  const before = html;
  html = html.replace(re, '$1' + cat + '$2');
  if (html !== before) {
    n++;
    continue;
  }
  const re2 = new RegExp('(data-cat=")[^"]+("[^>]*id="' + id + '")', 'g');
  const b2 = html;
  html = html.replace(re2, '$1' + cat + '$2');
  if (html !== b2) n++;
  else console.log('miss', id);
}
fs.writeFileSync(path, html);
console.log('remapped', n, 'tabs');
