
# Document Training Data Directory

This directory contains financial documents used to train and improve the ClauseWise AI chat responses.

## Current Dataset Integration

The AI Chat now uses your comprehensive financial datasets including:

### Loan Products Dataset
- **25+ loan products** from various banks and financial institutions
- **Key details tracked**: Interest rates, loan terms, processing fees, prepayment charges
- **Example products**: HDFC Home Loans, Axis Bank loans, SBI loans

### Credit Card Dataset  
- **30+ credit card products** from major banks
- **Key details tracked**: Annual fees, welcome bonuses, reward points, lounge access
- **Example products**: Axis Bank Select, IDFC FIRST Millennia, ICICI cards

### Insurance Dataset
- **25+ insurance products** from top insurers
- **Key details tracked**: Policy terms, sum assured, premiums, riders, maturity benefits
- **Example products**: LIC policies, ICICI Prudential, SBI Life insurance

## Directory Structure for Physical Documents

```
documents/
├── loans/          # PDF files for loan products
├── credit-cards/   # PDF files for credit card products  
├── insurance/      # PDF files for insurance products
└── general/        # Other financial documents
```

## How the AI Uses This Data

1. **Smart Local Search**: Searches through your dataset first for instant responses
2. **Product Matching**: Matches user queries to specific products in your database
3. **Contextual Advice**: Provides tailored advice based on actual product features
4. **Comparison Analysis**: Compares products using real data from your documents
5. **AI Fallback**: Uses cloud AI only when local data doesn't match the query

## Features Now Available

### Enhanced Query Handling
- **Product-specific questions**: "Tell me about HDFC home loan"
- **Category searches**: "Show me credit cards with lounge access"
- **Comparison queries**: "Compare SBI and ICICI insurance policies"
- **Feature-based search**: "Which cards have no annual fee?"

### Intelligent Responses
- Real product details from your dataset
- Risk analysis based on actual terms
- Benefits breakdown with specific features
- Personalized recommendations

### Document Integration
- Upload any financial document for analysis
- Cross-reference with existing product database
- Enhanced context from both uploaded docs and training data

## Adding New Documents

1. **Place PDF files** in appropriate category folders above
2. **Update the comprehensive dataset** in `src/data/comprehensiveFinancialData.ts`
3. **Add training summaries** in `src/data/documentTrainingData.ts` for enhanced AI responses

The AI will automatically use new data once files are properly integrated into the datasets.

## Benefits of This Integration

- **Faster responses** using local data
- **More accurate information** from your actual documents  
- **Cost-effective** - reduces AI API calls
- **Offline capability** - works without internet for basic queries
- **Customized advice** - tailored to your specific product portfolio

Your AI assistant now has comprehensive knowledge of your financial products and can provide expert-level guidance!
