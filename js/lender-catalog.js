/**
 * Lender / bank product catalog for calculator context.
 * Architecture: Market × Vertical → ranked lenders (rank 1 = default).
 * US is richest. Other markets get top institutions only.
 * Rates are ILLUSTRATIVE samples for UX — not live quotes or affiliation.
 */
(function (root) {
  'use strict';

  /** @type {Record<string, {code:string, label:string, currency:string}>} */
  const MARKETS = {
    US: { code: 'US', label: 'United States', currency: 'USD' },
    CA: { code: 'CA', label: 'Canada', currency: 'CAD' },
    GB: { code: 'GB', label: 'United Kingdom', currency: 'GBP' },
    IN: { code: 'IN', label: 'India', currency: 'INR' },
    AU: { code: 'AU', label: 'Australia', currency: 'AUD' },
    EU: { code: 'EU', label: 'Eurozone', currency: 'EUR' },
    SG: { code: 'SG', label: 'Singapore', currency: 'SGD' },
    AE: { code: 'AE', label: 'United Arab Emirates', currency: 'AED' }
  };

  const CURRENCY_TO_MARKET = {
    USD: 'US', CAD: 'CA', GBP: 'GB', INR: 'IN', AUD: 'AU', EUR: 'EU',
    SGD: 'SG', AED: 'AE', SAR: 'AE', NZD: 'AU', HKD: 'SG', CHF: 'EU',
    JPY: 'US', MXN: 'US', BRL: 'US', ZAR: 'GB', KRW: 'SG', TRY: 'EU',
    IDR: 'SG', MYR: 'SG', PHP: 'SG', THB: 'SG', VND: 'SG', ILS: 'EU',
    PLN: 'EU', SEK: 'EU', BTC: 'US'
  };

  /**
   * Product verticals map engines → rate fields and UX copy.
   * designFamily drives competitor-style layout variant (original skins).
   */
  const VERTICALS = {
    mortgage: {
      id: 'mortgage',
      label: 'Home lending',
      designFamily: 'mortgage-desk',
      engines: ['tab-mortgage', 'tab-biweekly', 'tab-refinance', 'tab-affordability', 'tab-heloc', 'tab-closingcosts', 'tab-rentbuy'],
      rateFields: {
        'tab-mortgage': ['mortgage-rate', 'mortgage-rate-range'],
        'tab-biweekly': ['biweekly-rate', 'biweekly-rate-range'],
        'tab-refinance': ['refinance-new-rate', 'refinance-new-rate-range'],
        'tab-affordability': ['affordability-rate'],
        'tab-heloc': ['heloc-rate', 'heloc-rate-range'],
        'tab-rentbuy': ['rentbuy-rate']
      }
    },
    auto: {
      id: 'auto',
      label: 'Auto finance',
      designFamily: 'auto-desk',
      engines: ['tab-autoloan', 'tab-autorefi', 'tab-carlease', 'tab-evgas'],
      rateFields: {
        'tab-autoloan': ['autoloan-rate', 'autoloan-rate-range'],
        'tab-autorefi': ['autorefi-new-rate'],
        'tab-carlease': ['carlease-loan-rate']
      }
    },
    personal: {
      id: 'personal',
      label: 'Personal lending',
      designFamily: 'loan-desk',
      engines: ['tab-personalloan', 'tab-snowball'],
      rateFields: {
        'tab-personalloan': ['personalloan-rate', 'personalloan-rate-range'],
        'tab-snowball': ['snowball-debt1-apr', 'snowball-debt2-apr']
      }
    },
    cards: {
      id: 'cards',
      label: 'Cards & revolving',
      designFamily: 'card-desk',
      engines: ['tab-creditcard', 'tab-creditscore'],
      rateFields: {
        'tab-creditcard': ['creditcard-apr']
      }
    },
    student: {
      id: 'student',
      label: 'Student lending',
      designFamily: 'loan-desk',
      engines: ['tab-student', 'tab-studentrefi'],
      rateFields: {
        'tab-student': ['student-rate', 'student-rate-range'],
        'tab-studentrefi': ['studentrefi-current-rate', 'studentrefi-current-rate-range']
      }
    },
    deposits: {
      id: 'deposits',
      label: 'Deposits & CDs',
      designFamily: 'deposit-desk',
      engines: ['tab-cdladder', 'tab-interest', 'tab-compound', 'tab-sip'],
      rateFields: {
        'tab-compound': ['compound-rate'],
        'tab-interest': ['interest-rate'],
        'tab-sip': ['sip-rate']
      }
    },
    wealth: {
      id: 'wealth',
      label: 'Wealth & retirement',
      designFamily: 'wealth-desk',
      engines: ['tab-fire', 'tab-four01k', 'tab-rmd', 'tab-hsa', 'tab-dividend', 'tab-stockavg', 'tab-cagr', 'tab-realreturns', 'tab-socialsecurity', 'tab-inflation'],
      rateFields: {
        'tab-four01k': ['four01k-rate'],
        'tab-hsa': ['hsa-rate']
      }
    },
    payroll: {
      id: 'payroll',
      label: 'Payroll banking',
      designFamily: 'payroll-desk',
      engines: ['tab-paycheck', 'tab-salary', 'tab-overtime', 'tab-bonustax', 'tab-severance', 'tab-budget', 'tab-quarterlytax', 'tab-capitalgains'],
      rateFields: {}
    },
    business: {
      id: 'business',
      label: 'Business banking',
      designFamily: 'biz-desk',
      engines: ['tab-invoice', 'tab-roi', 'tab-breakeven', 'tab-margin', 'tab-dropship', 'tab-caprate', 'tab-cashoncash', 'tab-airbnb', 'tab-solar'],
      rateFields: {}
    },
    crypto: {
      id: 'crypto',
      label: 'Crypto platforms',
      designFamily: 'crypto-desk',
      engines: ['tab-crypto', 'tab-staking'],
      rateFields: {}
    }
  };

  /**
   * Brand tokens are inspired by common retail-bank calculator UX
   * (header accent, trust strip, rate chip) — original colors/layouts, not cloned CSS.
   */
  const LENDERS = [
    // —— US mortgage / home (ranked) ——
    { id: 'us-chase-home', institutionId: 'jpmorgan-chase', market: 'US', verticals: ['mortgage'], rank: 1, name: 'Chase Home Lending', shortName: 'Chase', sampleRate: 6.35, product: '30-yr fixed purchase (sample)', brand: { primary: '#117ACA', accent: '#0B5CAB', soft: '#0c1a28', ink: '#E8F4FC' }, variant: 'us-blue' },
    { id: 'us-wells-home', institutionId: 'wells-fargo', market: 'US', verticals: ['mortgage'], rank: 2, name: 'Wells Fargo Home Mortgage', shortName: 'Wells Fargo', sampleRate: 6.42, product: 'Conforming fixed (sample)', brand: { primary: '#D71E28', accent: '#FFCD41', soft: '#1a1010', ink: '#FFE8E8' }, variant: 'us-red' },
    { id: 'us-bofa-home', institutionId: 'bank-of-america', market: 'US', verticals: ['mortgage'], rank: 3, name: 'Bank of America Home Loans', shortName: 'Bank of America', sampleRate: 6.48, product: 'Fixed-rate mortgage (sample)', brand: { primary: '#E31837', accent: '#012169', soft: '#140a0e', ink: '#FFE5EA' }, variant: 'us-red' },
    { id: 'us-usb-home', institutionId: 'us-bancorp', market: 'US', verticals: ['mortgage'], rank: 4, name: 'U.S. Bank Home Mortgage', shortName: 'U.S. Bank', sampleRate: 6.4, product: 'Purchase / refi (sample)', brand: { primary: '#0C2074', accent: '#C4D600', soft: '#0a1020', ink: '#E6ECFF' }, variant: 'us-navy' },
    { id: 'us-pnc-home', institutionId: 'pnc', market: 'US', verticals: ['mortgage'], rank: 5, name: 'PNC Mortgage', shortName: 'PNC', sampleRate: 6.45, product: 'Conventional fixed (sample)', brand: { primary: '#F58025', accent: '#1B5633', soft: '#1a1208', ink: '#FFF0E4' }, variant: 'us-orange' },

    // —— US auto ——
    { id: 'us-chase-auto', institutionId: 'jpmorgan-chase', market: 'US', verticals: ['auto'], rank: 1, name: 'Chase Auto', shortName: 'Chase Auto', sampleRate: 5.79, product: 'New / used auto loan (sample)', brand: { primary: '#117ACA', accent: '#0B5CAB', soft: '#0c1a28', ink: '#E8F4FC' }, variant: 'us-blue' },
    { id: 'us-capitalone-auto', institutionId: 'capital-one', market: 'US', verticals: ['auto'], rank: 2, name: 'Capital One Auto Finance', shortName: 'Capital One', sampleRate: 5.99, product: 'Auto refinance / purchase (sample)', brand: { primary: '#004977', accent: '#D03027', soft: '#0a1520', ink: '#E5F1FA' }, variant: 'us-navy' },
    { id: 'us-ally-auto', institutionId: 'ally-financial', market: 'US', verticals: ['auto'], rank: 3, name: 'Ally Auto', shortName: 'Ally', sampleRate: 5.69, product: 'Digital auto loan (sample)', brand: { primary: '#7700FF', accent: '#00A3E0', soft: '#12081c', ink: '#F0E6FF' }, variant: 'us-digital' },
    { id: 'us-wells-auto', institutionId: 'wells-fargo', market: 'US', verticals: ['auto'], rank: 4, name: 'Wells Fargo Auto', shortName: 'Wells Fargo', sampleRate: 5.89, product: 'Auto loan (sample)', brand: { primary: '#D71E28', accent: '#FFCD41', soft: '#1a1010', ink: '#FFE8E8' }, variant: 'us-red' },

    // —— US personal ——
    { id: 'us-sofi-personal', institutionId: null, market: 'US', verticals: ['personal'], rank: 1, name: 'SoFi Personal Loans', shortName: 'SoFi', sampleRate: 9.49, product: 'Unsecured personal loan (sample)', brand: { primary: '#00A3E0', accent: '#1B1B1B', soft: '#06141c', ink: '#E5F7FD' }, variant: 'us-digital' },
    { id: 'us-lightstream', institutionId: null, market: 'US', verticals: ['personal'], rank: 2, name: 'LightStream (Truist)', shortName: 'LightStream', sampleRate: 9.29, product: 'Personal loan (sample)', brand: { primary: '#00A651', accent: '#003A70', soft: '#06140c', ink: '#E5F8EC' }, variant: 'us-green' },
    { id: 'us-discover-pl', institutionId: null, market: 'US', verticals: ['personal'], rank: 3, name: 'Discover Personal Loans', shortName: 'Discover', sampleRate: 10.99, product: 'Personal loan (sample)', brand: { primary: '#FF6600', accent: '#1A1A1A', soft: '#1a1008', ink: '#FFF0E5' }, variant: 'us-orange' },
    { id: 'us-chase-sl', institutionId: 'jpmorgan-chase', market: 'US', verticals: ['personal'], rank: 4, name: 'Chase Personal Loan', shortName: 'Chase', sampleRate: 10.49, product: 'Existing-customer loan (sample)', brand: { primary: '#117ACA', accent: '#0B5CAB', soft: '#0c1a28', ink: '#E8F4FC' }, variant: 'us-blue' },

    // —— US cards ——
    { id: 'us-chase-card', institutionId: 'jpmorgan-chase', market: 'US', verticals: ['cards'], rank: 1, name: 'Chase Cards', shortName: 'Chase', sampleRate: 21.49, product: 'Variable APR range (sample mid)', brand: { primary: '#117ACA', accent: '#0B5CAB', soft: '#0c1a28', ink: '#E8F4FC' }, variant: 'us-blue' },
    { id: 'us-citi-card', institutionId: 'citigroup', market: 'US', verticals: ['cards'], rank: 2, name: 'Citi Cards', shortName: 'Citi', sampleRate: 21.99, product: 'Double Cash-style APR (sample)', brand: { primary: '#003B70', accent: '#E31837', soft: '#0a1420', ink: '#E5EEF7' }, variant: 'us-navy' },
    { id: 'us-amex-card', institutionId: 'american-express', market: 'US', verticals: ['cards'], rank: 3, name: 'American Express', shortName: 'Amex', sampleRate: 20.99, product: 'Consumer card APR (sample)', brand: { primary: '#006FCF', accent: '#00175A', soft: '#061018', ink: '#E5F2FC' }, variant: 'us-blue' },
    { id: 'us-capitalone-card', institutionId: 'capital-one', market: 'US', verticals: ['cards'], rank: 4, name: 'Capital One Cards', shortName: 'Capital One', sampleRate: 22.49, product: 'Revolving APR (sample)', brand: { primary: '#004977', accent: '#D03027', soft: '#0a1520', ink: '#E5F1FA' }, variant: 'us-navy' },

    // —— US student ——
    { id: 'us-sofi-student', institutionId: null, market: 'US', verticals: ['student'], rank: 1, name: 'SoFi Student Loans', shortName: 'SoFi', sampleRate: 5.74, product: 'Private student / refi (sample)', brand: { primary: '#00A3E0', accent: '#1B1B1B', soft: '#06141c', ink: '#E5F7FD' }, variant: 'us-digital' },
    { id: 'us-credible', institutionId: null, market: 'US', verticals: ['student'], rank: 2, name: 'Credible Marketplace', shortName: 'Credible', sampleRate: 5.99, product: 'Student refinance (sample)', brand: { primary: '#2BB0ED', accent: '#0B3D5C', soft: '#071820', ink: '#E5F6FD' }, variant: 'us-digital' },
    { id: 'us-discover-student', institutionId: null, market: 'US', verticals: ['student'], rank: 3, name: 'Discover Student Loans', shortName: 'Discover', sampleRate: 6.49, product: 'Private student loan (sample)', brand: { primary: '#FF6600', accent: '#1A1A1A', soft: '#1a1008', ink: '#FFF0E5' }, variant: 'us-orange' },

    // —— US deposits ——
    { id: 'us-marcus', institutionId: 'goldman-sachs', market: 'US', verticals: ['deposits'], rank: 1, name: 'Marcus by Goldman Sachs', shortName: 'Marcus', sampleRate: 4.4, product: 'Online savings / CD (sample APY)', brand: { primary: '#7399C6', accent: '#1A1A1A', soft: '#10161c', ink: '#EAF1F8' }, variant: 'us-digital' },
    { id: 'us-ally-deposit', institutionId: 'ally-financial', market: 'US', verticals: ['deposits'], rank: 2, name: 'Ally Bank', shortName: 'Ally', sampleRate: 4.2, product: 'Savings / CD ladder (sample)', brand: { primary: '#7700FF', accent: '#00A3E0', soft: '#12081c', ink: '#F0E6FF' }, variant: 'us-digital' },
    { id: 'us-capitalone-360', institutionId: 'capital-one', market: 'US', verticals: ['deposits'], rank: 3, name: 'Capital One 360', shortName: '360', sampleRate: 4.0, product: 'Performance savings (sample)', brand: { primary: '#004977', accent: '#D03027', soft: '#0a1520', ink: '#E5F1FA' }, variant: 'us-navy' },
    { id: 'us-chase-savings', institutionId: 'jpmorgan-chase', market: 'US', verticals: ['deposits'], rank: 4, name: 'Chase Savings', shortName: 'Chase', sampleRate: 0.01, product: 'Standard savings (sample)', brand: { primary: '#117ACA', accent: '#0B5CAB', soft: '#0c1a28', ink: '#E8F4FC' }, variant: 'us-blue' },

    // —— US wealth ——
    { id: 'us-fidelity', institutionId: null, market: 'US', verticals: ['wealth'], rank: 1, name: 'Fidelity', shortName: 'Fidelity', sampleRate: 8.0, product: '401(k) / brokerage growth (sample)', brand: { primary: '#4A8C2A', accent: '#1B4332', soft: '#0c1408', ink: '#EAF6E4' }, variant: 'us-green' },
    { id: 'us-vanguard', institutionId: null, market: 'US', verticals: ['wealth'], rank: 2, name: 'Vanguard', shortName: 'Vanguard', sampleRate: 7.5, product: 'Index / retirement (sample)', brand: { primary: '#96151D', accent: '#C4A35A', soft: '#160808', ink: '#FBE8E9' }, variant: 'us-red' },
    { id: 'us-schwab', institutionId: 'charles-schwab', market: 'US', verticals: ['wealth'], rank: 3, name: 'Charles Schwab', shortName: 'Schwab', sampleRate: 7.8, product: 'Brokerage / IRA (sample)', brand: { primary: '#00A0DF', accent: '#005C9E', soft: '#06141c', ink: '#E5F5FC' }, variant: 'us-blue' },
    { id: 'us-jpm-wealth', institutionId: 'jpmorgan-chase', market: 'US', verticals: ['wealth'], rank: 4, name: 'J.P. Morgan Wealth', shortName: 'J.P. Morgan', sampleRate: 7.2, product: 'Managed wealth (sample)', brand: { primary: '#003366', accent: '#C4A35A', soft: '#081018', ink: '#E5ECF5' }, variant: 'us-navy' },

    // —— US payroll banking ——
    { id: 'us-chase-checking', institutionId: 'jpmorgan-chase', market: 'US', verticals: ['payroll'], rank: 1, name: 'Chase Total Checking', shortName: 'Chase', sampleRate: null, product: 'Direct-deposit paycheck banking', brand: { primary: '#117ACA', accent: '#0B5CAB', soft: '#0c1a28', ink: '#E8F4FC' }, variant: 'us-blue' },
    { id: 'us-bofa-checking', institutionId: 'bank-of-america', market: 'US', verticals: ['payroll'], rank: 2, name: 'Bank of America Advantage', shortName: 'Bank of America', sampleRate: null, product: 'Payroll deposit checking', brand: { primary: '#E31837', accent: '#012169', soft: '#140a0e', ink: '#FFE5EA' }, variant: 'us-red' },
    { id: 'us-wells-checking', institutionId: 'wells-fargo', market: 'US', verticals: ['payroll'], rank: 3, name: 'Wells Fargo Everyday Checking', shortName: 'Wells Fargo', sampleRate: null, product: 'Payroll deposit checking', brand: { primary: '#D71E28', accent: '#FFCD41', soft: '#1a1010', ink: '#FFE8E8' }, variant: 'us-red' },
    { id: 'us-capitalone-checking', institutionId: 'capital-one', market: 'US', verticals: ['payroll'], rank: 4, name: 'Capital One 360 Checking', shortName: 'Capital One', sampleRate: null, product: 'Digital paycheck banking', brand: { primary: '#004977', accent: '#D03027', soft: '#0a1520', ink: '#E5F1FA' }, variant: 'us-navy' },

    // —— US business ——
    { id: 'us-chase-biz', institutionId: 'jpmorgan-chase', market: 'US', verticals: ['business'], rank: 1, name: 'Chase Business Banking', shortName: 'Chase Business', sampleRate: null, product: 'Business checking & lending', brand: { primary: '#117ACA', accent: '#0B5CAB', soft: '#0c1a28', ink: '#E8F4FC' }, variant: 'us-blue' },
    { id: 'us-bofa-biz', institutionId: 'bank-of-america', market: 'US', verticals: ['business'], rank: 2, name: 'Bank of America Business', shortName: 'BofA Business', sampleRate: null, product: 'Small business banking', brand: { primary: '#E31837', accent: '#012169', soft: '#140a0e', ink: '#FFE5EA' }, variant: 'us-red' },
    { id: 'us-amex-biz', institutionId: 'american-express', market: 'US', verticals: ['business'], rank: 3, name: 'American Express Business', shortName: 'Amex Business', sampleRate: null, product: 'Business cards & cash flow', brand: { primary: '#006FCF', accent: '#00175A', soft: '#061018', ink: '#E5F2FC' }, variant: 'us-blue' },

    // —— US crypto (platforms as “institutions”) ——
    { id: 'us-coinbase', institutionId: null, market: 'US', verticals: ['crypto'], rank: 1, name: 'Coinbase', shortName: 'Coinbase', sampleRate: null, product: 'Spot / leverage education (sample)', brand: { primary: '#0052FF', accent: '#050F1A', soft: '#060c18', ink: '#E5EEFF' }, variant: 'us-digital' },
    { id: 'us-kraken', institutionId: null, market: 'US', verticals: ['crypto'], rank: 2, name: 'Kraken', shortName: 'Kraken', sampleRate: null, product: 'Trading / staking (sample)', brand: { primary: '#5741D9', accent: '#0A0A0A', soft: '#10081c', ink: '#ECE8FF' }, variant: 'us-digital' },

    // —— Canada ——
    { id: 'ca-rbc-mortgage', institutionId: null, market: 'CA', verticals: ['mortgage'], rank: 1, name: 'RBC Royal Bank Mortgage', shortName: 'RBC', sampleRate: 4.49, product: 'Fixed mortgage (sample, semi-annual)', brand: { primary: '#0051A5', accent: '#FFD200', soft: '#0a1420', ink: '#E5F0FA' }, variant: 'ca-blue' },
    { id: 'ca-td-mortgage', institutionId: null, market: 'CA', verticals: ['mortgage'], rank: 2, name: 'TD Canada Trust Mortgage', shortName: 'TD', sampleRate: 4.54, product: 'Fixed mortgage (sample)', brand: { primary: '#34A853', accent: '#0B3D1F', soft: '#08140c', ink: '#E8F8EC' }, variant: 'ca-green' },
    { id: 'ca-scotiabank-mortgage', institutionId: null, market: 'CA', verticals: ['mortgage'], rank: 3, name: 'Scotiabank Mortgage', shortName: 'Scotiabank', sampleRate: 4.59, product: 'Fixed mortgage (sample)', brand: { primary: '#EC111A', accent: '#1A1A1A', soft: '#160808', ink: '#FDE8E9' }, variant: 'ca-red' },
    { id: 'ca-bmo-mortgage', institutionId: null, market: 'CA', verticals: ['mortgage'], rank: 4, name: 'BMO Mortgage', shortName: 'BMO', sampleRate: 4.64, product: 'Fixed mortgage (sample)', brand: { primary: '#0079C1', accent: '#FF6A13', soft: '#0a1520', ink: '#E5F3FB' }, variant: 'ca-blue' },
    { id: 'ca-rbc-auto', institutionId: null, market: 'CA', verticals: ['auto'], rank: 1, name: 'RBC Auto Finance', shortName: 'RBC', sampleRate: 5.99, product: 'Auto loan (sample)', brand: { primary: '#0051A5', accent: '#FFD200', soft: '#0a1420', ink: '#E5F0FA' }, variant: 'ca-blue' },
    { id: 'ca-td-personal', institutionId: null, market: 'CA', verticals: ['personal', 'cards', 'payroll', 'deposits', 'wealth', 'business'], rank: 1, name: 'TD Canada Trust', shortName: 'TD', sampleRate: 8.99, product: 'Everyday banking (sample)', brand: { primary: '#34A853', accent: '#0B3D1F', soft: '#08140c', ink: '#E8F8EC' }, variant: 'ca-green' },
    { id: 'ca-rbc-personal', institutionId: null, market: 'CA', verticals: ['personal', 'cards', 'payroll', 'deposits', 'wealth', 'business', 'student'], rank: 2, name: 'RBC Royal Bank', shortName: 'RBC', sampleRate: 9.25, product: 'Everyday banking (sample)', brand: { primary: '#0051A5', accent: '#FFD200', soft: '#0a1420', ink: '#E5F0FA' }, variant: 'ca-blue' },

    // —— UK ——
    { id: 'gb-hsbc', institutionId: null, market: 'GB', verticals: ['mortgage', 'auto', 'personal', 'cards', 'deposits', 'payroll', 'wealth', 'business', 'student'], rank: 1, name: 'HSBC UK', shortName: 'HSBC', sampleRate: 4.8, product: 'Retail banking (sample)', brand: { primary: '#DB0011', accent: '#000000', soft: '#160808', ink: '#FDE8E9' }, variant: 'global' },
    { id: 'gb-barclays', institutionId: null, market: 'GB', verticals: ['mortgage', 'auto', 'personal', 'cards', 'deposits', 'payroll', 'wealth', 'business'], rank: 2, name: 'Barclays', shortName: 'Barclays', sampleRate: 4.9, product: 'Retail banking (sample)', brand: { primary: '#00AEEF', accent: '#00395D', soft: '#06141c', ink: '#E5F7FD' }, variant: 'global' },
    { id: 'gb-lloyds', institutionId: null, market: 'GB', verticals: ['mortgage', 'personal', 'deposits', 'payroll'], rank: 3, name: 'Lloyds Bank', shortName: 'Lloyds', sampleRate: 4.95, product: 'Retail banking (sample)', brand: { primary: '#024731', accent: '#00A9E0', soft: '#06140e', ink: '#E5F2EC' }, variant: 'global' },

    // —— India ——
    { id: 'in-sbi', institutionId: null, market: 'IN', verticals: ['mortgage', 'auto', 'personal', 'deposits', 'payroll', 'wealth', 'business', 'student', 'cards'], rank: 1, name: 'State Bank of India', shortName: 'SBI', sampleRate: 8.5, product: 'Home / retail loan (sample)', brand: { primary: '#22409A', accent: '#F7A81B', soft: '#0a1020', ink: '#E8EDF8' }, variant: 'global' },
    { id: 'in-hdfc', institutionId: null, market: 'IN', verticals: ['mortgage', 'auto', 'personal', 'deposits', 'payroll', 'wealth', 'business', 'cards'], rank: 2, name: 'HDFC Bank', shortName: 'HDFC', sampleRate: 8.7, product: 'Home / personal loan (sample)', brand: { primary: '#004C8F', accent: '#ED232A', soft: '#0a1520', ink: '#E5EFF7' }, variant: 'global' },
    { id: 'in-icici', institutionId: null, market: 'IN', verticals: ['mortgage', 'auto', 'personal', 'deposits', 'cards', 'business'], rank: 3, name: 'ICICI Bank', shortName: 'ICICI', sampleRate: 8.85, product: 'Retail loan (sample)', brand: { primary: '#F58220', accent: '#B02A30', soft: '#1a1008', ink: '#FFF0E5' }, variant: 'global' },

    // —— Australia ——
    { id: 'au-cba', institutionId: null, market: 'AU', verticals: ['mortgage', 'auto', 'personal', 'deposits', 'payroll', 'wealth', 'business', 'cards'], rank: 1, name: 'Commonwealth Bank', shortName: 'CBA', sampleRate: 5.85, product: 'Home loan (sample)', brand: { primary: '#FFCC00', accent: '#000000', soft: '#1a1608', ink: '#FFF8E5' }, variant: 'global' },
    { id: 'au-westpac', institutionId: null, market: 'AU', verticals: ['mortgage', 'personal', 'deposits', 'payroll', 'business'], rank: 2, name: 'Westpac', shortName: 'Westpac', sampleRate: 5.95, product: 'Home loan (sample)', brand: { primary: '#D5002B', accent: '#1A1A1A', soft: '#160808', ink: '#FDE8EC' }, variant: 'global' },

    // —— Eurozone ——
    { id: 'eu-deutsche', institutionId: null, market: 'EU', verticals: ['mortgage', 'personal', 'deposits', 'wealth', 'business', 'payroll', 'cards', 'auto'], rank: 1, name: 'Deutsche Bank', shortName: 'Deutsche Bank', sampleRate: 3.8, product: 'Retail banking (sample)', brand: { primary: '#0018A8', accent: '#00A8E0', soft: '#080c1c', ink: '#E5EAF8' }, variant: 'global' },
    { id: 'eu-bnp', institutionId: null, market: 'EU', verticals: ['mortgage', 'personal', 'deposits', 'wealth', 'business'], rank: 2, name: 'BNP Paribas', shortName: 'BNP', sampleRate: 3.9, product: 'Retail banking (sample)', brand: { primary: '#00915A', accent: '#1A1A1A', soft: '#06140e', ink: '#E5F5EE' }, variant: 'global' },

    // —— Singapore / UAE ——
    { id: 'sg-dbs', institutionId: null, market: 'SG', verticals: ['mortgage', 'personal', 'deposits', 'wealth', 'business', 'payroll', 'cards', 'auto'], rank: 1, name: 'DBS Bank', shortName: 'DBS', sampleRate: 3.5, product: 'Home / retail (sample)', brand: { primary: '#FF3333', accent: '#111111', soft: '#160808', ink: '#FFE8E8' }, variant: 'global' },
    { id: 'ae-fab', institutionId: null, market: 'AE', verticals: ['mortgage', 'personal', 'deposits', 'wealth', 'business', 'payroll', 'cards', 'auto'], rank: 1, name: 'First Abu Dhabi Bank', shortName: 'FAB', sampleRate: 4.25, product: 'Retail banking (sample)', brand: { primary: '#8C1D40', accent: '#C4A35A', soft: '#140810', ink: '#F8E8EE' }, variant: 'global' }
  ];

  const ENGINE_TO_VERTICAL = {};
  Object.keys(VERTICALS).forEach(function (vid) {
    VERTICALS[vid].engines.forEach(function (engineId) {
      ENGINE_TO_VERTICAL[engineId] = vid;
    });
  });

  function marketFromCurrency(code) {
    return CURRENCY_TO_MARKET[code] || 'US';
  }

  function verticalForEngine(engineId) {
    return ENGINE_TO_VERTICAL[engineId] || null;
  }

  function lendersFor(engineId, marketCode) {
    const verticalId = verticalForEngine(engineId);
    if (!verticalId) return [];
    const market = marketCode || 'US';
    const list = LENDERS.filter(function (l) {
      return l.market === market && l.verticals.indexOf(verticalId) !== -1;
    }).sort(function (a, b) {
      return a.rank - b.rank;
    });
    if (list.length) return list;
    // Fallback: US top lenders for same vertical when market sparse
    return LENDERS.filter(function (l) {
      return l.market === 'US' && l.verticals.indexOf(verticalId) !== -1;
    }).sort(function (a, b) {
      return a.rank - b.rank;
    });
  }

  function defaultLender(engineId, marketCode) {
    const list = lendersFor(engineId, marketCode);
    return list[0] || null;
  }

  function getLenderById(id) {
    for (let i = 0; i < LENDERS.length; i++) {
      if (LENDERS[i].id === id) return LENDERS[i];
    }
    return null;
  }

  root.LENDER_CATALOG = {
    MARKETS: MARKETS,
    VERTICALS: VERTICALS,
    LENDERS: LENDERS,
    CURRENCY_TO_MARKET: CURRENCY_TO_MARKET,
    marketFromCurrency: marketFromCurrency,
    verticalForEngine: verticalForEngine,
    lendersFor: lendersFor,
    defaultLender: defaultLender,
    getLenderById: getLenderById
  };
})(typeof window !== 'undefined' ? window : globalThis);
