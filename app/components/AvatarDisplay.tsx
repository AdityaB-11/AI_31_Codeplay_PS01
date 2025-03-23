"use client";

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import type { Role, Message } from '../types';
import { roles } from '../utils/roleConfig';

interface AvatarDisplayProps {
  selectedRole: Role;
  isProcessing: boolean;
  currentMessage: Message | null;
}

export default function AvatarDisplay({ 
  selectedRole, 
  isProcessing,
  currentMessage 
}: AvatarDisplayProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showExpertise, setShowExpertise] = useState(false);

  // Get current role configuration
  const roleConfig = roles[selectedRole];
  if (!roleConfig) {
    console.error('Invalid role selected:', selectedRole);
    return null;
  }

  // Simulate avatar speaking when AI sends a message
  useEffect(() => {
    if (currentMessage && currentMessage.type === 'ai') {
      setIsSpeaking(true);
      setShowExpertise(false);
      
      // Simulate speaking time based on message length
      const speakingTime = Math.max(2000, currentMessage.content.length * 50);
      
      const timer = setTimeout(() => {
        setIsSpeaking(false);
      }, speakingTime);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [currentMessage]);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-slate-700">
      <div className="relative mb-6">
        <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-slate-600">
          <Image
            src={roleConfig.avatar.image}
            alt={roleConfig.avatar.alt}
            fill
            className="object-cover"
          />
        </div>
        
        {isProcessing && (
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent mb-3"></div>
              <p className="text-blue-400 text-sm font-medium">Processing...</p>
            </div>
          </div>
        )}
        
        {isSpeaking && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-1.5 rounded-full border border-blue-500/30">
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div 
                  key={i}
                  className="w-1.5 h-6 bg-blue-500 rounded-full animate-pulse"
                  style={{ 
                    animationDelay: `${i * 0.15}s`,
                    animationDuration: '1s'
                  }}
                ></div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      <div className="text-white text-center space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-1 text-blue-100">{roleConfig.title}</h2>
          <p className="text-sm text-gray-400">{roleConfig.description}</p>
        </div>

        <div className="text-sm bg-slate-700/50 backdrop-blur-sm px-4 py-3 rounded-lg text-gray-300 border border-slate-600">
          {isProcessing 
            ? 'Processing your request...'
            : isSpeaking 
              ? 'Speaking...'
              : roleConfig.defaultMessage}
        </div>

        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setShowExpertise(!showExpertise)}
            className="text-sm px-4 py-2 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 transition-colors"
          >
            {showExpertise ? 'Hide Expertise' : 'View Expertise'}
          </button>
        </div>
      </div>
    </div>
  );
} 