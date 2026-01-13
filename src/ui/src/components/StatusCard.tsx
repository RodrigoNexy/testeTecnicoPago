import React from 'react';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';

interface StatusCardProps {
  crawlId: string;
  status: 'Finalizado' | 'Processando';
  progress: number;
  total: number;
  processados: number;
  sucessos: number;
  erros: number;
  criadoEm: string;
  atualizadoEm: string;
}

export const StatusCard: React.FC<StatusCardProps> = ({
  crawlId,
  status,
  progress,
  total,
  processados,
  sucessos,
  erros,
  criadoEm,
  atualizadoEm,
}) => {
  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-slate-400">⚡</span>
            <h3 className="text-xl font-bold text-white">Status do Crawl</h3>
          </div>
          <p className="text-xs text-slate-500">{crawlId}</p>
        </div>
        <StatusBadge status={status as any} />
      </div>

      <div className="mb-6">
        <p className="text-sm text-slate-300 mb-2">Progresso</p>
        <ProgressBar percentage={progress} />
        <p className="text-right text-xs text-slate-400 mt-1">{progress}%</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-slate-700/50 rounded p-4">
          <p className="text-slate-400 text-xs flex items-center gap-2 mb-2">
            <span>⏱️</span> Total
          </p>
          <p className="text-2xl font-bold text-white">{total}</p>
        </div>
        <div className="bg-slate-700/50 rounded p-4">
          <p className="text-slate-400 text-xs flex items-center gap-2 mb-2">
            <span>⚙️</span> Processados
          </p>
          <p className="text-2xl font-bold text-white">{processados}</p>
        </div>
        <div className="hidden" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-500/10 border border-green-500/30 rounded p-4">
          <p className="text-green-400 text-xs flex items-center gap-2 mb-2">
            <span>✓</span> Sucessos
          </p>
          <p className="text-2xl font-bold text-green-400">{sucessos}</p>
        </div>
        <div className="bg-red-500/10 border border-red-500/30 rounded p-4">
          <p className="text-red-400 text-xs flex items-center gap-2 mb-2">
            <span>✕</span> Erros
          </p>
          <p className="text-2xl font-bold text-red-400">{erros}</p>
        </div>
      </div>

      <div className="flex justify-between text-xs text-slate-500 pt-4 border-t border-slate-700">
        <span>Criado: {criadoEm}</span>
        <span>Atualizado: {atualizadoEm}</span>
      </div>
    </div>
  );
};
