import { NextResponse } from 'next/server';

// Enterprise knowledge base for domain-specific responses
const knowledgeBase = {
  'report': {
    keywords: ['report', 'reports', 'reporting', 'analytics', 'sales report', 'monthly report'],
    response: 'To generate a monthly sales report in the IDMS ERP system, please follow these steps:\n\n1. Navigate to the Reports & Analytics module in the main dashboard\n2. Select "Sales Reports" from the category menu\n3. In the report parameters panel, choose "Monthly" from the time period dropdown\n4. Select the desired month and year using the calendar interface\n5. Click the "Generate Report" button\n\nThe report will be processed and displayed in the viewing panel. You can export it to Excel, PDF, or CSV format using the Export toolbar at the top right. For scheduled reports, use the "Schedule" button to set up automated delivery to relevant stakeholders.'
  },
  'login': {
    keywords: ['login', 'password', 'credentials', 'sign in', 'authentication', 'reset password', 'forgot password'],
    response: `To access the IDMS Enterprise ERP system, please use our secure login protocol:

1. Navigate to the login portal at https://erp.idmsinfotech.com
2. Enter your company ID in the designated field
3. Enter your username and password in the respective fields
4. Enable two-factor authentication if required by your organization
5. Click the "Sign In" button to proceed

If you've forgotten your password, click the "Password Recovery" link and follow the secure recovery process. For security purposes, your account will be temporarily locked after 5 unsuccessful login attempts. Should you require immediate assistance, please contact your system administrator or the IDMS Technical Support team at support@idmsinfotech.com.`
  },
  'inventory': {
    keywords: ['inventory', 'stock', 'warehousing', 'items', 'inventory management', 'stock levels', 'stock tracking'],
    response: 'The Inventory Management module in the IDMS Enterprise ERP system provides comprehensive tools for monitoring and optimizing your inventory operations:\n\n• Real-time tracking of stock levels across multiple warehouse locations\n• Automated reorder point notifications and purchase order generation\n• Batch and serial number tracking for regulatory compliance\n• Barcode and RFID integration for efficient inventory processing\n• Advanced forecasting algorithms to predict inventory needs\n\nTo access this module, select "Inventory Management" from the main dashboard. The system dashboard presents key metrics including current stock value, slow-moving items, and pending shipments. For detailed inventory reports, use the reporting section which offers customizable views of your inventory data with export capabilities to Excel and PDF formats.'
  },
  'security': {
    keywords: ['security', 'permissions', 'access control', 'roles', 'authorization', 'secure', 'compliance'],
    response: 'The IDMS ERP system implements enterprise-grade security protocols in accordance with ISO 27001 standards. Security administration is managed through the Security & Compliance module accessible to authorized administrators.\n\nKey security features include:\n\n• Role-based access control with fine-grained permissions\n• Multi-factor authentication support\n• Comprehensive audit logging of all system activities\n• Data encryption at rest and in transit\n• Compliance reporting for industry standards including GDPR, HIPAA, and SOX\n\nTo configure user roles and permissions, administrators should navigate to Administration → Security Management → Role Configuration. Each role can be customized with specific module and function-level permissions appropriate to job responsibilities, following the principle of least privilege.'
  },
  'integration': {
    keywords: ['integration', 'api', 'connect', 'third party', 'external system', 'data exchange', 'interface'],
    response: 'The IDMS Enterprise ERP system offers robust integration capabilities through our Enterprise Integration Framework (EIF). This allows seamless connectivity with third-party applications, business partners, and other enterprise systems.\n\nIntegration options include:\n\n• RESTful API endpoints with comprehensive documentation\n• SOAP web services for legacy system compatibility\n• Secure file-based integration using SFTP protocols\n• Real-time event-driven integration using message queues\n• Pre-built connectors for common business applications\n\nFor technical documentation on our API endpoints, please visit our developer portal at developer.idmsinfotech.com. For custom integration requirements, please contact our solutions team at integrations@idmsinfotech.com who can provide specialized guidance for your specific business needs.'
  },
  'help': {
    keywords: ['help', 'support', 'assistance', 'contact', 'troubleshoot', 'documentation'],
    response: 'The IDMS Enterprise ERP system offers multiple channels for support and assistance:\n\n• In-application Help Center: Access comprehensive documentation by clicking the "?" icon in the top navigation bar\n• Knowledge Base: Visit support.idmsinfotech.com for searchable articles and video tutorials\n• Technical Support: Contact our dedicated support team at +1-800-IDMS-HELP (436-7435)\n• Email Support: Submit detailed inquiries to support@idmsinfotech.com\n• Live Chat: Available during business hours (8:00 AM - 8:00 PM Eastern Time, Monday-Friday)\n\nFor urgent issues affecting business operations, please use our Priority Support option available to Enterprise tier customers. For feature requests or product feedback, please use the Feedback option in the Help menu to submit your suggestions directly to our product team.'
  }
};

export async function POST(request: Request) {
  try {
    const { message } = await request.json();
    
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request: message parameter is required' },
        { status: 400 }
      );
    }

    // Check if the message matches any knowledge base entries
    const lowerCaseMessage = message.toLowerCase();
    let response = null;
    
    for (const [key, entry] of Object.entries(knowledgeBase)) {
      if (entry.keywords.some(keyword => lowerCaseMessage.includes(keyword))) {
        response = entry.response;
        break;
      }
    }
    
    // If no match in knowledge base, use a professional fallback response
    // In a production implementation, this would call an external AI API like OpenAI
    if (!response) {
      response = `Thank you for your inquiry regarding "${message}". As the IDMS Enterprise Assistant, I'm here to provide information about our ERP system and its capabilities. For this specific query, I recommend consulting our comprehensive documentation in the Knowledge Base or reaching out to our technical support team at support@idmsinfotech.com for more detailed assistance tailored to your specific needs.`;
    }
    
    // Simulate processing delay for realism
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error processing chat request:', error);
    return NextResponse.json(
      { error: 'We apologize, but we encountered an unexpected error processing your request. Please try again or contact technical support if the issue persists.' },
      { status: 500 }
    );
  }
} 