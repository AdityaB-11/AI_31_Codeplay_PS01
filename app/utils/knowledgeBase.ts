import dataset from './dataset.json';

interface KnowledgeResponse {
  found: boolean;
  response?: string;
  confidence: number;
  source: string;
}

export function searchKnowledge(query: string): KnowledgeResponse {
  const normalizedQuery = query.toLowerCase();
  
  // Check Products
  const productMatch = dataset.products.find(product =>
    product.name.toLowerCase().includes(normalizedQuery) ||
    product.description.toLowerCase().includes(normalizedQuery) ||
    product.features.some(feature => feature.toLowerCase().includes(normalizedQuery))
  );

  if (productMatch) {
    const response = [
      `${productMatch.name}: ${productMatch.description}`,
      '',
      'Features:',
      productMatch.features.map(feature => `• ${feature}`).join('\n'),
      '',
      'Pricing:',
      `• Basic: ${productMatch.pricing.basic}`,
      `• Pro: ${productMatch.pricing.pro}`,
      `• Enterprise: ${productMatch.pricing.enterprise}`
    ].join('\n');

    return {
      found: true,
      response,
      confidence: 0.95,
      source: 'Product Catalog'
    };
  }

  // Check FAQs
  const faqMatch = dataset.faqs.find(faq => 
    faq.question.toLowerCase().includes(normalizedQuery) ||
    faq.answer.toLowerCase().includes(normalizedQuery)
  );
  
  if (faqMatch) {
    return {
      found: true,
      response: [
        'Question:',
        faqMatch.question,
        '',
        'Answer:',
        faqMatch.answer
      ].join('\n'),
      confidence: 0.9,
      source: 'FAQ Database'
    };
  }

  // Check Support Tickets for similar issues
  const ticketMatch = dataset.support_tickets.find(ticket =>
    ticket.issue.toLowerCase().includes(normalizedQuery) &&
    ticket.status === 'Resolved'
  );

  if (ticketMatch) {
    return {
      found: true,
      response: [
        'Similar Issue Found:',
        `Problem: ${ticketMatch.issue}`,
        `Resolution: ${ticketMatch.resolution}`
      ].join('\n'),
      confidence: 0.7,
      source: 'Support History'
    };
  }

  // Check Employee Knowledge Base
  const knowledgeMatch = dataset.employee_knowledge_base.find(kb =>
    kb.topic.toLowerCase().includes(normalizedQuery) ||
    kb.details.toLowerCase().includes(normalizedQuery)
  );

  if (knowledgeMatch) {
    return {
      found: true,
      response: [
        knowledgeMatch.topic,
        '',
        knowledgeMatch.details
      ].join('\n'),
      confidence: 0.8,
      source: 'Internal Knowledge Base'
    };
  }

  // No match found in knowledge base
  return {
    found: false,
    confidence: 0,
    source: 'No matching knowledge found'
  };
} 