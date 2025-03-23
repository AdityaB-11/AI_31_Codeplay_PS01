export type Role = 'Business Support Specialist' | 'Technical Support Engineer' | 'Customer Support Representative';

export type MessageType = 'user' | 'ai' | 'error';

export interface Message {
  content: string;
  role: Role;
  type: MessageType;
  source?: string;
  confidence?: number;
  id?: string;
  timestamp?: number;
}

export interface KnowledgeResponse {
  found: boolean;
  response?: string;
  source?: string;
  confidence?: number;
} 