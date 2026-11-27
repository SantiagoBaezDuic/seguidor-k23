import React from 'react';
import { Clock, BookOpen, Calendar, AlertTriangle, Check, CheckCircle2 } from 'lucide-react';

// Umbrales de carga horaria semanal
const HEAVY_HOURS = 24;
const MAX_HOURS = 30;

// Solo pueden figurar materias por cursar (0) o en curso (1): las Regulares y
// Aprobadas se quitan del planificador en App.jsx
const STATE_PILLS = {
  1: { label: 'Cursando', className: 'bg-sky-500/15 text-sky-300' }
};

/**
 * Componente para planificar qué materias cursar
 * Muestra materias disponibles y calcula carga horaria total
 */
const CoursePlanner = ({ availableSubjects, selectedSubjects, selectedSubjectsData = [], onSelectionChange }) => {
  // Materias a mostrar: las disponibles para cursar + las ya seleccionadas
  // aunque hayan cambiado de estado (ej. marcadas como Cursando) y ya no
  // figuren entre las "disponibles"
  const displaySubjects = [
    ...availableSubjects,
    ...selectedSubjectsData.filter(
      s => s.state !== 0 && !availableSubjects.some(a => a.id === s.id)
    )
  ];

  // Calcular carga horaria total a partir de los datos completos de cada materia
  // seleccionada (no solo de las "disponibles", que dejan de incluir una materia
  // en cuanto deja de estar en estado 0)
  const totalHours = selectedSubjects.reduce((sum, subjectId) => {
    const subject = selectedSubjectsData.find(s => s.id === subjectId)
      || availableSubjects.find(s => s.id === subjectId);
    return sum + (subject?.h || 0);
  }, 0);

  const isOverloaded = totalHours > MAX_HOURS;
  const isHeavy = totalHours > HEAVY_HOURS && !isOverloaded;

  const load = isOverloaded
    ? { bar: 'bg-red-500', text: 'text-red-300', icon: AlertTriangle, message: `Carga muy alta (recomendado: menos de ${MAX_HOURS} hs)` }
    : isHeavy
      ? { bar: 'bg-amber-500', text: 'text-amber-300', icon: AlertTriangle, message: `Carga considerable (recomendado: menos de ${HEAVY_HOURS} hs)` }
      : { bar: 'bg-blue-500', text: 'text-blue-300', icon: CheckCircle2, message: 'Carga balanceada' };
  const LoadIcon = load.icon;

  /**
   * Maneja el toggle de selección de una materia
   */
  const handleToggle = (subjectId) => {
    if (selectedSubjects.includes(subjectId)) {
      onSelectionChange(selectedSubjects.filter(id => id !== subjectId));
    } else {
      onSelectionChange([...selectedSubjects, subjectId]);
    }
  };

  if (displaySubjects.length === 0) {
    return (
      <div className="panel-inset p-8 flex flex-col items-center text-center gap-2">
        <BookOpen className="w-6 h-6 text-gray-500" />
        <p className="text-sm text-gray-300">No hay materias disponibles para cursar</p>
        <p className="text-xs text-gray-500">Completá las correlativas necesarias para habilitar nuevas materias.</p>
      </div>
    );
  }

  const groups = [
    { title: 'Obligatorias', items: displaySubjects.filter(s => s.l !== 6) },
    { title: 'Electivas', items: displaySubjects.filter(s => s.l === 6) }
  ].filter(group => group.items.length > 0);

  return (
    <div className="space-y-5">
      {/* Resumen de carga horaria */}
      <div className="panel-inset p-4 space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Carga horaria semanal
            </p>
            <p className="text-2xl font-semibold text-gray-100 tabular-nums mt-0.5">
              {totalHours} <span className="text-sm font-normal text-gray-400">hs</span>
              <span className="text-sm font-normal text-gray-500 ml-2">
                · {selectedSubjects.length} {selectedSubjects.length === 1 ? 'materia' : 'materias'}
              </span>
            </p>
          </div>
          {selectedSubjects.length > 0 && (
            <p className={`text-sm flex items-center gap-1.5 ${load.text}`}>
              <LoadIcon className="w-4 h-4" />
              {load.message}
            </p>
          )}
        </div>
        {/* Medidor con marcas en 24 y 30 hs */}
        <div className="relative">
          <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${load.bar}`}
              style={{ width: `${Math.min(100, (totalHours / (MAX_HOURS + 6)) * 100)}%` }}
            />
          </div>
          {[HEAVY_HOURS, MAX_HOURS].map(mark => (
            <span
              key={mark}
              className="absolute -top-0.5 h-3 w-px bg-gray-500"
              style={{ left: `${(mark / (MAX_HOURS + 6)) * 100}%` }}
              title={`${mark} hs`}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      {/* Materias disponibles */}
      {groups.map(group => (
        <div key={group.title}>
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            {group.title} <span className="text-gray-500">({group.items.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {group.items.map(subject => {
              const isSelected = selectedSubjects.includes(subject.id);
              const statePill = STATE_PILLS[subject.state];

              return (
                <label
                  key={subject.id}
                  className={`
                    relative flex items-start gap-3 pl-4 pr-3 py-3 rounded-lg border cursor-pointer
                    transition-colors focus-within:ring-2 focus-within:ring-blue-400
                    ${isSelected
                      ? 'bg-blue-500/10 border-blue-500/60'
                      : 'bg-gray-950/50 border-gray-800 hover:border-gray-600'}
                  `}
                >
                  <span
                    className={`absolute left-0 top-3 bottom-3 w-1 rounded-r ${isSelected ? 'bg-blue-400' : 'bg-gray-700'}`}
                    aria-hidden="true"
                  />
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggle(subject.id)}
                    className="sr-only"
                  />
                  {/* Checkbox visual */}
                  <span
                    className={`mt-0.5 w-4 h-4 rounded flex items-center justify-center flex-shrink-0 border ${
                      isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-600'
                    }`}
                    aria-hidden="true"
                  >
                    {isSelected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                  </span>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-[13px] leading-snug text-gray-100">
                      {subject.n}
                    </h4>
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="pill bg-gray-800 text-gray-300">
                        {subject.l === 6 ? 'Electiva' : `${subject.l}° año`}
                      </span>
                      <span className="pill bg-gray-800 text-gray-300">
                        <Clock className="w-3 h-3" />
                        {subject.h} hs
                      </span>
                      <span className="pill bg-gray-800 text-gray-300">
                        <Calendar className="w-3 h-3" />
                        {subject.m === 'A' ? 'Anual' : 'Cuatrimestral'}
                      </span>
                      {subject.it && (
                        <span
                          className="text-[10px] leading-none px-1.5 py-1 rounded font-semibold text-purple-300 border border-purple-500/40"
                          title="Cuenta para el Título Intermedio"
                        >
                          TI
                        </span>
                      )}
                      {statePill && (
                        <span className={`pill ${statePill.className}`}>{statePill.label}</span>
                      )}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CoursePlanner;
