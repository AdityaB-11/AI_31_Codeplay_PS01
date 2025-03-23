"use client";

import { useState, useRef, useEffect } from 'react';
import { MicrophoneIcon, PaperAirplaneIcon, StopIcon } from '@heroicons/react/24/outline';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import axios from 'axios';
import { Role, roles } from '../utils/roleConfig';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { searchKnowledge } from '../utils/knowledgeBase';

interface Message {
  type: 'user' | 'ai';
  content: string;
  source?: string;
  confidence?: number;
}

interface ChatInterfaceProps {
  selectedRole: string;
  messages: Message[];
  onSendMessage: (message: string | Message) => void;
  isProcessing?: boolean;
}

const markdownComponents: Partial<Components> = {
  h1: ({ node, ...props }) => (
    <h1 className="text-xl font-bold mb-4 text-blue-300" {...props} />
  ),
  h2: ({ node, ...props }) => (
    <h2 className="text-lg font-semibold mb-3 text-blue-200" {...props} />
  ),
  h3: ({ node, ...props }) => (
    <h3 className="text-base font-medium mb-2 text-blue-100" {...props} />
  ),
  ul: ({ node, ...props }) => (
    <ul className="list-disc list-inside mb-4 space-y-1" {...props} />
  ),
  ol: ({ node, ...props }) => (
    <ol className="list-decimal list-inside mb-4 space-y-1" {...props} />
  ),
  li: ({ node, ...props }) => (
    <li className="text-gray-200" {...props} />
  ),
  code: ({ node, ...props }) => (
    <code className="bg-slate-800 px-1.5 py-0.5 rounded text-blue-300 text-sm" {...props} />
  ),
  pre: ({ node, ...props }) => (
    <pre className="bg-slate-800/50 p-3 rounded-lg mb-4 overflow-x-auto" {...props} />
  ),
  p: ({ node, ...props }) => (
    <p className="mb-3 last:mb-0" {...props} />
  ),
  blockquote: ({ node, ...props }) => (
    <blockquote className="border-l-4 border-blue-500 pl-4 italic mb-4" {...props} />
  ),
  a: ({ node, ...props }) => (
    <a 
      className="text-blue-400 hover:text-blue-300 underline" 
      target="_blank" 
      rel="noopener noreferrer"
      {...props}
    />
  ),
};

export default function ChatInterface({ 
  selectedRole, 
  messages, 
  onSendMessage,
  isProcessing: parentIsProcessing 
}: ChatInterfaceProps) {
  const [inputMessage, setInputMessage] = useState('');
  const [localIsProcessing, setLocalIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Use parent isProcessing if provided, otherwise use local state
  const isProcessing = parentIsProcessing ?? localIsProcessing;

  const { 
    transcript, 
    isListening, 
    startListening, 
    stopListening, 
    error: speechError 
  } = useSpeechRecognition();
  
  // Update input value when transcript changes
  useEffect(() => {
    if (transcript) {
      setInputMessage(transcript);
    }
  }, [transcript]);
  
  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input field when component mounts and after sending a message
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages.length]);

  const currentRole = roles[selectedRole];
  
  const formatResponseByRole = (response: string, role: Role, source?: string): string => {
    // Don't format if already formatted
    if (response.includes('###') || response.includes('•')) {
      return response;
    }

    // Clean up any existing bullet points for consistent formatting
    const cleanResponse = response.replace(/^[•*-]\s*/gm, '');
    
    switch (role) {
      case 'technical':
        if (source === 'Support History') {
          return [
            '### Issue Analysis',
            '',
            cleanResponse,
            '',
            '### Prevention Tips',
            '• Document the solution in your team\'s knowledge base',
            '• Consider adding monitoring for similar issues',
            '• Review and update related documentation'
          ].join('\n');
        }
        return [
          '### Technical Details',
          '',
          cleanResponse,
          '',
          '### Additional Resources',
          '• Check our developer documentation for code examples',
          '• Join our technical community for more discussions',
          '• Contact our dev support team for advanced assistance'
        ].join('\n');

      case 'business':
        return [
          '### Business Overview',
          '',
          cleanResponse,
          '',
          '### Key Benefits',
          '• Improved operational efficiency',
          '• Cost-effective solution',
          '• Scalable for business growth',
          '',
          '### Next Steps',
          '• Schedule a demo for detailed walkthrough',
          '• Review pricing and ROI calculator',
          '• Connect with our business solutions team'
        ].join('\n');

      case 'customer':
      default:
        return [
          '### Solution',
          '',
          cleanResponse,
          '',
          '### Need More Help?',
          '• Contact our 24/7 support team',
          '• Visit our help center for tutorials',
          '• Join our community forum'
        ].join('\n');
    }
  };
  
  const processUserMessage = async (message: string) => {
    if (!message) return;
    
    try {
      setLocalIsProcessing(true);
      
      // Add the user's message first
      onSendMessage({
        type: 'user',
        content: message
      });

      // First check knowledge base
      const kbResponse = searchKnowledge(message);
      
      if (kbResponse.found && kbResponse.response) {
        // Add slight delay for natural feel
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const formattedResponse = formatResponseByRole(
          kbResponse.response,
          roles[selectedRole].id,
          kbResponse.source
        );
        
        onSendMessage({
          type: 'ai',
          content: formattedResponse,
          source: kbResponse.source,
          confidence: kbResponse.confidence
        });
        
        setLocalIsProcessing(false);
        return;
      }

      // If no knowledge base match, use AI service
      try {
        const response = await axios.post('/api/chat', {
          message,
          role: roles[selectedRole].id,
          context: {
            products: ['Nimbus Core', 'Nimbus Finance', 'Nimbus HR', 'Nimbus SCM', 'Nimbus CRM'],
            currentRole: roles[selectedRole].title
          }
        });

        if (response?.data?.message) {
          const formattedResponse = formatResponseByRole(
            response.data.message,
            roles[selectedRole].id,
            response.data.source || 'AI Assistant'
          );

          onSendMessage({
            type: 'ai',
            content: formattedResponse,
            source: response.data.source || 'AI Assistant',
            confidence: response.data.confidence || 0.85
          });
        } else if (response?.data?.error) {
          // Handle specific error messages from the API
          const errorMessage = response.data.error;
          const formattedError = formatResponseByRole(
            errorMessage,
            roles[selectedRole].id,
            'Error'
          );

          onSendMessage({
            type: 'ai',
            content: formattedError,
            source: 'Error',
            confidence: 0
          });
        } else {
          throw new Error('Invalid response format from AI service');
        }
      } catch (aiError: any) {
        console.error('AI service error:', aiError);
        
        // Try to find partial matches in knowledge base
        const keywords = message.toLowerCase().split(' ')
          .filter(word => word.length > 3)
          .slice(0, 3)
          .join(' ');
        
        const fallbackResponse = searchKnowledge(keywords);
        
        if (fallbackResponse.found && fallbackResponse.response) {
          const formattedResponse = formatResponseByRole(
            fallbackResponse.response,
            roles[selectedRole].id,
            'Knowledge Base'
          );

          onSendMessage({
            type: 'ai',
            content: formattedResponse,
            source: 'Knowledge Base',
            confidence: 0.95
          });
        } else {
          // Use role-specific error messages
          const errorResponse = roles[selectedRole].id === 'technical' 
            ? 'Technical Support: I apologize, but I\'m experiencing connectivity issues. Please try again shortly, or check our technical documentation.'
            : roles[selectedRole].id === 'business'
            ? 'Business Support: I apologize, but I\'m temporarily unable to process your request. Please try again soon, or contact our business solutions team.'
            : 'Customer Support: I apologize, but I\'m having trouble processing your request. Please try again shortly, or contact our support team.';

          const formattedError = formatResponseByRole(
            errorResponse,
            roles[selectedRole].id,
            'System'
          );

          onSendMessage({
            type: 'ai',
            content: formattedError,
            source: 'System',
            confidence: 0.5
          });
        }
      }

    } catch (error) {
      console.error('Error processing message:', error);
      const errorMessage = "I apologize, but I encountered an unexpected error. Please try again or contact our support team if the issue persists.";
      
      const formattedError = formatResponseByRole(
        errorMessage,
        roles[selectedRole].id,
        'Error'
      );

      onSendMessage({
        type: 'ai',
        content: formattedError,
        source: 'Error',
        confidence: 0
      });
    } finally {
      setLocalIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage || isProcessing) return;
    
    const trimmedMessage = inputMessage.trim();
    if (trimmedMessage) {
      processUserMessage(trimmedMessage);
      setInputMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const toggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const formatMessage = (message: Message) => {
    // For user messages, just return the content
    if (message.type === 'user') return message.content;

    // For AI messages, check if it's already formatted
    if (message.content.includes('###') || message.content.includes('•')) {
      return message.content;
    }

    const currentRole = roles[selectedRole];
    if (!currentRole) return message.content;

    return formatResponseByRole(message.content, currentRole.id, message.source);
  };

  return (
    <div className="bg-gradient-to-b from-slate-800 to-slate-900 rounded-lg shadow-xl flex flex-col h-[600px]">
      {/* Messages container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-100'
              }`}
            >
              <div className="prose prose-invert max-w-none text-sm">
                <ReactMarkdown components={markdownComponents}>
                  {formatMessage(message)}
                </ReactMarkdown>
              </div>
              
              {message.source && (
                <div className="mt-2 text-xs opacity-70 border-t border-gray-600 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-300">Source:</span> 
                    <span>{message.source}</span>
                    {message.confidence && (
                      <span className="bg-blue-900/30 px-2 py-0.5 rounded-full text-blue-300">
                        {Math.round(message.confidence * 100)}% confidence
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask NimbusERP Assistant..."
            className={`w-full bg-slate-700 text-white rounded-lg pl-4 pr-24 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
              isProcessing ? 'opacity-50' : ''
            }`}
            rows={2}
            disabled={isProcessing}
          />
          <div className="absolute right-2 bottom-2 flex items-center gap-2">
            <button
              type="button"
              onClick={toggleRecording}
              className={`rounded-lg p-2 ${
                isListening 
                  ? 'text-red-500 hover:text-red-400' 
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              disabled={isProcessing}
            >
              {isListening ? (
                <StopIcon className="h-6 w-6" />
              ) : (
                <MicrophoneIcon className="h-6 w-6" />
              )}
            </button>
            <button
              type="submit"
              className={`rounded-lg p-2 ${
                !inputMessage.trim() || isProcessing
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-blue-500 hover:text-blue-400'
              }`}
              disabled={!inputMessage.trim() || isProcessing}
            >
              <PaperAirplaneIcon className="h-6 w-6" />
            </button>
          </div>
        </div>
        {isProcessing && (
          <div className="mt-2 text-sm text-blue-400 animate-pulse">
            Processing your request...
          </div>
        )}
      </form>
    </div>
  );
} 