"use client";

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { roles, RoleConfig } from '../utils/roleConfig';

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
  const [showExpertise, setShowExpertise] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const speechSynthesis = useRef<SpeechSynthesis | null>(null);

  // Get current role configuration with fallback
  const getCurrentRole = (): RoleConfig => {
    const role = roles[selectedAvatar];
    if (!role) {
      console.warn(`Unknown avatar type: ${selectedAvatar}, falling back to business`);
      return roles.business;
    }
    return role;
  };

  const currentRole = getCurrentRole();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      speechSynthesis.current = window.speechSynthesis;
    }
  }, []);

  // Simulate avatar speaking when AI sends a message
  useEffect(() => {
    if (currentMessage && currentMessage.type === 'ai') {
      setIsSpeaking(true);
      setShowExpertise(false);
      
      // Simulate speaking time based on message length
      const speakingTime = Math.max(2000, currentMessage.content.length * 50);
      
      if (voiceEnabled && speechSynthesis.current && currentMessage.content) {
        const utterance = new SpeechSynthesisUtterance(currentMessage.content);
        utterance.rate = currentRole.voice.settings.rate;
        utterance.pitch = currentRole.voice.settings.pitch;
        utterance.volume = currentRole.voice.settings.volume;
        speechSynthesis.current.speak(utterance);
      }
      
      const timer = setTimeout(() => {
        setIsSpeaking(false);
      }, speakingTime);
      
      return () => {
        clearTimeout(timer);
        if (speechSynthesis.current) {
          speechSynthesis.current.cancel();
        }
      };
    }
  }, [currentMessage, voiceEnabled, currentRole.voice.settings]);

  return (
    <div className="bg-gradient-to-b from-slate-800 to-slate-900 shadow-xl rounded-lg p-8 flex flex-col items-center h-full">
      <div className="relative w-full aspect-square max-w-[380px] rounded-lg overflow-hidden mb-6 shadow-2xl border border-slate-700">
        <div className="w-full h-full relative group">
          {/* Avatar background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-b ${currentRole.avatar.style?.background || 'from-slate-100 to-slate-200'} opacity-10`} />
          
          {/* Avatar image */}
          <div className="relative w-full h-full">
            <Image
              src={currentRole.avatar.image}
              alt={currentRole.avatar.alt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              priority
            />
          </div>
          
          {/* Role indicator */}
          <div className="absolute top-3 left-3 bg-blue-600/80 backdrop-blur-sm px-3 py-1 rounded text-white text-xs font-semibold">
            {currentRole.title}
          </div>
          
          {/* Expertise tooltip */}
          <div 
            className={`absolute inset-0 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-6 transition-opacity duration-300 ${
              showExpertise ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <div className="text-white">
              <h3 className="font-semibold mb-2 text-blue-400">{currentRole.title} Expertise</h3>
              <ul className="text-sm space-y-1">
                {currentRole.expertise.map((skill, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                    {skill}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Processing overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent mb-3"></div>
                <p className="text-blue-400 text-sm font-medium">{currentRole.processingMessage}</p>
              </div>
            </div>
          )}
          
          {/* Speaking animation */}
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
      
      <div className="text-white text-center space-y-4">
        <div>
          <h2 className="text-xl font-semibold mb-1 text-blue-100">{currentRole.title}</h2>
          <p className="text-sm text-gray-400">{currentRole.description}</p>
        </div>

        <div className="text-sm bg-slate-700/50 backdrop-blur-sm px-4 py-3 rounded-lg text-gray-300 border border-slate-600">
          {isProcessing 
            ? currentRole.processingMessage
            : isSpeaking 
              ? currentRole.speakingMessage
              : currentRole.defaultMessage}
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