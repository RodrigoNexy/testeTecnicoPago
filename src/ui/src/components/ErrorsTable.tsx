import React from 'react'

interface ErrorItem {
  cep: string
  erro: string
  processadoEm: string
}

interface ErrorsTableProps {
  errors: ErrorItem[]
}

export const ErrorsTable: React.FC<ErrorsTableProps> = ({ errors }) => {
  return (
    <div className="bg-slate-800 rounded-lg p-6 border border-slate-700">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-red-400">⚠️</span>
        <h3 className="text-xl font-bold text-white">Erros</h3>
        <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-medium ml-auto">
          {errors.length} erros
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">CEP</th>
              <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Mensagem de Erro</th>
              <th className="text-left py-3 px-4 text-slate-400 text-sm font-medium">Processado em</th>
            </tr>
          </thead>
          <tbody>
            {errors.map((item, idx) => (
              <tr key={idx} className="border-b border-slate-700/50 hover:bg-red-500/10 transition-colors">
                <td className="py-3 px-4 text-white font-mono text-sm">{item.cep}</td>
                <td className="py-3 px-4 text-red-400 text-sm">{item.erro}</td>
                <td className="py-3 px-4 text-slate-400 text-sm">{item.processadoEm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {errors.length === 0 && (
        <div className="text-center py-8">
          <p className="text-slate-400">Nenhum erro registrado</p>
        </div>
      )}
    </div>
  )
}
