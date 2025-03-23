import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini Pro
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Knowledge base search function
const searchKnowledgeBase = (query: string) => {
  const normalizedQuery = query.toLowerCase();
  
  // Product information
  const products = {
    'nimbus core': {
      name: 'Nimbus Core',
      description: 'Comprehensive ERP solution for businesses of all sizes',
      features: [
        'Accounting',
        'Inventory Management',
        'HR & Payroll',
        'CRM',
        'Supply Chain Management',
        'Analytics & Reporting',
        'Workflow Automation',
        'Multi-Location Support',
        'AI-powered Insights',
        'Custom Workflows',
        'Mobile App Support',
        'Cloud Hosting'
      ],
      pricing: {
        basic: '$49/user/month',
        pro: '$99/user/month',
        enterprise: 'Custom pricing'
      }
    },
    'nimbus finance': {
      name: 'Nimbus Finance',
      description: 'Advanced financial planning and reporting tool',
      features: [
        'Budgeting',
        'Forecasting',
        'Tax Compliance',
        'Expense Management',
        'Multi-Currency Support',
        'Financial Risk Analysis',
        'Automated Billing',
        'Investment Tracking',
        'Invoice Management'
      ],
      pricing: {
        basic: '$29/user/month',
        pro: '$59/user/month',
        enterprise: 'Custom pricing'
      }
    }
  };

  // Check for product matches
  for (const [key, product] of Object.entries(products)) {
    if (normalizedQuery.includes(key)) {
      const response = `${product.name}: ${product.description}

Features:
${product.features.map(f => `• ${f}`).join('\n')}

Pricing:
• Basic: ${product.pricing.basic}
• Pro: ${product.pricing.pro}
• Enterprise: ${product.pricing.enterprise}`;

      return {
        found: true,
        response,
        source: 'Product Catalog',
        confidence: 0.95
      };
    }
  }

  // Check for IDMS-related queries
  if (normalizedQuery.includes('idms')) {
    const response = `IDMS Enterprise ERP is a comprehensive business management solution that offers:

Key Features:
• Integrated Modules for Finance, HR, and Operations
• Real-time Analytics and Reporting
• Role-based Access Control
• Multi-location Support
• Customizable Workflows
• Mobile Access
• Cloud and On-premise Deployment Options

Security Features:
• ISO 27001 Certified
• Multi-factor Authentication
• Data Encryption
• Audit Logging
• Compliance Management

Integration Capabilities:
• RESTful API Support
• Pre-built Connectors
• Custom Integration Options
• Real-time Data Sync

Support Options:
• 24/7 Technical Support
• Comprehensive Documentation
• Training Programs
• Regular Updates and Maintenance`;

    return {
      found: true,
      response,
      source: 'Enterprise Systems',
      confidence: 0.9
    };
  }

  return {
    found: false,
    response: '',
    source: '',
    confidence: 0
  };
};

export async function POST(req: Request) {
  try {
    const { message, role, context } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // First check knowledge base
    const kbResponse = searchKnowledgeBase(message);
    
    if (kbResponse.found) {
      return NextResponse.json({ 
        message: kbResponse.response,
        source: kbResponse.source,
        confidence: kbResponse.confidence
      });
    }

    // If no knowledge base match, use Gemini
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

      // Build prompt with context and examples
      const prompt = `You are creating a professional 30-second video pitch script for NimbusERP, a comprehensive enterprise resource planning solution.

      Key Products:
      - Nimbus Core: Comprehensive ERP solution with features like Accounting, HR, CRM, and Analytics
      - Nimbus Finance: Advanced financial planning tool with Budgeting, Forecasting, and Tax Compliance
      
      Target Audience: Business decision-makers and enterprise customers
      
      Please write an engaging, professional video pitch script that:
      1. Hooks the viewer in the first 5 seconds
      2. Highlights our key value propositions
      3. Showcases our main products
      4. Ends with a clear call to action
      
      Format the response as a video script with [Visual] and [Voiceover] sections.
      Keep it concise, professional, and impactful.
      Focus on business value and transformation.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Empty response from Gemini');
      }

      return NextResponse.json({ 
        message: text,
        source: 'AI Assistant',
        confidence: 0.85
      });

    } catch (aiError) {
      console.error('Gemini API error:', aiError);
      
      // Return a role-specific error message
      const errorMessage = role === 'technical' 
        ? 'Technical Support: I apologize, but I\'m experiencing connectivity issues with our AI service. Please try again shortly, or consult our technical documentation.'
        : role === 'business'
        ? 'Business Support: I apologize, but I\'m temporarily unable to access our AI service. Please try again soon, or contact our business solutions team.'
        : 'Customer Support: I apologize, but I\'m having trouble processing your request. Please try again shortly, or contact our support team.';

      return NextResponse.json({ 
        message: errorMessage,
        source: 'System',
        confidence: 0.5
      }, { status: 200 });
    }
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
} 