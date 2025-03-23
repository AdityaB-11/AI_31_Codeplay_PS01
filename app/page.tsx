"use client";

import { useState, useEffect } from 'react';
import type { Role, Message } from './types';
import AvatarDisplay from './components/AvatarDisplay';
import ChatInterface from './components/ChatInterface';
import Header from './components/Header';
import { roles } from './utils/roleConfig';
import { createChatSession, saveChatMessage, ChatMessage, ChatSession } from './utils/supabaseClient';

export default function Home() {
  const [selectedRole, setSelectedRole] = useState<Role>('Business Support Specialist');
  const [messages, setMessages] = useState<Message[]>([
    {
      type: 'ai',
      content: `Welcome! I'm your ${roles['Business Support Specialist'].title}. How can I help optimize your business processes today?`,
      source: 'system',
      confidence: 1.0,
      role: 'Business Support Specialist'
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  // Initialize chat session
  useEffect(() => {
    const initSession = async () => {
      try {
        setSessionError(null);
        const tempUserId = `temp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        console.log('Initializing session for user:', tempUserId);
        
        const session = await createChatSession(tempUserId, 'New Chat');
        
        if (!session) {
          const error = 'Failed to create chat session. Please refresh the page to try again.';
          console.error(error);
          setSessionError(error);
          return;
        }
        
        console.log('Session initialized:', session);
        setCurrentSession(session);
        
        // Add welcome message based on selected role
        const welcomeMessage: Message = {
          type: 'ai',
          content: `Welcome! I'm your ${roles[selectedRole].title}. How can I help you today?`,
          source: 'system',
          confidence: 1.0,
          role: selectedRole
        };
        setMessages([welcomeMessage]);
        
      } catch (error) {
        const errorMsg = 'Error initializing chat session. Please refresh the page.';
        console.error(errorMsg, error);
        setSessionError(errorMsg);
      }
    };

    initSession();
  }, [selectedRole]);

  const handleSendMessage = (message: Message) => {
    setMessages(prev => [...prev, message]);
  };

  const handleRoleChange = (role: Role) => {
    setSelectedRole(role);
    // Add welcome message for new role
    setMessages([
      {
        type: 'ai',
        content: `Welcome! I'm your ${roles[role].title}. How can I help you today?`,
        source: 'system',
        confidence: 1.0,
        role: role
      }
    ]);
  };

  // Show error message if session initialization fails
  if (sessionError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 p-6 flex items-center justify-center">
        <div className="bg-red-900/20 backdrop-blur-sm border border-red-800/30 rounded-lg p-6 max-w-md w-full">
          <h3 className="text-red-300 font-medium mb-2">Connection Error</h3>
          <p className="text-gray-300 text-sm">{sessionError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto">
        <Header selectedRole={selectedRole} onRoleChange={handleRoleChange} />
        
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AvatarDisplay 
              selectedRole={selectedRole}
              isProcessing={isProcessing}
              currentMessage={messages[messages.length - 1] || null}
            />
          </div>
          
          <div className="lg:col-span-2">
            <ChatInterface 
              selectedRole={selectedRole}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
