"use client";

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface AvatarDisplayProps {
  selectedAvatar: string;
  isProcessing: boolean;
  currentMessage: { type: 'user' | 'ai', content: string } | null;
}

export default function AvatarDisplay({ 
  selectedAvatar, 
  isProcessing,
  currentMessage 
}: AvatarDisplayProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Avatars with different emotional states
  const avatars = {
    default: '/avatars/default.jpg',
    professional: '/avatars/professional.jpg',
    friendly: '/avatars/friendly.jpg',
    technical: '/avatars/technical.jpg',
  };

  // Simulate avatar speaking when AI sends a message
  useEffect(() => {
    if (currentMessage && currentMessage.type === 'ai') {
      setIsSpeaking(true);
      
      // Simulate speaking time based on message length
      const speakingTime = Math.max(2000, currentMessage.content.length * 50);
      
      const timer = setTimeout(() => {
        setIsSpeaking(false);
      }, speakingTime);
      
      return () => clearTimeout(timer);
    }
  }, [currentMessage]);

  // Temporary avatar image
  // In a real implementation, this would be replaced with a D-ID or similar API integration
  const avatarSrc = avatars[selectedAvatar as keyof typeof avatars] || avatars.default;

  return (
    <div className="bg-gradient-to-b from-slate-800 to-slate-900 shadow-xl rounded-lg p-8 flex flex-col items-center h-full">
      <div className="relative w-full aspect-square max-w-[380px] rounded-lg overflow-hidden mb-6 shadow-2xl border border-slate-700">
        <div className="w-full h-full relative">
          <Image
            src={avatarSrc}
            alt="AI Avatar"
            fill
            className="object-cover"
            priority
          />
          
          {/* Corporate branding overlay */}
          <div className="absolute top-3 left-3 bg-blue-600/80 backdrop-blur-sm px-3 py-1 rounded text-white text-xs font-semibold">
            IDMS
          </div>
          
          {/* Overlay for "processing" state */}
          {isProcessing && (
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent mb-3"></div>
                <p className="text-blue-400 text-sm font-medium">Processing query...</p>
              </div>
            </div>
          )}
          
          {/* Animation for speaking */}
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
      </div>
      
      <div className="text-white text-center">
        <h2 className="text-xl font-semibold mb-3 text-blue-100">IDMS Enterprise Assistant</h2>
        <div className="text-sm bg-slate-700/50 backdrop-blur-sm px-4 py-3 rounded-lg text-gray-300 border border-slate-600">
          {isProcessing 
            ? "Analyzing your request..." 
            : isSpeaking 
              ? "Providing information..." 
              : "How may I assist you with the ERP system today?"}
        </div>
      </div>
    </div>
  );
} 