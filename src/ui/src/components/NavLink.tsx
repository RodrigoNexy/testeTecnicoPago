import React from 'react';

export const NavLink: React.FC<{ text: string }> = ({ text }) => {
  return (
    <button className="text-gray-400 hover:text-teal-400 transition-colors text-sm">
      {text}
    </button>
  );
};
