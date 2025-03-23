import { KnowledgeResponse } from '../types';
import dataset from './dataset.json';

// Helper function to calculate string similarity
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  
  // Check for exact substring match
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.9;
  }
  
  // Calculate word overlap
  const words1 = new Set(s1.split(/\s+/));
  const words2 = new Set(s2.split(/\s+/));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

// Search products in dataset
function searchProducts(query: string): KnowledgeResponse | null {
  const threshold = 0.3; // Lower threshold for product matches
  let bestMatch = null;
  let highestScore = threshold;

  for (const product of dataset.products) {
    // Check product name and description
    const nameMatch = calculateSimilarity(query, product.name);
    const descMatch = calculateSimilarity(query, product.description);
    const score = Math.max(nameMatch, descMatch);

    if (score > highestScore) {
      const response = `${product.name}:
${product.description}

Key Features:
${product.features.map(f => `• ${f}`).join('\n')}

Pricing:
• Basic: ${product.pricing.basic}
• Pro: ${product.pricing.pro}
• Enterprise: ${product.pricing.enterprise}`;

      bestMatch = {
        found: true,
        response,
        source: 'Product Catalog',
        confidence: score
      };
      highestScore = score;
    }
  }

  return bestMatch;
}

// Search FAQs in dataset
function searchFAQs(query: string): KnowledgeResponse | null {
  const threshold = 0.4;
  let bestMatch = null;
  let highestScore = threshold;

  for (const faq of dataset.faqs) {
    const score = calculateSimilarity(query, faq.question);
    
    if (score > highestScore) {
      bestMatch = {
        found: true,
        response: faq.answer,
        source: 'FAQ Database',
        confidence: score
      };
      highestScore = score;
    }
  }

  return bestMatch;
}

// Search support tickets in dataset
function searchSupportTickets(query: string): KnowledgeResponse | null {
  const threshold = 0.4;
  let bestMatch = null;
  let highestScore = threshold;

  for (const ticket of dataset.support_tickets) {
    const score = calculateSimilarity(query, ticket.issue);
    
    if (score > highestScore) {
      const response = `Similar Issue Found:
Issue: ${ticket.issue}
Status: ${ticket.status}
Resolution: ${ticket.resolution}`;

      bestMatch = {
        found: true,
        response,
        source: 'Support History',
        confidence: score
      };
      highestScore = score;
    }
  }

  return bestMatch;
}

// Search employee knowledge base
function searchEmployeeKB(query: string): KnowledgeResponse | null {
  const threshold = 0.4;
  let bestMatch = null;
  let highestScore = threshold;

  for (const kb of dataset.employee_knowledge_base) {
    const topicMatch = calculateSimilarity(query, kb.topic);
    const detailsMatch = calculateSimilarity(query, kb.details);
    const score = Math.max(topicMatch, detailsMatch);
    
    if (score > highestScore) {
      const response = `${kb.topic}:\n${kb.details}`;
      
      bestMatch = {
        found: true,
        response,
        source: 'Employee Knowledge Base',
        confidence: score
      };
      highestScore = score;
    }
  }

  return bestMatch;
}

// Search company information
function searchCompanyInfo(query: string): KnowledgeResponse | null {
  const threshold = 0.3;
  const companyTerms = ['company', 'about', 'organization', 'business', 'enterprise'];
  
  // Check if query is about company information
  const isCompanyQuery = companyTerms.some(term => 
    query.toLowerCase().includes(term)
  );

  if (isCompanyQuery) {
    const company = dataset.company;
    const response = `About ${company.name}:
• Industry: ${company.industry}
• Headquarters: ${company.headquarters}
• Founded: ${company.founded}
• Employees: ${company.employees}
• Major Clients: ${company.clients.slice(0, 5).join(', ')} and ${company.clients.length - 5} more`;

    return {
      found: true,
      response,
      source: 'Company Information',
      confidence: 0.9
    };
  }

  return null;
}

export async function searchKnowledge(query: string): Promise<KnowledgeResponse> {
  // Search all sources
  const results = [
    searchProducts(query),
    searchFAQs(query),
    searchSupportTickets(query),
    searchEmployeeKB(query),
    searchCompanyInfo(query)
  ].filter(result => result !== null) as KnowledgeResponse[];

  // Return the result with highest confidence if any
  if (results.length > 0) {
    return results.reduce((best, current) => 
      (current.confidence || 0) > (best.confidence || 0) ? current : best
    );
  }

  // No matches found
  return {
    found: false,
    response: '',
    source: '',
    confidence: 0
  };
} 