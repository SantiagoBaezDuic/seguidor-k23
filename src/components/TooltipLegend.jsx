import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

/**
 * Componente de tooltip con la leyenda de estados, badges y líneas
 */
const TooltipLegend = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      {/* Botón de ayuda */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className="p-2 rounded-full hover:bg-gray-700/50 transition-colors"
        aria-label="Ver leyenda"
      >
        <HelpCircle className="w-5 h-5 text-blue-400" />
      </button>

      {/* Tooltip */}
      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-96 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-50 p-4"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <h3 className="text-sm font-semibold text-gray-200 mb-3 border-b border-gray-700 pb-2">
            Leyenda
          </h3>
          
          <div className="space-y-4 text-xs">
            {/* Estados de materias */}
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">Estados:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-700 rounded border border-gray-600"></div>
                  <span className="text-gray-300">No Cursada (click para cambiar)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-900 rounded border border-yellow-500"></div>
                  <span className="text-gray-300">Regular (cursada aprobada)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-900 rounded border border-green-500"></div>
                  <span className="text-gray-300">Aprobada (final aprobado)</span>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">Indicadores:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-purple-600 text-white text-[10px] rounded-full font-semibold">TI</span>
                  <span className="text-gray-300">Título Intermedio</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-blue-500/30 text-blue-200 text-[10px] rounded-full">✓ Habilitada cursar</span>
                  <span className="text-gray-300">Podés inscribirte</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-orange-500/30 text-orange-200 text-[10px] rounded-full">✓ Habilitada final</span>
                  <span className="text-gray-300">Podés rendir examen</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-red-500/20 text-red-300 text-[10px] rounded-full">✗ Bloqueada</span>
                  <span className="text-gray-300">Faltan correlativas</span>
                </div>
              </div>
            </div>

            {/* Líneas de correlatividad */}
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">Líneas:</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg width="24" height="2" className="flex-shrink-0">
                    <line x1="0" y1="1" x2="24" y2="1" stroke="#60a5fa" strokeWidth="2" />
                  </svg>
                  <span className="text-gray-300">Requiere cursada/regular</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg width="24" height="2" className="flex-shrink-0">
                    <line x1="0" y1="1" x2="24" y2="1" stroke="#fb923c" strokeWidth="2" strokeDasharray="4,2" />
                  </svg>
                  <span className="text-gray-300">Requiere aprobación</span>
                </div>
                <div className="text-gray-400 text-[10px] italic mt-1">
                  * Solo se muestran para materias bloqueadas
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TooltipLegend;
