
// This file contains training data for the AI Chat based on your document collection
// Add your document summaries and key insights here to improve AI responses

export interface DocumentData {
  filename: string;
  category: 'loan' | 'credit-card' | 'insurance' | 'general';
  title: string;
  keyPoints: string[];
  riskFactors: string[];
  benefits: string[];
  summary: string;
}

export const documentTrainingData: DocumentData[] = [
  {
    filename: "hdfc-home-loan-agreement.pdf",
    category: "loan",
    title: "HDFC Home Loan Agreement",
    keyPoints: [
      "Fixed and floating interest rate options",
      "Prepayment charges may apply",
      "Processing fees as per bank policy",
      "EMI calculation based on reducing balance method"
    ],
    riskFactors: [
      "Interest rate fluctuations affect EMI",
      "Prepayment penalties may apply",
      "Default may result in property seizure",
      "Processing fees and other charges"
    ],
    benefits: [
      "Tax benefits under Section 80C and 24(b)",
      "Flexible repayment options",
      "Lower interest rates compared to personal loans",
      "Property ownership advantages"
    ],
    summary: "HDFC Home Loan offers competitive interest rates with flexible repayment options, but borrowers should be aware of prepayment charges and interest rate fluctuation risks."
  },
  {
    filename: "axis-bank-select-credit-card.pdf",
    category: "credit-card",
    title: "Axis Bank Select Credit Card",
    keyPoints: [
      "Premium credit card with high annual fee",
      "Airport lounge access benefits",
      "Reward points on specific categories",
      "Welcome bonus offers"
    ],
    riskFactors: [
      "High annual fees",
      "Interest charges on outstanding balances",
      "Late payment penalties",
      "Over-limit charges"
    ],
    benefits: [
      "Complimentary airport lounge access",
      "Accelerated reward points",
      "Travel insurance coverage",
      "Exclusive offers and discounts"
    ],
    summary: "Axis Bank Select Credit Card offers premium benefits including lounge access and reward points, but comes with high annual fees and standard credit card risks."
  },
  {
    filename: "lic-jeevan-anand-policy.pdf",
    category: "insurance",
    title: "LIC Jeevan Anand Policy",
    keyPoints: [
      "Whole life insurance with savings benefit",
      "Maturity benefit available",
      "Bonus additions to sum assured",
      "Loan facility against policy"
    ],
    riskFactors: [
      "Long-term commitment required",
      "Lower returns compared to market investments",
      "Premium payment defaults affect coverage",
      "Surrender charges in early years"
    ],
    benefits: [
      "Life insurance coverage",
      "Guaranteed returns at maturity",
      "Tax benefits under Section 80C",
      "Loan facility available"
    ],
    summary: "LIC Jeevan Anand provides life insurance with savings benefits and guaranteed returns, though returns may be lower than market alternatives and requires long-term commitment."
  }
];

// Search function to find relevant documents for AI context
export const searchDocuments = (query: string): DocumentData[] => {
  const searchTerm = query.toLowerCase();
  
  return documentTrainingData.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm) ||
    doc.category.includes(searchTerm as any) ||
    doc.keyPoints.some(point => point.toLowerCase().includes(searchTerm)) ||
    doc.summary.toLowerCase().includes(searchTerm)
  );
};

// Get documents by category
export const getDocumentsByCategory = (category: DocumentData['category']): DocumentData[] => {
  return documentTrainingData.filter(doc => doc.category === category);
};

// Get document context for AI prompt
export const getDocumentContext = (query: string): string => {
  const relevantDocs = searchDocuments(query);
  
  if (relevantDocs.length === 0) return '';
  
  return `Based on our document analysis database, here are relevant insights:

${relevantDocs.map(doc => `
**${doc.title}**
- Category: ${doc.category}
- Key Benefits: ${doc.benefits.join(', ')}
- Risk Factors: ${doc.riskFactors.join(', ')}
- Summary: ${doc.summary}
`).join('\n')}`;
};
