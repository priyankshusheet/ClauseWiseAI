
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, hasDocument, fileName } = await req.json();

    let systemPrompt = `You are ClauseWise, an AI financial companion specialized in explaining complex financial documents, insurance policies, credit card terms, and legal jargon in simple, easy-to-understand language. 

Key guidelines:
- Explain complex financial terms in simple language
- Highlight potential risks, hidden fees, and important clauses
- Be friendly but professional
- Use emojis occasionally to make responses engaging
- Focus on consumer protection and financial literacy
- When analyzing documents, provide specific warnings about auto-renewal, penalties, and exclusions
- Always encourage users to read full documents and consult professionals for major decisions`;

    let userMessage = message;
    if (hasDocument) {
      systemPrompt += `\n\nThe user has uploaded a document: "${fileName}". Provide analysis and insights based on what they're asking about this document.`;
      userMessage = `I've uploaded a document called "${fileName}". ${message || 'Can you help me understand the key terms and any potential risks?'}`;
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat-analysis function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to process request',
      response: "I'm having trouble processing your request right now. Please try asking me about financial terms, insurance policies, or credit card agreements - I'm here to help explain complex financial language! 😊"
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
