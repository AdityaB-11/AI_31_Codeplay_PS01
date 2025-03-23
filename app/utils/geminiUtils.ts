import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

if (!process.env.GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Get the generative model without version arguments
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-pro" });

interface GeminiError extends Error {
  message: string;
  code?: string;
  details?: any;
}

export async function generateGeminiResponse(prompt: string): Promise<string> {
  try {
    // Input validation
    if (!prompt || typeof prompt !== 'string') {
      throw new Error('Invalid prompt: Must be a non-empty string');
    }

    // Generate content using Gemini with safety settings
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });
    
    // Check if we have a valid response
    if (!result) {
      console.error('Empty result from Gemini API');
      throw new Error('Empty response from Gemini API');
    }

    const response = await result.response;
    if (!response) {
      console.error('No response object in Gemini result');
      throw new Error('Invalid response from Gemini API');
    }

    const text = response.text();
    if (!text) {
      console.error('Empty text in Gemini response');
      throw new Error('Empty text from Gemini API');
    }

    // Log successful response for debugging
    console.log('Gemini API Response:', {
      promptLength: prompt.length,
      responseLength: text.length,
      status: 'success'
    });

    return text;

  } catch (error) {
    // Handle specific error types
    const err = error as GeminiError;
    
    // Log the error with details for debugging
    console.error('Gemini API Error:', {
      message: err.message,
      code: err.code,
      details: err.details
    });

    // Return user-friendly error messages based on error type
    if (err.message?.includes('API key')) {
      console.error('API Key error:', err);
      return "There's an issue with the API configuration. Please contact support.";
    }
    
    if (err.code === 'INVALID_ARGUMENT') {
      return "I couldn't process your request due to invalid input. Please try rephrasing your question.";
    } else if (err.code === 'RESOURCE_EXHAUSTED') {
      return "I'm currently experiencing high demand. Please try again in a moment.";
    } else if (err.code === 'PERMISSION_DENIED') {
      return "I'm having trouble accessing the required services. Please contact support if this persists.";
    } else if (err.code === 'FAILED_PRECONDITION') {
      return "The system is currently unavailable. Please try again later.";
    }

    // Default error message
    return "I apologize, but I encountered an error while processing your request. Please try again or contact support if the issue persists.";
  }
} 