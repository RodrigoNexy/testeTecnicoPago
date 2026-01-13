import React from 'react';

interface StatusBadgeProps {
  status: 'OK' | 'Erro' | 'Finalizado';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const statusClasses = {
    OK: 'bg-teal-500/20 text-teal-400 border border-teal-500/30',
    Erro: 'bg-red-500/20 text-red-400 border border-red-500/30',
    Finalizado: 'bg-green-500/20 text-green-400 border border-green-500/30',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusClasses[status]}`}>
      {status}
    </span>
  );
};
