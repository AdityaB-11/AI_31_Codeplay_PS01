"use client";

import { useState } from 'react';
import axios from 'axios';
import AvatarDisplay from './components/AvatarDisplay';
import ChatInterface from './components/ChatInterface';
import Header from './components/Header';
import { speakText } from './utils/speechUtils';

export default function Home() {
  const [messages, setMessages] = useState<Array<{type: 'user' | 'ai', content: string}>>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('default');
  const [isSpeechEnabled, setIsSpeechEnabled] = useState(true);

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isProcessing) return;
    
    // Add user message to chat
    setMessages(prev => [...prev, { type: 'user', content: message }]);
    setIsProcessing(true);
    
    try {
      // Simulate local response while waiting for API
      let apiResponse;
      
      // Use a timeout to ensure we respond even if the API is slow
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 5000);
      });
      
      try {
        // Race between API call and timeout
        apiResponse = await Promise.race([
          axios.post('/api/chat', { message }),
          timeoutPromise
        ]);
        
        const aiResponse = apiResponse.data.response;
        
        // Add AI response to chat
        setMessages(prev => [...prev, { type: 'ai', content: aiResponse }]);
        
        // Use browser's speech synthesis for the response if enabled
        if (isSpeechEnabled && typeof window !== 'undefined') {
          speakText(aiResponse);
        }
      } catch (apiError) {
        console.error("API error:", apiError);
        
        // If API fails, use a fallback response
        const fallbackResponse = "I'm sorry, I couldn't process your request at the moment. This might be due to network issues or server load. Could you please try again in a moment?";
        
        setMessages(prev => [...prev, { 
          type: 'ai', 
          content: fallbackResponse
        }]);
        
        if (isSpeechEnabled && typeof window !== 'undefined') {
          speakText(fallbackResponse);
        }
      }
    } catch (error) {
      console.error("Error processing message:", error);
      const errorMessage = 'I apologize, but I encountered an error while processing your request. Please try again or contact your system administrator if the issue persists.';
      
      setMessages(prev => [...prev, { 
        type: 'ai', 
        content: errorMessage
      }]);
      
      if (isSpeechEnabled && typeof window !== 'undefined') {
        speakText(errorMessage);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAvatarChange = (avatar: string) => {
    setSelectedAvatar(avatar);
  };

  const toggleSpeech = () => {
    setIsSpeechEnabled(!isSpeechEnabled);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-950 p-6">
      <div className="max-w-6xl mx-auto flex flex-col gap-6">
        <Header 
          onAvatarChange={handleAvatarChange} 
          isSpeechEnabled={isSpeechEnabled}
          onToggleSpeech={toggleSpeech}
        />
        
        <div className="flex flex-col md:flex-row gap-6 w-full">
          <div className="flex-1 max-w-full md:max-w-[45%]">
            <AvatarDisplay 
              selectedAvatar={selectedAvatar}
              isProcessing={isProcessing}
              currentMessage={messages.length > 0 ? messages[messages.length - 1] : null}
            />
          </div>
          
          <div className="flex-1">
            <ChatInterface 
              messages={messages}
              onSendMessage={handleSendMessage}
              isProcessing={isProcessing}
            />
          </div>
        </div>
        
        <footer className="text-center text-gray-500 text-xs py-4">
          <p>© {new Date().getFullYear()} IDMS Infotech Ltd. All rights reserved.</p>
          <p className="mt-1">Enterprise Resource Planning System v3.2.1</p>
        </footer>
      </div>
    </main>
  );
}
