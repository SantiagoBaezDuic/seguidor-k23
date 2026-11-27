import React from 'react';
import { Target, Trophy, GraduationCap } from 'lucide-react';
import SectionHeader from './SectionHeader';

const STAT_TILES = [
  { key: 'aprobadas', label: 'Aprobadas', accent: 'bg-emerald-400', value: 'text-emerald-200' },
  { key: 'regulares', label: 'Regulares', accent: 'bg-amber-400', value: 'text-amber-200' },
  { key: 'cursando', label: 'Cursando', accent: 'bg-sky-400', value: 'text-sky-200' },
  { key: 'noCursadas', label: 'Pendientes', accent: 'bg-gray-600', value: 'text-gray-300' }
];

/**
 * Componente para mostrar estadísticas generales y del título intermedio
 */
const Statistics = ({ progress, intermediateProgress, intermediateCompleted }) => {
  const remainingIntermediate = intermediateProgress.total - intermediateProgress.completed;

  return (
    <div className="panel p-5 space-y-5">
      <SectionHeader icon={Target} title="Progreso" />

      {/* Porcentaje general + barra segmentada */}
      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-2">
          <p className="text-3xl font-semibold text-gray-100 tabular-nums">
            {progress.porcentaje}<span className="text-lg text-gray-400">%</span>
          </p>
          <p className="text-xs text-gray-400 tabular-nums">
            {progress.aprobadas} de {progress.total} aprobadas
          </p>
        </div>
        <div
          className="w-full bg-gray-800 rounded-full h-2 overflow-hidden flex"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress.porcentaje}
          aria-label="Progreso de la carrera"
        >
          {[
            { value: progress.aprobadas, className: 'bg-emerald-500', label: 'Aprobadas' },
            { value: progress.regulares, className: 'bg-amber-500', label: 'Regulares' },
            { value: progress.cursando, className: 'bg-sky-500', label: 'Cursando' },
          ].map(segment => (
            <div
              key={segment.label}
              title={`${segment.label}: ${segment.value}`}
              className={`h-full transition-all duration-500 ${segment.className}`}
              style={{ width: `${progress.total > 0 ? (segment.value / progress.total) * 100 : 0}%` }}
            />
          ))}
        </div>
        <p className="text-[11px] text-gray-500">
          Cuentan {progress.total} materias: obligatorias + 7 electivas.
        </p>
      </div>

      {/* Conteo por estado */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-2">
        {STAT_TILES.map(tile => (
          <div key={tile.key} className="panel-inset relative pl-3.5 pr-2 py-2 overflow-hidden">
            <span className={`absolute left-0 top-2 bottom-2 w-1 rounded-r ${tile.accent}`} aria-hidden="true" />
            <div className={`text-lg font-semibold tabular-nums ${tile.value}`}>{progress[tile.key]}</div>
            <div className="text-[11px] text-gray-400">{tile.label}</div>
          </div>
        ))}
      </div>

      {/* Progreso Título Intermedio */}
      <div className="border-t border-gray-800 pt-4 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-gray-200 flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-purple-300" />
            Título intermedio
            <span className="text-xs text-gray-500 font-normal">Analista</span>
          </h3>
          <span className="text-xs text-gray-400 tabular-nums">
            {intermediateProgress.completed}/{intermediateProgress.total}
          </span>
        </div>

        {intermediateCompleted ? (
          <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3 flex items-center gap-3">
            <Trophy className="w-5 h-5 text-emerald-300 flex-shrink-0" />
            <div>
              <div className="text-emerald-100 font-medium text-sm">¡Felicitaciones!</div>
              <div className="text-emerald-200/80 text-xs">Completaste los requisitos de Analista de Sistemas</div>
            </div>
          </div>
        ) : (
          <>
            <div className="w-full bg-gray-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="h-full bg-purple-400 transition-all duration-500"
                style={{ width: `${intermediateProgress.porcentaje}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {remainingIntermediate === 1 ? 'Falta 1 materia' : `Faltan ${remainingIntermediate} materias`} para el título
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Statistics;
