import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const API_KEY = Deno.env.get('XAI_API_KEY');
const API_ENDPOINT = 'https://api.x.ai/v1/chat/completions';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

// Expanded database of representative products and T&C examples
const financialKnowledge = {
  // --- CREDIT CARDS ---
  creditCards: {
    // Entry-Level
    "sbi simplysave": {
      company: "SBI Card",
      type: "Entry-Level",
      fees: { annual: 499, foreign: 3.5 },
      rewards: "1 reward point on every ₹150 spent",
      features: [
        "Fuel surcharge waiver",
        "Flexipay EMI",
        "Worldwide acceptance"
      ],
      terms: [
        "Annual fee reversal on spending ₹1L in a year",
        "Add-on cards available",
        "Late fee as per statement"
      ],
      exclusions: [
        "No rewards on fuel, wallet, or EMI transactions"
      ]
    },
    "icici platinum chip": {
      company: "ICICI Bank",
      type: "Entry-Level",
      fees: { annual: 199, foreign: 3.5 },
      rewards: "2 PAYBACK points per ₹100 retail spends",
      features: [
        "Chip & PIN protection",
        "Dining discounts"
      ],
      terms: [
        "No annual fee on select accounts",
        "2.5% fuel surcharge waiver"
      ],
      exclusions: [
        "No free airport lounge",
        "No cashback on EMI"
      ]
    },
    "axis my zone": {
      company: "Axis Bank",
      type: "Entry-Level",
      fees: { annual: 500, foreign: 3.5 },
      rewards: "4 EDGE points per ₹200",
      features: [
        "BOGO on movie tickets",
        "Swiggy & Paytm Movie cashback"
      ],
      terms: [
        "Annual fee waiver at ₹30,000 spend"
      ],
      exclusions: [
        "Minimum purchase for cashback"
      ]
    },
    // Rewards
    "hdfc millennia": {
      company: "HDFC Bank",
      type: "Rewards",
      fees: { annual: 1000, foreign: 3.5 },
      rewards: "5% cashback on Amazon/Flipkart, 1% on offline",
      features: [
        "Airport lounge access",
        "Fuel surcharge waiver"
      ],
      terms: [
        "₹1,00,000 spend for fee waiver",
        "Max cashback ₹1,000/month"
      ]
    },
    "amazon pay icici": {
      company: "ICICI Bank",
      type: "Rewards/Co-branded",
      fees: { annual: 0, foreign: 3.5 },
      rewards: "5% (Prime), 3% (non-Prime) on Amazon, 1% elsewhere",
      features: [
        "No joining/annual fee",
        "Direct Amazon Pay cashback"
      ],
      terms: [
        "Primary use on Amazon for maximum benefit"
      ]
    },
    "axis ace": {
      company: "Axis Bank",
      type: "Rewards/Cashback",
      fees: { annual: 499, foreign: 3.5 },
      rewards: "5% cashback on Google Pay utility, 2% elsewhere",
      features: [
        "Lounge access 4/yr",
        "Unlimited cashback"
      ],
      terms: [
        "Joining bonus ₹500",
        "Fee reversal on ₹2L spend"
      ]
    },
    // Travel
    "hdfc regalia": {
      company: "HDFC Bank",
      type: "Travel/Premium",
      fees: { annual: 2500, foreign: 2.5 },
      rewards: "4 points per ₹150 spent",
      features: [
        "Lounge access (air/rail)",
        "Insurance: air accident, lost card"
      ],
      terms: [
        "Waiver on spending ₹3L/yr",
        "2% forex markup"
      ]
    },
    "axis atlas": {
      company: "Axis Bank",
      type: "Travel",
      fees: { annual: 5000, foreign: 2.0 },
      rewards: "5 edge miles for ₹100 spent",
      features: [
        "Global lounge access",
        "Dedicated concierge"
      ],
      terms: [
        "High annual fee, multipliers on travel expenses"
      ]
    },
    "sbi elite": {
      company: "SBI Card",
      type: "Travel/Premium",
      fees: { annual: 4999, foreign: 1.99 },
      rewards: "Rewards on travel & movies",
      features: [
        "Complimentary hotel memberships",
        "Lounge visits: domestic/international"
      ],
      terms: [
        "Fee reversal at ₹10L spend"
      ]
    },
    "club vistara sbi": {
      company: "SBI Card",
      type: "Travel/Co-branded",
      fees: { annual: 1499, foreign: 3.5 },
      rewards: "Vistara points for airline spends",
      features: [
        "Lounge visits",
        "Air accident insurance"
      ]
    },
    // Fuel
    "indianoil axis bank": {
      company: "Axis Bank",
      type: "Fuel",
      fees: { annual: 500, foreign: 3.5 },
      rewards: "4% value back on IOCL fuel bills",
      terms: [
        "Annual fee waiver: ₹50,000 spend"
      ]
    },
    "bpcl sbi card": {
      company: "SBI Card",
      type: "Fuel",
      fees: { annual: 499, foreign: 3.5 },
      rewards: "13X points on BPCL fuel, 3.25% value back",
      features: [
        "1% fuel surcharge waiver"
      ]
    },
    // Cashback
    "axis flipkart": {
      company: "Axis Bank",
      type: "Cashback",
      fees: { annual: 500, foreign: 3.5 },
      rewards: "5% cashback at Flipkart, 4% at partners, 1.5% elsewhere",
      features: [
        "Four airport lounge visits",
        "Dining offers"
      ]
    },
    "hdfc moneyback plus": {
      company: "HDFC Bank",
      type: "Cashback",
      fees: { annual: 500, foreign: 3.5 },
      rewards: "Cashpoints for retail spends",
      terms: [
        "Joining fee waived at ₹50,000 spend"
      ]
    },
    "hsbc cashback": {
      company: "HSBC Bank",
      type: "Cashback",
      fees: { annual: 999, foreign: 3.5 },
      rewards: "1.5% cashback on all spends",
      features: [
        "Amazon, Flipkart, Swiggy offer"
      ]
    },
    // Premium
    "hdfc infinia": {
      company: "HDFC Bank",
      type: "Premium",
      fees: { annual: 12500, foreign: 2.0 },
      rewards: "5 reward points per ₹150",
      features: [
        "Unlimited lounge access"
      ],
      terms: [
        "Invitation only"
      ]
    },
    "axis magnus": {
      company: "Axis Bank",
      type: "Premium",
      fees: { annual: 12000, foreign: 2.0 },
      rewards: "12 Edge reward points per ₹200",
      features: [
        "Unlimited global lounge (Priority Pass)",
        "Dining/concierge"
      ]
    },
    "sbi aurum": {
      company: "SBI Card",
      type: "Premium",
      fees: { annual: 9999, foreign: 1.99 },
      rewards: "5X rewards on all spends",
      features: [
        "Taj Epicure membership",
        "Personal relationship manager"
      ]
    },
    "icici emeralde": {
      company: "ICICI Bank",
      type: "Premium",
      fees: { annual: 12000, foreign: 2.5 },
      rewards: "Reward points per spend slab",
      features: [
        "Airport lounge (domestic/international)",
        "Spa access"
      ]
    },
    // Co-branded
    "flipkart axis": {
      company: "Axis Bank",
      type: "Co-branded",
      fees: { annual: 500, foreign: 3.5 },
      rewards: "5% on Flipkart, 1.5% elsewhere",
      terms: [
        "Annual fee waived at ₹2L spend"
      ]
    },
    "irctc sbi": {
      company: "SBI Card",
      type: "Co-branded",
      fees: { annual: 500, foreign: 3.5 },
      rewards: "1.8% value back on train bookings",
      features: [
        "Fuel surcharge waiver",
        "Exclusive rail surcharges"
      ]
    },
    "swiggy hdfc": {
      company: "HDFC Bank",
      type: "Co-branded",
      fees: { annual: 500, foreign: 3.5 },
      rewards: "10% cashback at Swiggy",
      features: [
        "Dining offers",
        "Discounts on partner platforms"
      ]
    }
    // ... add more as needed
  },

  // --- MUTUAL FUNDS ---
  mutualFunds: {
    // Large Cap
    "nippon india large cap": {
      company: "Nippon MF",
      type: "Large Cap",
      expenseRatio: "1.25%",
      exitLoad: "1% if < 1 year",
      minInvestment: 100,
      features: [
        "Invests in large blue chip stocks"
      ],
      terms: [
        "SIP allowed; no entry load"
      ]
    },
    "axis bluechip": {
      company: "Axis MF",
      type: "Large Cap",
      expenseRatio: "1.60%",
      exitLoad: "1% < 1 year",
      minInvestment: 500,
      features: [
        "Top 100 Indian listed companies",
        "Long-term wealth creation"
      ]
    },
    "icici prudential bluechip": {
      company: "ICICI MF",
      type: "Large Cap",
      expenseRatio: "1.20%",
      exitLoad: "1%",
      minInvestment: 100,
      features: [
        "Invests in high market cap companies"
      ]
    },
    // Mid Cap
    "motilal oswal midcap": {
      company: "Motilal Oswal MF",
      type: "Mid Cap",
      expenseRatio: "1.51%",
      exitLoad: "1%",
      minInvestment: 500,
      features: [
        "Focus on mid cap growth"
      ]
    },
    "kotak emerging equity": {
      company: "Kotak MF",
      type: "Mid Cap",
      expenseRatio: "1.24%",
      exitLoad: "1%",
      minInvestment: 500,
      features: [
        "Diversification in mid cap stocks"
      ]
    },
    // Small Cap
    "sbi small cap": {
      company: "SBI MF",
      type: "Small Cap",
      expenseRatio: "1.27%",
      exitLoad: "1% <1yr",
      minInvestment: 500,
      features: [
        "Long term small cap pick"
      ]
    },
    "nippon india small cap": {
      company: "Nippon MF",
      type: "Small Cap",
      expenseRatio: "1.34%",
      exitLoad: "1%",
      minInvestment: 100,
      features: [
        "Best performer 5 year CAGR"
      ]
    },
    "quant small cap": {
      company: "Quant MF",
      type: "Small Cap",
      expenseRatio: "0.64%",
      exitLoad: "1%",
      minInvestment: 500,
      features: [
        "Active management"
      ]
    },
    // Flexi Cap
    "parag parikh flexi cap": {
      company: "PPFAS",
      type: "Flexi Cap",
      expenseRatio: "0.79%",
      exitLoad: "2% <1yr",
      minInvestment: 1000,
      features: [
        "International equity exposure"
      ]
    },
    "hdfc flexi cap": {
      company: "HDFC MF",
      type: "Flexi Cap",
      expenseRatio: "1.11%",
      exitLoad: "1%",
      minInvestment: 100,
      features: [
        "Market cap agnostic"
      ]
    },
    // ELSS (Tax Saving)
    "axis long term equity": {
      company: "Axis MF",
      type: "ELSS",
      expenseRatio: "1.68%",
      lockin: "3 yrs",
      minInvestment: 500,
      features: [
        "Tax benefit under sec 80C"
      ]
    },
    "quant elss": {
      company: "Quant MF",
      type: "ELSS",
      expenseRatio: "0.7%",
      lockin: "3 yrs",
      minInvestment: 500,
      features: [
        "Aggressive growth, tax benefit"
      ]
    },
    "mirae asset tax saver": {
      company: "Mirae Asset MF",
      type: "ELSS",
      expenseRatio: "0.91%",
      lockin: "3 yrs",
      minInvestment: 500,
      features: [
        "Balanced portfolio"
      ]
    },
    // Index Funds
    "hdfc nifty 50 index": {
      company: "HDFC MF",
      type: "Index",
      expenseRatio: "0.20%",
      exitLoad: "NIL",
      features: [
        "Tracks Nifty 50 performance"
      ]
    },
    "uti nifty next 50": {
      company: "UTI MF",
      type: "Index",
      expenseRatio: "0.29%",
      exitLoad: "0.25% <7d",
      features: [
        "Tracks Nifty Next 50"
      ]
    },
    "icici nifty 500": {
      company: "ICICI MF",
      type: "Index",
      expenseRatio: "0.27%",
      exitLoad: "0.25% <1m",
      features: [
        "Well-diversified"
      ]
    },
    // Debt
    "sbi magnum short term": {
      company: "SBI MF",
      type: "Debt",
      expenseRatio: "0.69%",
      exitLoad: "NIL",
      features: [
        "Short duration bonds"
      ]
    },
    "hdfc corporate bond": {
      company: "HDFC MF",
      type: "Debt",
      expenseRatio: "0.56%",
      exitLoad: "NIL",
      features: [
        "Corporate bonds investments"
      ]
    },
    // Hybrid
    "icici balanced advantage": {
      company: "ICICI MF",
      type: "Hybrid",
      expenseRatio: "1.06%",
      exitLoad: "1% <12m",
      features: [
        "Dynamic asset allocation"
      ]
    },
    "sbi equity hybrid": {
      company: "SBI MF",
      type: "Hybrid",
      expenseRatio: "0.96%",
      exitLoad: "1% <1yr",
      features: [
        "Equity + debt"
      ]
    }
    // ... add more top funds as needed
  },

  // --- HEALTH INSURANCE ---
  healthInsurance: {
    // Star Health
    "star family health optima": {
      company: "Star Health",
      type: "Family Floater",
      sumInsured: [300000, 500000, 1000000],
      premium: "₹6,500 - ₹14,000/year (family)",
      keyFeatures: [
        "Auto restoration of sum insured",
        "Pre & post hospitalization covered",
        "Road ambulance cover"
      ],
      terms: [
        "Waiting period: 30 days (illness), 2-4 years (PED)",
        "5 year renewability"
      ],
      exclusions: [
        "War, cosmetic treatments",
        "Donor expenses not covered"
      ]
    },
    "star comprehensive health": {
      company: "Star Health",
      type: "Individual/Family",
      sumInsured: [500000, 1000000, 2500000],
      premium: "₹7,000 - ₹22,000/year",
      keyFeatures: [
        "Maternity benefit",
        "No capping on room rent"
      ],
      terms: [
        "PED waiting: 3 years",
        "Day care covered"
      ]
    },
    // HDFC ERGO
    "optima restore": {
      company: "HDFC ERGO",
      type: "Family Floater",
      sumInsured: [300000, 500000, 1000000],
      premium: "₹7,500 - ₹18,000/year",
      keyFeatures: [
        "Restore benefit",
        "Critical illness cover"
      ],
      terms: [
        "24m waiting for pre-existing diseases"
      ]
    },
    "health suraksha": {
      company: "HDFC ERGO",
      type: "Individual",
      sumInsured: [200000, 500000, 1000000],
      premium: "₹6,000 - ₹15,000/year",
      keyFeatures: [
        "No room rent capping",
        "AYUSH cover"
      ]
    },
    // Niva Bupa
    "reassure 2.0": {
      company: "Niva Bupa",
      type: "Family Floater",
      sumInsured: [500000, 1000000, 2500000],
      premium: "₹7,500 - ₹17,000/year",
      keyFeatures: [
        "Reinstatement benefit",
        "No sub limits"
      ]
    },
    "health companion": {
      company: "Niva Bupa",
      type: "Individual/Family",
      sumInsured: [500000, 1000000],
      premium: "₹6,500 - ₹12,000/year",
      keyFeatures: [
        "Day care covered",
        "No room capping"
      ]
    },
    // Care Health
    "care advantage": {
      company: "Care Health",
      type: "Individual/Family",
      sumInsured: [300000, 1000000],
      premium: "₹7,000 - ₹15,000/year",
      keyFeatures: [
        "Cashless at 20K+ hospitals"
      ]
    },
    "care supreme": {
      company: "Care Health",
      type: "Individual/Family",
      sumInsured: [500000, 2000000],
      premium: "₹9,000 - ₹30,000/year",
      keyFeatures: [
        "500+ day care procedures",
        "Health checkup included"
      ]
    },
    // Tata AIG
    "medicare": {
      company: "Tata AIG",
      type: "Individual/Family",
      sumInsured: [200000, 1000000],
      premium: "₹6,000+",
      keyFeatures: [
        "Cover for alternative medicine",
        "Health check-up benefit"
      ]
    },
    "medicare premier": {
      company: "Tata AIG",
      type: "Premium",
      sumInsured: [500000, 3000000],
      premium: "₹10,000+",
      keyFeatures: [
        "Maternity cover",
        "No sub-limits"
      ]
    },
    // Aditya Birla
    "activ health platinum": {
      company: "Aditya Birla Health",
      type: "Premium",
      sumInsured: [500000, 2000000, 5000000],
      premium: "₹12,000+",
      keyFeatures: [
        "Healthy returns bonus",
        "Chronic management program"
      ]
    },
    // ICICI Lombard
    "complete health insurance": {
      company: "ICICI Lombard",
      type: "Family/Individual",
      sumInsured: [200000, 500000, 1000000],
      premium: "₹7,000+",
      keyFeatures: [
        "Sum insured recharge",
        "Wellness program"
      ]
    }
    // ... add more as needed
  },

  // --- LIFE INSURANCE ---
  lifeInsurance: {
    // Term Insurance
    "hdfc click2protect life": {
      company: "HDFC Life",
      type: "Term",
      sumAssured: "₹50L - ₹5Cr",
      premium: "Low",
      keyFeatures: [
        "Lump Sum or monthly pay"
      ],
      terms: [
        "Death due to any cause except suicide 1st year"
      ]
    },
    "max life smart secure": {
      company: "Max Life",
      type: "Term",
      sumAssured: "₹50L+",
      premium: "Affordable",
      keyFeatures: [
        "Accident benefit rider"
      ]
    },
    "icici iprotect smart": {
      company: "ICICI Prudential",
      type: "Term",
      sumAssured: "₹50L - ₹10Cr",
      premium: "Affordable",
      keyFeatures: [
        "Inbuilt terminal illness benefit"
      ]
    },
    // Whole Life
    "lic jeevan umang": {
      company: "LIC",
      type: "Whole Life",
      sumAssured: "₹2L+",
      premium: "Varies",
      keyFeatures: [
        "Lifelong cover with bonuses"
      ]
    },
    "tata aia whole life": {
      company: "Tata AIA",
      type: "Whole Life",
      sumAssured: "₹5L+",
      keyFeatures: [
        "Guaranteed payments till age 100"
      ]
    },
    // Endowment
    "lic jeevan labh": {
      company: "LIC",
      type: "Endowment",
      sumAssured: "₹2L+",
      keyFeatures: [
        "Guaranteed bonuses"
      ]
    },
    "hdfc sanchay plus": {
      company: "HDFC Life",
      type: "Endowment",
      sumAssured: "Flexible",
      keyFeatures: [
        "Guaranteed income on maturity"
      ]
    },
    // Money Back
    "lic new money back": {
      company: "LIC",
      type: "Money Back",
      sumAssured: "₹1L+",
      keyFeatures: [
        "Regular payouts"
      ]
    },
    "sbi life smart money back": {
      company: "SBI Life",
      type: "Money Back",
      sumAssured: "₹1L+",
      keyFeatures: [
        "Guaranteed money back at intervals"
      ]
    },
    // ULIPs (refer to ULIPs section for more)
    "hdfc click2wealth": {
      company: "HDFC Life",
      type: "ULIP",
      sumAssured: "Varies",
      keyFeatures: [
        "Low charges, flexible premium"
      ]
    },
    "icici pru signature": {
      company: "ICICI Prudential",
      type: "ULIP",
      sumAssured: "Varies",
      keyFeatures: [
        "Loyalty additions, high allocation"
      ]
    }
    // ... add more as needed
  },

  // --- LOANS ---
  loans: {
    // Home Loans
    "hdfc home loan": {
      company: "HDFC Ltd",
      type: "Home Loan",
      minAmount: 500000,
      maxAmount: 100000000,
      tenure: "1–30 years",
      interestRate: "8.5% - 9.5%",
      processingFee: "Up to 0.5%",
      terms: [
        "Floating/fixed options",
        "No prepayment penalty (individuals)"
      ]
    },
    "sbi home loan": {
      company: "SBI",
      type: "Home Loan",
      minAmount: 500000,
      maxAmount: 100000000,
      tenure: "1–30 years",
      interestRate: "8.5%",
      processingFee: "0.4% (Max ₹10K)",
      terms: [
        "Zero prepayment for floating loans"
      ]
    },
    "lic housing loan": {
      company: "LIC Housing",
      type: "Home Loan",
      terms: [
        "Low processing fee",
        "Flexible tenure"
      ]
    },
    "axis home loan": {
      company: "Axis Bank",
      type: "Home Loan",
      terms: [
        "Attractive floating rate"
      ]
    },
    // Personal Loans
    "hdfc personal loan": {
      company: "HDFC Bank",
      type: "Personal Loan",
      minAmount: 50000,
      maxAmount: 4000000,
      tenure: "12–60 months",
      interestRate: "10.5% - 21%",
      processingFee: "2.5%",
      terms: [
        "No part prepayment first 12 months",
        "Foreclosure charges: 4%"
      ]
    },
    "icici personal loan": {
      company: "ICICI Bank",
      type: "Personal Loan",
      terms: [
        "Quick disbursal",
        "Flexible tenure",
        "Processing fees extra"
      ]
    },
    "tata capital personal loan": {
      company: "Tata Capital",
      type: "Personal Loan",
      terms: [
        "Loan up to ₹25L",
        "Minimal documentation"
      ]
    },
    "bajaj finserv personal loan": {
      company: "Bajaj Finserv",
      type: "Personal Loan",
      terms: [
        "Loan up to ₹25L",
        "Fast approval"
      ]
    },
    // Education Loans
    "sbi global ed-vantage": {
      company: "SBI",
      type: "Education Loan",
      tenure: "Up to 15 yrs",
      interestRate: "8.5–10.5%",
      terms: [
        "For study abroad",
        "Tax benefits on interest"
      ]
    },
    "icici education loan": {
      company: "ICICI Bank",
      type: "Education Loan",
      terms: [
        "No collateral for small amounts"
      ]
    },
    "avanse education loan": {
      company: "Avanse",
      type: "Education Loan",
      terms: [
        "Quick digital process"
      ]
    },
    // Car Loans
    "hdfc car loan": {
      company: "HDFC Bank",
      type: "Car Loan",
      terms: [
        "100% on-road funding"
      ]
    },
    "sbi car loan": {
      company: "SBI",
      type: "Car Loan",
      terms: [
        "7–5 years tenure",
        "Affordable EMIs"
      ]
    },
    "axis auto loan": {
      company: "Axis Bank",
      type: "Car Loan",
      terms: [
        "Easy application"
      ]
    },
    // Gold Loans
    "muthoot gold loan": {
      company: "Muthoot Finance",
      type: "Gold Loan",
      terms: [
        "Up to 75% LTV",
        "Quick disbursal"
      ]
    },
    "manappuram gold loan": {
      company: "Manappuram",
      type: "Gold Loan",
      terms: [
        "Minimal paperwork"
      ]
    },
    "hdfc gold loan": {
      company: "HDFC Bank",
      type: "Gold Loan",
      terms: [
        "Attractive interest"
      ]
    },
    // Business Loans
    "lendingkart business loan": {
      company: "Lendingkart",
      type: "Business Loan",
      terms: [
        "Fast online approval"
      ]
    },
    "bajaj finserv business loan": {
      company: "Bajaj Finserv",
      type: "Business Loan",
      terms: [
        "Collateral free",
        "Flexible tenure"
      ]
    },
    "sbi business loan": {
      company: "SBI",
      type: "Business Loan",
      terms: [
        "Easy eligibility",
        "Minimal documentation"
      ]
    }
    // ... add more as needed
  },

  // --- ULIPs ---
  ulips: {
    "hdfc click 2 wealth": {
      company: "HDFC Life",
      lockin: 5,
      minPremium: 24000,
      fundChoices: ["Equity", "Debt", "Balanced"],
      charges: [
        "Premium allocation: 2%",
        "Policy admin: Rs. 60/month (first 5 yrs)"
      ],
      features: [
        "Loyalty additions after year 6",
        "Partial withdrawal allowed"
      ],
      terms: [
        "Returns market-linked",
        "Mortality & admin charges applicable"
      ]
    },
    "hdfc pro growth plus": {
      company: "HDFC Life",
      lockin: 5,
      fundChoices: ["Equity", "Balanced"],
      terms: [
        "Tax-free maturity benefit"
      ]
    },
    "icici prudential lifetime classic": {
      company: "ICICI Prudential",
      lockin: 5,
      minPremium: 30000,
      fundChoices: ["Equity", "Debt", "Balanced"],
      features: [
        "Loyalty additions",
        "Partial withdrawal after 5 years"
      ]
    },
    "icici pru signature": {
      company: "ICICI Prudential",
      lockin: 5,
      minPremium: 60000,
      fundChoices: ["Multi Cap", "Debt", "Hybrid"],
      features: [
        "High allocation, tax benefit"
      ]
    },
    "sbi ewealth insurance": {
      company: "SBI Life",
      lockin: 5,
      fundChoices: ["Growth", "Balanced"],
      features: [
        "Online only"
      ]
    },
    "sbi smart wealth assure": {
      company: "SBI Life",
      lockin: 5,
      features: [
        "Choice of fund allocation"
      ]
    },
    "bajaj future gain": {
      company: "Bajaj Allianz",
      lockin: 5,
      minPremium: 25000,
      fundChoices: ["Equity Growth", "Pure Stock"],
      features: [
        "Loyalty reward from year 6"
      ]
    },
    "bajaj goal assure": {
      company: "Bajaj Allianz",
      features: [
        "Return of mortality charge"
      ]
    },
    "max online savings plan": {
      company: "Max Life",
      lockin: 5,
      features: [
        "Multiple switches"
      ]
    },
    "max smart wealth plan": {
      company: "Max Life",
      lockin: 5,
      features: [
        "Comprehensive family cover"
      ]
    },
    "aditya birla wealth aspire": {
      company: "Aditya Birla Sun Life",
      features: [
        "Top-up premium allowed"
      ]
    },
    "tata aia fortune pro": {
      company: "Tata AIA",
      lockin: 5,
      features: [
        "Death & maturity benefit"
      ]
    },
    "tata aia wealth maxima": {
      company: "Tata AIA",
      features: [
        "0% premium allocation charge after Year 11"
      ]
    }
    // ... add more as needed
  }
};

const searchKnowledge = (query: string) => {
  const lowerQuery = query.toLowerCase();
  const results = [];
  
  // Search credit cards
  for (const [cardName, details] of Object.entries(financialKnowledge.creditCards)) {
    if (
      lowerQuery.includes(cardName) ||
      (typeof details.company === "string" && lowerQuery.includes(details.company.toLowerCase())) ||
      lowerQuery.includes('credit card') ||
      lowerQuery.includes('cc')
    ) {
      results.push(`${details.company} "${cardName}"\nFeatures: ${details.features ? details.features.join(', ') : details.benefits?.join(', ') ?? ""}\nRewards: ${details.rewards}\nAPR: ${details.apr}\nFees: Annual ₹${details.fees.annual}, Foreign ${details.fees.foreign}%\nTerms: ${(details.terms ?? []).join('; ')}\nRisks/Exclusions: ${(details.exclusions ?? details.risks ?? []).join('; ')}`);
    }
  }

  // Mutual funds
  for (const [mfName, info] of Object.entries(financialKnowledge.mutualFunds ?? {})) {
    if (
      lowerQuery.includes(mfName) ||
      (typeof info.company === "string" && lowerQuery.includes(info.company.toLowerCase())) ||
      lowerQuery.includes("mutual fund") ||
      lowerQuery.includes(info.type?.toLowerCase() ?? "")
    ) {
      results.push(`${info.company} "${mfName}" [${info.type}]\nExpense Ratio: ${info.expenseRatio}, Exit Load: ${info.exitLoad}, Min Investment: ₹${info.minInvestment}\nFeatures: ${(info.features ?? []).join(", ")}\nTerms: ${(info.terms ?? []).join('; ')}\nRisks: ${(info.risks ?? []).join('; ')}`);
    }
  }

  // Health insurance
  for (const [plan, details] of Object.entries(financialKnowledge.healthInsurance ?? {})) {
    if (
      lowerQuery.includes(plan) ||
      (typeof details.company === "string" && lowerQuery.includes(details.company.toLowerCase())) ||
      lowerQuery.includes("health insurance") ||
      lowerQuery.includes(details.type?.toLowerCase() ?? "")
    ) {
      results.push(`${details.company} "${plan}" [${details.type}]\nSum Insured: ${Array.isArray(details.sumInsured) ? details.sumInsured.join(", ") : details.sumInsured}\nPremium: ${details.premium}\nKey Features: ${(details.keyFeatures ?? []).join(", ")}\nTerms: ${(details.terms ?? []).join("; ")}\nExclusions: ${(details.exclusions ?? []).join("; ")}`);
    }
  }

  // Life insurance
  for (const [plan, details] of Object.entries(financialKnowledge.lifeInsurance ?? {})) {
    if (
      lowerQuery.includes(plan) ||
      (typeof details.company === "string" && lowerQuery.includes(details.company.toLowerCase())) ||
      lowerQuery.includes("life insurance") ||
      lowerQuery.includes(details.type?.toLowerCase() ?? "")
    ) {
      results.push(`${details.company} "${plan}" [${details.type}]\nSum Assured: ${details.sumAssured ?? 'N/A'}\nPremium: ${details.premium ?? 'On request'}\nFeatures: ${(details.keyFeatures ?? []).join(", ")}\nTerms: ${(details.terms ?? []).join("; ")}`);
    }
  }

  // Loans
  for (const [loan, details] of Object.entries(financialKnowledge.loans ?? {})) {
    if (
      lowerQuery.includes(loan) ||
      (typeof details.company === "string" && lowerQuery.includes(details.company.toLowerCase())) ||
      lowerQuery.includes('loan') ||
      lowerQuery.includes(details.type?.toLowerCase() ?? "")
    ) {
      results.push(`${details.company} "${loan}" [${details.type}]\nTenure: ${details.tenure}\nInterest Rate: ${details.interestRate}\nAmt: ₹${details.minAmount}–₹${details.maxAmount}\nTerms: ${(details.terms ?? []).join("; ")}\nProcessing Fee: ${details.processingFee}`);
    }
  }

  // ULIPs
  for (const [ulip, details] of Object.entries(financialKnowledge.ulips ?? {})) {
    if (
      lowerQuery.includes(ulip) ||
      (typeof details.company === "string" && lowerQuery.includes(details.company.toLowerCase())) ||
      lowerQuery.includes('ulip')
    ) {
      results.push(`${details.company} "${ulip}"\nLock-in: ${details.lockin} yrs\nMin Premium: ₹${details.minPremium}\nFunds: ${(details.fundChoices ?? []).join(', ')}\nCharges: ${(details.charges ?? []).join('; ')}\nFeatures: ${(details.features ?? []).join(', ')}\nTerms: ${(details.terms ?? []).join('; ')}`);
    }
  }

  return results;
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, hasDocument, fileName } = await req.json();
    
    // Search local knowledge base
    const knowledgeResults = searchKnowledge(message);
    let knowledgeContext = '';
    
    if (knowledgeResults.length > 0) {
      knowledgeContext = `\n\nRelevant information:\n${knowledgeResults.join('\n')}`;
    }

    const systemPrompt = `You are a financial document analysis expert. Help users understand credit cards, insurance policies, mutual funds, loans, ULIPs, life insurance—and their terms and conditions. 
    
    Always call out hidden fees, exclusions, penalty clauses, and key benefits. 
    Never give investment advice, only factual information and explanations.
    Provide simple, practical insights.
    ${knowledgeContext}`;

    const userPrompt = hasDocument 
      ? `Uploaded document: "${fileName}". ${message}` 
      : message;

    // Try API call first
    if (API_KEY) {
      try {
        const response = await fetch(API_ENDPOINT, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'grok-beta',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.3,
            max_tokens: 1000
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const aiResponse = data.choices?.[0]?.message?.content;
          
          if (aiResponse) {
            return new Response(JSON.stringify({ response: aiResponse }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
          }
        }
      } catch (apiError) {
        console.error('API call failed:', apiError);
      }
    }

    // Fallback response with knowledge base
    let fallbackResponse = "I'm here to help with financial document analysis.\n";
    if (knowledgeResults.length > 0) {
      fallbackResponse += `Here's what I found:\n\n${knowledgeResults.join('\n\n')}\n\n`;
    }
    if (hasDocument) {
      fallbackResponse += `For your uploaded document "${fileName}":\n• Look for automatic renewal clauses\n• Hidden fees/charges\n• Cancellation policies\n• Penalty terms\n• Coverage limitations\n\nWould you like any specific clause explained?`;
    } else {
      fallbackResponse += `I can help you break down:\n• Credit card and loan terms\n• Details in policies & funds\n• Hidden clauses and risks\n\nLet me know which product you want to know more about.`;
    }
    return new Response(JSON.stringify({ response: fallbackResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({ 
      response: "I'm experiencing technical difficulties. Please try again shortly."
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
