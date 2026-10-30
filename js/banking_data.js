/**
 * aFinanceCalculator™ — U.S. & Canada Banking Intelligence Hub
 * Complete Institutional Directory, Cross-Border Architecture & Yield Comparison Engine
 * Covers all Top 4 U.S. Giants, Ranks 5-35+ Regional/Commercial Banks, and Canadian Big Six + Digital Banks.
 */

const BANKING_INSTITUTIONS = [
  // --- TOP 4 U.S. GIANTS ---
  {
    id: "jpmorgan-chase",
    name: "JPMorgan Chase & Co.",
    hq: "New York, NY",
    country: "US",
    category: "us-giant",
    assetRank: "Rank #1 U.S. ($3.9T Assets)",
    crossBorder: "international",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "SSN or ITIN required online; passport/foreign ID accepted at branches. Minimum deposit: $0. Monthly fee: $12 (waived with $500 direct deposit or $1,500 daily balance).",
    hysaApy: "0.01% Standard / Up to 4.25% via J.P. Morgan Wealth CDs",
    checkingFeature: "Chase Total Checking®: 4,700 branches, 15,000 ATMs, Zelle integration, instant mobile check deposit.",
    topCreditCard: "Chase Sapphire Preferred® (60k pts bonus, 3x dining, 2x travel) & Chase Freedom Unlimited® (1.5%-5% cash back).",
    crossBorderPerks: "Extensive global wire network; dedicated private bank cross-border advisory. J.P. Morgan international wealth desks in Toronto & Montreal.",
    websiteUrl: "https://www.chase.com"
  },
  {
    id: "bank-of-america",
    name: "Bank of America",
    hq: "Charlotte, NC",
    country: "US",
    category: "us-giant",
    assetRank: "Rank #2 U.S. ($3.2T Assets)",
    crossBorder: "international",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "SSN/ITIN online; passport/ITIN accepted in financial centers. $25 opening deposit. Monthly fee: $4.95-$12 (waived with qualifying direct deposit or Preferred Rewards).",
    hysaApy: "0.01% - 0.04% Core / Up to 4.50% via Merrill Lynch Preferred Deposit",
    checkingFeature: "Bank of America Advantage Banking: Customizable checking with balance tiers, Erica® AI financial assistant, nationwide ATM footprint.",
    topCreditCard: "Customized Cash Rewards (3% category choice, up to 5.25% with Preferred Rewards) & Premium Rewards® Elite.",
    crossBorderPerks: "Global ATM Alliance partner with Scotiabank in Canada (fee-free ATM withdrawals across U.S. and Canada).",
    websiteUrl: "https://www.bankofamerica.com"
  },
  {
    id: "citigroup",
    name: "Citigroup / Citibank",
    hq: "New York, NY",
    country: "US",
    category: "us-giant",
    assetRank: "Rank #3 U.S. ($2.4T Assets)",
    crossBorder: "international",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "SSN online; international documentation accepted through Citi IPB (International Personal Bank). $0 minimum opening balance.",
    hysaApy: "Up to 4.30% APY via Citi Accelerate High-Yield Savings (select markets)",
    checkingFeature: "Citi Access Account & Elevate: No overdraft fees, global digital banking, Citi Global Transfers.",
    topCreditCard: "Citi Double Cash® (2% cash back: 1% buy + 1% pay) & Citi Strata Premier℠ (3x points dining, travel, supermarkets).",
    crossBorderPerks: "Citi Global Transfers enables fee-free, real-time cross-border funds movement between eligible Citibank accounts worldwide.",
    websiteUrl: "https://www.citi.com"
  },
  {
    id: "wells-fargo",
    name: "Wells Fargo",
    hq: "San Francisco, CA",
    country: "US",
    category: "us-giant",
    assetRank: "Rank #4 U.S. ($1.9T Assets)",
    crossBorder: "international",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "SSN/ITIN online; two forms of identification (including foreign passport) in branches. $25 min opening deposit. $10 monthly fee waived with $500 direct deposit.",
    hysaApy: "0.01% - 0.15% Standard / Up to 4.40% via Wells Fargo CD Specials",
    checkingFeature: "Everyday Checking: Massive traditional branch network across 36 states, seamless Zelle®, contactless debit.",
    topCreditCard: "Wells Fargo Active Cash® (flat 2% cash rewards on all purchases) & Autograph Journey℠ (5x hotels, 4x airlines).",
    crossBorderPerks: "ExpressSend® remittance network across Latin America & Asia; commercial cross-border Canadian corporate coverage.",
    websiteUrl: "https://www.wellsfargo.com"
  },

  // --- MAJOR U.S. INVESTMENT, COMMERCIAL & REGIONAL BANKS (Ranks 5–35+) ---
  {
    id: "goldman-sachs",
    name: "Goldman Sachs / Marcus",
    hq: "New York, NY",
    country: "US",
    category: "us-major",
    assetRank: "Rank #5 U.S. ($1.6T Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000 via Goldman Sachs Bank USA)",
    openReqs: "SSN, U.S. residential address, 18+ years old. 100% digital onboarding. $0 opening minimum, zero monthly maintenance fees.",
    hysaApy: "4.40% APY (Marcus Online Savings with Same-Day Transfers up to $100k)",
    checkingFeature: "Marcus High-Yield Online Savings: No fees ever, unlimited transfers, high-yield CDs with 10-day rate guarantee.",
    topCreditCard: "GM Rewards Card & co-branded high-yield digital credit platforms.",
    crossBorderPerks: "Global investment banking; Marcus accounts accept inbound international wires from Canadian and European accounts.",
    websiteUrl: "https://www.marcus.com"
  },
  {
    id: "morgan-stanley",
    name: "Morgan Stanley Private Bank",
    hq: "New York, NY",
    country: "US",
    category: "us-major",
    assetRank: "Rank #6 U.S. ($1.2T Assets)",
    crossBorder: "international",
    fdicCdic: "FDIC Insured ($250,000; up to $5M via Bank Deposit Program)",
    openReqs: "Offered via Morgan Stanley Wealth Management or E*TRADE. SSN/ITIN, $0 min on E*TRADE savings.",
    hysaApy: "Up to 4.25% - 5.00% APY via Morgan Stanley Preferred Savings & E*TRADE Premium Savings",
    checkingFeature: "Morgan Stanley CashPlus: High-net-worth liquidity account with unlimited ATM fee rebates worldwide and cyber security protection.",
    topCreditCard: "Morgan Stanley Blue Cash Preferred® & Platinum Card® from American Express exclusively for Morgan Stanley clients.",
    crossBorderPerks: "Cross-border wealth advisory desks for dual US-Canadian tax residents and high-net-worth cross-border estates.",
    websiteUrl: "https://www.morganstanley.com"
  },
  {
    id: "us-bancorp",
    name: "U.S. Bancorp / U.S. Bank",
    hq: "Minneapolis, MN",
    country: "US",
    category: "us-major",
    assetRank: "Rank #7 U.S. ($663B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "SSN online; foreign passport + proof of residence in branch. $25 opening deposit. Monthly fee waived with direct deposit or $1,500 balance.",
    hysaApy: "Up to 4.50% APY via U.S. Bank Elite Money Market Account",
    checkingFeature: "Bank Smartly® Checking: Automated rewards tiers, nationwide Midwest & West Coast footprint, free credit monitoring.",
    topCreditCard: "U.S. Bank Altitude® Reserve (3x travel & mobile wallet purchases) & U.S. Bank Cash+® (5% cash back on two chosen categories).",
    crossBorderPerks: "Commercial cross-border services for US-Canada Midwest supply chain corridors; foreign exchange trading desks.",
    websiteUrl: "https://www.usbank.com"
  },
  {
    id: "capital-one",
    name: "Capital One Financial Corp.",
    hq: "Tysons, VA",
    country: "US",
    category: "us-major",
    assetRank: "Rank #9 U.S. ($478B Assets)",
    crossBorder: "international",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "SSN online; $0 minimum opening balance. Zero foreign transaction fees on all cards and accounts.",
    hysaApy: "4.25% APY via 360 Performance Savings (No minimum balance, fee-free)",
    checkingFeature: "360 Checking: Fee-free overdraft, 70,000+ fee-free Allpoint ATMs, Capital One Cafés with 50% handcrafted beverage discounts.",
    topCreditCard: "Venture X Rewards (2x miles, $300 travel credit, lounge access) & SavorOne (3% dining, entertainment, grocery).",
    crossBorderPerks: "ALL Capital One credit cards have ZERO foreign transaction fees worldwide, making them the #1 cross-border card for US/Canada travel.",
    websiteUrl: "https://www.capitalone.com"
  },
  {
    id: "pnc",
    name: "PNC Financial Services",
    hq: "Pittsburgh, PA",
    country: "US",
    category: "us-major",
    assetRank: "Rank #8 U.S. ($560B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "SSN online; foreign passport + US address in branch. $0-$25 opening deposit depending on tier.",
    hysaApy: "Up to 4.65% APY via PNC High Yield Savings (in eligible online markets)",
    checkingFeature: "Virtual Wallet®: Patented Money Bar® digital interface organizing Spend, Reserve (short-term savings), and Growth (long-term goals).",
    topCreditCard: "PNC Cash Unlimited® Visa Signature (2% flat cash back on all eligible purchases with no category tracking).",
    crossBorderPerks: "Strong commercial presence in Canada with PNC Bank Canada Branch (Toronto), financing cross-border trade.",
    websiteUrl: "https://www.pnc.com"
  },
  {
    id: "truist",
    name: "Truist Financial Corporation",
    hq: "Charlotte, NC",
    country: "US",
    category: "us-major",
    assetRank: "Rank #10 U.S. ($535B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "SSN online; ITIN/passport accepted in branch. $50 minimum opening deposit. $12 monthly fee waived with $500 direct deposit.",
    hysaApy: "Up to 4.20% APY on Promotional CDs and Truist One Savings",
    checkingFeature: "Truist One Checking: Progressive 5-tier fee waivers, $100 negative balance buffer, 2,000+ branches across Southeast & Mid-Atlantic.",
    topCreditCard: "Truist Enjoy Cash (3% on gas/EV charging, 2% on utilities & groceries) & Truist Future (low APR).",
    crossBorderPerks: "International payments desk; commercial corporate accounts for cross-border US-Canada logistics.",
    websiteUrl: "https://www.truist.com"
  },
  {
    id: "bny-mellon",
    name: "The Bank of New York Mellon Corp.",
    hq: "New York, NY",
    country: "US",
    category: "us-major",
    assetRank: "Rank #11 U.S. ($430B Assets / $47T Custody)",
    crossBorder: "international",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Institutional, family office, and private wealth clients. Cross-border accredited investor onboarding.",
    hysaApy: "Institutional competitive money market yields (Pershing Government Liquidity)",
    checkingFeature: "Pershing Cash Solutions: High-capacity institutional custody, multi-currency settlement, margin lending.",
    topCreditCard: "Private wealth bespoke credit lines and securities-backed credit (SBLOC).",
    crossBorderPerks: "World's largest custody bank. Primary custodian for U.S.-Canada dual-listed equity clearing and cross-border ETFs.",
    websiteUrl: "https://www.bnymellon.com"
  },
  {
    id: "charles-schwab",
    name: "Charles Schwab Corporation",
    hq: "Westlake, TX",
    country: "US",
    category: "us-major",
    assetRank: "Rank #12 U.S. ($480B Assets / $8.5T Client Assets)",
    crossBorder: "international",
    fdicCdic: "FDIC Insured ($250,000; up to $5M via Schwab Bank Deposit Sweep)",
    openReqs: "SSN online for domestic; Schwab One International account available for Canadian residents with $25k minimum.",
    hysaApy: "Up to 5.15% APY via Schwab Value Advantage Money Fund (SWVXX)",
    checkingFeature: "Schwab Bank Investor Checking™: UNLIMITED worldwide ATM fee rebates, zero foreign transaction fees, no monthly fees ever.",
    topCreditCard: "Schwab Investor Card® from American Express (1.5% cash back automatically invested into brokerage).",
    crossBorderPerks: "Legendary for U.S.-Canada travelers: debit card allows fee-free cash withdrawals at any Canadian ATM with zero foreign exchange fees.",
    websiteUrl: "https://www.schwab.com"
  },
  {
    id: "td-bank-us",
    name: "TD Bank, N.A. (America's Most Convenient Bank)",
    hq: "Mount Laurel, NJ",
    country: "US",
    category: "us-major",
    assetRank: "Rank #13 U.S. ($370B Assets / U.S. subsidiary of TD Bank Group)",
    crossBorder: "specialist",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Can be opened by Canadian citizens from Canada using Canadian SIN and Canadian passport! $0 to $100 min deposit.",
    hysaApy: "Up to 4.00% APY via TD Signature Savings",
    checkingFeature: "TD Beyond Checking: 7-day banking with extended weekend hours, fee-free transactions at TD Canada Trust and TD Bank US.",
    topCreditCard: "TD Double Up (2% cash back) & TD First Class Visa Signature.",
    crossBorderPerks: "★ PREMIER CROSS-BORDER SPECIALIST: Seamless single-sign-on linking TD Canada Trust (CAD) and TD Bank USA (USD). Instant free cross-border transfers. Canadian credit history used to approve US credit cards and mortgages!",
    websiteUrl: "https://www.td.com/us"
  },
  {
    id: "state-street",
    name: "State Street Corporation",
    hq: "Boston, MA",
    country: "US",
    category: "us-major",
    assetRank: "Rank #14 U.S. ($300B Assets / $40T Custody)",
    crossBorder: "international",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Institutional asset owners, global custodians, asset managers.",
    hysaApy: "Institutional liquidity yields via State Street Global Advisors (SSGA)",
    checkingFeature: "Institutional Global Treasury Liquidity Suite & SPDR ETF asset management.",
    topCreditCard: "Institutional securities lending facilities.",
    crossBorderPerks: "Manages cross-border U.S.-Canadian institutional index allocations, currency hedging, and settlement.",
    websiteUrl: "https://www.statestreet.com"
  },
  {
    id: "american-express",
    name: "American Express Co.",
    hq: "New York, NY",
    country: "US",
    category: "us-major",
    assetRank: "Rank #15 U.S. ($260B Assets)",
    crossBorder: "specialist",
    fdicCdic: "FDIC Insured ($250,000 via American Express National Bank)",
    openReqs: "SSN online; supports Amex Global Transfer using Canadian credit bureau file (Nova Credit / Amex Global Transfer)!",
    hysaApy: "4.25% - 4.35% APY via American Express High Yield Savings Account (No minimum, fee-free)",
    checkingFeature: "American Express Rewards Checking: Earns Membership Rewards® points on debit card spend, fee-free digital interface.",
    topCreditCard: "Platinum Card® (80k pts, airport lounges, hotel status) & Gold Card (4x restaurants & supermarkets).",
    crossBorderPerks: "★ AMEX GLOBAL TRANSFER: Allows any Canadian moving to or banking in the U.S. to obtain a U.S. American Express credit card using their Canadian credit history without needing an established U.S. credit score!",
    websiteUrl: "https://www.americanexpress.com"
  },
  {
    id: "fifth-third",
    name: "Fifth Third Bank",
    hq: "Cincinnati, OH",
    country: "US",
    category: "us-major",
    assetRank: "Rank #16 U.S. ($215B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "SSN online; branch identification for international applicants. $0-$50 min opening deposit.",
    hysaApy: "Up to 4.25% APY via Relationship Savings / Promotional CD Tiers",
    checkingFeature: "Fifth Third Momentum® Checking: Early pay up to 2 days early, zero balance fee waivers, 1,100 branches in Midwest/Southeast.",
    topCreditCard: "Fifth Third 1.67% Cash/2% Cash Back Cards with no annual fee.",
    crossBorderPerks: "Commercial cross-border services for automotive supply chains connecting Ontario and Midwest industrial hubs.",
    websiteUrl: "https://www.53.com"
  },
  {
    id: "bmo-usa",
    name: "BMO USA (formerly BMO Harris Bank)",
    hq: "Chicago, IL",
    country: "US",
    category: "us-major",
    assetRank: "Rank #17 U.S. ($265B Assets / U.S. subsidiary of Bank of Montreal)",
    crossBorder: "specialist",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Can be opened directly from Canada or the US! Accepts Canadian ID, passport, and SIN/SSN.",
    hysaApy: "Up to 4.50% - 4.75% APY via BMO Alto High-Yield Savings (100% digital platform)",
    checkingFeature: "BMO Smart Advantage: Zero fee checking with $0 monthly maintenance, expanded footprint across California and West Coast via Bank of the West acquisition.",
    topCreditCard: "BMO Cash Back & BMO Platinum Rewards.",
    crossBorderPerks: "★ TOP-TIER CROSS-BORDER BANK: Integrated with BMO Bank of Montreal in Canada. Fee-free cross-border wire transfers, cross-border mortgage financing for Canadian snowbirds buying Florida or Arizona real estate!",
    websiteUrl: "https://www.bmo.com/main/personal"
  },
  {
    id: "huntington",
    name: "Huntington Bancshares",
    hq: "Columbus, OH",
    country: "US",
    category: "us-major",
    assetRank: "Rank #18 U.S. ($190B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "SSN online; branch verification for foreign applicants. $0 minimum deposit for Asterisk-Free Checking.",
    hysaApy: "Up to 4.25% APY on select Premier Money Market and relationship CD rungs",
    checkingFeature: "Asterisk-Free Checking®: No monthly maintenance fees, 24-Hour Grace® overdraft relief, Hub financial planning tools.",
    topCreditCard: "Huntington Voice Credit Card® (choose your own 3% cash back category).",
    crossBorderPerks: "Key banking partner for Great Lakes cross-border commerce between Ohio/Michigan and Ontario.",
    websiteUrl: "https://www.huntington.com"
  },
  {
    id: "usaa",
    name: "USAA Federal Savings Bank",
    hq: "San Antonio, TX",
    country: "US",
    category: "us-major",
    assetRank: "Rank #19 U.S. ($115B Assets)",
    crossBorder: "international",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Exclusively for active-duty U.S. military, veterans, and their eligible family members. SSN required.",
    hysaApy: "Up to 4.30% APY on USAA Performance First Savings Tiers",
    checkingFeature: "USAA Classic Checking: Worldwide ATM fee refunds up to $15/month, zero foreign transaction fees, specialized military deployment features.",
    topCreditCard: "USAA Cashback Rewards Plus (5% cash back on military base spend and gas) & Eagle Navigator™.",
    crossBorderPerks: "Comprehensive international banking for service members stationed at NATO/NORAD bases in Canada and abroad.",
    websiteUrl: "https://www.usaa.com"
  },
  {
    id: "hsbc-usa",
    name: "HSBC Bank USA",
    hq: "New York, NY",
    country: "US",
    category: "us-major",
    assetRank: "Rank #20 U.S. ($85B Assets)",
    crossBorder: "international",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "HSBC Premier / Private Banking. Minimum balance: $75,000 in qualifying deposits/investments.",
    hysaApy: "Up to 4.25% APY via HSBC Premier Relationship Savings",
    checkingFeature: "HSBC Premier Checking: Global view and global transfers across 30+ international countries with single-login interface.",
    topCreditCard: "HSBC Premier World Elite Mastercard® (travel privileges, lounge key).",
    crossBorderPerks: "Instant fee-free Global Transfers between U.S., Canadian, and European accounts with preferential FX conversion rates.",
    websiteUrl: "https://www.us.hsbc.com"
  },
  {
    id: "first-citizens",
    name: "First Citizens BancShares",
    hq: "Raleigh, NC",
    country: "US",
    category: "us-major",
    assetRank: "Rank #21 U.S. ($220B Assets / Acquired Silicon Valley Bank)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "SSN online; business documentation for SVB innovation tech accounts.",
    hysaApy: "Up to 4.50% APY on commercial treasury and relationship savings",
    checkingFeature: "Premier Commercial & Venture Banking: SVB tech innovation platform, robust regional retail banking.",
    topCreditCard: "First Citizens Smart Option & Rewards Visa.",
    crossBorderPerks: "Powers cross-border venture banking for Canadian tech startups operating in Silicon Valley and Boston.",
    websiteUrl: "https://www.firstcitizens.com"
  },
  {
    id: "barclays-us",
    name: "Barclays Bank Delaware (Barclays US)",
    hq: "Wilmington, DE",
    country: "US",
    category: "us-major",
    assetRank: "Rank #22 U.S. ($100B Assets)",
    crossBorder: "international",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "100% online onboarding for savings and co-branded airline/hotel credit cards. SSN required.",
    hysaApy: "4.35% APY via Barclays Tier-1 Online Savings (No minimum balance, fee-free)",
    checkingFeature: "High-Yield Online Savings & CDs: Direct deposit sweep, no monthly fees, 24/7 digital access.",
    topCreditCard: "AAdvantage® Aviator® Red World Elite Mastercard, JetBlue Plus, and Wyndham Rewards.",
    crossBorderPerks: "Global travel rewards credit cards with zero foreign transaction fees for seamless U.S.-Canada travel.",
    websiteUrl: "https://www.banking.barclaysus.com"
  },
  {
    id: "citizens-bank",
    name: "Citizens Financial Group",
    hq: "Providence, RI",
    country: "US",
    category: "us-major",
    assetRank: "Rank #23 U.S. ($225B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "SSN online; branch verification in Northeast and Mid-Atlantic. $0 opening minimum on select tiers.",
    hysaApy: "Up to 4.50% APY via Citizens Access Online Savings (Direct Digital Bank)",
    checkingFeature: "EverValue Checking™ & One Deposit Checking: Transparent fee structures, massive branch footprint in NY/NJ/New England.",
    topCreditCard: "Citizens Cash Back Plus™ World Mastercard® (1.8% cash back on everything).",
    crossBorderPerks: "Financing cross-border New England-Quebec and New York-Ontario commercial corridors.",
    websiteUrl: "https://www.citizensbank.com"
  },
  {
    id: "mt-bank",
    name: "M&T Bank",
    hq: "Buffalo, NY",
    country: "US",
    category: "us-major",
    assetRank: "Rank #24 U.S. ($210B Assets)",
    crossBorder: "specialist",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "SSN/ITIN; Buffalo-Niagara border proximity makes them highly experienced with Canadian cross-border customers.",
    hysaApy: "Up to 4.25% APY via Relationship Savings & Promotional CD specials",
    checkingFeature: "EZChoice Checking: No monthly fee with any single debit or deposit transaction per month.",
    topCreditCard: "M&T Visa Signature (1.5% unlimited cash back) & M&T Rewards.",
    crossBorderPerks: "Located on the U.S.-Canada Niagara border. Specialized in Canadian cross-border real estate purchases and cross-border commercial trade.",
    websiteUrl: "https://www.mtb.com"
  },
  {
    id: "ubs-bank-us",
    name: "UBS Bank USA",
    hq: "New York, NY",
    country: "US",
    category: "us-major",
    assetRank: "Rank #25 U.S. ($130B Assets)",
    crossBorder: "international",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "High-net-worth wealth management and private client onboarding.",
    hysaApy: "Up to 5.00% APY via UBS Insured Deposit Program (FDIC coverage up to $5M)",
    checkingFeature: "Resource Management Account (RMA®): Comprehensive cash, securities, and margin integration.",
    topCreditCard: "UBS Visa Infinite Credit Card (premium travel benefits, private aviation perks).",
    crossBorderPerks: "Bespoke dual US-Canadian tax residency estate planning and multi-currency portfolio management.",
    websiteUrl: "https://www.ubs.com"
  },
  {
    id: "city-national-rbc",
    name: "City National Bank / RBC USA",
    hq: "Los Angeles, CA / New York, NY",
    country: "US",
    category: "us-major",
    assetRank: "Rank #26 U.S. ($95B Assets / Subsidiary of Royal Bank of Canada)",
    crossBorder: "specialist",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Premier commercial, entertainment, and wealth onboarding; cross-border access for RBC Canadian clients.",
    hysaApy: "Competitive private client money market yields up to 4.60%",
    checkingFeature: "Premier Personal Checking: Known as the 'Bank to the Stars' in Los Angeles and New York; entertainment industry banking.",
    topCreditCard: "City National Crystal Visa Infinite® Card (premium dining, air travel credits).",
    crossBorderPerks: "★ BACKED BY RBC CANADA: Seamless integration with Royal Bank of Canada (RBC) for high-net-worth cross-border transactions and Hollywood/Toronto film co-productions.",
    websiteUrl: "https://www.cnb.com"
  },
  {
    id: "ally-financial",
    name: "Ally Financial (Ally Bank)",
    hq: "Detroit, MI",
    country: "US",
    category: "us-major",
    assetRank: "Rank #27 U.S. ($185B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "100% digital online bank. SSN and U.S. address required. $0 minimum opening balance.",
    hysaApy: "4.25% - 4.35% APY via Ally High Yield Savings with Automated Savings Buckets & Boosters",
    checkingFeature: "Ally Interest Checking: Free checks, 43,000+ Allpoint ATMs with up to $10/month out-of-network reimbursement.",
    topCreditCard: "Ally Everyday Cash Back Mastercard® (3% gas, groceries, drugstores).",
    crossBorderPerks: "Leading online automotive finance provider across the United States; fee-free inbound wire reception.",
    websiteUrl: "https://www.ally.com"
  },
  {
    id: "ameriprise",
    name: "Ameriprise Financial",
    hq: "Minneapolis, MN",
    country: "US",
    category: "us-major",
    assetRank: "Rank #28 U.S. ($170B Assets / $1.4T AUM)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Comprehensive financial planning and wealth management clients.",
    hysaApy: "Up to 4.50% APY via Ameriprise Insured Sweep Account",
    checkingFeature: "Ameriprise ONE® Financial Account: Integrated cash sweep, checkwriting, and wealth planning.",
    topCreditCard: "Ameriprise World Elite Mastercard with points conversion into retirement accounts.",
    crossBorderPerks: "Advises Canadian expats and US citizens resident in Canada on cross-border tax treaties and IRA/RRSP transfers.",
    websiteUrl: "https://www.ameriprise.com"
  },
  {
    id: "keybank",
    name: "KeyBank / KeyCorp",
    hq: "Cleveland, OH",
    country: "US",
    category: "us-major",
    assetRank: "Rank #29 U.S. ($190B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "SSN online; branch verification for foreign nationals. $10-$50 min opening deposit.",
    hysaApy: "Up to 4.30% APY on promotional Relationship Money Market accounts",
    checkingFeature: "Key Smart Checking®: No monthly maintenance fees, extensive Midwest and Pacific Northwest branch footprint.",
    topCreditCard: "Key Cashback® Credit Card (up to 2% cash back with qualifying relationship).",
    crossBorderPerks: "Strong branch density along the Washington State-British Columbia and Ohio-Ontario border crossings.",
    websiteUrl: "https://www.key.com"
  },
  {
    id: "northern-trust",
    name: "Northern Trust",
    hq: "Chicago, IL",
    country: "US",
    category: "us-major",
    assetRank: "Rank #30 U.S. ($155B Assets / $16T Assets Under Custody)",
    crossBorder: "international",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "High net worth individuals, endowments, family offices, and institutions.",
    hysaApy: "Institutional liquidity yields via Northern Trust Global Asset Management",
    checkingFeature: "Wealth Passport®: Multi-asset liquidity management, bespoke private banking lines of credit.",
    topCreditCard: "Private wealth exclusive credit services and custom collateralized lending.",
    crossBorderPerks: "Active Canadian presence with Northern Trust Global Services Canada (Toronto), managing cross-border pension funds.",
    websiteUrl: "https://www.northerntrust.com"
  },
  {
    id: "santander-us",
    name: "Santander Bank, N.A.",
    hq: "Boston, MA",
    country: "US",
    category: "us-major",
    assetRank: "Rank #31 U.S. ($100B Assets / U.S. arm of Banco Santander)",
    crossBorder: "international",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "SSN online; foreign passport + international documentation supported in branches.",
    hysaApy: "Up to 4.40% APY on Promotional Money Market & CD Tiers",
    checkingFeature: "Santander Select® Checking: No ATM fees anywhere worldwide, dedicated banker, international wire discounts.",
    topCreditCard: "Santander Ultimate Cash Back Mastercard (1.5% unlimited cash back).",
    crossBorderPerks: "Seamless international connectivity through global Banco Santander network.",
    websiteUrl: "https://www.santanderbank.com"
  },
  {
    id: "regions-financial",
    name: "Regions Financial Corporation",
    hq: "Birmingham, AL",
    country: "US",
    category: "us-major",
    assetRank: "Rank #32 U.S. ($155B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "SSN online; foreign ID in branch. $50 opening deposit. Monthly fee waived with direct deposit.",
    hysaApy: "Up to 4.00% APY on relationship CD rungs and Premium Money Market",
    checkingFeature: "LifeGreen Checking®: Popular Southeast/Midwest retail footprint, discounts on personal loans.",
    topCreditCard: "Regions Cash Rewards (1.5% cash back on all qualifying purchases).",
    crossBorderPerks: "Primary consumer banking provider across the Sunbelt and Florida snowbird corridors.",
    websiteUrl: "https://www.regions.com"
  },
  {
    id: "deutsche-bank-us",
    name: "Deutsche Bank USA",
    hq: "New York, NY",
    country: "US",
    category: "us-major",
    assetRank: "Rank #33 U.S. ($120B Assets)",
    crossBorder: "international",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Corporate, commercial, and private wealth clients only.",
    hysaApy: "Institutional competitive money market and treasury yields",
    checkingFeature: "Private Wealth Cash Solutions: Global currency custody and structured asset financing.",
    topCreditCard: "Bespoke high-net-worth private credit lines.",
    crossBorderPerks: "Foreign exchange cross-border clearing between USD, CAD, EUR, and GBP.",
    websiteUrl: "https://www.db.com/usa"
  },
  {
    id: "synchrony-financial",
    name: "Synchrony Financial (Synchrony Bank)",
    hq: "Stamford, CT",
    country: "US",
    category: "us-major",
    assetRank: "Rank #34 U.S. ($115B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "100% digital bank onboarding. SSN required. $0 minimum deposit.",
    hysaApy: "4.30% APY via Synchrony High Yield Savings (No minimum balance, ATM card available)",
    checkingFeature: "High-Yield Savings & CDs: Optional ATM card with up to $5/month out-of-network reimbursement, fee-free.",
    topCreditCard: "Synchrony Premier World Mastercard® (2% cash back on every purchase with zero annual fee).",
    crossBorderPerks: "Nation's largest provider of private label consumer financing and retail credit programs.",
    websiteUrl: "https://www.synchronybank.com"
  },
  {
    id: "cibc-bank-usa",
    name: "CIBC Bank USA",
    hq: "Chicago, IL",
    country: "US",
    category: "us-major",
    assetRank: "Rank #35 U.S. ($70B Assets / U.S. subsidiary of CIBC Canada)",
    crossBorder: "specialist",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "★ OPEN ONLINE FROM CANADA: Canadian citizens can open CIBC Bank USA accounts directly via Canadian CIBC online banking!",
    hysaApy: "Up to 4.52% APY via CIBC Agility High-Yield Savings (100% digital nationwide)",
    checkingFeature: "CIBC US Smart Checking: $0 monthly fees, seamless linking with CIBC Canada Trust accounts.",
    topCreditCard: "CIBC Bank USA Credit Card with no foreign exchange markups and zero annual fee.",
    crossBorderPerks: "★ TOP-TIER CROSS-BORDER BANK: Free instant real-time transfers between CIBC Canada and CIBC US accounts. Allows Canadians to finance U.S. mortgages using their Canadian credit history!",
    websiteUrl: "https://us.cibc.com"
  },

  // --- U.S. REGIONAL & SPECIALTY COMMERCIAL BANKS ---
  {
    id: "pinnacle-financial",
    name: "Pinnacle Financial Partners",
    hq: "Nashville, TN",
    country: "US",
    category: "us-regional",
    assetRank: "Top 40 U.S. ($48B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Regional retail and business banking. $100 min deposit.",
    hysaApy: "Competitive regional Money Market APY up to 4.10%",
    checkingFeature: "Pinnacle High-Touch Relationship Checking: Dedicated client advisors, free checks.",
    topCreditCard: "Pinnacle Cash Rewards Visa.",
    crossBorderPerks: "Premier commercial bank across Tennessee, the Carolinas, and Virginia.",
    websiteUrl: "https://www.pnfp.com"
  },
  {
    id: "western-alliance",
    name: "Western Alliance Bancorporation",
    hq: "Phoenix, AZ",
    country: "US",
    category: "us-regional",
    assetRank: "Top 40 U.S. ($75B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Online savings available nationwide via digital platform.",
    hysaApy: "4.80% - 5.10% APY via Western Alliance High-Yield Savings (Nationwide Online)",
    checkingFeature: "Commercial Banking & Specialized Tech/Biotech Financing.",
    topCreditCard: "Commercial treasury and corporate cards.",
    crossBorderPerks: "Very popular among Canadian snowbirds in Arizona for high-yield cash management.",
    websiteUrl: "https://www.westernalliancebancorporation.com"
  },
  {
    id: "zions-bancorporation",
    name: "Zions Bancorporation",
    hq: "Salt Lake City, UT",
    country: "US",
    category: "us-regional",
    assetRank: "Top 40 U.S. ($90B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Operates through affiliate community brands across 11 Western states. $50 min deposit.",
    hysaApy: "Up to 4.20% APY on Premium Money Market tiers",
    checkingFeature: "Anytime Checking: Strong mountain-west branch network across Utah, Nevada, Arizona, Idaho.",
    topCreditCard: "Zions Agility Cash Credit Card.",
    crossBorderPerks: "Commercial trade support for Western Canadian logistics and energy companies.",
    websiteUrl: "https://www.zionsbancorporation.com"
  },
  {
    id: "first-horizon",
    name: "First Horizon Bank",
    hq: "Memphis, TN",
    country: "US",
    category: "us-regional",
    assetRank: "Top 40 U.S. ($82B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Regional retail and business branches. $50 min opening deposit.",
    hysaApy: "Up to 4.15% APY on Select CDs and Money Market Accounts",
    checkingFeature: "FirstView Checking: Mobile deposit, overdraft grace periods, Mid-South presence.",
    topCreditCard: "First Horizon Visa Signature Cash Back.",
    crossBorderPerks: "Commercial banking along Mississippi River inland trade routes.",
    websiteUrl: "https://www.firsthorizon.com"
  },
  {
    id: "webster-bank",
    name: "Webster Bank",
    hq: "Stamford, CT",
    country: "US",
    category: "us-regional",
    assetRank: "Top 40 U.S. ($75B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Consumer branches in CT, NY, MA, RI; HSA Bank division nationwide.",
    hysaApy: "Up to 4.40% APY via Webster Premier Money Market",
    checkingFeature: "Premier Checking & National HSA Administrator (HSA Bank division).",
    topCreditCard: "Webster Visa Signature Rewards.",
    crossBorderPerks: "Nation's leading administrator of health savings accounts (HSAs).",
    websiteUrl: "https://www.websterbank.com"
  },
  {
    id: "comerica",
    name: "Comerica Bank",
    hq: "Dallas, TX",
    country: "US",
    category: "us-regional",
    assetRank: "Top 40 U.S. ($85B Assets)",
    crossBorder: "specialist",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Commercial and consumer footprint in Texas, Michigan, California, Arizona, Florida.",
    hysaApy: "Up to 4.00% APY on Relationship Money Market Accounts",
    checkingFeature: "Rich Legacy in Detroit automotive corridors and Texas commercial enterprises.",
    topCreditCard: "Comerica Business & Consumer Rewards Cards.",
    crossBorderPerks: "Maintains dedicated Canada cross-border corporate banking desk in Windsor/Detroit.",
    websiteUrl: "https://www.comerica.com"
  },
  {
    id: "east-west-bank",
    name: "East West Bank",
    hq: "Pasadena, CA",
    country: "US",
    category: "us-regional",
    assetRank: "Top 40 U.S. ($70B Assets)",
    crossBorder: "international",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Bilingual digital onboarding (English & Chinese); foreign passport accepted.",
    hysaApy: "Up to 4.50% APY on Premier Money Market and Term Deposits",
    checkingFeature: "Velo by East West®: Digital global account enabling international customers to open US accounts.",
    topCreditCard: "East West Visa Cash Rewards Credit Card.",
    crossBorderPerks: "Leading bridge bank for cross-border financial transactions between the US, Canada (Vancouver), and Asia.",
    websiteUrl: "https://www.eastwestbank.com"
  },
  {
    id: "umb-financial",
    name: "UMB Financial Corporation",
    hq: "Kansas City, MO",
    country: "US",
    category: "us-regional",
    assetRank: "Top 50 U.S. ($45B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Commercial, consumer, and institutional healthcare accounts. $100 min deposit.",
    hysaApy: "Competitive rates on liquid Money Market and Certificate accounts",
    checkingFeature: "UMB Select Checking & National Institutional Custody.",
    topCreditCard: "UMB Simply Rewards Visa (3x points on gas, groceries, dining).",
    crossBorderPerks: "Institutional healthcare payment clearing across North America.",
    websiteUrl: "https://www.umb.com"
  },
  {
    id: "southstate-bank",
    name: "SouthState Bank",
    hq: "Winter Haven, FL",
    country: "US",
    category: "us-regional",
    assetRank: "Top 50 U.S. ($45B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Regional branches in Florida, Georgia, the Carolinas, Alabama, Virginia. $50 min deposit.",
    hysaApy: "Up to 4.25% APY on Special CDs and Relationship Money Market",
    checkingFeature: "SouthState Choice Checking: Widely accessible across Florida vacation and snowbird regions.",
    topCreditCard: "SouthState Cash Rewards Card.",
    crossBorderPerks: "Premier destination bank for Canadian snowbirds purchasing winter properties in Florida.",
    websiteUrl: "https://www.southstatebank.com"
  },
  {
    id: "valley-national",
    name: "Valley National Bank",
    hq: "Wayne, NJ",
    country: "US",
    category: "us-regional",
    assetRank: "Top 50 U.S. ($60B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Branches in NY, NJ, FL, AL. $100 min deposit.",
    hysaApy: "Up to 4.50% APY via Valley Direct Online High-Yield Savings",
    checkingFeature: "Valley All Access Checking: Full branch and digital services in the NY metro and Florida markets.",
    topCreditCard: "Valley Visa Signature Rewards.",
    crossBorderPerks: "Convenient dual-presence in New York Metro and Florida for dual-state residents and Canadian snowbirds.",
    websiteUrl: "https://www.valley.com"
  },
  {
    id: "flagstar-bank",
    name: "Flagstar Bank (formerly NYCB)",
    hq: "Troy, MI / Hicksville, NY",
    country: "US",
    category: "us-regional",
    assetRank: "Top 50 U.S. ($110B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Branches across Northeast, Midwest, and West Coast. $50 min deposit.",
    hysaApy: "Up to 4.60% APY on Promotional High-Yield Savings and CDs",
    checkingFeature: "One of the nation's largest residential and multi-family mortgage servicers.",
    topCreditCard: "Flagstar Max Cash Preferred (5% cash back in two categories).",
    crossBorderPerks: "Comprehensive wholesale residential mortgage underwriting.",
    websiteUrl: "https://www.flagstar.com"
  },
  {
    id: "fulton-financial",
    name: "Fulton Financial Corporation",
    hq: "Lancaster, PA",
    country: "US",
    category: "us-regional",
    assetRank: "Top 60 U.S. ($30B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Branches in PA, NJ, MD, DE, VA. $25 min deposit.",
    hysaApy: "Competitive regional CD specials up to 4.25% APY",
    checkingFeature: "Relationship Checking: Community-focused bank serving Mid-Atlantic agricultural and commercial sectors.",
    topCreditCard: "Fulton Visa Signature Cash Back.",
    crossBorderPerks: "Regional commercial financing across the Mid-Atlantic corridor.",
    websiteUrl: "https://www.fultonbank.com"
  },
  {
    id: "commerce-bancshares",
    name: "Commerce Bancshares",
    hq: "Kansas City, MO",
    country: "US",
    category: "us-regional",
    assetRank: "Top 60 U.S. ($32B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Midwest regional presence in MO, KS, IL, OK, CO. $25 min deposit.",
    hysaApy: "Up to 4.10% APY on Premium Money Market accounts",
    checkingFeature: "CommerceFree Checking: 50+ year record of dividend payment growth, ultra-safe conservative balance sheet.",
    topCreditCard: "Commerce Bank Special Connections Card.",
    crossBorderPerks: "Commercial grain and agricultural export financing between US Midwest and Canadian prairies.",
    websiteUrl: "https://www.commercebank.com"
  },
  {
    id: "old-national",
    name: "Old National Bank",
    hq: "Evansville, IN",
    country: "US",
    category: "us-regional",
    assetRank: "Top 60 U.S. ($48B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Footprint in IN, IL, MI, MN, WI, KY. $50 min deposit.",
    hysaApy: "Up to 4.30% APY on Promotional Money Market Tiers",
    checkingFeature: "ONB Community Checking: Deep Midwest ties, commercial real estate and wealth management.",
    topCreditCard: "Old National Cash Rewards Visa.",
    crossBorderPerks: "Financing Great Lakes shipping and manufacturing corridors.",
    websiteUrl: "https://www.oldnational.com"
  },
  {
    id: "synovus",
    name: "Synovus Financial Corp.",
    hq: "Columbus, GA",
    country: "US",
    category: "us-regional",
    assetRank: "Top 60 U.S. ($60B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Branches in GA, AL, FL, SC, TN. $100 min deposit.",
    hysaApy: "Up to 4.35% APY on Relationship CD specials",
    checkingFeature: "Synovus Plus Checking: Premier private client banking in Atlanta and the Southeast.",
    topCreditCard: "Synovus Cash Rewards Visa.",
    crossBorderPerks: "Commercial banking for Canadian companies with manufacturing plants in Georgia and Alabama.",
    websiteUrl: "https://www.synovus.com"
  },
  {
    id: "bok-financial",
    name: "BOK Financial Corporation",
    hq: "Tulsa, OK",
    country: "US",
    category: "us-regional",
    assetRank: "Top 60 U.S. ($50B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Operates Bank of Oklahoma, Bank of Texas, Bank of Albuquerque. $50 min deposit.",
    hysaApy: "Up to 4.25% APY on Liquid Relationship Savings",
    checkingFeature: "Premier Energy and Commercial Banking across the Southwest and Rocky Mountains.",
    topCreditCard: "BOK Financial Visa Signature.",
    crossBorderPerks: "Energy sector finance and commodity hedging connecting Calgary oil companies with Texas/Oklahoma producers.",
    websiteUrl: "https://www.bokf.com"
  },
  {
    id: "associated-bank",
    name: "Associated Banc-Corp",
    hq: "Green Bay, WI",
    country: "US",
    category: "us-regional",
    assetRank: "Top 60 U.S. ($42B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Serving Wisconsin, Illinois, and Minnesota. $25 min deposit.",
    hysaApy: "Up to 4.25% APY via Associated Relationship Savings",
    checkingFeature: "Associated Checking: Official bank of the Green Bay Packers with Packers-themed debit cards.",
    topCreditCard: "Associated Bank Visa Signature Real Rewards.",
    crossBorderPerks: "Paper, timber, and agricultural trade financing with Ontario and Manitoba.",
    websiteUrl: "https://www.associatedbank.com"
  },
  {
    id: "international-bancshares",
    name: "International Bancshares Corporation (IBC Bank)",
    hq: "Laredo, TX",
    country: "US",
    category: "us-regional",
    assetRank: "Top 75 U.S. ($16B Assets)",
    crossBorder: "international",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "U.S.-Mexico border specialist; operates 165+ branches in Texas and Oklahoma.",
    hysaApy: "Competitive CDs and Money Market rates",
    checkingFeature: "IBC Free Checking: Motto 'We Do More' on the southern international trade corridor.",
    topCreditCard: "IBC Bank Visa Card.",
    crossBorderPerks: "USMCA cross-border supply chain financing connecting Canada, the U.S., and Mexico.",
    websiteUrl: "https://www.ibc.com"
  },
  {
    id: "first-interstate",
    name: "First Interstate BancSystem",
    hq: "Billings, MT",
    country: "US",
    category: "us-regional",
    assetRank: "Top 75 U.S. ($30B Assets)",
    crossBorder: "specialist",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Branches in MT, WY, ID, WA, OR, SD. $50 min deposit.",
    hysaApy: "Up to 4.10% APY on Relationship Savings",
    checkingFeature: "First Interstate Classic: Strong presence in Rocky Mountain and Pacific Northwest communities.",
    topCreditCard: "First Interstate Rewards Card.",
    crossBorderPerks: "Border branches along the Montana-Alberta border, highly experienced with cross-border agricultural trade.",
    websiteUrl: "https://www.firstinterstatebank.com"
  },
  {
    id: "cadence-bank",
    name: "Cadence Bank",
    hq: "Tupelo, MS",
    country: "US",
    category: "us-regional",
    assetRank: "Top 75 U.S. ($48B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Serving TX, MS, AL, FL, GA, TN, AR. $50 min deposit.",
    hysaApy: "Up to 4.25% APY on Cadence Special CDs",
    checkingFeature: "Cadence Standard Checking: Large southern footprint with specialized energy and healthcare lending.",
    topCreditCard: "Cadence Cash Plus Mastercard.",
    crossBorderPerks: "Financing southern U.S. commercial expansion for international enterprises.",
    websiteUrl: "https://www.cadencebank.com"
  },
  {
    id: "columbia-bank",
    name: "Columbia Banking System (Columbia Bank / Umpqua)",
    hq: "Tacoma, WA",
    country: "US",
    category: "us-regional",
    assetRank: "Top 75 U.S. ($52B Assets)",
    crossBorder: "specialist",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Pacific Northwest network in WA, OR, ID, CA, NV. $25 min deposit.",
    hysaApy: "Up to 4.30% APY on Premium Money Market accounts",
    checkingFeature: "Pacific Northwest commercial and retail powerhouse following merger with Umpqua Bank.",
    topCreditCard: "Columbia Rewards Visa.",
    crossBorderPerks: "Directly on the Cascadia corridor (Seattle-Vancouver), facilitating seamless Pacific Northwest cross-border commerce.",
    websiteUrl: "https://www.columbiabank.com"
  },
  {
    id: "hancock-whitney",
    name: "Hancock Whitney",
    hq: "Gulfport, MS",
    country: "US",
    category: "us-regional",
    assetRank: "Top 75 U.S. ($35B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Gulf Coast footprint in MS, LA, AL, FL, TX. $50 min deposit.",
    hysaApy: "Up to 4.15% APY on select relationship terms",
    checkingFeature: "Access Checking: Over 120 years of continuous Gulf Coast community banking.",
    topCreditCard: "Hancock Whitney Visa Signature.",
    crossBorderPerks: "Gulf maritime trade and maritime transport financing.",
    websiteUrl: "https://www.hancockwhitney.com"
  },
  {
    id: "texas-capital",
    name: "Texas Capital Bancshares",
    hq: "Dallas, TX",
    country: "US",
    category: "us-regional",
    assetRank: "Top 75 U.S. ($30B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Focuses on commercial middle-market, private wealth, and Texas businesses.",
    hysaApy: "Up to 5.00% APY via Bask Bank (Online Digital Savings Division)",
    checkingFeature: "Bask Bank division offers unique Interest Savings or American Airlines AAdvantage® Miles Savings accounts!",
    topCreditCard: "Commercial treasury and corporate card products.",
    crossBorderPerks: "Bask Bank provides one of the highest-yielding digital FDIC savings accounts nationwide.",
    websiteUrl: "https://www.texascapitalbank.com"
  },
  {
    id: "wintrust",
    name: "Wintrust Financial Corporation",
    hq: "Rosemont, IL",
    country: "US",
    category: "us-regional",
    assetRank: "Top 75 U.S. ($57B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Known as 'Chicago's Bank', 170+ community banking branches across Chicagoland.",
    hysaApy: "Up to 4.35% APY via MaxSafe Accounts with multi-bank FDIC insurance up to $3.75M",
    checkingFeature: "Wintrust Community Checking: Slogan 'Have It All', free ATMs worldwide.",
    topCreditCard: "Wintrust Visa Signature Rewards.",
    crossBorderPerks: "MaxSafe accounts provide multi-million dollar FDIC insurance coverage for commercial treasuries.",
    websiteUrl: "https://www.wintrust.com"
  },
  {
    id: "simmons-first",
    name: "Simmons First National Corporation",
    hq: "Pine Bluff, AR",
    country: "US",
    category: "us-regional",
    assetRank: "Top 80 U.S. ($27B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Branches across AR, KS, MO, OK, TN, TX. $100 min deposit.",
    hysaApy: "Up to 4.20% APY on Promotional CD Tiers",
    checkingFeature: "Simply Checking: Over 120 years of solid community banking.",
    topCreditCard: "Simmons Bank Visa with consistently low national ongoing APRs.",
    crossBorderPerks: "Nationally recognized for low fixed-rate credit cards.",
    websiteUrl: "https://www.simmonsbank.com"
  },
  {
    id: "cathay-general",
    name: "Cathay General Bancorp (Cathay Bank)",
    hq: "Los Angeles, CA",
    country: "US",
    category: "us-regional",
    assetRank: "Top 80 U.S. ($23B Assets)",
    crossBorder: "international",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Oldest operating Chinese-American bank in Southern California; branches in 9 states.",
    hysaApy: "Up to 4.35% APY on Smart Money Market accounts",
    checkingFeature: "Cross-border personal and commercial banking with Asia and North America.",
    topCreditCard: "Cathay Bank Business & Consumer Cards.",
    crossBorderPerks: "Key financial bridge between Canadian-Asian enterprises in Richmond/Vancouver and California.",
    websiteUrl: "https://www.cathaybank.com"
  },
  {
    id: "ofg-bancorp",
    name: "OFG Bancorp (Oriental Bank)",
    hq: "San Juan, PR",
    country: "US",
    category: "us-regional",
    assetRank: "Top 90 U.S. ($10B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Serving Puerto Rico and U.S. Virgin Islands under U.S. banking regulation.",
    hysaApy: "Up to 3.80% APY on relationship term deposits",
    checkingFeature: "Cuenta Libre: Digital-first Puerto Rican retail banking, bilingual platform.",
    topCreditCard: "Oriental Mastercard Rewards.",
    crossBorderPerks: "Specialized in Act 60 U.S. tax incentive relocations and Caribbean trade.",
    websiteUrl: "https://www.orientalbank.com"
  },
  {
    id: "midfirst-bank",
    name: "MidFirst Bank",
    hq: "Oklahoma City, OK",
    country: "US",
    category: "us-regional",
    assetRank: "Top 80 U.S. ($37B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Largest privately owned bank in the United States. $25-$100 min deposit.",
    hysaApy: "Up to 4.30% APY on Relationship Money Market Accounts",
    checkingFeature: "LiveFree Checking: High-touch customer service across OK, AZ, CO, TX, CA.",
    topCreditCard: "MidFirst Visa Signature Cash Back.",
    crossBorderPerks: "Major mortgage servicer across all 50 U.S. states.",
    websiteUrl: "https://www.midfirst.com"
  },
  {
    id: "atlantic-union",
    name: "Atlantic Union Bankshares",
    hq: "Richmond, VA",
    country: "US",
    category: "us-regional",
    assetRank: "Top 80 U.S. ($24B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Branches throughout Virginia, Maryland, and North Carolina. $25 min deposit.",
    hysaApy: "Up to 4.25% APY on special promotional CD terms",
    checkingFeature: "Free Checking: Largest independent regional community bank headquartered in Virginia.",
    topCreditCard: "Atlantic Union Bank Visa Signature.",
    crossBorderPerks: "Commercial trade support for the Port of Virginia shipping terminals.",
    websiteUrl: "https://www.atlanticunionbank.com"
  },
  {
    id: "townebank",
    name: "TowneBank",
    hq: "Suffolk, VA",
    country: "US",
    category: "us-regional",
    assetRank: "Top 90 U.S. ($17B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Serving Virginia and North Carolina; $100 min opening deposit.",
    hysaApy: "Up to 4.10% APY on Relationship Money Market",
    checkingFeature: "Towne Classic: Emphasis on community involvement and high-touch private client relations.",
    topCreditCard: "TowneBank Visa Cash Rewards.",
    crossBorderPerks: "Vacation property financing in the Outer Banks and Coastal Virginia.",
    websiteUrl: "https://www.townebank.com"
  },
  {
    id: "cnb-financial",
    name: "CNB Financial Corporation",
    hq: "Clearfield, PA",
    country: "US",
    category: "us-regional",
    assetRank: "Top 100 U.S. ($6B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Operates CNB Bank, ERIEBANK, FCBank, and BankOnBuffalo across PA, OH, NY.",
    hysaApy: "Up to 4.25% APY on Regional Money Market & CD Tiers",
    checkingFeature: "ERIEBANK and BankOnBuffalo divisions provide high-touch service along Lake Erie.",
    topCreditCard: "CNB Visa Rewards.",
    crossBorderPerks: "BankOnBuffalo branch network sits directly at the Buffalo-Fort Erie Canadian border crossing.",
    websiteUrl: "https://www.cnbbank.bank"
  },
  {
    id: "park-national",
    name: "Park National Corporation",
    hq: "Newark, OH",
    country: "US",
    category: "us-regional",
    assetRank: "Top 100 U.S. ($10B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "100+ branches throughout Ohio, Kentucky, the Carolinas. $50 min deposit.",
    hysaApy: "Up to 4.15% APY on promotional CD specials",
    checkingFeature: "Park Checking: Over 115 years of community banking and local decision-making.",
    topCreditCard: "Park National Visa Cash Card.",
    crossBorderPerks: "Agricultural and manufacturing equipment financing.",
    websiteUrl: "https://www.parknationalbank.com"
  },
  {
    id: "brookline-bancorp",
    name: "Brookline Bancorp",
    hq: "Boston, MA",
    country: "US",
    category: "us-regional",
    assetRank: "Top 100 U.S. ($12B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Operates Brookline Bank, Bank Rhode Island, and PCSB Bank in NY.",
    hysaApy: "Up to 4.25% APY on Premier Money Market Tiers",
    checkingFeature: "Premier Commercial Real Estate and Equipment Financing throughout New England.",
    topCreditCard: "Brookline Bank Visa Rewards.",
    crossBorderPerks: "Cross-border commercial equipment financing throughout Eastern Canada and New England.",
    websiteUrl: "https://www.brooklinebank.com"
  },
  {
    id: "lakeland-financial",
    name: "Lakeland Financial Corporation (Lake City Bank)",
    hq: "Warsaw, IN",
    country: "US",
    category: "us-regional",
    assetRank: "Top 100 U.S. ($7B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "50+ branches across Indiana. $50 min opening deposit.",
    hysaApy: "Up to 4.20% APY on Lake City CD specials",
    checkingFeature: "Lake City Basic Checking: Consistently rated one of Forbes Best Banks in America.",
    topCreditCard: "Lake City Bank Visa Signature.",
    crossBorderPerks: "World capital of orthopedics equipment financing (Warsaw, IN).",
    websiteUrl: "https://www.lakecitybank.com"
  },
  {
    id: "enterprise-financial",
    name: "Enterprise Financial Services Corp (Enterprise Bank & Trust)",
    hq: "St. Louis, MO",
    country: "US",
    category: "us-regional",
    assetRank: "Top 100 U.S. ($15B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Middle-market commercial banking in MO, KS, AZ, CA, NV, NM.",
    hysaApy: "Up to 4.35% APY on Enterprise Tiered Money Market",
    checkingFeature: "Enterprise Commercial Checking: Specialized in enterprise businesses and family wealth.",
    topCreditCard: "Enterprise Business Cash Rewards.",
    crossBorderPerks: "Cross-border mergers and acquisitions advisory for middle-market firms.",
    websiteUrl: "https://www.enterprisebank.com"
  },
  {
    id: "sandy-spring",
    name: "Sandy Spring Bancorp",
    hq: "Olney, MD",
    country: "US",
    category: "us-regional",
    assetRank: "Top 100 U.S. ($14B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Oldest community bank in Maryland (established 1868); branches in MD, VA, DC.",
    hysaApy: "Up to 4.25% APY on Relationship Money Market",
    checkingFeature: "Premier Community Checking: High-touch service across Greater Washington D.C.",
    topCreditCard: "Sandy Spring Bank Visa Rewards.",
    crossBorderPerks: "Diplomatic and international embassy services in Washington D.C.",
    websiteUrl: "https://www.sandyspringbank.com"
  },
  {
    id: "trustmark",
    name: "Trustmark Corporation",
    hq: "Jackson, MS",
    country: "US",
    category: "us-regional",
    assetRank: "Top 90 U.S. ($18B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "180+ branches across MS, AL, FL, TN, TX. $50 min deposit.",
    hysaApy: "Up to 4.10% APY on Smart Money Market accounts",
    checkingFeature: "Trustmark Performance Checking: Full retail, commercial, and mortgage banking services.",
    topCreditCard: "Trustmark Platinum Visa Card.",
    crossBorderPerks: "Regional commercial real estate lending in the southern corridor.",
    websiteUrl: "https://www.trustmark.com"
  },
  {
    id: "german-american",
    name: "German American Bancorp",
    hq: "Jasper, IN",
    country: "US",
    category: "us-regional",
    assetRank: "Top 100 U.S. ($6B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Serving Southern Indiana and Kentucky. $50 min deposit.",
    hysaApy: "Up to 4.15% APY on Promotional CD Specials",
    checkingFeature: "German American Freedom Checking: Strong heritage in agricultural and manufacturing banking.",
    topCreditCard: "German American Visa Platinum.",
    crossBorderPerks: "Manufacturing and automotive component supply chain lending.",
    websiteUrl: "https://www.germanamerican.com"
  },
  {
    id: "tompkins-financial",
    name: "Tompkins Financial Corporation",
    hq: "Ithaca, NY",
    country: "US",
    category: "us-regional",
    assetRank: "Top 100 U.S. ($8B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Branches in Central, Western, and Hudson Valley New York, and Southeastern PA.",
    hysaApy: "Up to 4.20% APY on Tompkins Relationship Savings",
    checkingFeature: "Tompkins Kasasa Cash®: High-yield community checking with nationwide ATM fee refunds.",
    topCreditCard: "Tompkins Visa Signature.",
    crossBorderPerks: "Proximity to Lake Ontario and educational ties with Cornell University international students.",
    websiteUrl: "https://www.tompkinsbank.com"
  },
  {
    id: "first-bancorp-pr",
    name: "First BanCorp (FirstBank Puerto Rico)",
    hq: "San Juan, PR",
    country: "US",
    category: "us-regional",
    assetRank: "Top 90 U.S. ($19B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Serving Puerto Rico, US Virgin Islands, and Florida. Bilingual English/Spanish.",
    hysaApy: "Up to 4.00% APY on relationship term deposits",
    checkingFeature: "FirstBank Checking: 75+ branches with extensive South Florida branch expansion.",
    topCreditCard: "FirstBank Visa Beyond.",
    crossBorderPerks: "Seamless financial movement between the Caribbean and Florida.",
    websiteUrl: "https://www.firstbankpr.com"
  },
  {
    id: "servisfirst",
    name: "ServisFirst Bancshares",
    hq: "Birmingham, AL",
    country: "US",
    category: "us-regional",
    assetRank: "Top 90 U.S. ($16B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Commercial-focused bank serving businesses and professionals across the Southeast.",
    hysaApy: "Up to 4.40% APY on Commercial Liquidity Accounts",
    checkingFeature: "Low-overhead, high-efficiency business banking model with industry-leading efficiency ratios.",
    topCreditCard: "ServisFirst Visa Commercial Card.",
    crossBorderPerks: "Commercial treasury and correspondent banking services.",
    websiteUrl: "https://www.servisfirstbank.com"
  },
  {
    id: "premier-financial",
    name: "Premier Financial Corp.",
    hq: "Defiance, OH",
    country: "US",
    category: "us-regional",
    assetRank: "Top 100 U.S. ($9B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Branches across OH, MI, IN, PA. $50 min deposit.",
    hysaApy: "Up to 4.25% APY on Select CD Specials",
    checkingFeature: "Premier Community Checking: Commercial lending, wealth management, insurance.",
    topCreditCard: "Premier Visa Cash Back Card.",
    crossBorderPerks: "Regional commercial automotive supply chain banking.",
    websiteUrl: "https://www.premierfincorp.com"
  },
  {
    id: "st-bancorp",
    name: "S&T Bancorp",
    hq: "Indiana, PA",
    country: "US",
    category: "us-regional",
    assetRank: "Top 100 U.S. ($9B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Operating across Western PA, Central PA, Eastern OH. $50 min deposit.",
    hysaApy: "Up to 4.15% APY on High-Interest Money Market Tiers",
    checkingFeature: "My S&T Checking: Full mobile integration with strong regional commercial lending.",
    topCreditCard: "S&T Bank Visa Signature Card.",
    crossBorderPerks: "Energy and manufacturing finance across the Marcellus Shale region.",
    websiteUrl: "https://www.stbank.com"
  },
  {
    id: "nbt-bancorp",
    name: "NBT Bancorp",
    hq: "Norwich, NY",
    country: "US",
    category: "us-regional",
    assetRank: "Top 90 U.S. ($14B Assets)",
    crossBorder: "specialist",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "150+ branches in NY, PA, VT, MA, NH, ME. $25 min deposit.",
    hysaApy: "Up to 4.30% APY on Special CD terms",
    checkingFeature: "NBT Classic Checking: Dedicated community banking across upstate New York and New England.",
    topCreditCard: "NBT Bank Rewards Mastercard.",
    crossBorderPerks: "Located directly along the Quebec and Ontario borders, with branches serving Canadian commercial transit.",
    websiteUrl: "https://www.nbtbank.com"
  },
  {
    id: "independent-bank",
    name: "Independent Bank Corp (Rockland Trust)",
    hq: "Rockland, MA",
    country: "US",
    category: "us-regional",
    assetRank: "Top 90 U.S. ($20B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Largest community bank in Massachusetts and Rhode Island. $25 min deposit.",
    hysaApy: "Up to 4.25% APY on Relationship Savings Tiers",
    checkingFeature: "Rockland Trust Free Checking: Slogan 'Where Each Relationship Matters', extensive Boston network.",
    topCreditCard: "Rockland Trust Mastercard Cash Rewards.",
    crossBorderPerks: "Biotech, life sciences, and academic financing connecting Boston with Montreal/Toronto.",
    websiteUrl: "https://www.rocklandtrust.com"
  },
  {
    id: "bank-of-hawaii",
    name: "Bank of Hawaii",
    hq: "Honolulu, HI",
    country: "US",
    category: "us-regional",
    assetRank: "Top 80 U.S. ($23B Assets)",
    crossBorder: "international",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Primary financial institution in Hawaii and the Pacific Islands (Guam, Saipan).",
    hysaApy: "Up to 4.00% APY on Select CD Specials",
    checkingFeature: "Bank of Hawaii Convenience Checking: Island-wide branch and ATM network.",
    topCreditCard: "Bank of Hawaii Hawaiian Airlines® World Elite Mastercard®.",
    crossBorderPerks: "Major international destination bank for Canadian travelers and vacation homeowners in Maui and Oahu.",
    websiteUrl: "https://www.boh.com"
  },
  {
    id: "first-hawaiian",
    name: "First Hawaiian Bank",
    hq: "Honolulu, HI",
    country: "US",
    category: "us-regional",
    assetRank: "Top 80 U.S. ($24B Assets)",
    crossBorder: "international",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Oldest bank in Hawaii (established 1858 by Charles Reed Bishop). $25 min deposit.",
    hysaApy: "Up to 4.10% APY on Premier Money Market Accounts",
    checkingFeature: "Pure Checking: Comprehensive wealth management and Hawaiian commercial leadership.",
    topCreditCard: "First Hawaiian Priority Destinations® World Elite Mastercard®.",
    crossBorderPerks: "Pacific Rim cross-border commerce; extensive experience servicing Canadian real estate buyers.",
    websiteUrl: "https://www.fhb.com"
  },
  {
    id: "oceanfirst",
    name: "OceanFirst Bank",
    hq: "Toms River, NJ",
    country: "US",
    category: "us-regional",
    assetRank: "Top 100 U.S. ($13B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Serving Central/Southern New Jersey, Philadelphia, and New York City. $50 min deposit.",
    hysaApy: "Up to 4.30% APY on Select Promotional CD Tiers",
    checkingFeature: "Simply OceanFirst Checking: Community commercial lending and residential mortgages.",
    topCreditCard: "OceanFirst Visa Rewards.",
    crossBorderPerks: "Jersey Shore vacation property financing.",
    websiteUrl: "https://www.oceanfirst.com"
  },
  {
    id: "wsfs-financial",
    name: "WSFS Financial Corporation",
    hq: "Wilmington, DE",
    country: "US",
    category: "us-regional",
    assetRank: "Top 80 U.S. ($21B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Oldest and largest locally-managed bank in the Delaware Valley (founded 1832).",
    hysaApy: "Up to 4.25% APY on WSFS Relationship Savings",
    checkingFeature: "Core Checking: Full retail network in DE, PA, NJ, plus Cash Connect® ATM management.",
    topCreditCard: "WSFS Visa Cash Rewards Card.",
    crossBorderPerks: "Delaware statutory trust services for international business entities.",
    websiteUrl: "https://www.wsfsbank.com"
  },
  {
    id: "first-financial-oh",
    name: "First Financial Bancorp",
    hq: "Cincinnati, OH",
    country: "US",
    category: "us-regional",
    assetRank: "Top 90 U.S. ($18B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Branches in OH, IN, KY, IL. $50 min deposit.",
    hysaApy: "Up to 4.20% APY on Premium Money Market Tiers",
    checkingFeature: "First Financial Checking: Commercial and small business lending leadership in Ohio River valley.",
    topCreditCard: "First Financial Visa Platinum.",
    crossBorderPerks: "Middle-market commercial banking.",
    websiteUrl: "https://www.bankatfirst.com"
  },
  {
    id: "seacoast-bank",
    name: "Seacoast Banking Corporation of Florida",
    hq: "Stuart, FL",
    country: "US",
    category: "us-regional",
    assetRank: "Top 90 U.S. ($15B Assets)",
    crossBorder: "specialist",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Branches throughout Florida (Miami, Orlando, Tampa, Palm Beach). $50 min deposit.",
    hysaApy: "Up to 4.35% APY on Special Promotional CDs",
    checkingFeature: "Seacoast Classic Checking: Full Florida footprint, customized residential mortgage team.",
    topCreditCard: "Seacoast Cash Rewards Visa.",
    crossBorderPerks: "★ FAVORITE SNOWBIRD BANK: Extensive expertise in handling Canadian snowbird deposits, seasonal winter checking, and Florida vacation home mortgages.",
    websiteUrl: "https://www.seacoastbank.com"
  },
  {
    id: "first-merchants",
    name: "First Merchants Corporation",
    hq: "Muncie, IN",
    country: "US",
    category: "us-regional",
    assetRank: "Top 90 U.S. ($18B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Branches in IN, MI, OH, IL. $100 min deposit.",
    hysaApy: "Up to 4.25% APY on Relationship Money Market Accounts",
    checkingFeature: "Carefree Checking: Rated #1 Midwest bank in customer satisfaction by J.D. Power.",
    topCreditCard: "First Merchants Visa Rewards.",
    crossBorderPerks: "Manufacturing and Midwest corporate supply chain support.",
    websiteUrl: "https://www.firstmerchants.com"
  },
  {
    id: "mechanics-bank",
    name: "Mechanics Bank",
    hq: "Walnut Creek, CA",
    country: "US",
    category: "us-regional",
    assetRank: "Top 90 U.S. ($19B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "100+ branches across California. $25-$50 min deposit.",
    hysaApy: "Up to 4.20% APY on Premier CD Tiers",
    checkingFeature: "Mechanics Essential Checking: Over a century of California relationship banking and auto finance.",
    topCreditCard: "Mechanics Bank Platinum Rewards Visa.",
    crossBorderPerks: "Agricultural and commercial real estate lending in California valleys.",
    websiteUrl: "https://www.mechanicsbank.com"
  },
  {
    id: "merchants-bank-in",
    name: "Merchants Bank of Indiana",
    hq: "Carmel, IN",
    country: "US",
    category: "us-regional",
    assetRank: "Top 100 U.S. ($17B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Consumer branches in Indiana; national multifamily mortgage servicing division.",
    hysaApy: "Up to 5.00% APY via Merchants Bank Online High-Yield Money Market",
    checkingFeature: "Nationally recognized for industry-topping Money Market APY yields and healthcare facility financing.",
    topCreditCard: "Merchants Bank Visa Platinum.",
    crossBorderPerks: "Consistently ranked among the highest-yielding savings institutions in the United States.",
    websiteUrl: "https://www.merchantsbankofindiana.com"
  },
  {
    id: "citizens-business-bank",
    name: "Citizens Business Bank (CVB Financial)",
    hq: "Ontario, CA",
    country: "US",
    category: "us-regional",
    assetRank: "Top 90 U.S. ($16B Assets)",
    crossBorder: "standard",
    fdicCdic: "FDIC Insured ($250,000)",
    openReqs: "Focuses on commercial middle-market enterprises, agribusiness, and professionals in California.",
    hysaApy: "Competitive commercial treasury and escrow yields",
    checkingFeature: "Ranked one of Forbes Best Banks in America for over a decade straight; zero long-term debt.",
    topCreditCard: "Commercial treasury and corporate Mastercard products.",
    crossBorderPerks: "Major agricultural export financing between California and Western Canadian distributors.",
    websiteUrl: "https://www.cbbank.com"
  },

  // --- THE "BIG SIX" BANKS OF CANADA ---
  {
    id: "rbc-canada",
    name: "Royal Bank of Canada (RBC / RBC Royal Bank)",
    hq: "Toronto, ON",
    country: "CA",
    category: "ca-bigsix",
    assetRank: "Rank #1 Canada ($2.0T CAD Assets / Largest Market Cap)",
    crossBorder: "specialist",
    fdicCdic: "CDIC Member ($100,000 CAD per insured category)",
    openReqs: "Online with Canadian SIN or in-branch with Canadian passport/PR card. Dedicated newcomer banking program.",
    hysaApy: "Up to 4.50% - 5.00% promotional APY on RBC High Interest eSavings",
    checkingFeature: "RBC Day to Day Banking & RBC Signature No Limit: Free Interac e-Transfers, linked Petro-Canada fuel savings.",
    topCreditCard: "RBC Avion Visa Infinite® (premier Canadian travel points) & WestJet RBC World Elite Mastercard (annual companion voucher).",
    crossBorderPerks: "★ UNDISPUTED CROSS-BORDER LEADER: Operates RBC Bank US (Georgia, USA). Canadians can open a true U.S.-domiciled bank account, get a U.S. Visa Signature card using Canadian credit, and obtain a U.S. mortgage for Florida/Arizona/California properties with zero U.S. credit history!",
    websiteUrl: "https://www.rbcroyalbank.com"
  },
  {
    id: "td-canada",
    name: "Toronto-Dominion Bank (TD Canada Trust)",
    hq: "Toronto, ON",
    country: "CA",
    category: "ca-bigsix",
    assetRank: "Rank #2 Canada ($1.9T CAD Assets / Massive U.S. Footprint)",
    crossBorder: "specialist",
    fdicCdic: "CDIC Member ($100,000 CAD per category)",
    openReqs: "Online with Canadian SIN or study/work permit. Extensive branch hours including Sundays in select locations.",
    hysaApy: "Up to 4.25% promotional APY via TD High Interest Savings Account (HISA)",
    checkingFeature: "TD All-Inclusive Banking Plan: Monthly fee waived with $5,000 balance; includes free safe deposit box and premium credit card fee waiver.",
    topCreditCard: "TD Aeroplan Visa Infinite® (top Air Canada rewards card) & TD First Class Travel Visa Infinite®.",
    crossBorderPerks: "★ PREMIER U.S.–CANADA BRIDGE: Direct integration between TD Canada Trust and TD Bank N.A. (USA). Instant, fee-free cross-border transfers via TD Cross-Border Banking portal, single online banking dashboard for both countries.",
    websiteUrl: "https://www.td.com/ca/en/personal-banking"
  },
  {
    id: "scotiabank",
    name: "Bank of Nova Scotia (Scotiabank)",
    hq: "Toronto, ON",
    country: "CA",
    category: "ca-bigsix",
    assetRank: "Rank #3 Canada ($1.4T CAD Assets / Most International)",
    crossBorder: "specialist",
    fdicCdic: "CDIC Member ($100,000 CAD per category)",
    openReqs: "Online onboarding for Canadian residents; StartRight® Program for newcomers, international students, and foreign workers.",
    hysaApy: "Up to 4.50% promotional APY on Scotiabank MomentumPLUS Savings Account",
    checkingFeature: "Scotiabank Ultimate Package: Fee waived with $6,000 balance, unlimited free global non-Scotia ATM withdrawals.",
    topCreditCard: "Scotiabank Gold American Express® (5x points on grocery & dining with NO foreign transaction fees) & Scotiabank Passport® Visa Infinite® (zero FX fees).",
    crossBorderPerks: "Global ATM Alliance member (free cash withdrawals at Bank of America ATMs across the U.S.); cards have 0% foreign transaction fees, saving 2.5% on cross-border shopping.",
    websiteUrl: "https://www.scotiabank.com"
  },
  {
    id: "bmo-canada",
    name: "Bank of Montreal (BMO / BMO Financial Group)",
    hq: "Toronto, ON (Established in Montreal 1817)",
    country: "CA",
    category: "ca-bigsix",
    assetRank: "Rank #4 Canada ($1.3T CAD Assets / Canada's Oldest Bank)",
    crossBorder: "specialist",
    fdicCdic: "CDIC Member ($100,000 CAD per category)",
    openReqs: "Online with Canadian SIN or study permit. BMO NewStart® Program for newcomers.",
    hysaApy: "Up to 4.50% promotional APY on BMO Savings Amplifier Account",
    checkingFeature: "BMO Performance Package: Fee waived with $4,000 balance, unlimited Interac e-Transfers, family bundle options.",
    topCreditCard: "BMO eclipse Visa Infinite® (5x points dining, groceries, gas) & BMO AIR MILES® World Elite Mastercard.",
    crossBorderPerks: "★ SEAMLESS U.S. NETWORK: Directly owns BMO USA (formerly BMO Harris). Snowbird banking packages, free cross-border transfers, U.S. dollar checking, and U.S. mortgage financing for Canadian property buyers.",
    websiteUrl: "https://www.bmo.com"
  },
  {
    id: "cibc-canada",
    name: "Canadian Imperial Bank of Commerce (CIBC)",
    hq: "Toronto, ON",
    country: "CA",
    category: "ca-bigsix",
    assetRank: "Rank #5 Canada ($950B CAD Assets)",
    crossBorder: "specialist",
    fdicCdic: "CDIC Member ($100,000 CAD per category)",
    openReqs: "Online application in minutes. CIBC Smart Start for youth/students, CIBC Welcome to Canada package.",
    hysaApy: "Up to 4.75% promotional APY on CIBC eAdvantage Savings Account",
    checkingFeature: "CIBC Smart Account: Dynamic monthly fee based on activity ($4.95 to $16.95, waived with $4,000 balance).",
    topCreditCard: "CIBC Dividend® Visa Infinite® (4% cash back on gas and groceries) & CIBC Costco Mastercard®.",
    crossBorderPerks: "★ ELITE CROSS-BORDER SUITE: Seamlessly links with CIBC Bank USA. Free real-time transfers between Canadian and U.S. accounts, U.S. Dollar Smart Accounts, and CIBC Global Money Transfer (fee-free wires to 120+ countries with competitive FX rates).",
    websiteUrl: "https://www.cibc.com"
  },
  {
    id: "national-bank-canada",
    name: "National Bank of Canada (Banque Nationale du Canada)",
    hq: "Montreal, QC",
    country: "CA",
    category: "ca-bigsix",
    assetRank: "Rank #6 Canada ($430B CAD Assets / Dominant in Quebec)",
    crossBorder: "specialist",
    fdicCdic: "CDIC Member ($100,000 CAD per category)",
    openReqs: "Online with SIN; bilingual French/English digital onboarding. Acquiring Canadian Western Bank (CWB).",
    hysaApy: "Competitive rates on High Interest Savings and Progressive Term Deposits",
    checkingFeature: "The Total Package: All-inclusive checking with fee waivers for professionals (engineers, healthcare, accountants).",
    topCreditCard: "National Bank World Elite Mastercard® (up to 5x points, unmatched comprehensive out-of-province travel medical insurance).",
    crossBorderPerks: "Operates Natbank (Florida subsidiary based in Hollywood & Boynton Beach), tailored specifically for French-Canadian and Quebec snowbirds vacationing in Florida.",
    websiteUrl: "https://www.nbc.ca"
  },

  // --- MAJOR CANADIAN DIGITAL & REGIONAL INSTITUTIONS ---
  {
    id: "tangerine-bank",
    name: "Tangerine Bank",
    hq: "Toronto, ON",
    country: "CA",
    category: "ca-digital",
    assetRank: "Premier Canadian Digital Bank (Subsidiary of Scotiabank)",
    crossBorder: "standard",
    fdicCdic: "CDIC Member ($100,000 CAD per category)",
    openReqs: "100% digital online bank. Canadian SIN, email, and ID verification via Canada Post or selfie app.",
    hysaApy: "Up to 5.25% promotional APY on New Client Savings / 1.00% ongoing base rate",
    checkingFeature: "Tangerine No-Fee Daily Chequing: Free Interac e-Transfers, free access to 3,500+ Scotiabank ABMs nationwide.",
    topCreditCard: "Tangerine Money-Back Credit Card (2% unlimited cash back in up to 3 chosen categories, paid monthly into savings).",
    crossBorderPerks: "Fee-free cash access across the U.S. via Scotiabank's partnership with Bank of America ATMs.",
    websiteUrl: "https://www.tangerine.ca"
  },
  {
    id: "eq-bank",
    name: "EQ Bank (Equitable Bank)",
    hq: "Toronto, ON",
    country: "CA",
    category: "ca-digital",
    assetRank: "Canada's Challenger Bank ($120B CAD Assets Under Administration)",
    crossBorder: "specialist",
    fdicCdic: "CDIC Member ($100,000 CAD per category)",
    openReqs: "100% digital online opening in under 5 minutes. Canadian SIN required.",
    hysaApy: "Up to 4.00% APY on Personal Account with qualifying direct deposit / 2.50% base rate",
    checkingFeature: "EQ Bank Personal Account: Hybrid checking + high-yield savings in ONE account! Unlimited free Interac e-Transfers, free ATM withdrawals at any Canadian ATM.",
    topCreditCard: "EQ Bank Mastercard® (cash back on all purchases, zero foreign transaction fees, earn high interest on loaded balance).",
    crossBorderPerks: "★ REVOLUTIONARY FX PARTNERSHIP: Integrated with Wise (formerly TransferWise) directly inside the EQ Bank app for the lowest cross-border currency conversion fees in Canada!",
    websiteUrl: "https://www.eqbank.ca"
  },
  {
    id: "atb-financial",
    name: "ATB Financial",
    hq: "Edmonton, AB",
    country: "CA",
    category: "ca-digital",
    assetRank: "Premier Alberta Crown Financial Institution ($60B CAD Assets)",
    crossBorder: "standard",
    fdicCdic: "100% Full Unconditional Deposit Guarantee by the Province of Alberta (Unlimited!)",
    openReqs: "Alberta residents and businesses. $0 opening minimum.",
    hysaApy: "Up to 4.25% APY on ATB Springboard Savings and GICs",
    checkingFeature: "ATB Advantage Account: 100% of all deposits and interest are unconditionally guaranteed by the Government of Alberta.",
    topCreditCard: "ATB World Elite Mastercard (up to 2% rewards points).",
    crossBorderPerks: "Financing cross-border energy trade and agricultural exports between Alberta and Montana/Texas.",
    websiteUrl: "https://www.atb.com"
  },
  {
    id: "laurentian-bank",
    name: "Laurentian Bank of Canada",
    hq: "Montreal, QC",
    country: "CA",
    category: "ca-digital",
    assetRank: "Regional Canadian Commercial & Retail Bank ($50B CAD Assets)",
    crossBorder: "standard",
    fdicCdic: "CDIC Member ($100,000 CAD per category)",
    openReqs: "Digital and branch onboarding across Quebec and Ontario.",
    hysaApy: "Up to 4.30% APY via LBC Digital High-Rate Savings",
    checkingFeature: "Laurentian Daily Operations Checking: Strong focus on real estate and commercial financing.",
    topCreditCard: "Laurentian Bank Visa Infinite.",
    crossBorderPerks: "Syndicated commercial real estate and infrastructure financing across North America.",
    websiteUrl: "https://www.laurentianbank.ca"
  },
  {
    id: "hsbc-bank-canada",
    name: "HSBC Bank Canada (Integrated with RBC)",
    hq: "Vancouver, BC / Toronto, ON",
    country: "CA",
    category: "ca-bigsix",
    assetRank: "International Heritage Commercial Bank (Now Integrated with RBC)",
    crossBorder: "international",
    fdicCdic: "CDIC Member / RBC Backing",
    openReqs: "Integrated client access through RBC Royal Bank network.",
    hysaApy: "Premier liquidity and multi-currency high-rate accounts",
    checkingFeature: "Premier Global Banking: Leading trade finance provider across the Pacific Rim and Europe.",
    topCreditCard: "RBC Premier Elite travel credit platforms.",
    crossBorderPerks: "Historic leader in Pacific Rim cross-border business and Asian-Canadian wealth transfers; now bolstered by RBC's US banking network.",
    websiteUrl: "https://www.rbcroyalbank.com/hsbc-integration"
  }
];

// Active State for Banking Hub
let currentBankingFilter = 'all';
let currentBankingSearchQuery = '';
let currentBankingTab = 'cross-border';

/**
 * Filter banking institutions
 */
function setBankingCategoryFilter(category) {
  currentBankingFilter = category;
  document.querySelectorAll('.bank-cat-chip').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
  renderBankingDirectory();
}

/**
 * Live search filter
 */
function handleBankingSearch(query) {
  currentBankingSearchQuery = (query || '').toLowerCase().trim();
  renderBankingDirectory();
}

/**
 * Switch tabs inside the Banking Hub:
 * - 'cross-border': Cross-Border US-Canada transfers, snowbird rules, credit porting
 * - 'yields': Credit Card vs HYSA Yield Optimizer & Comparison Matrix
 * - 'directory': Searchable 90+ Bank Directory & Account Opening Guides
 */
function switchBankingTab(tabName) {
  currentBankingTab = tabName;
  
  const tabCrossBorder = document.getElementById('bank-tab-crossborder');
  const tabYields = document.getElementById('bank-tab-yields');
  const tabDirectory = document.getElementById('bank-tab-directory');

  const paneCrossBorder = document.getElementById('bank-pane-crossborder');
  const paneYields = document.getElementById('bank-pane-yields');
  const paneDirectory = document.getElementById('bank-pane-directory');

  if (tabCrossBorder) tabCrossBorder.classList.toggle('active', tabName === 'cross-border');
  if (tabYields) tabYields.classList.toggle('active', tabName === 'yields');
  if (tabDirectory) tabDirectory.classList.toggle('active', tabName === 'directory');

  if (paneCrossBorder) paneCrossBorder.classList.toggle('hidden', tabName !== 'cross-border');
  if (paneYields) paneYields.classList.toggle('hidden', tabName !== 'yields');
  if (paneDirectory) paneDirectory.classList.toggle('hidden', tabName !== 'directory');

  if (tabName === 'directory') {
    renderBankingDirectory();
  }
}

/**
 * Render the 90+ bank cards inside the directory
 */
function renderBankingDirectory() {
  const container = document.getElementById('banking-directory-grid');
  const countBadge = document.getElementById('banking-results-count');
  if (!container) return;

  const filtered = BANKING_INSTITUTIONS.filter(bank => {
    const matchesCategory = 
      currentBankingFilter === 'all' ||
      (currentBankingFilter === 'us-giant' && bank.category === 'us-giant') ||
      (currentBankingFilter === 'us-major' && (bank.category === 'us-major' || bank.category === 'us-regional')) ||
      (currentBankingFilter === 'ca-banks' && (bank.category === 'ca-bigsix' || bank.category === 'ca-digital')) ||
      (currentBankingFilter === 'cross-border' && bank.crossBorder === 'specialist');

    const matchesQuery = 
      !currentBankingSearchQuery ||
      bank.name.toLowerCase().includes(currentBankingSearchQuery) ||
      bank.hq.toLowerCase().includes(currentBankingSearchQuery) ||
      bank.openReqs.toLowerCase().includes(currentBankingSearchQuery) ||
      bank.topCreditCard.toLowerCase().includes(currentBankingSearchQuery) ||
      bank.hysaApy.toLowerCase().includes(currentBankingSearchQuery);

    return matchesCategory && matchesQuery;
  });

  if (countBadge) {
    countBadge.textContent = `${filtered.length} Insured Institutions`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-1 md:col-span-2 lg:col-span-3 p-8 text-center bg-slate-900/60 rounded-xl border border-slate-800">
        <span class="text-3xl">🔍</span>
        <h4 class="text-sm font-bold text-white mt-2">No Banking Institutions Found</h4>
        <p class="text-xs text-slate-400 mt-1">Try clearing your search term or selecting "All Institutions".</p>
        <button onclick="setBankingCategoryFilter('all'); document.getElementById('banking-search-input').value = ''; handleBankingSearch('');" class="mt-3 px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 rounded-lg hover:bg-emerald-900 transition-all cursor-pointer">
          Reset Filter
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(bank => {
    const isSpecialist = bank.crossBorder === 'specialist';
    const flag = bank.country === 'US' ? '🇺🇸' : '🇨🇦';
    const badgeColor = bank.country === 'US' ? 'text-blue-400 border-blue-900/40 bg-blue-950/20' : 'text-red-400 border-red-900/40 bg-red-950/20';

    return `
      <div class="bank-card bg-slate-900/80 border ${isSpecialist ? 'border-emerald-500/40 ring-1 ring-emerald-500/20' : 'border-slate-800'} rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-all group">
        <div>
          <div class="flex items-start justify-between gap-2 mb-2">
            <div>
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${badgeColor}">
                ${flag} ${bank.country === 'US' ? 'United States' : 'Canada'}
              </span>
              ${isSpecialist ? `<span class="ml-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">★ Cross-Border</span>` : ''}
              <h4 class="text-sm font-black text-white group-hover:text-emerald-400 transition-colors mt-1.5">
                ${bank.name}
              </h4>
              <p class="text-[11px] text-slate-400 flex items-center gap-1">
                <span>📍 ${bank.hq}</span> &bull; <span class="text-slate-500">${bank.assetRank}</span>
              </p>
            </div>
            <span class="text-[10px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800/80 whitespace-nowrap">
              ${bank.fdicCdic}
            </span>
          </div>

          <div class="space-y-2 my-3 text-xs">
            <div class="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <span class="text-[10px] uppercase font-bold text-emerald-400 block mb-0.5">High-Yield Savings / CD APY:</span>
              <p class="text-slate-200 font-semibold font-mono text-[11px]">${bank.hysaApy}</p>
            </div>

            <div class="p-2 rounded-lg bg-slate-950/60 border border-slate-800/60">
              <span class="text-[10px] uppercase font-bold text-teal-400 block mb-0.5">Premier Card / Rewards:</span>
              <p class="text-slate-300 text-[11px] line-clamp-2">${bank.topCreditCard}</p>
            </div>

            <div class="text-[11px] text-slate-400 line-clamp-2">
              <strong class="text-slate-300">Open Account:</strong> ${bank.openReqs}
            </div>
          </div>
        </div>

        <div class="pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <button onclick="openBankDetailsModal('${bank.id}')" class="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1">
            <span>Dossier &amp; Requirements</span>
            <span>→</span>
          </button>
          <a href="${bank.websiteUrl}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-lg transition-all">
            Official Portal ↗
          </a>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Open Modal with Full Bank Dossier
 */
function openBankDetailsModal(bankId) {
  const bank = BANKING_INSTITUTIONS.find(b => b.id === bankId);
  if (!bank) return;

  const modal = document.getElementById('bank-details-modal');
  const titleEl = document.getElementById('bank-modal-title');
  const badgeEl = document.getElementById('bank-modal-badge');
  const hqEl = document.getElementById('bank-modal-hq');
  const bodyEl = document.getElementById('bank-modal-body');
  const linkEl = document.getElementById('bank-modal-link');

  if (titleEl) titleEl.textContent = bank.name;
  if (badgeEl) badgeEl.textContent = `${bank.country === 'US' ? '🇺🇸 U.S. Bank' : '🇨🇦 Canadian Bank'} • ${bank.fdicCdic}`;
  if (hqEl) hqEl.textContent = `${bank.hq} • ${bank.assetRank}`;
  if (linkEl) linkEl.href = bank.websiteUrl;

  if (bodyEl) {
    bodyEl.innerHTML = `
      <div class="space-y-4">
        <!-- Key Service 1: Opening an Account -->
        <div class="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div class="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1.5">
            <span>📝</span> <span>1. Opening an Account &amp; Eligibility Protocol</span>
          </div>
          <p class="text-xs text-slate-300 leading-relaxed">${bank.openReqs}</p>
          <div class="mt-2 text-[11px] text-slate-400 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80">
            <strong>Documentation Required:</strong> Primary Government Photo ID (Passport or Driver's License), Tax Identification Number (${bank.country === 'US' ? 'SSN or ITIN' : 'Canadian SIN or Study/Work Permit'}), and Proof of Residential Address (Utility bill or bank statement).
          </div>
        </div>

        <!-- Key Service 2: Compare Credit Card & Savings Yields -->
        <div class="p-4 rounded-xl bg-slate-950 border border-slate-800">
          <div class="flex items-center gap-2 text-teal-400 font-bold text-xs uppercase tracking-wider mb-1.5">
            <span>💳</span> <span>2. High-Yield Savings (APY) &amp; Credit Card Rewards</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mt-2">
            <div class="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80">
              <span class="text-[10px] text-slate-400 uppercase font-bold block mb-1">Savings / CD APY Yield:</span>
              <span class="text-emerald-400 font-mono font-bold text-sm">${bank.hysaApy}</span>
            </div>
            <div class="p-3 bg-slate-900/80 rounded-lg border border-slate-800/80">
              <span class="text-[10px] text-slate-400 uppercase font-bold block mb-1">Checking / Liquidity Feature:</span>
              <span class="text-slate-200 font-medium">${bank.checkingFeature}</span>
            </div>
          </div>
          <div class="mt-3 p-3 bg-slate-900/80 rounded-lg border border-slate-800/80 text-xs">
            <span class="text-[10px] text-slate-400 uppercase font-bold block mb-1">Flagship Credit Card:</span>
            <p class="text-slate-200">${bank.topCreditCard}</p>
          </div>
        </div>

        <!-- Key Service 3: Cross-Border Banking between U.S. and Canada -->
        <div class="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
          <div class="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1.5">
            <span>🌐</span> <span>3. Cross-Border Banking (U.S. ⇄ Canada Capabilities)</span>
          </div>
          <p class="text-xs text-slate-200 leading-relaxed">${bank.crossBorderPerks}</p>
          <div class="mt-2.5 flex flex-wrap gap-2 text-[10px] font-mono">
            <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">W-8BEN Foreign Status Compliant</span>
            <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">FinCEN 114 FBAR Tracking</span>
            <span class="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">IRS 183-Day Closer Connection Support</span>
          </div>
        </div>
      </div>
    `;
  }

  if (modal) modal.classList.add('active');
}

function closeBankDetailsModal() {
  const modal = document.getElementById('bank-details-modal');
  if (modal) modal.classList.remove('active');
}

/**
 * Interactive Cross-Border CAD ⇄ USD Live Calculator
 */
function calcCrossBorderTransfer() {
  const amount = parseFloat(document.getElementById('xb-amount')?.value) || 10000;
  const direction = document.getElementById('xb-direction')?.value || 'cad-to-usd';
  const provider = document.getElementById('xb-provider')?.value || 'rbc';

  // Base Interbank Rate Benchmark (CAD/USD ~ 0.74 / USD/CAD ~ 1.35)
  const baseCadToUsd = 0.7420;
  const baseUsdToCad = 1.3477;

  // Provider spread models:
  // Traditional bank wire: 2.75% FX spread + $35 wire fee
  // Cross-Border Specialist (RBC/TD/BMO/CIBC linked): 1.15% FX spread + $0 transfer fee
  // Fintech Specialist (Wise/EQ Bank): 0.45% FX spread + $5 transfer fee
  const providerConfigs = {
    'rbc': { name: 'RBC Royal Bank & RBC Bank US', fee: 0, spread: 0.0110, time: 'Instant Real-Time' },
    'td': { name: 'TD Canada Trust & TD Bank US', fee: 0, spread: 0.0115, time: 'Instant Real-Time' },
    'bmo': { name: 'BMO Canada & BMO USA', fee: 0, spread: 0.0115, time: 'Instant Real-Time' },
    'cibc': { name: 'CIBC Canada & CIBC Bank USA', fee: 0, spread: 0.0110, time: 'Instant Real-Time' },
    'wise': { name: 'EQ Bank / Wise Cross-Border', fee: 5.50, spread: 0.0042, time: 'Same-Day' },
    'traditional': { name: 'Traditional Wire / Out-of-Network', fee: 35.00, spread: 0.0275, time: '2-4 Business Days' }
  };

  const config = providerConfigs[provider] || providerConfigs['rbc'];
  const isCadToUsd = direction === 'cad-to-usd';
  const baseRate = isCadToUsd ? baseCadToUsd : baseUsdToCad;

  // Effective rate after spread deduction
  const effectiveRate = baseRate * (1 - config.spread);
  const grossConverted = (amount - config.fee) * effectiveRate;
  const totalCostFx = (amount * baseRate) - grossConverted;

  const resultAmountEl = document.getElementById('xb-result-amount');
  const resultRateEl = document.getElementById('xb-result-rate');
  const resultFeeEl = document.getElementById('xb-result-fee');
  const resultSpeedEl = document.getElementById('xb-result-speed');
  const savingsVsTradEl = document.getElementById('xb-savings-vs-traditional');

  const targetSymbol = isCadToUsd ? 'USD $' : 'CAD $';
  const sourceSymbol = isCadToUsd ? 'CAD $' : 'USD $';

  if (resultAmountEl) resultAmountEl.textContent = `${targetSymbol} ${grossConverted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (resultRateEl) resultRateEl.textContent = `1 ${isCadToUsd ? 'CAD' : 'USD'} = ${effectiveRate.toFixed(4)} ${isCadToUsd ? 'USD' : 'CAD'} (Spread: ${(config.spread * 100).toFixed(2)}%)`;
  if (resultFeeEl) resultFeeEl.textContent = config.fee === 0 ? '✓ $0 Free Cross-Border Transfer' : `$${config.fee.toFixed(2)} Platform Fee`;
  if (resultSpeedEl) resultSpeedEl.textContent = config.time;

  // Traditional cost comparison
  const tradEffective = baseRate * (1 - 0.0275);
  const tradConverted = Math.max(0, (amount - 35.00) * tradEffective);
  const netAdvantage = Math.max(0, grossConverted - tradConverted);

  if (savingsVsTradEl) {
    savingsVsTradEl.textContent = `+${targetSymbol} ${netAdvantage.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} saved vs. traditional bank wire!`;
  }
}

/**
 * Interactive Credit Card vs High-Yield Savings Yield Optimizer
 */
function calcYieldComparison() {
  const depositBal = parseFloat(document.getElementById('yield-deposit-balance')?.value) || 25000;
  const hysaRate = parseFloat(document.getElementById('yield-hysa-rate')?.value) || 4.50;
  const monthlySpend = parseFloat(document.getElementById('yield-monthly-spend')?.value) || 2500;
  const cardCashbackPct = parseFloat(document.getElementById('yield-card-cashback')?.value) || 2.0;
  const cardAnnualFee = parseFloat(document.getElementById('yield-card-fee')?.value) || 0;

  // 1. HYSA Yield Calculations
  const traditionalRate = 0.04; // 0.04% national average checking
  const annualHysaYield = depositBal * (hysaRate / 100);
  const monthlyHysaYield = annualHysaYield / 12;
  const traditionalYield = depositBal * (traditionalRate / 100);
  const hysaAdvantage = annualHysaYield - traditionalYield;

  // 2. Credit Card Rewards Calculations
  const annualSpend = monthlySpend * 12;
  const grossCashback = annualSpend * (cardCashbackPct / 100);
  const netCardRewards = Math.max(0, grossCashback - cardAnnualFee);

  // 3. Combined Wealth Optimization Yield
  const totalCombinedAnnualGain = annualHysaYield + netCardRewards;

  const hysaAnnualEl = document.getElementById('yield-hysa-annual');
  const hysaMonthlyEl = document.getElementById('yield-hysa-monthly');
  const hysaAdvEl = document.getElementById('yield-hysa-advantage');
  const cardAnnualEl = document.getElementById('yield-card-annual');
  const cardNetEl = document.getElementById('yield-card-net');
  const combinedTotalEl = document.getElementById('yield-combined-total');

  if (hysaAnnualEl) hysaAnnualEl.textContent = `$${annualHysaYield.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (hysaMonthlyEl) hysaMonthlyEl.textContent = `$${monthlyHysaYield.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / mo`;
  if (hysaAdvEl) hysaAdvEl.textContent = `+$${hysaAdvantage.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} more than standard checking`;
  if (cardAnnualEl) cardAnnualEl.textContent = `$${grossCashback.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (cardNetEl) cardNetEl.textContent = `$${netCardRewards.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} net profit`;
  if (combinedTotalEl) combinedTotalEl.textContent = `$${totalCombinedAnnualGain.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / Year`;
}

// Global Initialization
document.addEventListener('DOMContentLoaded', () => {
  renderBankingDirectory();
  calcCrossBorderTransfer();
  calcYieldComparison();
});

// Window Bindings for inline event handlers
if (typeof window !== 'undefined') {
  window.setBankingCategoryFilter = setBankingCategoryFilter;
  window.handleBankingSearch = handleBankingSearch;
  window.switchBankingTab = switchBankingTab;
  window.openBankDetailsModal = openBankDetailsModal;
  window.closeBankDetailsModal = closeBankDetailsModal;
  window.calcCrossBorderTransfer = calcCrossBorderTransfer;
  window.calcYieldComparison = calcYieldComparison;
}
