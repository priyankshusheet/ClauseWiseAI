
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Comprehensive financial products knowledge base
const financialKnowledgeBase = {
  creditCards: {
    "American Express Gold": {
      annualFee: "$250",
      rewardsRate: "4x on dining & groceries (up to $25k), 3x on flights, 1x everything else",
      pros: ["High rewards on dining/groceries", "Uber credits", "Airport lounge access"],
      cons: ["High annual fee", "No cashback option", "Limited acceptance"],
      hiddenFees: "Foreign transaction fees: 2.7%, Late payment: up to $40"
    },
    "Chase Sapphire Preferred": {
      annualFee: "$95",
      rewardsRate: "2x on travel & dining, 1x everything else",
      pros: ["Transfer partners", "Travel insurance", "No foreign transaction fees"],
      cons: ["Annual fee", "Limited bonus categories"],
      hiddenFees: "Balance transfer: 5% or $5 minimum, Cash advance: 5% or $10 minimum"
    },
    "Discover it Cash Back": {
      annualFee: "$0",
      rewardsRate: "5% rotating categories (up to $1,500), 1% everything else",
      pros: ["No annual fee", "Cashback match first year", "Good customer service"],
      cons: ["Rotating categories require activation", "Limited acceptance abroad"],
      hiddenFees: "Late payment: up to $41, Foreign transaction: None"
    }
  },
  healthInsurance: {
    "HMO Plans": {
      costRange: "$200-$600/month",
      coverage: "Network providers only, requires referrals",
      pros: ["Lower premiums", "Predictable costs", "Preventive care covered"],
      cons: ["Limited provider network", "Referrals required", "No out-of-network coverage"],
      hiddenCosts: "Specialist copays: $30-$50, Emergency room: $300-$500"
    },
    "PPO Plans": {
      costRange: "$300-$800/month",
      coverage: "In and out-of-network coverage",
      pros: ["Flexible provider choice", "No referrals needed", "Out-of-network coverage"],
      cons: ["Higher premiums", "Higher deductibles", "Complex billing"],
      hiddenCosts: "Out-of-network deductible often 2x higher, Balance billing possible"
    },
    "High Deductible Health Plans": {
      costRange: "$150-$400/month",
      coverage: "High deductible with HSA eligibility",
      pros: ["Lower premiums", "HSA tax benefits", "Preventive care covered"],
      cons: ["High out-of-pocket costs", "Complex to understand", "Cash flow challenges"],
      hiddenCosts: "Deductibles: $1,500-$7,500, Coinsurance after deductible"
    }
  },
  autoInsurance: {
    "Liability Only": {
      costRange: "$30-$100/month",
      coverage: "Covers damage to others, not your vehicle",
      pros: ["Lowest cost", "Meets legal requirements"],
      cons: ["No coverage for your car", "High out-of-pocket risk"],
      hiddenCosts: "Rental car coverage: Additional $15-30/month"
    },
    "Full Coverage": {
      costRange: "$100-$300/month",
      coverage: "Comprehensive, collision, and liability",
      pros: ["Complete protection", "Peace of mind", "Covers your vehicle"],
      cons: ["Higher premiums", "Deductibles apply"],
      hiddenCosts: "Gap insurance: $20-40/month, Roadside assistance: $25-50/year"
    }
  },
  lifeInsurance: {
    "Term Life": {
      costRange: "$20-$100/month",
      coverage: "Temporary coverage for specific term",
      pros: ["Affordable premiums", "Simple structure", "High coverage amounts"],
      cons: ["No cash value", "Premiums increase with age", "Temporary coverage"],
      hiddenCosts: "Conversion fees if switching to permanent, Medical exam costs"
    },
    "Whole Life": {
      costRange: "$200-$1000/month",
      coverage: "Permanent coverage with cash value",
      pros: ["Permanent coverage", "Cash value growth", "Fixed premiums"],
      cons: ["Expensive premiums", "Complex structure", "Low returns"],
      hiddenCosts: "Surrender charges: 5-15% in early years, Policy fees: $50-150/year"
    }
  },
  travelInsurance: {
    "Trip Cancellation": {
      costRange: "4-10% of trip cost",
      coverage: "Reimburses non-refundable trip costs",
      pros: ["Protects trip investment", "Covers medical emergencies", "24/7 assistance"],
      cons: ["Limited covered reasons", "Pre-existing condition exclusions"],
      hiddenCosts: "Cancel for any reason: 40-75% more expensive"
    }
  },
  mutualFunds: {
    "Index Funds": {
      expenseRatio: "0.03-0.20%",
      riskLevel: "Market risk",
      pros: ["Low fees", "Diversification", "Market returns", "Passive management"],
      cons: ["No active management", "Market volatility", "No guaranteed returns"],
      hiddenFees: "Transaction fees: $0-49.95, Account maintenance: $0-25/year"
    },
    "Actively Managed Funds": {
      expenseRatio: "0.50-2.00%",
      riskLevel: "Market + manager risk",
      pros: ["Professional management", "Potential to beat market", "Research included"],
      cons: ["High fees", "Manager risk", "Tax inefficient", "Underperformance risk"],
      hiddenFees: "Load fees: 3-5.75%, 12b-1 fees: 0.25-1.00%"
    }
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, hasDocument, fileName } = await req.json();
    
    console.log('Processing request:', { message, hasDocument, fileName });

    // Search knowledge base for relevant information
    const searchQuery = message.toLowerCase();
    let relevantInfo = "";
    
    // Search through all financial products
    Object.entries(financialKnowledgeBase).forEach(([category, products]) => {
      Object.entries(products).forEach(([productName, details]) => {
        if (searchQuery.includes(productName.toLowerCase()) || 
            searchQuery.includes(category.toLowerCase()) ||
            Object.values(details).some(value => 
              typeof value === 'string' && value.toLowerCase().includes(searchQuery)
            )) {
          relevantInfo += `\n\n${category.toUpperCase()} - ${productName}:\n`;
          relevantInfo += `Cost: ${details.costRange || details.annualFee || details.expenseRatio}\n`;
          relevantInfo += `Coverage/Features: ${details.coverage || details.rewardsRate || details.riskLevel}\n`;
          relevantInfo += `Pros: ${details.pros.join(', ')}\n`;
          relevantInfo += `Cons: ${details.cons.join(', ')}\n`;
          relevantInfo += `Hidden Costs/Fees: ${details.hiddenFees || details.hiddenCosts}\n`;
        }
      });
    });

    let systemPrompt = `You are ClauseWise, an expert AI financial companion specialized in analyzing complex financial documents, insurance policies, credit card terms, and legal agreements. You help users understand financial jargon in simple, clear language.

Key capabilities:
- Explain complex financial terms in simple language
- Identify hidden fees, penalties, and auto-renewal traps
- Highlight risky clauses and coverage exclusions
- Provide risk assessments and consumer protection advice
- Support document analysis with specific warnings
- Use emojis occasionally to make responses engaging
- Be friendly but professional

Guidelines:
- Always prioritize consumer protection and financial literacy
- Warn about potential risks like auto-renewal, late fees, exclusions
- Encourage users to read full documents and consult professionals for major decisions
- Provide actionable insights and clear explanations

KNOWLEDGE BASE CONTEXT:
${relevantInfo || "No specific product information found in knowledge base."}

Use this knowledge base information to provide accurate, detailed responses about financial products. Always mention specific fees, pros, cons, and hidden costs when available.`;

    let userMessage = message;
    if (hasDocument && fileName) {
      systemPrompt += `\n\nThe user has uploaded a document: "${fileName}". Analyze this document for potential risks, hidden clauses, and provide clear insights.`;
      userMessage = `I've uploaded a document called "${fileName}". ${message || 'Can you help me understand the key terms, risks, and any red flags in this document?'}`;
    }

    console.log('Using Groq API (free tier)...');

    // Using Groq API (free tier) instead of paid APIs
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer gsk_demo_key_for_testing', // Demo key for testing
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 1200,
        temperature: 0.7,
        top_p: 0.9,
      }),
    });

    if (!response.ok) {
      console.log('Groq API not available, using local knowledge base response');
      
      // Fallback to knowledge base response if API fails
      let fallbackResponse = "I'm ClauseWise, your financial companion! 😊\n\n";
      
      if (relevantInfo) {
        fallbackResponse += "Based on my knowledge base, here's what I found:\n";
        fallbackResponse += relevantInfo;
        fallbackResponse += "\n\n⚠️ Always read the fine print and consider consulting with a financial advisor for major decisions!";
      } else {
        // General financial advice based on the query
        if (searchQuery.includes('credit card')) {
          fallbackResponse += "🏦 Credit Card Tips:\n";
          fallbackResponse += "• Watch for annual fees ($0-$695+)\n";
          fallbackResponse += "• Check APR rates (15-29%)\n";
          fallbackResponse += "• Look for hidden fees: foreign transaction (0-3%), balance transfer (3-5%)\n";
          fallbackResponse += "• Understand reward structures and redemption options\n";
          fallbackResponse += "• Be aware of promotional rate expiration dates";
        } else if (searchQuery.includes('insurance')) {
          fallbackResponse += "🛡️ Insurance Guidelines:\n";
          fallbackResponse += "• Compare deductibles and coverage limits\n";
          fallbackResponse += "• Check for exclusions and waiting periods\n";
          fallbackResponse += "• Understand claim procedures and timelines\n";
          fallbackResponse += "• Look for auto-renewal clauses\n";
          fallbackResponse += "• Verify network providers (for health insurance)";
        } else if (searchQuery.includes('mutual fund')) {
          fallbackResponse += "📈 Mutual Fund Considerations:\n";
          fallbackResponse += "• Expense ratios (0.03%-2.00%)\n";
          fallbackResponse += "• Load fees (front-end, back-end)\n";
          fallbackResponse += "• Management fees and 12b-1 fees\n";
          fallbackResponse += "• Risk level and historical performance\n";
          fallbackResponse += "• Tax implications and turnover rates";
        } else {
          fallbackResponse += "I can help you understand:\n";
          fallbackResponse += "• Credit card terms and hidden fees\n";
          fallbackResponse += "• Health, auto, life, and travel insurance policies\n";
          fallbackResponse += "• Mutual fund costs and structures\n";
          fallbackResponse += "• Investment risks and terms\n\n";
          fallbackResponse += "What specific financial product would you like me to explain?";
        }
      }
      
      return new Response(JSON.stringify({ response: fallbackResponse }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    console.log('AI response generated successfully');

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat-analysis function:', error);
    
    const fallbackResponse = "I'm ClauseWise, your financial companion! 😊\n\nI can help you understand financial documents, insurance policies, and credit card terms. I have comprehensive information about:\n\n🏦 Credit Cards: American Express, Chase, Discover and their fees\n🛡️ Insurance: Health (HMO/PPO), Auto, Life, Travel policies\n📈 Investments: Mutual funds, index funds, and their costs\n\nWhat would you like me to explain about financial products or policies?";

    return new Response(JSON.stringify({ 
      error: error.message,
      response: fallbackResponse
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
