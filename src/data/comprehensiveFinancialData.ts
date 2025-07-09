
export interface ProductDetails {
  loan_amount?: string;
  interest_rate?: string;
  processing_fee?: string;
  loan_term?: string;
  prepayment?: string;
  welcome_bonus?: string;
  annual_fee?: string;
  reward_points?: string;
  lounge_access?: string;
  riders?: string;
  policy_term?: string;
  maturity_benefit?: string;
  sum_assured?: string;
  premium?: string;
  surrender_value?: string;
}

export interface ProductInfo {
  source_pdf: string;
  category: string;
  product_name: string;
  key_details: ProductDetails;
}

export const loanDataSet: ProductInfo[] = [
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
    "source_pdf": "CIS Modified LIC's Bima Ratna.pdf",
    "category": "Loan",
    "product_name": "CIS Modified LIC's Bima Ratna",
    "key_details": {
      "loan_amount": "022-69038800/69038812",
      "interest_rate": "125%",
      "loan_term": "However, in case of minor Life Assured, whose age at entry is below 8 years, on death before the commencement of Risk, the Death Benefit payable shall be return of Total Premiums paid"
    }
  },
  {
    "source_pdf": "HDFC-Bank-Home-Loan-Agreement.pdf",
    "category": "Loan",
    "product_name": "HDFC-Bank-Home-Loan-Agreement",
    "key_details": {
      "prepayment": "means premature payment of the Loan or any part thereof, as per the terms and conditions stipulated by the Bank",
      "interest_rate": "0.50%",
      "loan_term": "The Borrower shall reimburse or pay to the Bank such amount as may have been paid or payable by Bank to any Government"
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
      "loan_term": "With Shubh aarambh Home Loans 4 EMIs* waived every 4 years*"
    }
  },
  {
    "source_pdf": "Terms-and-Conditions.pdf",
    "category": "Loan",
    "product_name": "SBI Home Loan Terms and Conditions",
    "key_details": {
      "prepayment": "Charges applicable",
      "loan_amount": "250/-",
      "interest_rate": "90%",
      "loan_term": "SBI Home Loan for Purchase/construction/Take over with various options"
    }
  }
];

export const creditCardDataSet: ProductInfo[] = [
  {
    "source_pdf": "FIRST Classic Product Guide.pdf",
    "category": "Credit Card",
    "product_name": "IDFC FIRST Classic",
    "key_details": {
      "reward_points": "Benefits on every spend",
      "welcome_bonus": "Welcome to the Super Rewarding Life",
      "lounge_access": "Complimentary Railway Lounge access- 4 per quarter"
    }
  },
  {
    "source_pdf": "FIRST Millennia Product Guide.pdf",
    "category": "Credit Card",
    "product_name": "IDFC FIRST Millennia",
    "key_details": {
      "lounge_access": "4 per quarter",
      "reward_points": "Comprehensive benefits package"
    }
  },
  {
    "source_pdf": "IDFC-FIRST-Millennia-2024.pdf",
    "category": "Credit Card",
    "product_name": "IDFC FIRST Millennia 2024",
    "key_details": {
      "lounge_access": "Complimentary access",
      "reward_points": "1 reward point per spend",
      "annual_fee": "499",
      "welcome_bonus": "up to ₹500 on eligible spends"
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
    "source_pdf": "feature-updates-of-select-credit-card.pdf",
    "category": "Credit Card",
    "product_name": "Axis Bank Select",
    "key_details": {
      "lounge_access": "with Priority Pass",
      "annual_fee": "6",
      "welcome_bonus": "The Priority Pass welcome kit will reach within 15 days post first swipe/activation"
    }
  }
];

export const insuranceDataSet: ProductInfo[] = [
  {
    "source_pdf": "Final CIS_MB20.pdf",
    "category": "Insurance",
    "product_name": "LIC New Money Back Plan-20 years",
    "key_details": {
      "riders": "opted, if available",
      "policy_term": "20 years money back plan"
    }
  },
  {
    "source_pdf": "Final CIS_MB25.pdf",
    "category": "Insurance",
    "product_name": "LIC New Money Back Plan-25 years",
    "key_details": {
      "riders": "opted, if available",
      "policy_term": "25 years money back plan"
    }
  },
  {
    "source_pdf": "ICICI_Pru_iProtect_Smart.pdf",
    "category": "Insurance",
    "product_name": "ICICI Prudential iProtect Smart",
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
      "sum_assured": "Increasing coverage",
      "premium": "Affordable premiums",
      "policy_term": "15 years"
    }
  },
  {
    "source_pdf": "Policy Document Modified LIC's Bima Ratna.pdf",
    "category": "Insurance",
    "product_name": "LIC Bima Ratna",
    "key_details": {
      "sum_assured": "Guaranteed returns",
      "policy_term": "15 years and 30 days completed for Policy Term 20 & 25 years",
      "maturity_benefit": "Guaranteed maturity benefits",
      "riders": "subject to the eligibility as detailed"
    }
  }
];

// Combined search function
export const searchAllProducts = (query: string): Array<{
  category: string;
  product_name: string;
  source_pdf: string;
  key_details: ProductDetails;
  relevanceScore: number;
}> => {
  const results: Array<{
    category: string;
    product_name: string;
    source_pdf: string;
    key_details: ProductDetails;
    relevanceScore: number;
  }> = [];
  
  const allDataSets = [
    ...loanDataSet,
    ...creditCardDataSet,
    ...insuranceDataSet
  ];
  
  const queryLower = query.toLowerCase();
  
  allDataSets.forEach(product => {
    let relevanceScore = 0;
    
    // Check product name
    if (product.product_name.toLowerCase().includes(queryLower)) {
      relevanceScore += 10;
    }
    
    // Check category
    if (product.category.toLowerCase().includes(queryLower)) {
      relevanceScore += 8;
    }
    
    // Check key details
    Object.values(product.key_details).forEach(detail => {
      if (detail && detail.toLowerCase().includes(queryLower)) {
        relevanceScore += 5;
      }
    });
    
    if (relevanceScore > 0) {
      results.push({
        category: product.category,
        product_name: product.product_name,
        source_pdf: product.source_pdf,
        key_details: product.key_details,
        relevanceScore
      });
    }
  });
  
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
};

// Get products by category
export const getProductsByCategory = (category: 'Loan' | 'Credit Card' | 'Insurance') => {
  switch (category) {
    case 'Loan':
      return loanDataSet;
    case 'Credit Card':
      return creditCardDataSet;
    case 'Insurance':
      return insuranceDataSet;
    default:
      return [];
  }
};

// Format product details for display
export const formatProductDetails = (product: ProductInfo): string => {
  const details = product.key_details;
  let formatted = `**${product.product_name}** (${product.category})\n\n`;
  
  if (details.interest_rate) {
    formatted += `• **Interest Rate:** ${details.interest_rate}\n`;
  }
  if (details.loan_amount) {
    formatted += `• **Loan Amount:** ${details.loan_amount}\n`;
  }
  if (details.processing_fee) {
    formatted += `• **Processing Fee:** ${details.processing_fee}\n`;
  }
  if (details.loan_term) {
    formatted += `• **Loan Term:** ${details.loan_term}\n`;
  }
  if (details.annual_fee) {
    formatted += `• **Annual Fee:** ${details.annual_fee}\n`;
  }
  if (details.reward_points) {
    formatted += `• **Reward Points:** ${details.reward_points}\n`;
  }
  if (details.lounge_access) {
    formatted += `• **Lounge Access:** ${details.lounge_access}\n`;
  }
  if (details.welcome_bonus) {
    formatted += `• **Welcome Bonus:** ${details.welcome_bonus}\n`;
  }
  if (details.policy_term) {
    formatted += `• **Policy Term:** ${details.policy_term}\n`;
  }
  if (details.sum_assured) {
    formatted += `• **Sum Assured:** ${details.sum_assured}\n`;
  }
  if (details.premium) {
    formatted += `• **Premium:** ${details.premium}\n`;
  }
  if (details.maturity_benefit) {
    formatted += `• **Maturity Benefit:** ${details.maturity_benefit}\n`;
  }
  if (details.riders) {
    formatted += `• **Riders:** ${details.riders}\n`;
  }
  if (details.prepayment) {
    formatted += `• **Prepayment:** ${details.prepayment}\n`;
  }
  
  formatted += `\n*Source: ${product.source_pdf}*`;
  
  return formatted;
};
