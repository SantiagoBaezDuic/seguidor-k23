import React, { useState } from 'react';
import { HelpCircle, CheckCircle2, Clock, BookOpen, CircleDot, Lock } from 'lucide-react';
import { LINE_COLORS } from './CorrelationLines';

const STATES = [
  { icon: CheckCircle2, label: 'Aprobada', desc: 'Final aprobado', accent: 'bg-emerald-400', pill: 'bg-emerald-500/15 text-emerald-300' },
  { icon: Clock, label: 'Regular', desc: 'Cursada aprobada, falta el final', accent: 'bg-amber-400', pill: 'bg-amber-500/15 text-amber-300' },
  { icon: BookOpen, label: 'Cursando', desc: 'La estás cursando ahora', accent: 'bg-sky-400', pill: 'bg-sky-500/15 text-sky-300' },
  { icon: CircleDot, label: 'Habilitada', desc: 'Podés inscribirte', accent: 'bg-blue-400', pill: 'bg-blue-500/15 text-blue-300' },
  { icon: Lock, label: 'Bloqueada', desc: 'Faltan correlativas', accent: 'bg-gray-600', pill: 'bg-gray-700/40 text-gray-400' }
];

const LINES = [
  { color: LINE_COLORS.cursada, dash: undefined, desc: 'Correlativa que falta regularizar' },
  { color: LINE_COLORS.aprobacion, dash: '6 4', desc: 'Correlativa que falta aprobar (final)' },
  { color: LINE_COLORS.cumplida, dash: undefined, desc: 'Correlativa ya cumplida' }
];

const pill = 'text-[10px] leading-none px-2 py-1 rounded-full inline-flex items-center gap-1 whitespace-nowrap';

/**
 * Componente de tooltip con la leyenda de estados, indicadores y líneas
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
        aria-expanded={isOpen}
      >
        <HelpCircle className="w-5 h-5 text-blue-400" />
      </button>

      {/* Tooltip */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-[22rem] max-w-[calc(100vw-2rem)] bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 p-4"
          onMouseEnter={() => setIsOpen(true)}
          onMouseLeave={() => setIsOpen(false)}
        >
          <h3 className="text-sm font-semibold text-gray-200 mb-3 border-b border-gray-800 pb-2">
            Leyenda
          </h3>

          <div className="space-y-4 text-xs">
            {/* Estados de materias */}
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">Estados</h4>
              <div className="space-y-1.5">
                {STATES.map(({ icon: Icon, label, desc, accent, pill: pillColor }) => (
                  <div key={label} className="flex items-center gap-2">
                    <span className={`w-1 h-4 rounded ${accent}`} />
                    <span className={`${pill} ${pillColor} w-24 justify-start`}>
                      <Icon className="w-3 h-3" />
                      {label}
                    </span>
                    <span className="text-gray-400">{desc}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-[11px] mt-2">
                Click avanza el estado · Click derecho o Backspace lo retrocede · Cada cambio se puede deshacer desde la notificación.
              </p>
            </div>

            {/* Indicadores */}
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">Indicadores</h4>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] leading-none px-1.5 py-1 rounded font-semibold text-purple-300 border border-purple-500/40">TI</span>
                  <span className="text-gray-400">Cuenta para el Título Intermedio</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`${pill} bg-orange-500/15 text-orange-300`}>Final habilitado</span>
                  <span className="text-gray-400">Podés rendir el final</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`${pill} bg-red-500/15 text-red-300`}>Final bloqueado</span>
                  <span className="text-gray-400">Faltan correlativas aprobadas</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`${pill} border border-amber-500/40 text-amber-300`}>Pedir excepción</span>
                  <span className="text-gray-400">Aparece al pasar el mouse por una bloqueada</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`${pill} bg-amber-500/25 text-amber-200`}>Excepción</span>
                  <span className="text-gray-400">Cursás sin correlativas (el final igual las requiere)</span>
                </div>
              </div>
            </div>

            {/* Líneas de correlatividad */}
            <div>
              <h4 className="font-semibold text-gray-300 mb-2">Líneas</h4>
              <div className="space-y-1.5">
                {LINES.map(line => (
                  <div key={line.desc} className="flex items-center gap-2">
                    <svg width="24" height="6" className="flex-shrink-0" aria-hidden="true">
                      <line x1="1" y1="3" x2="23" y2="3" stroke={line.color} strokeWidth="2" strokeDasharray={line.dash} strokeLinecap="round" />
                    </svg>
                    <span className="text-gray-400">{line.desc}</span>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-[11px] mt-2">
                Pasá el mouse (o enfocá con Tab) una materia para ver sus correlativas y lo que habilita.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TooltipLegend;
