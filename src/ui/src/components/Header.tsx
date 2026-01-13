import React from 'react';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="bg-slate-900 border-b border-slate-700 px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-teal-500 rounded-lg flex items-center justify-center">
          <span className="text-white text-xl">📍</span>
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">{title}</h1>
          <p className="text-gray-400 text-xs">{subtitle}</p>
        </div>
      </div>
    </div>
  );
};
