
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
    
    console.log('Processing request:', { message, hasDocument, fileName });

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

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
- Provide actionable insights and clear explanations`;

    let userMessage = message;
    if (hasDocument && fileName) {
      systemPrompt += `\n\nThe user has uploaded a document: "${fileName}". Analyze this document for potential risks, hidden clauses, and provide clear insights.`;
      userMessage = `I've uploaded a document called "${fileName}". ${message || 'Can you help me understand the key terms, risks, and any red flags in this document?'}`;
    }

    console.log('Calling OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
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
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from OpenAI');
    }

    console.log('AI response generated successfully');

    return new Response(JSON.stringify({ response: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-chat-analysis function:', error);
    
    const fallbackResponse = "I'm experiencing technical difficulties right now. Please try again in a moment. I'm here to help you understand financial documents, insurance policies, and credit card terms! 😊\n\nIn the meantime, feel free to ask me about:\n• Insurance policy terms\n• Credit card fees and conditions\n• Investment product risks\n• Financial jargon explanations";

    return new Response(JSON.stringify({ 
      error: error.message,
      response: fallbackResponse
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
