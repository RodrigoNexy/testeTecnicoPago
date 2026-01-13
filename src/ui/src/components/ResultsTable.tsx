import React, { useState } from 'react';
import { StatusBadge } from './StatusBadge';
import { MapModal } from './MapModal';

interface ResultItem {
  cep: string;
  status: 'OK' | 'Erro';
  endereco: string;
  processadoEm: string;
}

interface ResultsTableProps {
  results: ResultItem[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ results }) => {
  const [selectedMap, setSelectedMap] = useState<ResultItem | null>(null);

  const successResults = results.filter(r => r.status === 'OK');

  if (successResults.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-green-400">✓</span>
          <h3 className="text-xl font-bold text-white">Resultados com Sucesso</h3>
          <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium ml-auto">
            {successResults.length} sucesso{successResults.length > 1 ? 's' : ''}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">CEP</th>
                <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Status</th>
                <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Endereço</th>
                <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Processado em</th>
                <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {successResults.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 px-4 text-white font-mono text-sm">{item.cep}</td>
                  <td className="py-3 px-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-sm">{item.endereco}</td>
                  <td className="py-3 px-4 text-slate-400 text-sm">{item.processadoEm}</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => setSelectedMap(item)}
                      className="text-teal-400 hover:text-teal-300 text-sm transition-colors"
                    >
                      📍 Ver Mapa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedMap && (
        <MapModal
          cep={selectedMap.cep}
          endereco={selectedMap.endereco}
          isOpen={true}
          onClose={() => setSelectedMap(null)}
        />
      )}
    </>
  );
};
