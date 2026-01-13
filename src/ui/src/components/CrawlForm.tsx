import React from 'react';

interface CrawlFormProps {
  onSubmit: (cepInicial: string, cepFinal: string) => void;
  isLoading?: boolean;
}

export const CrawlForm: React.FC<CrawlFormProps> = ({ onSubmit, isLoading = false }) => {
  const [cepInicial, setCepInicial] = React.useState('01000000');
  const [cepFinal, setCepFinal] = React.useState('01000001');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(cepInicial, cepFinal);
  };

  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-teal-400">🔍</span>
        <h3 className="text-xl font-bold text-white">Novo Crawl</h3>
      </div>
      <p className="text-slate-400 text-sm mb-6">Defina o range de CEPs para processar</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">CEP Inicial</label>
            <input
              type="text"
              value={cepInicial}
              onChange={(e) => setCepInicial(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              placeholder="01000000"
            />
          </div>
          <div>
            <label className="block text-sm text-slate-300 mb-2">CEP Final</label>
            <input
              type="text"
              value={cepFinal}
              onChange={(e) => setCepFinal(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 rounded px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              placeholder="01000001"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-teal-500/50 text-white font-medium py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
        >
          <span>▶</span>
          {isLoading ? 'Processando...' : 'Iniciar Crawl'}
        </button>
      </form>
    </div>
  );
};
