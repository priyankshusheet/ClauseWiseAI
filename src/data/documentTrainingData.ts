
// Enhanced document training data with comprehensive dataset
import { comprehensiveFinancialData, searchByKeyword, getProductContext } from './comprehensiveFinancialData';

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
    filename: "HDFC-Bank-Home-Loan-Agreement.pdf",
    category: "loan",
    title: "HDFC Bank Home Loan Agreement",
    keyPoints: [
      "Floating and fixed interest rate options available",
      "Prepayment charges as per bank policy",
      "Processing fees and other charges applicable",
      "EMI calculation on reducing balance method"
    ],
    riskFactors: [
      "Interest rate fluctuations can increase EMI burden",
      "Prepayment penalties may apply for early closure",
      "Default can result in property seizure",
      "Additional charges and taxes during loan tenure"
    ],
    benefits: [
      "Tax benefits under Section 80C and 24(b)",
      "Flexible repayment options available",
      "Competitive interest rates",
      "Property ownership advantages"
    ],
    summary: "HDFC Bank Home Loan offers competitive rates with flexible repayment, but borrowers should be aware of fluctuating interest rates and associated charges."
  },
  {
    filename: "feature-updates-of-select-credit-card.pdf",
    category: "credit-card",
    title: "Axis Bank Select Credit Card",
    keyPoints: [
      "Premium credit card with Priority Pass lounge access",
      "Welcome bonus and activation benefits",
      "Reward points on various spending categories",
      "Annual fee applicable"
    ],
    riskFactors: [
      "High annual fees",
      "Interest charges on outstanding balances",
      "Late payment penalties and charges",
      "Over-limit fees applicable"
    ],
    benefits: [
      "Complimentary Priority Pass lounge access",
      "Welcome kit within 15 days of activation",
      "Reward points accumulation",
      "Premium banking privileges"
    ],
    summary: "Axis Bank Select Credit Card provides premium benefits including Priority Pass access, but comes with significant annual fees and standard credit risks."
  },
  {
    filename: "ICICI_Pru_iProtect_Smart.pdf",
    category: "insurance",
    title: "ICICI Prudential iProtect Smart",
    keyPoints: [
      "Term life insurance with flexible policy terms",
      "Coverage up to ₹10 crores sum assured",
      "Policy term options from 5 to 85 years",
      "Pure protection without investment component"
    ],
    riskFactors: [
      "No maturity benefit - pure term insurance",
      "Premiums not refunded if policy survives term",
      "Medical underwriting required",
      "Premium increases with age at entry"
    ],
    benefits: [
      "High coverage at affordable premiums",
      "Tax benefits under Section 80C and 10(10D)",
      "Flexible policy term options",
      "Financial protection for family"
    ],
    summary: "ICICI Pru iProtect Smart offers high life coverage at low cost, ideal for pure protection needs, but provides no maturity benefits."
  }
];

// Enhanced search function that also searches comprehensive dataset
export const searchDocuments = (query: string): DocumentData[] => {
  const searchTerm = query.toLowerCase();
  
  // First search in curated training data
  const trainingResults = documentTrainingData.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm) ||
    doc.category.includes(searchTerm as any) ||
    doc.keyPoints.some(point => point.toLowerCase().includes(searchTerm)) ||
    doc.summary.toLowerCase().includes(searchTerm)
  );
  
  return trainingResults;
};

// Get documents by category
export const getDocumentsByCategory = (category: DocumentData['category']): DocumentData[] => {
  return documentTrainingData.filter(doc => doc.category === category);
};

// Enhanced context generation using both datasets
export const getDocumentContext = (query: string): string => {
  const relevantDocs = searchDocuments(query);
  const productContext = getProductContext(query);
  
  let context = '';
  
  if (relevantDocs.length > 0) {
    context += `Based on our document analysis database:\n\n${relevantDocs.map(doc => `
**${doc.title}**
- Category: ${doc.category}
- Key Benefits: ${doc.benefits.join(', ')}
- Risk Factors: ${doc.riskFactors.join(', ')}
- Summary: ${doc.summary}
`).join('\n')}`;
  }
  
  if (productContext) {
    context += context ? '\n\n' + productContext : productContext;
  }
  
  return context;
};

// Get comprehensive financial advice
export const getFinancialAdvice = (category: string, query: string): string => {
  const lowerQuery = query.toLowerCase();
  const lowerCategory = category.toLowerCase();
  
  if (lowerCategory.includes('loan') || lowerQuery.includes('loan')) {
    return `**Loan Advice**: 
• Compare interest rates from multiple lenders
• Check for prepayment penalties and processing fees
• Understand floating vs fixed rate implications
• Ensure you can afford EMIs even if rates increase
• Read all terms and conditions carefully`;
  }
  
  if (lowerCategory.includes('credit') || lowerQuery.includes('credit card')) {
    return `**Credit Card Advice**:
• Compare annual fees against benefits received
• Understand reward point redemption terms
• Check for hidden charges and penalties
• Pay full balance to avoid interest charges
• Monitor credit utilization ratio`;
  }
  
  if (lowerCategory.includes('insurance') || lowerQuery.includes('insurance')) {
    return `**Insurance Advice**:
• Buy adequate coverage based on your dependents
• Compare premiums across insurers
• Understand policy exclusions and waiting periods
• Disclose all medical conditions honestly
• Review and update coverage periodically`;
  }
  
  return '';
};
