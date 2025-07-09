
// Comprehensive Financial Training Data for AI Chat
export interface FinancialProduct {
  source_pdf: string;
  category: 'Loan' | 'Credit Card' | 'Insurance';
  product_name: string;
  key_details: Record<string, string>;
}

export interface LoanDetails {
  loan_amount?: string;
  interest_rate?: string;
  processing_fee?: string;
  prepayment?: string;
  loan_term?: string;
}

export interface CreditCardDetails {
  annual_fee?: string;
  welcome_bonus?: string;
  reward_points?: string;
  lounge_access?: string;
}

export interface InsuranceDetails {
  sum_assured?: string;
  premium?: string;
  policy_term?: string;
  maturity_benefit?: string;
  riders?: string;
  surrender_value?: string;
}

// Loan Dataset
export const loanDataset: FinancialProduct[] = [
  {
    "source_pdf": "asha-home-loan-leaflet_new.pdf",
    "category": "Loan",
    "product_name": "asha-home-loan-leaflet_new",
    "key_details": {}
  },
  {
    "source_pdf": "Campaign_offer.pdf",
    "category": "Loan",
    "product_name": "Campaign_offer",
    "key_details": {
      "loan_amount": "3",
      "interest_rate": "9.15%",
      "processing_fee": "3"
    }
  },
  {
    "source_pdf": "HDFC-Bank-Home-Loan-Agreement.pdf",
    "category": "Loan",
    "product_name": "HDFC-Bank-Home-Loan-Agreement",
    "key_details": {
      "loan_amount": ",",
      "processing_fee": ",",
      "prepayment": "means premature payment of the Loan or any part thereof, as per the terms and conditions stipulated by the Bank",
      "interest_rate": "0.50%",
      "loan_term": "The Borrower shall reimburse or pay to the Bank such amount as may have been paid or payable by Bank to any Government or any tax or other authority on account of any tax levied on interest or any other charges, fees, expenses or costs"
    }
  },
  {
    "source_pdf": "quikpay-home-loan-leaflet_new.pdf",
    "category": "Loan",
    "product_name": "quikpay-home-loan-leaflet_new",
    "key_details": {
      "loan_term": "20 years",
      "prepayment": "charges",
      "interest_rate": "12%"
    }
  },
  {
    "source_pdf": "shubh-aarambh-home-loan-leaflet.pdf",
    "category": "Loan",
    "product_name": "shubh-aarambh-home-loan-leaflet",
    "key_details": {
      "loan_term": "With Shubh aarambh Home Loans 4 EMIs waived every 4 years. Nil pre-payment charges. Subsidy of up to 2.67 lakhs under PMAY benefit"
    }
  }
];

// Credit Card Dataset
export const creditCardDataset: FinancialProduct[] = [
  {
    "source_pdf": "feature-updates-of-select-credit-card.pdf",
    "category": "Credit Card",
    "product_name": "Axis Bank Select Credit Card",
    "key_details": {
      "lounge_access": "with Priority Pass",
      "annual_fee": "6",
      "welcome_bonus": "The Priority Pass welcome kit will reach within 15 days post first swipe/activation"
    }
  },
  {
    "source_pdf": "FIRST Classic Product Guide.pdf",
    "category": "Credit Card",
    "product_name": "IDFC FIRST Classic Credit Card",
    "key_details": {
      "reward_points": "Benefits",
      "welcome_bonus": "Welcome to the Super Rewarding Life. We at IDFC FIRST Bank have created a card keeping your needs and aspirations in mind",
      "lounge_access": "Complimentary Railway Lounge access- 4 per quarter. Personal Accident cover and Zero Lost Card Liability. 25% discount on movie tickets once a month up to ₹100"
    }
  },
  {
    "source_pdf": "icici-card.pdf",
    "category": "Credit Card",
    "product_name": "ICICI Credit Card",
    "key_details": {
      "welcome_bonus": "Monthly top 100 spenders will get a Manchester United branded T-shirt",
      "lounge_access": "every quarter",
      "reward_points": "for every 100/- Rs spend except fuel",
      "annual_fee": "1,50,000"
    }
  },
  {
    "source_pdf": "IDFC-FIRST-Millennia-2024.pdf",
    "category": "Credit Card",
    "product_name": "IDFC FIRST Millennia Credit Card",
    "key_details": {
      "lounge_access": ",",
      "reward_points": "1",
      "annual_fee": "499",
      "welcome_bonus": "Lifetime free Credit Card up to ₹500 on eligible spends. Welcome Voucher. Interest-free ATM Cash Withdrawal for up to 45 days"
    }
  }
];

// Insurance Dataset
export const insuranceDataset: FinancialProduct[] = [
  {
    "source_pdf": "Final CIS_MB20.pdf",
    "category": "Insurance",
    "product_name": "LIC's New Money Back Plan-20 years",
    "key_details": {
      "riders": "opted, if",
      "policy_term": "LIC's New Money Back Plan-20 years (UIN:512N280V03)"
    }
  },
  {
    "source_pdf": "ICICI_Pru_iProtect_Smart.pdf",
    "category": "Insurance",
    "product_name": "ICICI Pru iProtect Smart",
    "key_details": {
      "policy_term": "5 years / 85 years",
      "sum_assured": "10,000,000"
    }
  },
  {
    "source_pdf": "SBI+Life+-+Smart+Shield+(V08)_Brochure.pdf",
    "category": "Insurance",
    "product_name": "SBI Life Smart Shield",
    "key_details": {
      "sum_assured": "2",
      "premium": ",",
      "policy_term": "15 years"
    }
  }
];

// Combined dataset
export const comprehensiveFinancialData: FinancialProduct[] = [
  ...loanDataset,
  ...creditCardDataset,
  ...insuranceDataset
];

// Search functions
export const searchByCategory = (category: 'Loan' | 'Credit Card' | 'Insurance'): FinancialProduct[] => {
  return comprehensiveFinancialData.filter(product => product.category === category);
};

export const searchByKeyword = (keyword: string): FinancialProduct[] => {
  const searchTerm = keyword.toLowerCase();
  return comprehensiveFinancialData.filter(product => 
    product.product_name.toLowerCase().includes(searchTerm) ||
    product.source_pdf.toLowerCase().includes(searchTerm) ||
    Object.values(product.key_details).some(detail => 
      detail.toLowerCase().includes(searchTerm)
    )
  );
};

export const searchByProductName = (productName: string): FinancialProduct | undefined => {
  return comprehensiveFinancialData.find(product => 
    product.product_name.toLowerCase().includes(productName.toLowerCase())
  );
};

// Format response for specific product
export const formatProductResponse = (product: FinancialProduct): string => {
  const details = Object.entries(product.key_details)
    .filter(([_, value]) => value && value.trim().length > 0)
    .map(([key, value]) => `• **${key.replace(/_/g, ' ').toUpperCase()}**: ${value}`)
    .join('\n');
  
  return `## ${product.product_name}
**Category**: ${product.category}
**Source Document**: ${product.source_pdf}

${details ? `**Key Details:**\n${details}` : 'No specific details available in our database.'}

Would you like more information about this product or compare it with similar options?`;
};

// Get product recommendations
export const getRecommendations = (category: 'Loan' | 'Credit Card' | 'Insurance', limit: number = 3): FinancialProduct[] => {
  return searchByCategory(category).slice(0, limit);
};

// Extract key insights for AI context
export const getProductContext = (query: string): string => {
  const relevantProducts = searchByKeyword(query);
  
  if (relevantProducts.length === 0) return '';
  
  return `Based on our financial products database, here are relevant products:

${relevantProducts.slice(0, 3).map(product => `
**${product.product_name}** (${product.category})
- Source: ${product.source_pdf}
- Key features: ${Object.entries(product.key_details).slice(0, 2).map(([k, v]) => `${k}: ${v}`).join(', ')}
`).join('\n')}`;
};
