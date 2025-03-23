import dataset from './dataset.json';

interface KnowledgeBaseResult {
  response: string;
  confidence: number;
  source: 'faq' | 'product' | 'support' | 'employee_kb' | 'company';
}

// Function to calculate string similarity using Levenshtein distance
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer.toLowerCase(), shorter.toLowerCase());
  return (longer.length - editDistance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));

  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;

  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }

  return matrix[str2.length][str1.length];
}

// Function to search FAQs
function searchFAQs(query: string): KnowledgeBaseResult | null {
  let bestMatch = null;
  let highestSimilarity = 0.6; // Threshold for minimum similarity

  for (const faq of dataset.faqs) {
    const similarity = calculateSimilarity(query, faq.question);
    if (similarity > highestSimilarity) {
      highestSimilarity = similarity;
      bestMatch = {
        response: faq.answer,
        confidence: similarity,
        source: 'faq' as const
      };
    }
  }

  return bestMatch;
}

// Function to search product information
function searchProducts(query: string): KnowledgeBaseResult | null {
  const queryLower = query.toLowerCase();
  let bestMatch = null;
  let highestSimilarity = 0.4; // Lower threshold for product matches

  for (const product of dataset.products) {
    // Check product name and description
    const nameMatch = calculateSimilarity(queryLower, product.name.toLowerCase());
    const descMatch = calculateSimilarity(queryLower, product.description.toLowerCase());
    
    // Also check if query contains product name exactly
    const exactNameMatch = queryLower.includes(product.name.toLowerCase());
    
    const similarity = Math.max(nameMatch, descMatch) + (exactNameMatch ? 0.3 : 0);
    
    if (similarity > highestSimilarity) {
      const response = `${product.name}: ${product.description}\n\nFeatures:\n${product.features.map(f => `• ${f}`).join('\n')}\n\nPricing:\n• Basic: ${product.pricing.basic}\n• Pro: ${product.pricing.pro}\n• Enterprise: ${product.pricing.enterprise}`;
      
      bestMatch = {
        response,
        confidence: similarity,
        source: 'product' as const
      };
      highestSimilarity = similarity;
    }
  }

  return bestMatch;
}

// Function to search support tickets
function searchSupportTickets(query: string): KnowledgeBaseResult | null {
  const queryLower = query.toLowerCase();
  let bestMatch = null;
  let highestSimilarity = 0.6;

  for (const ticket of dataset.support_tickets) {
    const similarity = calculateSimilarity(queryLower, ticket.issue.toLowerCase());
    
    if (similarity > highestSimilarity) {
      const response = `Similar Issue Found:\nIssue: ${ticket.issue}\nStatus: ${ticket.status}\nResolution: ${ticket.resolution}`;
      
      bestMatch = {
        response,
        confidence: similarity,
        source: 'support' as const
      };
      highestSimilarity = similarity;
    }
  }

  return bestMatch;
}

// Function to search employee knowledge base
function searchEmployeeKB(query: string): KnowledgeBaseResult | null {
  const queryLower = query.toLowerCase();
  let bestMatch = null;
  let highestSimilarity = 0.6;

  for (const kb of dataset.employee_knowledge_base) {
    const topicMatch = calculateSimilarity(queryLower, kb.topic.toLowerCase());
    const detailsMatch = calculateSimilarity(queryLower, kb.details.toLowerCase());
    
    const similarity = Math.max(topicMatch, detailsMatch);
    
    if (similarity > highestSimilarity) {
      bestMatch = {
        response: `${kb.topic}:\n${kb.details}`,
        confidence: similarity,
        source: 'employee_kb' as const
      };
      highestSimilarity = similarity;
    }
  }

  return bestMatch;
}

// Function to search company information
function searchCompanyInfo(query: string): KnowledgeBaseResult | null {
  const queryLower = query.toLowerCase();
  const companyInfo = dataset.company;
  let bestMatch = null;
  let highestSimilarity = 0.6;

  // Create a company description
  const companyDesc = `${companyInfo.name} is a ${companyInfo.industry} company founded in ${companyInfo.founded}, headquartered in ${companyInfo.headquarters}. We have ${companyInfo.employees} employees and serve ${companyInfo.clients.length} major clients.`;
  
  const similarity = calculateSimilarity(queryLower, companyDesc.toLowerCase());
  
  if (similarity > highestSimilarity) {
    bestMatch = {
      response: companyDesc,
      confidence: similarity,
      source: 'company' as const
    };
  }

  return bestMatch;
}

export async function searchKnowledgeBase(query: string): Promise<KnowledgeBaseResult | null> {
  // Search all sources
  const results = [
    searchFAQs(query),
    searchProducts(query),
    searchSupportTickets(query),
    searchEmployeeKB(query),
    searchCompanyInfo(query)
  ].filter(result => result !== null) as KnowledgeBaseResult[];

  // Return the result with highest confidence if any
  if (results.length > 0) {
    return results.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );
  }

  return null;
} 