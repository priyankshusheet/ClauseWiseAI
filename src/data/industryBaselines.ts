// Industry standard baseline templates for document comparison
export interface IndustryBaseline {
  id: string;
  name: string;
  category: string;
  description: string;
  riskScore: number;
  riskLevel: string;
  extractedText: string;
  clauses: {
    text: string;
    category: string;
    riskLevel: string;
    explanation: string;
  }[];
}

export const industryBaselines: IndustryBaseline[] = [
  {
    id: 'fair-insurance',
    name: 'Fair Insurance Policy (Standard)',
    category: 'Insurance Policy',
    description: 'A consumer-friendly insurance policy based on regulatory best practices. Includes standard cooling-off period, transparent exclusions, and fair claim settlement.',
    riskScore: 25,
    riskLevel: 'low',
    extractedText: `STANDARD FAIR INSURANCE POLICY

1. COOLING-OFF PERIOD: The policyholder has a 15-day free-look period from the date of receipt of the policy document to review the terms. If not satisfied, the policyholder may return the policy for a full refund of premium paid, minus proportionate risk premium for the period of cover.

2. PREMIUM PAYMENT: Premiums are fixed for the policy term and clearly stated in the schedule. No hidden charges or automatic escalation clauses apply. Grace period of 30 days for premium payment.

3. CLAIM SETTLEMENT: Claims shall be settled within 30 days of submission of all required documents. The insurer shall not reject claims on technical grounds if the policyholder has acted in good faith.

4. EXCLUSIONS: All exclusions are clearly listed in Section 4 of this document. Pre-existing conditions are covered after a 2-year waiting period as per regulatory guidelines. No blanket exclusions.

5. RENEWAL: Policy renewal is guaranteed regardless of claims history. Premium increases, if any, shall not exceed 10% and must be communicated 60 days before renewal.

6. DISPUTE RESOLUTION: Disputes shall be resolved through the Insurance Ombudsman before any legal proceedings. The policyholder retains the right to approach the consumer forum.

7. CANCELLATION: Either party may cancel with 30 days written notice. Pro-rata refund of unused premium to the policyholder upon cancellation.

8. DATA PRIVACY: Personal data collected shall only be used for policy administration and claims processing. No sharing with third parties without explicit consent.`,
    clauses: [
      { text: '15-day free-look period with full refund option', category: 'Consumer Protection', riskLevel: 'low', explanation: 'Standard consumer protection allowing policy review and return.' },
      { text: 'Premiums fixed for policy term, no hidden charges', category: 'Pricing', riskLevel: 'low', explanation: 'Transparent pricing with no surprise fee escalation.' },
      { text: 'Claims settled within 30 days, good faith protection', category: 'Claims', riskLevel: 'low', explanation: 'Fair claim settlement timeline with good faith provisions.' },
      { text: 'Pre-existing conditions covered after 2-year wait', category: 'Coverage', riskLevel: 'low', explanation: 'Follows regulatory standard for pre-existing condition coverage.' },
      { text: 'Guaranteed renewal regardless of claims history', category: 'Renewal', riskLevel: 'low', explanation: 'Prevents unfair non-renewal after claims.' },
      { text: 'Premium increase capped at 10% with 60-day notice', category: 'Pricing', riskLevel: 'low', explanation: 'Protects against excessive premium hikes.' },
    ],
  },
  {
    id: 'fair-loan',
    name: 'Fair Loan Agreement (Standard)',
    category: 'Loan Agreement',
    description: 'A balanced loan agreement following RBI/regulatory guidelines with transparent fees, fair prepayment terms, and borrower protections.',
    riskScore: 20,
    riskLevel: 'low',
    extractedText: `STANDARD FAIR LOAN AGREEMENT

1. INTEREST RATE: The applicable interest rate is [X]% per annum, calculated on reducing balance method. Rate changes, if any, are linked to the RBI repo rate and will be communicated 30 days in advance.

2. PROCESSING FEE: A one-time processing fee of up to 1% of the loan amount. No additional hidden charges. All fees and charges are listed in the fee schedule annexed.

3. PREPAYMENT: Borrower may prepay the loan partially or fully at any time. No prepayment penalty for floating rate loans. For fixed rate loans, prepayment charge shall not exceed 2% of the outstanding principal.

4. DEFAULT & LATE PAYMENT: Grace period of 15 days for EMI payment. Late payment charges shall not exceed 2% per month on the overdue amount. No compounding of penal interest. The lender shall provide written notice before classifying the account as NPA.

5. FORECLOSURE: The lender shall not foreclose without providing 60 days written notice and opportunity to cure the default. The borrower has the right to reinstate the loan by clearing all dues.

6. SECURITY: Collateral valuation shall be conducted by an independent valuer. Release of security within 30 days of full repayment.

7. GRIEVANCE REDRESSAL: Complaints shall be acknowledged within 3 working days and resolved within 30 days. Escalation to Banking Ombudsman available.

8. LOAN TRANSFER: Borrower has the right to transfer the loan to another lender without penalty. The existing lender shall provide NOC within 21 days.`,
    clauses: [
      { text: 'Interest calculated on reducing balance, rate changes with 30-day notice', category: 'Interest Rate', riskLevel: 'low', explanation: 'Transparent interest calculation method with advance notification.' },
      { text: 'Processing fee capped at 1%, all fees disclosed upfront', category: 'Fees', riskLevel: 'low', explanation: 'No hidden charges, fee transparency.' },
      { text: 'No prepayment penalty on floating rate loans', category: 'Prepayment', riskLevel: 'low', explanation: 'Consumer-friendly prepayment terms following RBI guidelines.' },
      { text: '15-day grace period, penal interest not compounded', category: 'Default', riskLevel: 'low', explanation: 'Fair treatment of delayed payments.' },
      { text: '60-day notice before foreclosure with right to cure', category: 'Foreclosure', riskLevel: 'low', explanation: 'Adequate protection against sudden foreclosure.' },
      { text: 'Right to transfer loan to another lender', category: 'Portability', riskLevel: 'low', explanation: 'Ensures loan portability and competition.' },
    ],
  },
  {
    id: 'fair-credit-card',
    name: 'Fair Credit Card Agreement (Standard)',
    category: 'Credit Card Agreement',
    description: 'A consumer-friendly credit card agreement with transparent fees, reasonable interest rates, and clear dispute resolution.',
    riskScore: 22,
    riskLevel: 'low',
    extractedText: `STANDARD FAIR CREDIT CARD AGREEMENT

1. ANNUAL FEE: Annual fee of [X] is clearly stated. Fee waiver conditions, if any, are specified upfront. No surprise charges.

2. INTEREST RATE: Interest rate of [X]% per month on outstanding balance. Interest-free period of 50 days on purchases if full payment is made by due date. No interest charged on new purchases if previous balance is paid in full.

3. MINIMUM PAYMENT: Minimum payment is 5% of outstanding balance or [minimum amount], whichever is higher. Clear disclosure of how long repayment takes at minimum payments.

4. LATE PAYMENT: Late payment fee capped at [X]. Grace period of 3 days beyond due date. No impact on credit score for payments within grace period.

5. REWARD POINTS: Reward points earned on eligible transactions. Points valid for 3 years. Redemption process clearly explained. No unilateral devaluation of points without 90-day notice.

6. FRAUD PROTECTION: Zero liability for unauthorized transactions reported within 7 days. Card can be blocked instantly via app/phone. Real-time transaction alerts.

7. CANCELLATION: Card can be cancelled anytime. Outstanding balance to be settled. No cancellation charges. Reward points can be redeemed within 30 days of cancellation.

8. CREDIT LIMIT: Credit limit changes communicated in advance. No automatic limit increases without cardholder consent.`,
    clauses: [
      { text: 'Annual fee clearly stated with waiver conditions', category: 'Fees', riskLevel: 'low', explanation: 'Full fee transparency from the start.' },
      { text: '50-day interest-free period on purchases', category: 'Interest', riskLevel: 'low', explanation: 'Standard interest-free period for responsible users.' },
      { text: 'Zero liability for unauthorized transactions within 7 days', category: 'Security', riskLevel: 'low', explanation: 'Strong fraud protection for cardholders.' },
      { text: 'Reward points valid 3 years, 90-day notice before changes', category: 'Rewards', riskLevel: 'low', explanation: 'Fair reward program with protection against sudden devaluation.' },
      { text: 'No automatic credit limit increases without consent', category: 'Credit Limit', riskLevel: 'low', explanation: 'Prevents unwanted credit exposure.' },
    ],
  },
  {
    id: 'fair-rental',
    name: 'Fair Rental Agreement (Standard)',
    category: 'Rental Agreement',
    description: 'A balanced rental agreement protecting both landlord and tenant interests with clear terms.',
    riskScore: 18,
    riskLevel: 'low',
    extractedText: `STANDARD FAIR RENTAL AGREEMENT

1. RENT: Monthly rent of [X] payable by the 5th of each month. Rent increase capped at 5% per year with 60-day advance notice.

2. SECURITY DEPOSIT: Security deposit of maximum 2 months rent. Refundable within 30 days of lease termination after deducting documented damages. Itemized deduction list to be provided.

3. MAINTENANCE: Landlord responsible for structural repairs and major maintenance. Tenant responsible for routine upkeep. Emergency repairs responded to within 24 hours.

4. TERMINATION: Either party may terminate with 60 days written notice. Early termination by tenant requires 2 months rent as exit fee. Landlord cannot evict without cause during lease term.

5. PRIVACY: Landlord must provide 24-hour notice before entering the premises except in emergencies. Maximum 2 inspections per quarter.

6. UTILITIES: Tenant pays for electricity, water, and internet. Common area maintenance charges shared among all tenants as per actual costs.

7. SUBLETTING: Subletting permitted with written landlord consent, not to be unreasonably withheld.

8. DISPUTE RESOLUTION: Disputes to be resolved through mediation before legal action. Jurisdiction as per local rent control act.`,
    clauses: [
      { text: 'Rent increase capped at 5% per year with 60-day notice', category: 'Pricing', riskLevel: 'low', explanation: 'Prevents excessive rent hikes.' },
      { text: 'Security deposit refund within 30 days with itemized deductions', category: 'Deposit', riskLevel: 'low', explanation: 'Transparent deposit handling.' },
      { text: '24-hour notice before landlord entry', category: 'Privacy', riskLevel: 'low', explanation: 'Tenant privacy protection.' },
      { text: 'Landlord cannot evict without cause during lease term', category: 'Tenure Security', riskLevel: 'low', explanation: 'Protection against arbitrary eviction.' },
    ],
  },
];
