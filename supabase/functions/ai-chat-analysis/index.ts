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
  creditCards: {
    "hdfc regalia": {
      company: "HDFC Bank",
      fees: { annual: 2500, foreign: 2.5 },
      apr: "23.88%",
      rewards: "4 points per Rs. 150 spent",
      features: ["Lounge access", "Air accident cover", "Dining offers"],
      terms: [
        "Annual fee waived on Rs. 3L annual spend",
        "Fuel surcharge waiver: 1%",
        "Foreign transaction mark-up: 2.5%",
        "Interest-free period: 50 days"
      ],
      exclusions: [
        "No reward points on fuel, EMI, and wallet loads",
        "Late fee as per outstanding amount slab"
      ]
    },
    "sbi simplyclick": {
      company: "SBI Card",
      fees: { annual: 499, foreign: 3.5 },
      apr: "27%",
      rewards: "10x points on online spending",
      features: ["Amazon vouchers", "E-commerce rewards"],
      terms: [
        "Annual fee reversed at 1L annual spends",
        "1% fuel surcharge waiver up to Rs. 100/month",
        "Flexipay EMI option available"
      ],
      exclusions: [
        "No lounge access",
        "No international reward multiplier"
      ]
    },
    "amex gold": {
      company: "American Express",
      fees: { annual: 250, foreign: 0 },
      apr: '21.24% - 27.24%',
      rewards: '4x points on dining and groceries',
      benefits: ['Airport lounge access', 'Travel insurance', 'Purchase protection'],
      risks: ['High annual fee', 'No preset spending limit may affect credit utilization'],
      terms: [
        "No pre-set spending limit; flexible payments.",
        "Late payments incur 29.99% APR penalty.",
        "Purchase protection up to $1,000 per occurrence."
      ]
    }
    // ... add more representative cards as needed
  },
  mutualFunds: {
    "sbi bluechip fund": {
      company: "SBI Mutual Fund",
      type: "Large Cap Equity",
      expenseRatio: "0.90%",
      exitLoad: "1% if redeemed <1 year",
      minInvestment: 500,
      features: [
        "Diversified across top 100 companies",
        "Focus on stability and reputable brands"
      ],
      terms: [
        "NAV calculated at market close",
        "No entry load fee",
        "SIP option available monthly"
      ],
      risks: [
        "Market risk due to equity fluctuations",
        "Returns not guaranteed"
      ]
    },
    "hdfc hybrid equity fund": {
      company: "HDFC Mutual Fund",
      type: "Aggressive Hybrid",
      expenseRatio: "1.30%",
      exitLoad: "1% <1 year",
      minInvestment: 500,
      features: [
        "Mix of equity (60-80%) and debt (20-40%)",
        "Regular income potential"
      ],
      terms: [
        "SIP and lump-sum available",
        "No entry load",
        "Redemption proceeds in T+3 days"
      ]
    },
    // ... add more representative funds as needed
  },
  // Health Insurance (expanded)
  healthInsurance: {
    "max bupa health companion": {
      company: "Niva Bupa",
      type: "Family Floater",
      sumInsured: [500000, 1000000, 2500000],
      premium: "₹6,500 - ₹12,000/year (30yr, family of 3)",
      keyFeatures: [
        "Re-instatement of sum insured",
        "Day care procedures covered",
        "No room rent capping"
      ],
      terms: [
        "2-year waiting for pre-existing diseases",
        "Sub-limits: None for most covers",
        "50% NCB for claim free year"
      ],
      exclusions: [
        "No cover for cosmetic surgery",
        "War and hazardous sports"
      ]
    },
    "apollo munich optima restore": {
      company: "HDFC ERGO",
      type: "Family Floater",
      sumInsured: [300000, 500000, 1000000],
      premium: "₹7,000 - ₹15,000/year (family, age 30)",
      keyFeatures: [
        "Restore benefit on partial utilization",
        "E-opinion for critical illness",
        "No claim bonus: 50% up to 100%"
      ],
      terms: [
        "24-month waiting for pre-existing disease",
        "Initial 30-days waiting for illness cover",
        "Entry age: 91 days onwards"
      ]
    }
    // ... add more as required
  },
  lifeInsurance: {
    "lic jeevan amar": {
      company: "LIC",
      type: "Term Plan",
      sumAssured: "₹50 lakhs - ₹5 crores",
      premium: "Low for non-smokers",
      keyFeatures: [
        "Flexible payout: Lump sum or monthly",
        "Death benefit covers all causes (except suicide within first year)"
      ],
      terms: [
        "Policy term: 10–40 years",
        "Grace period for lapsed premium: 30 days",
        "Revival allowed within 5 years"
      ]
    },
    "hdfc click2protect life": {
      company: "HDFC Life",
      type: "Term Plan",
      payoutOptions: ["Lump sum", "Monthly income"],
      accidentalBenefit: true,
      riders: ["Critical illness", "Waiver of premium"],
      terms: [
        "12-TO-40 year term",
        "Waiting period: suicide exclusion, 1 year",
        "Grace period: 30 days"
      ]
    }
    // ... more plans
  },
  loans: {
    "hdfc personal loan": {
      company: "HDFC Bank",
      type: "Unsecured personal",
      minAmount: 50000,
      maxAmount: 4000000,
      tenure: "12–60 months",
      interestRate: "10.5% - 21%",
      processingFee: "2.5%",
      terms: [
        "No part prepayment in first 12 months",
        "Foreclosure charges: 4%",
        "Late payment penalty: ₹300 - ₹600"
      ]
    }
    // ... more representative loans
  },
  ulips: {
    "icici prudential wealth builder ii": {
      company: "ICICI Prudential",
      lockin: 5,
      minPremium: 30000,
      fundChoices: ["Equity", "Debt", "Balanced"],
      charges: [
        "Premium allocation: 2% first year",
        "Policy admin: Rs. 60/month first 5 years"
      ],
      features: [
        "Loyalty additions from year 6",
        "Partial withdrawals after 5 years"
      ],
      terms: [
        "Market-linked returns",
        "Mortality charges deducted monthly"
      ]
    }
    // ... add more ULIP products
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
