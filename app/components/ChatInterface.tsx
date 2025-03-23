"use client";

import { useState, useRef, useEffect } from 'react';
import { MicrophoneIcon, PaperAirplaneIcon, StopIcon } from '@heroicons/react/24/outline';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import axios from 'axios';
import { roles } from '../utils/roleConfig';
import type { Role } from '../types';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import { searchKnowledge } from '../utils/knowledgeBase';
import type { Message } from '../types';
import type { RoleConfig } from '../utils/roleConfig';

interface ChatInterfaceProps {
  selectedRole: Role;
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

export default function ChatInterface({ selectedRole }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
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

  const formatResponseByRole = (response: string, role: Role, source?: string): string => {
    if (response.includes('###') || response.includes('•')) {
      return response;
    }

    const cleanResponse = response.replace(/^[•*-]\s*/gm, '');
    
    switch (role) {
      case 'Technical Support Engineer':
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

      case 'Business Support Specialist':
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

      case 'Customer Support Representative':
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
  
  const processUserMessage = async (userMessage: string) => {
    try {
      setIsProcessing(true);
      
      // Add user message
      const userMessageObj: Message = {
        content: userMessage,
        role: selectedRole,
        type: 'user',
        id: Date.now().toString(),
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, userMessageObj]);

      // Call API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          role: selectedRole
        }),
      });

      if (!response.ok) {
        throw new Error(`API call failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.response) {
        throw new Error('Invalid response format from API');
      }

      // Add AI response
      const aiMessage: Message = {
        content: data.response,
        role: selectedRole,
        type: 'ai',
        source: data.source || 'AI Assistant',
        confidence: typeof data.confidence === 'number' ? data.confidence : 0.85,
        id: (Date.now() + 1).toString(),
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMessage]);
      
    } catch (error) {
      console.error('Error processing message:', error);
      
      // Add error message
      const errorMessage: Message = {
        content: 'Sorry, I encountered an error processing your request. Please try again.',
        role: selectedRole,
        type: 'error',
        id: (Date.now() + 1).toString(),
        timestamp: Date.now()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
    } finally {
      setIsProcessing(false);
      setInputMessage('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isProcessing) return;
    await processUserMessage(inputMessage.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
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
    if (message.type === 'user') return message.content;

    if (message.content.includes('###') || message.content.includes('•')) {
      return message.content;
    }

    return formatResponseByRole(
      message.content,
      message.role,
      message.source
    );
  };

  const roleConfig = roles[selectedRole];

  // Ensure roleConfig exists before rendering
  if (!roleConfig || typeof roleConfig.defaultMessage !== 'string') {
    console.error('Invalid role configuration:', selectedRole);
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-lg shadow-xl">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.type === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-xl p-4 shadow-md ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.type === 'error'
                  ? 'bg-red-500/10 text-red-200 border border-red-500/20'
                  : 'bg-slate-800 text-slate-100'
              }`}
            >
              <div className="prose prose-invert max-w-none">
                <ReactMarkdown components={markdownComponents}>
                  {formatMessage(message)}
                </ReactMarkdown>
              </div>
              
              {message.source && (
                <div className="mt-3 pt-2 border-t border-slate-700/50">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-blue-300">Source:</span> 
                    <span className="text-slate-300">{message.source}</span>
                    {message.confidence && (
                      <span className="bg-blue-500/20 px-2 py-1 rounded-full text-blue-200 text-xs">
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

      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-800 bg-slate-900/50 backdrop-blur">
        <div className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={roleConfig.defaultMessage}
            className="flex-1 p-3 bg-slate-800 text-slate-100 border border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !inputMessage.trim()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 font-medium shadow-lg shadow-blue-500/20"
          >
            {isProcessing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <PaperAirplaneIcon className="h-5 w-5" />
                Send
              </span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
} 