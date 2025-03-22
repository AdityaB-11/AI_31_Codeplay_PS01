"use client";

import { useState, useRef, useEffect } from 'react';
import { MicrophoneIcon, PaperAirplaneIcon, StopIcon } from '@heroicons/react/24/outline';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import axios from 'axios';

interface ChatInterfaceProps {
  messages: Array<{type: 'user' | 'ai', content: string}>;
  onSendMessage: (message: string) => void;
  isProcessing: boolean;
}

export default function ChatInterface({ 
  messages, 
  onSendMessage,
  isProcessing 
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
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
      setInputValue(transcript);
    }
  }, [transcript]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input field when component mounts and after sending a message
  useEffect(() => {
    // Short timeout to ensure the input is rendered
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [messages.length]); // Re-focus after sending a message

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !isProcessing) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const toggleRecording = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-800 to-slate-900 shadow-xl rounded-lg flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-transparent">
        <div className="flex flex-col gap-5">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-blue-900/20 backdrop-blur-sm border border-blue-800/30 rounded-lg py-6 px-4">
                <h3 className="text-blue-300 font-medium mb-2">Welcome to IDMS Enterprise Assistant</h3>
                <p className="text-gray-400 text-sm">
                  Ask me any question about the IDMS ERP system, such as generating reports, 
                  managing inventory, or troubleshooting common issues.
                </p>
              </div>
            </div>
          )}
          
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              <div 
                className={`max-w-[85%] rounded-lg px-4 py-3 shadow-md ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-slate-700 text-gray-100 rounded-tl-none border border-slate-600'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div className="text-right mt-1">
                  <span className={`text-xs ${message.type === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                    {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="border-t border-slate-700 p-4">
        {speechError && (
          <div className="text-red-400 text-xs mb-2 bg-red-900/20 p-2 rounded">
            Error: {speechError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            disabled={isProcessing || isListening}
            placeholder={isListening ? "Listening..." : "Type your message..."}
            className="flex-1 bg-slate-700 text-white rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 border border-slate-600 text-sm"
          />
          
          <button
            type="button"
            onClick={toggleRecording}
            disabled={isProcessing}
            className={`rounded-full p-2.5 transition-all duration-300 ${
              isListening 
                ? 'bg-red-600 hover:bg-red-700 border border-red-500 ring-2 ring-red-500/50' 
                : 'bg-slate-600 hover:bg-slate-700 border border-slate-500'
            }`}
            title={isListening ? "Stop listening" : "Start voice input"}
          >
            {isListening ? (
              <StopIcon className="h-5 w-5 text-white" />
            ) : (
              <MicrophoneIcon className="h-5 w-5 text-white" />
            )}
          </button>
          
          <button
            type="submit"
            disabled={isProcessing || !inputValue.trim()}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800/50 disabled:opacity-50 text-white rounded-full p-2.5 transition-all duration-300 border border-blue-500 disabled:border-blue-700"
            title="Send message"
          >
            <PaperAirplaneIcon className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
} 