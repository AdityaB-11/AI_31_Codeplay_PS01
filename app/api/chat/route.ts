import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';
import { searchKnowledge } from '@/app/utils/knowledgeBase';
import { Role } from '@/app/types';

interface KnowledgeResponse {
  found: boolean;
  response: string;
  source: string;
  confidence: number;
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" });

// Validate configuration
function validateConfig() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }
  return true;
}

// Format response based on role
function formatResponse(response: string, role: Role) {
  const confidence = 0.85; // AI response confidence score
  return {
    response,
    source: 'AI Assistant',
    confidence,
    role
  };
}

// Generate role-specific prompt
function generatePrompt(query: string, role: Role) {
  const basePrompt = `You are an AI Assistant specializing in ERP systems and business solutions. You're currently acting as a ${role}.

Context:
- You have access to information about our ERP system and its features
- You should provide detailed, professional responses
- Format responses in a clear, structured way
- Include specific features and benefits when relevant
- Maintain a professional, helpful tone

For product queries, structure your response as:
1. Brief Overview
2. Key Features
3. Benefits
4. Pricing (if applicable)
5. Next Steps

For technical queries, structure your response as:
1. Issue Analysis
2. Solution Steps
3. Technical Details
4. Prevention Tips

For general queries, provide:
1. Clear explanation
2. Relevant examples
3. Actionable recommendations

User Query: ${query}

Please provide a comprehensive, role-appropriate response:`;

  return basePrompt;
}

export async function POST(req: NextRequest) {
  try {
    validateConfig();
    
    const { message, role } = await req.json() as { message: string; role: Role };
    
    if (!message || !role) {
      return NextResponse.json({
        response: 'Message and role are required',
        source: 'System',
        confidence: 0,
        role: 'system'
      }, { status: 400 });
    }

    // First check knowledge base
    const kbResponse = await searchKnowledge(message);
    if (kbResponse.found) {
      return NextResponse.json({
        response: kbResponse.response,
        source: 'Knowledge Base',
        confidence: kbResponse.confidence,
        role
      });
    }

    // Use the pre-initialized model
    const prompt = generatePrompt(message, role);
    
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response?.text();
      
      if (!response) {
        return NextResponse.json({
          response: 'I apologize, but I received an empty response. Please try again.',
          source: 'System',
          confidence: 0,
          role: 'system'
        }, { status: 500 });
      }
      
      return NextResponse.json(formatResponse(response, role));
    } catch (aiError: any) {
      console.error('Gemini API error:', {
        message: aiError.message,
        details: aiError.details,
        stack: aiError.stack
      });
      
      let errorMessage = 'I apologize, but I encountered an error processing your request.';
      
      if (aiError.message?.includes('API key')) {
        errorMessage = 'There is an issue with the API configuration. Please check your API key.';
      } else if (aiError.message?.includes('model not found')) {
        errorMessage = 'The AI model is currently unavailable. Please try again later.';
      }

      return NextResponse.json({
        response: errorMessage,
        source: 'System',
        confidence: 0,
        role: 'system'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('Error processing request:', {
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json({
      response: 'I apologize, but I encountered an error processing your request. Please try again later.',
      source: 'System',
      confidence: 0,
      role: 'system'
    }, { status: 500 });
  }
} 