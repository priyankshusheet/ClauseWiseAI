
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const API_KEY = Deno.env.get('XAI_API_KEY');
const API_ENDPOINT = 'https://api.x.ai/v1/chat/completions';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

const financialKnowledge = {
  creditCards: {
    'american express gold': {
      fees: { annual: 250, foreign: 0 },
      apr: '21.24% - 27.24%',
      rewards: '4x points on dining and groceries',
      benefits: ['Airport lounge access', 'Travel insurance', 'Purchase protection'],
      risks: ['High annual fee', 'No preset spending limit may affect credit utilization']
    },
    'american express platinum': {
      fees: { annual: 695, foreign: 0 },
      apr: '21.24% - 27.24%',
      rewards: '5x points on flights and hotels',
      benefits: ['Premium airport lounge access', 'Hotel status', 'Concierge service'],
      risks: ['Very high annual fee', 'Benefits require travel to maximize value']
    },
    'chase sapphire preferred': {
      fees: { annual: 95, foreign: 0 },
      apr: '18.24% - 25.24%',
      rewards: '2x points on travel and dining',
      benefits: ['Travel insurance', 'Purchase protection', 'Extended warranty'],
      risks: ['Annual fee', 'Points best used for travel']
    }
  },
  insurance: {
    health: {
      hmo: {
        costs: 'Lower premiums, higher out-of-pocket',
        network: 'Restricted to specific providers',
        referrals: 'Required for specialists',
        pros: ['Lower monthly costs', 'Preventive care covered'],
        cons: ['Limited provider choice', 'Referral requirements']
      },
      ppo: {
        costs: 'Higher premiums, lower out-of-pocket',
        network: 'Broader provider network',
        referrals: 'Not required',
        pros: ['Provider flexibility', 'No referrals needed'],
        cons: ['Higher monthly premiums', 'Higher out-of-network costs']
      }
    },
    auto: {
      liability: {
        coverage: 'Covers damage to others',
        cost: 'Lower premiums',
        pros: ['Legally required minimum', 'Affordable'],
        cons: ['No coverage for your vehicle', 'Limited protection']
      },
      comprehensive: {
        coverage: 'Covers your vehicle and others',
        cost: 'Higher premiums',
        pros: ['Full protection', 'Peace of mind'],
        cons: ['Higher cost', 'Deductibles apply']
      }
    }
  }
};

const searchKnowledge = (query: string) => {
  const lowerQuery = query.toLowerCase();
  const results = [];
  
  // Search credit cards
  for (const [cardName, details] of Object.entries(financialKnowledge.creditCards)) {
    if (lowerQuery.includes(cardName.toLowerCase()) || 
        lowerQuery.includes('credit card') || 
        lowerQuery.includes('amex') || 
        lowerQuery.includes('american express')) {
      results.push(`${cardName}: Annual fee $${details.fees.annual}, APR ${details.apr}, Rewards: ${details.rewards}`);
    }
  }
  
  // Search insurance
  if (lowerQuery.includes('insurance') || lowerQuery.includes('health') || lowerQuery.includes('auto')) {
    for (const [type, products] of Object.entries(financialKnowledge.insurance)) {
      for (const [product, details] of Object.entries(products)) {
        if (lowerQuery.includes(type) || lowerQuery.includes(product)) {
          results.push(`${type} ${product}: ${details.costs}, Pros: ${details.pros?.join(', ')}, Cons: ${details.cons?.join(', ')}`);
        }
      }
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
      knowledgeContext = `\n\nRelevant information from database:\n${knowledgeResults.join('\n')}`;
    }

    const systemPrompt = `You are a financial document analysis expert. Help users understand credit cards, insurance policies, and financial terms. 
    
    Focus on:
    - Hidden fees and charges
    - Auto-renewal clauses  
    - Penalty terms
    - Coverage limitations
    - Consumer protection advice
    
    Provide clear, actionable insights.${knowledgeContext}`;

    const userPrompt = hasDocument 
      ? `I've uploaded a document: "${fileName}". ${message}` 
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
    let fallbackResponse = "I'm here to help with financial document analysis. ";
    
    if (knowledgeResults.length > 0) {
      fallbackResponse += `Based on your query, here's what I found:\n\n${knowledgeResults.join('\n\n')}\n\n`;
    }
    
    if (hasDocument) {
      fallbackResponse += `Regarding your uploaded document "${fileName}", I recommend reviewing these key areas:
      
      • Check for automatic renewal clauses
      • Look for hidden fees or charges
      • Review cancellation policies
      • Understand penalty terms
      • Verify coverage limitations
      
      Would you like me to explain any specific terms or clauses?`;
    } else {
      fallbackResponse += `I can help you understand:
      
      • Credit card terms and fees
      • Insurance policy details
      • Financial document analysis
      • Hidden clauses and risks
      
      What specific questions do you have?`;
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
