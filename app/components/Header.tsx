"use client";

import { useState } from 'react';
import { ChevronDownIcon, SpeakerWaveIcon } from '@heroicons/react/24/solid';
import { roles } from '../utils/roleConfig';
import Image from 'next/image';

interface HeaderProps {
  selectedRole: string;
  onRoleChange: (role: string) => void;
}

export default function Header({ selectedRole, onRoleChange }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg shadow-xl p-4 md:p-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Image
            src="/nimbus-logo.png"
            alt="NimbusERP Logo"
            width={48}
            height={48}
            className="rounded-lg"
          />
          <h1 className="text-2xl font-bold text-white">NimbusERP Assistant</h1>
        </div>
        
        <div className="flex gap-2">
          {Object.entries(roles).map(([id, role]) => (
            <button
              key={id}
              onClick={() => onRoleChange(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                selectedRole === id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              <Image
                src={role.avatar.image}
                alt={role.avatar.alt}
                width={24}
                height={24}
                className="rounded-full"
              />
              <span className="hidden md:inline">{role.title}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
} 