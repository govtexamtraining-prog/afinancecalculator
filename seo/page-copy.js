/**
 * Original explanations for each calculator page.
 * Dollar figures are computed from the same formulas as js/mechanics.js.
 */
module.exports = {
  'mortgage-calculator': {
    how: 'The monthly principal and interest payment is M = P × [i(1+i)^n] / [(1+i)^n − 1]. P is the price minus the down payment. For a United States fixed mortgage, i is the annual rate divided by 12, and n is the number of months. A 30-year loan uses 360 months. The payment stays the same each month. Early payments are mostly interest. Later payments retire more principal.',
    example: 'A $450,000 home with $90,000 down leaves a $360,000 loan. At 6.2% for 30 years the payment is $2,204.89 a month. Interest over the full 360 payments is $433,759.79. The same loan at 15 years is $3,076.92 a month.',
    leaves: 'Property tax, homeowners insurance, mortgage insurance, and HOA dues are not in the payment. The rate is compounded monthly, which is the US fixed-rate convention. This is not a lender approval and it does not apply Canadian semi-annual compounding. Use the Canada mortgage page for that schedule.'
  },
  'canada-mortgage-calculator': {
    how: 'Canadian mortgage rates are quoted as a rate compounded twice a year. This page converts that quote to a monthly rate with i = (1 + annual rate / 2)^(1/6) − 1, then uses the standard payment formula for the number of months. When the down payment is under 20% and the price is $1,500,000 or less, the CMHC homeowner premium is added to the loan before the payment is calculated. The published bands used here are 2.80% from just over 80% loan-to-value through 85%, 3.10% through 90%, and 4.00% through 95%. An amortization longer than 25 years adds the published 0.20 point surcharge. The premium table is CMHC’s homeowner schedule for the total loan amount.',
    example: 'A C$600,000 home with C$120,000 down is an 80% loan of C$480,000. At 4.5% compounded semi-annually for 25 years, principal and interest is C$2,656.67 a month. Interest over 300 payments is C$317,001.05. No CMHC premium is added, because the down payment is 20%. The same home with C$60,000 down is a 90% loan. The 3.10% premium is C$16,740, the insured loan is C$556,740, and the payment is C$3,081.41 a month.',
    leaves: 'Provincial sales tax on the premium in Ontario, Quebec, and Saskatchewan is not added, and that tax cannot be rolled into the loan. Sagen and other insurers are not priced here. The federal stress test, the minimum qualifying rate, and a lender’s approval are not decided. A non-traditional down payment, which CMHC prices at 4.50% in the top band, is not assumed. This is not an RRSP, TFSA, or land-transfer-tax calculator.'
  },
  'biweekly-mortgage-calculator': {
    how: 'A biweekly plan takes half of the monthly principal-and-interest payment and collects it 26 times a year. That is one extra monthly payment each year, because 26 half-payments equal 13 full payments. Interest in this tool accrues once per biweekly period, using the annual rate divided by 26. The page compares that path with paying the ordinary monthly amount.',
    example: 'Half of a $2,204.89 monthly payment is about $1,102.45, paid 26 times. The tool then walks the balance forward until it reaches zero or the horizon ends, and it reports the interest difference against the monthly schedule.',
    leaves: 'Taxes, insurance, and a lender’s biweekly enrollment fee are not included. Some lenders simply draft half the payment every two weeks and still compound monthly. This page does not know which draft method a lender uses.'
  },
  'refinance-calculator': {
    how: 'The current payment and the new payment are each a standard monthly principal-and-interest calculation on the balance, rate, and term you enter. The monthly savings are the old payment minus the new payment. Break-even months are the closing costs you enter divided by that monthly savings, when the new payment is lower.',
    example: 'A lower rate on the same balance reduces the payment. If closing costs are $6,000 and the payment falls by $200 a month, the costs are covered in 30 months. After that, the lower payment is the gain. If the new payment is higher, there is no break-even from payment savings.',
    leaves: 'The result is not a lender quote. Cash-out, points bought with a higher fee, mortgage insurance, and prepayment penalties are only present if you have already put them into the balance or the closing-cost field.'
  },
  'rent-vs-buy-calculator': {
    how: 'The page compares five years of rent with the principal and interest on a purchase, plus a sale cost you can read on the form. Rent can grow at the rate you enter. The buy side uses the home price, down payment, and mortgage rate on the form. Any investment return you enter is applied only to the case the form labels.',
    example: 'If rent is $2,200 a month and does not change, five years of rent is $132,000 before moving costs. The buy side depends on the price, the down payment, and the rate you type. The verdict is the difference between those two paths over the years on the form, not a lifetime forecast.',
    leaves: 'Repairs, property tax, insurance, and homeowners association fees are left out unless a field on the form asks for them. It is not a full cost of owning, and it is not tax advice on the mortgage-interest deduction.'
  },
  'home-affordability-calculator': {
    how: 'The payment the form allows is the housing share you set, times gross monthly income, minus the monthly debts you enter. That payment is turned back into a loan amount with the standard mortgage formula at the rate and term you enter. Adding the down payment gives a purchase price.',
    example: 'A household that can put $2,200 a month toward principal and interest, at 6.2% for 30 years, supports a loan near $360,000. With $90,000 down, the price is near $450,000. Change the rate or the term and both numbers move.',
    leaves: 'This is not a lender pre-approval. It is not the Canadian mortgage stress test. Taxes, insurance, and mortgage insurance are outside the payment unless you have already reduced the housing budget to leave room for them.'
  },
  'heloc-calculator': {
    how: 'During the draw years the payment is interest only: the drawn balance times the annual rate divided by 12. During the repayment years the same balance is amortized with the standard monthly payment over the repayment term you enter. Total interest adds the interest-only months to the interest inside the repayment payments.',
    example: 'A $50,000 draw at 8% costs $333.33 a month in interest only. If that balance is then amortized over 15 years at the same rate, the repayment payment is higher because it includes principal. The form shows both payments.',
    leaves: 'A home-equity line’s real rate, draw rules, and minimum payment come from the lender. This page does not look up a bank’s prime rate or decide how much equity you can borrow.'
  },
  'closing-costs-calculator': {
    how: 'The total is the sum of the fee amounts you type: lender charges, title, escrow, and any other lines on the form. Nothing is looked up from a county fee schedule. Percent fields, where the form has them, are that percent times the price or loan you entered.',
    example: 'A 1% origination charge on a $360,000 loan is $3,600. Add the flat title and escrow amounts you type and the page shows the cash due at closing from those lines alone.',
    leaves: 'This is a US-style list of fees you enter. It does not calculate Canadian land transfer tax, title insurance, or a provincial welcome tax. Prepaid property tax and insurance are included only when you type them.'
  },
  'cap-rate-calculator': {
    how: 'Capitalization rate is net operating income divided by price. Net operating income on this page is the rent you enter minus the operating costs you enter. The mortgage payment is not subtracted. A cap rate answers what the building yields before financing.',
    example: 'Rent of $36,000 a year and operating costs of $12,000 leave $24,000 of net operating income. On a $400,000 price the cap rate is 6%. The same income on a higher price is a lower cap rate.',
    leaves: 'Vacancy, repairs, and management are in the result only to the extent you typed them into operating costs. Debt service, income tax, and future rent growth are not in the cap rate.'
  },
  'cash-on-cash-calculator': {
    how: 'Cash on cash return is the annual cash flow after the mortgage payment, divided by the cash you put in. Cash flow starts from rent, subtracts the operating costs you enter, then subtracts the mortgage payment the form calculates or accepts. The down payment and closing cash are the denominator.',
    example: 'If the cash left after the mortgage is $6,000 a year and you invested $100,000, the cash-on-cash return is 6%. A higher mortgage payment lowers that return even when the cap rate stays the same.',
    leaves: 'Vacancy and repairs are only the amounts you enter. It is not a cap rate, and it does not forecast appreciation or tax loss.'
  },
  'airbnb-calculator': {
    how: 'Gross booking revenue is the nightly rate times occupied nights. Occupied nights are the occupancy percent you enter times 365. Platform fees, the mortgage payment, and the operating costs you enter are subtracted. Net monthly cash is that annual result divided by 12. Margin is net divided by gross.',
    example: 'A $200 night at 60% occupancy is 219 occupied nights and $43,800 of gross bookings before fees. Subtract the platform percent, mortgage, and operating bills you type to reach the cash left.',
    leaves: 'It is not a forecast of bookings. Seasonality, cleaning, local lodging tax, and empty months appear only when you put them in the occupancy or cost fields.'
  },
  'compound-interest-calculator': {
    how: 'This tool compounds a lump sum once a year. Future value is principal times (1 + rate)^years. There is no monthly contribution on this page. The rate is the number you type. It is not a market return.',
    example: '$10,000 at 7% compounded once a year for 20 years grows to $38,696.84. The gain is $28,696.84. That is 3.87 times the starting amount. A monthly contribution belongs on the monthly investment page, not this one.',
    leaves: 'Fees, taxes, and a varying market return are not applied. Inflation is a separate calculator. The growth is not a forecast that a savings account or a stock index will earn 7%.'
  },
  'cagr-calculator': {
    how: 'Compound annual growth rate is the constant yearly rate that connects a starting value to an ending value. CAGR = (ending / starting)^(1 / years) − 1. It smooths a bumpy path into one annual rate. It does not show the path between the two dates.',
    example: 'A value that goes from $10,000 to $20,000 in 10 years has a CAGR of 7.18% a year. Doubling in 10 years is not 10% a year, because the gains themselves earn returns.',
    leaves: 'Deposits and withdrawals in the middle years are not modeled. If money was added along the way, this rate overstates how hard the investment worked.'
  },
  'simple-interest-calculator': {
    how: 'Simple interest is principal times rate times time. The interest does not earn interest. A two-year loan at simple interest costs twice the interest of a one-year loan at the same rate. That is different from the compound-interest page, which applies the rate to the growing balance.',
    example: '$10,000 at 6% simple interest for 3 years earns $1,800 of interest. The amount owed at the end, if nothing was paid along the way, is $11,800.',
    leaves: 'It does not amortize a monthly payment, and it does not compound. Use the mortgage or personal-loan page when the balance should be paid down each month.'
  },
  'dividend-calculator': {
    how: 'Dividend yield is the annual dividend per share divided by the price per share. The dollar income is the annual dividend times the number of shares. The yield falls when the price rises and the dividend stays the same.',
    example: 'A $2 annual dividend on a $50 share is a 4% yield. Two hundred shares at that dividend pay $400 a year before tax. The page does not assume the dividend is raised.',
    leaves: 'It does not predict whether the dividend continues, and it does not subtract withholding tax. Price change is not part of the yield.'
  },
  'stock-average-calculator': {
    how: 'Average cost is the total amount paid divided by the total shares. Each lot contributes shares times price. A later purchase at a higher price pulls the average up. A later purchase at a lower price pulls it down. The page combines the lots you enter into one average.',
    example: '100 shares at $40 and 100 shares at $60 cost $10,000 together. The average cost is $50 a share. Selling above $50 is a gain on that average. Selling below it is a loss.',
    leaves: 'Commissions are included only if you folded them into the prices you typed. The tax on a sale is the capital-gains page, not this one.'
  },
  'monthly-investment-calculator': {
    how: 'A fixed amount is added every month. The annual rate is divided by 12, and each month the balance grows by that monthly rate. The ending value is the ordinary annuity formula used in the tool: payment times ((1+i)^n − 1) / i, times (1+i), which treats each deposit as earning one month of interest in the month it is made. At a 0% rate the balance equals the contributions.',
    example: '$500 a month for 20 years is $120,000 of contributions before any growth. At a positive rate the ending balance is higher than $120,000 by the growth on each deposit. At a 0% rate the balance equals the contributions.',
    leaves: 'It is not a paycheck deduction, an RRSP, or a TFSA. Taxes on the growth are not withheld. A market loss would require a lower or negative rate that you type yourself.'
  },
  'inflation-calculator': {
    how: 'A future price at a constant inflation rate is today’s amount times (1 + inflation)^years. Going backward, today’s buying power of a future amount divides by that same factor. The inflation rate is the number you enter. It is not a CPI print from Statistics Canada or the US Bureau of Labor Statistics.',
    example: '$100 at 3% inflation for 20 years has the same buying power as $180.61 of future dollars. Prices do not have to follow 3%. The figure only shows the constant rate you typed.',
    leaves: 'It is not a forecast for the United States or Canada. Different items inflate at different rates. The page uses one rate for the whole amount.'
  },
  'real-return-calculator': {
    how: 'The Fisher equation used here is 1 + real = (1 + nominal) / (1 + inflation). Real return is that result minus 1. A rough subtraction of inflation from the nominal rate is close when both rates are small, and it is not the figure this page uses.',
    example: 'A 7% nominal return with 3% inflation is a real return of 3.88%, because 1.07 / 1.03 − 1 = 0.0388. Subtracting 3 from 7 would have said 4%, which is a bit high.',
    leaves: 'Taxes are not removed. The nominal return and the inflation rate are both numbers you enter, not forecasts.'
  },
  'cd-ladder-calculator': {
    how: 'Each rung is a certificate of deposit with the deposit, the annual percentage yield, and the term you enter. Interest on a rung is deposit times yield times years, using the simple growth the form labels. The ladder total is the sum of the rungs. Rolling a matured rung is a new term you choose, not an automatic bank renewal.',
    example: 'Four equal deposits at four different yields produce four different interest amounts. A higher yield on a longer rung does not change the interest on the shorter rungs. The page adds them. It does not quote a live bank rate.',
    leaves: 'This is a US certificate-of-deposit ladder, not a Canadian GIC ladder. Early-withdrawal penalties are not calculated. The yields are the ones you type, not a current offer from a bank.'
  },
  'fire-calculator': {
    how: 'The target portfolio is annual spending divided by the withdrawal rate. At 4%, the target is spending times 25. Each year the current savings grow by the growth rate you enter, and then the annual savings amount is added. The page counts years until the balance reaches the target, and it stops at 60 years.',
    example: 'Spending of $60,000 a year at a 4% withdrawal rate sets a target of $1,500,000. If savings are already at that target, the years to get there are zero. If they are not, the years depend on the starting balance, the yearly contribution, and the growth rate, which defaults to 7% when that field is empty.',
    leaves: 'A 4% withdrawal is a planning target, not a guarantee that the portfolio survives. Social Security, CPP, a pension, and taxes are not subtracted from the spending figure unless you have already done that yourself.'
  },
  '401k-calculator': {
    how: 'The employee deferral is the percent of salary you enter, capped at the 2026 employee limit used in this tool, $24,500. The employer match is the match percent of salary, and it cannot exceed the employee deferral. Each year the balance grows by that combined contribution at the annual rate you enter. Catch-up contributions for older workers are not added on top of the cap.',
    example: 'A $100,000 salary with a 10% deferral is $10,000, which is under the $24,500 cap. A match of 4% of pay is $4,000, and because that is less than the deferral, the full $4,000 is added. The yearly addition is $14,000 before growth. A match percent that would exceed the deferral is cut back to the deferral.',
    leaves: 'This is a United States 401(k). It is not an RRSP, a TFSA, or a Canadian pension adjustment. The $24,500 figure is the employee elective deferral limit used here for 2026, not a personal IRS determination, and it does not include a catch-up amount.'
  },
  'rmd-calculator': {
    how: 'The required distribution is the account balance divided by the IRS Uniform Lifetime factor for the age you enter. This tool uses the published factors for ages 72 through 120. Age 73 uses 26.5. The page does not use the Joint Life table.',
    example: 'A $400,000 balance at age 73, factor 26.5, has a required distribution of $15,094.34. A larger balance at the same age raises the distribution in proportion. The factor gets smaller as age increases, so the same balance requires a larger distribution later.',
    leaves: 'This is the US IRA required minimum distribution. It is not a Canadian RRIF minimum. It does not know your beneficiary’s age, and it does not calculate the income tax on the withdrawal.'
  },
  'social-security-calculator': {
    how: 'You enter the monthly benefit at one claiming age. The page scales that benefit to the other claiming ages using the early and delayed factors in the tool, so you can compare the monthly amounts. It does not contact the Social Security Administration and it does not read a statement.',
    example: 'If the benefit you type at full retirement age is $2,000 a month, claiming earlier shows a smaller monthly amount and claiming later shows a larger one. The comparison is only as good as the benefit you entered.',
    leaves: 'This is United States Social Security. It is not the Canada Pension Plan or Old Age Security. Spousal benefits, the earnings test, and taxation of benefits are not calculated.'
  },
  'hsa-calculator': {
    how: 'The contribution is capped at the 2026 health savings account limit used in this tool: $4,400 for self-only coverage and $8,750 for family coverage. The balance grows at the annual rate you enter. A qualified withdrawal is shown as leaving the balance. The cap is applied before growth.',
    example: 'A family contribution at the $8,750 cap, with no withdrawal, grows only by the rate you type. A contribution typed above the cap is reduced to the cap before the growth is applied. Catch-up contributions at age 55 are not added.',
    leaves: 'This is a United States HSA. It is not a Canadian health spending account or an FHSA. The limits are the figures built into this tool for 2026, not a determination that your plan is HSA-eligible.'
  },
  'paycheck-calculator': {
    how: 'Annual wages are the gross pay per period times the number of periods. Social Security is 6.2% of wages up to the 2026 wage base used here, $184,500. Medicare is 1.45% of all wages. Additional Medicare is 0.9% of wages above $200,000. Those three are calculated. Federal income tax and state or provincial income tax are the percents you type, applied to the period’s gross pay. Net pay is gross minus those amounts. A 401(k) deferral does not reduce these payroll taxes on this page.',
    example: 'Gross pay of $3,500, 26 times a year, is $91,000 a year. That is under the Social Security wage base and under the additional Medicare threshold. FICA on one paycheck is $267.75. At 12.5% federal and 4.5% state, those income-tax amounts are $437.50 and $157.50. Net pay is $2,637.25.',
    leaves: 'The federal and state percents are not tax brackets. A California, Texas, or New York paycheck still needs you to type that state’s rate. Texas has no wage income tax, so the state field would be 0 there. Pre-tax health insurance, local tax, and the federal withholding tables are not applied. This is not Canadian payroll, CPP, or EI.'
  },
  'capital-gains-calculator': {
    how: 'The gain is the sale proceeds minus the purchase cost, and it cannot go below zero on this page. Tax is the gain times the rate you enter. The field starts at 15%. Net profit is the gain minus that tax. The rate is not chosen from US brackets or from Canada’s inclusion rate.',
    example: 'A purchase at $20,000 and a sale at $40,000 is a $20,000 gain. At 15% the tax is $3,000 and the amount left is $17,000. At a 0% rate the tax is zero. Enter Canada’s inclusion math yourself if you want that result. This page will not apply it.',
    leaves: 'It does not apply Canada’s capital-gains inclusion rate. It does not apply US long-term brackets, the net investment income tax, or a wash sale. Losses on this form do not create a negative gain.'
  },
  'quarterly-tax-calculator': {
    how: 'Net profit is revenue minus expenses. Self-employment tax is net profit times 0.9235 times 15.3%. Income tax is the federal percent you enter, applied to profit after half of the self-employment tax is removed. The year is then divided by four to suggest a quarterly amount.',
    example: 'Revenue of $100,000 and expenses of $20,000 leave $80,000 of profit. Self-employment tax is $11,303.64. At a 15% federal rate, income tax is $11,152.23. The four payments are $5,613.97 each.',
    leaves: 'This is a United States self-employment estimate. It is not a CRA instalment. It does not apply the qualified business income deduction, state tax, or the additional Medicare tax beyond the 15.3% self-employment rate used here.'
  },
  'overtime-calculator': {
    how: 'Straight time is the hourly wage times the regular hours. Overtime is the wage times 1.5 times the overtime hours. Double time, where you enter those hours, is the wage times 2. The week’s gross pay adds those pieces. The page does not decide whether the hours legally require overtime.',
    example: 'A $20 wage for 40 regular hours is $800. Ten overtime hours at 1.5 add $300. Gross pay for that week is $1,100 before tax. Tax is the paycheck page, not this one.',
    leaves: 'It does not decide whether US federal overtime, a state daily overtime rule, or a Canadian provincial rule applies to the job. Exemptions for salaried workers are not tested.'
  },
  'bonus-tax-calculator': {
    how: 'US supplemental withholding on this page is 22% of the bonus up to $1,000,000, then 37% of the amount above that. Social Security and Medicare are then calculated with the same employee rates as the paycheck page, including the wage base. A 401(k) percent, if you enter one, reduces the bonus before income withholding on this form and does not reduce those payroll taxes.',
    example: 'A $10,000 bonus under the wage base has $2,200 of supplemental withholding at 22%, plus employee Social Security and Medicare on the full $10,000. The amount deposited is the bonus minus those amounts. A bonus that pushes year-to-date wages over $184,500 stops additional Social Security.',
    leaves: 'This is US supplemental withholding, not the tax you ultimately owe, and not Canadian bonus tax. It is not a flat 22% of tax due on your return. The final tax depends on the rest of the year’s income.'
  },
  'severance-calculator': {
    how: 'The lump sum you enter is treated as supplemental wages. US supplemental withholding and employee FICA are taken off using the same rates as the bonus page. The cash left is divided by the monthly spending you enter to show how many months it covers. Unemployment benefits are not added.',
    example: 'A severance check uses the 22% supplemental rate when the amount is under $1,000,000, then Social Security and Medicare subject to the wage base. If $20,000 remains after those amounts and spending is $4,000 a month, the runway is 5 months from this check alone.',
    leaves: 'State unemployment is not added to the runway. A release agreement, a pension, and continued health insurance are not valued. This is not Canadian termination pay or employment-standards notice.'
  },
  'debt-snowball-calculator': {
    how: 'Two debts share one extra payment. Each debt’s minimum is spread as a flat amount over 36 months plus interest, using the balance and rate you enter. Snowball sends the extra dollar to the smaller balance first. Avalanche sends it to the higher rate first. The page walks both orders month by month and shows the interest difference.',
    example: 'An $8,000 balance at 24.5% and a $2,500 balance at 11.5%, with $300 extra, do not finish on the same month or at the same interest cost. Avalanche puts the extra onto the 24.5% balance first. Snowball puts it onto the $2,500 balance first. The form shows both.',
    leaves: 'A third debt is not included. Minimum payments in real contracts are often a percent of the balance, not a 36-month flat amount. The comparison uses the two balances on the form.'
  },
  'credit-card-payoff-calculator': {
    how: 'Each month the balance grows by the annual percentage rate divided by 12, then the payment is subtracted. The page counts months until the balance is gone and adds the interest along the way. If the payment does not cover that month’s interest, the balance is not paid off.',
    example: 'A $5,000 balance at 20% APR grows by about $83 in the first month before the payment. A $150 payment covers that interest and reduces the balance. A payment below the interest would not. The months to zero depend on the payment you type.',
    leaves: 'Fees, a promotional rate that expires, and a changing minimum payment are not included. The rate stays at the APR you enter for the whole payoff.'
  },
  'auto-loan-calculator': {
    how: 'The monthly payment uses the standard amortizing formula. The amount is the number you enter. The rate is divided by 12. The term is the number of months on the form. Total interest is the payment times the number of months, minus the amount borrowed.',
    example: 'A $30,000 loan at 7% for 60 months has a fixed monthly principal-and-interest payment. Sales tax is not added on top. If the amount you typed already includes tax and fees, those costs are inside the payment. If it does not, they are missing.',
    leaves: 'Tax, title, and dealer fees are not added unless they are already in the amount. A down payment should be subtracted before you type the amount, or entered in the down-payment field when the form has one.'
  },
  'auto-refinance-calculator': {
    how: 'The current payment and the refinanced payment are two amortizing loans: the remaining balance at the old rate and remaining term, and the same balance at the new rate and new term. Monthly savings are the difference. It is not an offer from a lender.',
    example: 'A shorter new term can raise the payment even when the rate falls. A longer new term can lower the payment and raise total interest. The page shows the payment change from the terms you type, not a bank’s approval.',
    leaves: 'A prepayment penalty, a new title fee, and negative equity added to the loan are included only when you put them in the balance or fee field.'
  },
  'car-lease-calculator': {
    how: 'The lease side uses the capitalized cost, residual, money factor or rate, and term on the form. The buy side is an amortizing loan at the loan rate you enter on the same vehicle. The page compares the payments and the cost over the term you set. Taxes and fees count only when a field includes them.',
    example: 'A higher residual lowers the lease payment and leaves you without the car at the end unless you buy it for that residual. The loan payment buys the car and continues until the term ends. The comparison is those two sets of inputs, not a dealer’s worksheet.',
    leaves: 'Disposition fees, excess miles, and wear charges are not estimated. Sales tax is included only in the fields that ask for it.'
  },
  'personal-loan-calculator': {
    how: 'The payment is the standard monthly amortization of the amount, rate, and term you enter. Interest is the payment times the number of months, minus the amount borrowed. An origination fee is part of the cost only when the form asks for it or you have added it to the amount.',
    example: 'Borrowing $10,000 at 12% for 36 months produces a fixed payment that covers interest and principal. The total of the 36 payments is more than $10,000 by the interest. A 0% rate makes the payment the amount divided by the months.',
    leaves: 'A late fee, a variable rate, and credit insurance are not added. The APR a lender advertises may already include a fee that this payment ignores unless you enter it.'
  },
  'student-loan-calculator': {
    how: 'The payment amortizes the balance at the rate and term you enter, compounded monthly. Interest over the term is the sum of the payments minus the starting balance. Extra payments, when the form has that field, shorten the term the same way an extra mortgage payment does.',
    example: 'A $30,000 balance at 6% for 10 years has 120 payments. The payment is higher than $30,000 divided by 120 because of interest. A longer term lowers the payment and raises the interest.',
    leaves: 'This is not a Canada Student Loan or Repayment Assistance Plan calculator. Income-driven payments, subsidies, and forgiveness are not applied. The rate stays fixed at the rate you type.'
  },
  'student-loan-refinance-calculator': {
    how: 'One column is a private refinance payment: the balance amortized at the new rate and term. The other column is the income-driven payment described by the fields on the page. The page places those two payments next to each other. Public Service Loan Forgiveness is a US program. The page does not decide that a borrower qualifies.',
    example: 'A lower refinance rate reduces the payment and removes the forgiveness path, because a private refinance is no longer a federal loan. The income-driven column keeps whatever payment you described. The difference is the comparison. It is not an approval.',
    leaves: 'It does not decide forgiveness, and it is not a Canada Student Loan calculator. Tax on forgiven balances, qualifying payment counts, and income recertification are not calculated.'
  },
  'budget-calculator': {
    how: 'Take-home pay is split 50% to needs, 30% to wants, and 20% to savings. Needs are half of the pay you enter. Wants are 30%. Savings are 20%. The split is a planning guide. The page also shows the amounts you type for actual spending so you can see the gap.',
    example: 'Take-home pay of $5,000 a month assigns $2,500 to needs, $1,500 to wants, and $1,000 to savings. If rent alone is $2,200, most of the needs bucket is already used. The page does not move the rent. It shows the bucket.',
    leaves: 'It is not a budget you must follow. Taxes are already out if the pay you typed is take-home. Gross pay should go through the paycheck page first.'
  },
  'credit-utilization-calculator': {
    how: 'Utilization is the balance divided by the credit limit, in percent. Several cards are added first: total balances divided by total limits. A lower limit or a higher balance raises the percent. The page reports percentage points. It does not estimate a score.',
    example: 'A $2,000 balance on a $10,000 limit is 20% utilization. Adding another card with a $0 balance and a $5,000 limit makes the combined utilization $2,000 / $15,000, or 13.3%. Paying the balance to $0 makes utilization 0% on this form.',
    leaves: 'It does not estimate a FICO or Equifax score. Statement dates, authorized users, and closed cards with a remaining balance are not modeled.'
  },
  'invoice-calculator': {
    how: 'The subtotal is hours times the hourly rate, or the line amounts on the form. Tax is the tax percent you enter times the taxable subtotal. The total due is the subtotal plus that tax. Nothing is filed with a tax agency.',
    example: '40 hours at $100 is a $4,000 subtotal. A 13% tax field adds $520, and the invoice total is $4,520. A 0% tax field leaves the total at $4,000. The percent is whatever you type.',
    leaves: 'It does not file GST, HST, or US sales tax, and it does not know which rate a province or state charges. Retainers, deposits already paid, and late fees count only if you include them in the lines.'
  },
  'roi-calculator': {
    how: 'Return on investment is the gain divided by the amount invested. The gain is the number you enter, or the ending value minus the starting value when those are the fields. The result is a percent. It is not a compound annual rate unless the period is one year and nothing else changed.',
    example: 'A $10,000 investment that produces a $2,000 gain has a 20% return. That 20% does not say how many years it took. For a multi-year rate, use the CAGR page.',
    leaves: 'Fees and taxes are already out of the gain only if you subtracted them before typing it. The page does not project a future return.'
  },
  'break-even-calculator': {
    how: 'Break-even units are fixed costs divided by the margin on each unit. The margin is the price minus the variable cost. Break-even sales dollars are the break-even units times the price. If the margin is zero or negative, there is no break-even, because each sale loses money or makes none.',
    example: 'Fixed costs of $12,000, a $40 price, and a $25 variable cost leave $15 of margin. Break-even is 800 units, or $32,000 of sales. The 801st unit is the first one that contributes only to profit.',
    leaves: 'A changing price, a step-up in rent at some volume, and taxes on profit are not included. The fixed cost is the single number you enter.'
  },
  'profit-margin-calculator': {
    how: 'Margin is (price − cost) / price. Markup is (price − cost) / cost. They are different denominators. A 50% markup on cost is not a 50% margin on price. The page shows both from the cost and price you enter.',
    example: 'A product that costs $60 and sells for $100 has a $40 profit. Margin is 40%. Markup is 66.7%, because $40 / $60 is two-thirds. Pricing from a desired margin uses price = cost / (1 − margin).',
    leaves: 'Overhead, shipping, and advertising are in the cost only if you included them in the cost you typed. Tax on the profit is not removed.'
  },
  'salary-calculator': {
    how: 'Yearly gross pay is the hourly wage times hours per week times weeks per year. Monthly gross is that year divided by 12. Weekly gross is the wage times the weekly hours. The result is before tax.',
    example: '$30 an hour, 40 hours a week, 52 weeks a year, is $62,400 a year, $5,200 a month, and $1,200 a week, all before tax. Unpaid weeks should be removed from the weeks field rather than left at 52.',
    leaves: 'Income tax, FICA, CPP, and benefits are not deducted. Use the paycheck page for a US take-home estimate after you choose the federal and state percents.'
  },
  'crypto-leverage-calculator': {
    how: 'Position size is the margin you post times the leverage. Liquidation is estimated from the entry price and the move that would consume the margin, using the long or short direction selected on the form. A fee, where the form has one, reduces the cushion. It is not an exchange’s liquidation engine.',
    example: '$1,000 of margin at 10x controls a $10,000 position. A move against the position of about 10%, before fees, consumes that margin. The form’s exact liquidation price depends on the direction and the fee you entered.',
    leaves: 'Funding rates, maintenance margin tiers, and an exchange’s insurance fund are not included. The figure is not a quote from an exchange and it is not a recommendation to use leverage.'
  },
  'staking-calculator': {
    how: 'Staking yield is the amount you stake times the annual rate you enter, for the period on the form. A price change you enter is applied as a separate impermanent-loss or value-change case so the token count and the dollar value are not treated as the same thing.',
    example: 'Staking $10,000 at 5% for a year adds $500 if the token price does not change. If the price falls by half, the dollar value of the stake and the reward falls with it. The page shows the rate you typed, not a protocol’s current reward.',
    leaves: 'Lockups, slashing, validator fees, and taxes are not deducted unless a field asks for a fee. The rate is not a live on-chain quote.'
  },
  'solar-calculator': {
    how: 'Yearly savings are the share of the electric bill you say the system covers. Payback years are the system cost, minus the incentive amount you type, divided by that yearly savings. Incentives are only the dollar amount you enter. The page does not decide that a tax credit applies.',
    example: 'A $20,000 system with a $0 incentive and $1,000 a year of bill savings pays back in 20 years. Type a $6,000 incentive and the net cost is $14,000, so the same savings pay back in 14 years. The incentive has to be a number you believe applies.',
    leaves: 'It is not a US federal tax-credit determination, and it does not know a utility’s net-metering rate. Panel degradation, a loan on the system, and rising electric rates are not projected unless you have already folded them into the savings figure.'
  },
  'ev-vs-gas-calculator': {
    how: 'Annual fuel cost for the gas car is miles divided by miles per gallon, times the gas price. Annual energy cost for the EV is miles times the energy use per mile, times the electricity price. The difference is the yearly fuel gap. Insurance, depreciation, and the purchase price are not in that gap.',
    example: '12,000 miles at 30 miles per gallon and $3.50 a gallon costs $1,400 a year in gas. The EV cost depends on the kilowatt-hours per mile and the cents per kilowatt-hour you enter. The page subtracts those two yearly bills.',
    leaves: 'Insurance, maintenance, depreciation, and a home charger are not included. A public fast-charge price is used only if you type that price into the electricity field.'
  },
  'ecommerce-margin-calculator': {
    how: 'The margin starts at the sale price minus the product cost. Advertising and the platform percent you enter are then subtracted. What remains is the contribution on that order. Divide by the sale price for the margin percent.',
    example: 'A $40 sale with a $15 product cost, $8 of advertising, and a 15% platform fee of $6 leaves $11. The margin on the sale price is 27.5%. Raise the advertising and the $11 falls by the same amount.',
    leaves: 'Returns, payment-processing fees, and shipping are included only when you put them in the cost or advertising fields. It is not a forecast of how many orders will sell.'
  },
  'us-canada-banks': {
    how: 'The directory is a list of US and Canadian institutions kept in this project as an editorial snapshot. Each entry shows the yield and account notes stored with that institution. Choosing a bank opens the description. It does not submit an application and it does not fetch a rate from the bank.',
    example: 'A listed savings yield is the figure stored for that institution at the time the snapshot was written. Two banks can show different yields because the snapshot recorded different figures. Neither figure is a promise that the account still pays that yield today.',
    leaves: 'Yields are not live quotes. The page does not open accounts, and it does not know a branch’s current promotion. Insurance coverage, foreign-exchange spreads, and monthly fees should be read on the institution’s own site.'
  }
};
