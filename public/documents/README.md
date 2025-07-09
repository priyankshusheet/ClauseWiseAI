
# Financial Documents Storage

This directory contains PDF documents for financial products analysis.

## Structure:
- `loans/` - Home loans, personal loans, and other loan documents
- `credit-cards/` - Credit card terms, conditions, and product guides  
- `insurance/` - Life insurance, health insurance policy documents

## Usage:
These PDFs are referenced in the comprehensive financial dataset and can be:
1. Analyzed by the OCR system when users upload them
2. Referenced in AI chat responses
3. Used for document comparison and analysis

## Adding New Documents:
1. Place PDF files in the appropriate category folder
2. Update the corresponding dataset in `src/data/comprehensiveFinancialData.ts`
3. Ensure file names match the `source_pdf` field in the dataset
