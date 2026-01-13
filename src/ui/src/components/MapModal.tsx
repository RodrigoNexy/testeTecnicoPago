import React from 'react'

interface MapModalProps {
  cep: string
  endereco: string
  isOpen: boolean
  onClose: () => void
}

export const MapModal: React.FC<MapModalProps> = ({ cep, endereco, isOpen, onClose }) => {
  if (!isOpen) return null

  const googleMapsUrl = `https://www.google.com/maps/place/${cep}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-slate-800 rounded-lg shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] flex flex-col border border-slate-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h3 className="text-xl font-bold text-white">📍 Localização do CEP</h3>
            <p className="text-slate-400 text-sm mt-1">{cep}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Mapa */}
        <div className="flex-1 overflow-hidden">
          <iframe
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            src={`https://maps.google.com/maps?q=${cep}&t=m&z=15&output=embed`}
          />
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 bg-slate-700/30">
          <p className="text-slate-300 text-sm mb-3">{endereco}</p>
          <div className="flex gap-3">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors text-center"
            >
              Abrir no Google Maps
            </a>
            <button
              onClick={onClose}
              className="flex-1 bg-teal-500 hover:bg-teal-600 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
