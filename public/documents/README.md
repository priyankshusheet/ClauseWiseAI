
# Document Training Data Directory

This directory contains financial documents used to train and improve the ClauseWise AI chat responses.

## Directory Structure

```
documents/
├── loans/          # Home loans, personal loans, business loans
├── credit-cards/   # Credit card terms, agreements, benefits
├── insurance/      # Life, health, vehicle insurance policies
└── general/        # Other financial documents
```

## How to Add Documents

1. **Create appropriate subdirectories** if they don't exist
2. **Place PDF files** in the relevant category folder
3. **Update the training data** in `src/data/documentTrainingData.ts`
4. **Add document metadata** including:
   - Filename (must match the actual file)
   - Category (loan, credit-card, insurance, general)
   - Title (human-readable name)
   - Key points, risk factors, and benefits
   - Summary for AI context

## AI Training Process

The AI chat system will:
1. **Search local documents** first for relevant context
2. **Extract key insights** from your document summaries
3. **Provide contextual responses** based on actual document content
4. **Fall back to general AI** if no relevant documents found

## Document Security

- Documents are used for **training purposes only**
- **No personal information** should be included in training documents
- Use **sanitized/anonymized** versions of real documents
- Remove all **personal identifiers** before adding to training data

## Best Practices

- **Use descriptive filenames** that match your training data entries
- **Keep documents organized** by category
- **Update training data** whenever you add new documents
- **Test AI responses** after adding new documents to ensure quality
