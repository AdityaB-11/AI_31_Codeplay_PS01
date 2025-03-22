"use client";

import { useState } from 'react';
import { SpeakerWaveIcon, SpeakerXMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';

interface HeaderProps {
  onAvatarChange: (avatar: string) => void;
  isSpeechEnabled?: boolean;
  onToggleSpeech?: () => void;
}

const avatarOptions = [
  { id: 'default', name: 'Default', description: 'Standard business professional' },
  { id: 'professional', name: 'Executive', description: 'Formal corporate style' },
  { id: 'friendly', name: 'Consultant', description: 'Approachable and helpful' },
  { id: 'technical', name: 'Technical Expert', description: 'Specialized knowledge' },
];

export default function Header({ 
  onAvatarChange, 
  isSpeechEnabled = true, 
  onToggleSpeech 
}: HeaderProps) {
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('default');

  const handleAvatarSelect = (avatarId: string) => {
    setSelectedAvatar(avatarId);
    onAvatarChange(avatarId);
    setIsAvatarMenuOpen(false);
  };

  return (
    <header className="w-full bg-gradient-to-r from-slate-800 to-slate-900 shadow-xl rounded-lg p-4 flex justify-between items-center border-b border-slate-700">
      <div className="flex items-center">
        {/* Company logo placeholder */}
        <div className="w-10 h-10 rounded-md bg-blue-600 flex items-center justify-center mr-3 shadow-lg">
          <span className="text-white font-bold text-lg">ID</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">IDMS Enterprise Assistant</h1>
          <p className="text-gray-400 text-xs">Powered by Advanced AI</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {onToggleSpeech && (
          <button
            onClick={onToggleSpeech}
            className={`bg-slate-700 text-white p-2 rounded-full transition-all duration-300 border ${
              isSpeechEnabled ? 'border-blue-500 hover:bg-slate-600' : 'border-slate-600 hover:bg-slate-600'
            }`}
            title={isSpeechEnabled ? "Disable voice response" : "Enable voice response"}
          >
            {isSpeechEnabled ? (
              <SpeakerWaveIcon className="h-5 w-5" />
            ) : (
              <SpeakerXMarkIcon className="h-5 w-5" />
            )}
          </button>
        )}
        
        <div className="relative">
          <button 
            onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-md flex items-center gap-2 shadow-md border border-blue-500 transition-all duration-300"
          >
            <span>Assistant Style</span>
            <ChevronDownIcon className={`h-4 w-4 transition-transform duration-300 ${isAvatarMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isAvatarMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-slate-800 rounded-md shadow-2xl z-10 border border-slate-700 overflow-hidden">
              <div className="py-1">
                {avatarOptions.map((avatar) => (
                  <button
                    key={avatar.id}
                    className={`flex items-center w-full text-left px-4 py-3 text-sm transition-colors duration-200 ${
                      selectedAvatar === avatar.id 
                        ? 'bg-blue-900/50 text-blue-100' 
                        : 'text-gray-200 hover:bg-slate-700'
                    }`}
                    onClick={() => handleAvatarSelect(avatar.id)}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{avatar.name}</p>
                      <p className="text-xs text-gray-400">{avatar.description}</p>
                    </div>
                    {selectedAvatar === avatar.id && (
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 