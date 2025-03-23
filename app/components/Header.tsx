"use client";

import Image from 'next/image';
import type { Role } from '../types';
import { roles } from '../utils/roleConfig';

interface HeaderProps {
  selectedRole: Role;
  onRoleChange: (role: Role) => void;
}

export default function Header({ selectedRole, onRoleChange }: HeaderProps) {
  return (
    <header className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg shadow-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14">
          <Image
            src="/logo.jpg"
            alt="NimbusERP Logo"
            fill
            className="object-contain"
          />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">NimbusERP</h1>
          <p className="text-sm text-gray-400">Powered by Gemini AI</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {Object.entries(roles).map(([role, config]) => (
          <button
            key={role}
            onClick={() => onRoleChange(role as Role)}
            className={`px-4 py-2 rounded-lg transition-all transform hover:scale-105 active:scale-95 ${
              selectedRole === role
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            {config.title}
          </button>
        ))}
      </div>
    </header>
  );
} 