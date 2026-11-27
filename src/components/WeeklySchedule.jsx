import React, { useState } from 'react';
import { Calendar, Plus, Trash2, AlertTriangle, X } from 'lucide-react';

// Definición de franjas horarias según la imagen de la facultad
const TIME_SLOTS = [
  // Mañana (0-6)
  { id: 0, time: '07:45-08:30', period: 'M', label: 'M0' },
  { id: 1, time: '08:30-09:15', period: 'M', label: 'M1' },
  { id: 2, time: '09:15-10:00', period: 'M', label: 'M2' },
  { id: 3, time: '10:15-11:00', period: 'M', label: 'M3' },
  { id: 4, time: '11:00-11:45', period: 'M', label: 'M4' },
  { id: 5, time: '11:45-12:30', period: 'M', label: 'M5' },
  { id: 6, time: '12:30-13:15', period: 'M', label: 'M6' },
  // Tarde (7-13)
  { id: 7, time: '13:30-14:15', period: 'T', label: 'T0' },
  { id: 8, time: '14:15-15:00', period: 'T', label: 'T1' },
  { id: 9, time: '15:00-15:45', period: 'T', label: 'T2' },
  { id: 10, time: '16:00-16:45', period: 'T', label: 'T3' },
  { id: 11, time: '16:45-17:30', period: 'T', label: 'T4' },
  { id: 12, time: '17:30-18:15', period: 'T', label: 'T5' },
  { id: 13, time: '18:15-19:00', period: 'T', label: 'T6' },
  // Noche (14-18)
  { id: 14, time: '19:00-19:45', period: 'N', label: 'N0' },
  { id: 15, time: '19:45-20:30', period: 'N', label: 'N1' },
  { id: 16, time: '20:45-21:30', period: 'N', label: 'N2' },
  { id: 17, time: '21:30-22:15', period: 'N', label: 'N3' },
  { id: 18, time: '22:15-23:00', period: 'N', label: 'N4' },
];

const DAYS = [
  { id: 0, name: 'Lunes', short: 'Lun' },
  { id: 1, name: 'Martes', short: 'Mar' },
  { id: 2, name: 'Miércoles', short: 'Mié' },
  { id: 3, name: 'Jueves', short: 'Jue' },
  { id: 4, name: 'Viernes', short: 'Vie' },
  { id: 5, name: 'Sábado', short: 'Sáb' },
];

/**
 * Componente para visualizar y asignar horarios semanales
 */
const WeeklySchedule = ({ 
  selectedSubjects, 
  schedule, 
  onAddSlot, 
  onRemoveSlot, 
  hasConflictInCell,
  getSubjectsInCell 
}) => {
  const [showAddForm, setShowAddForm] = useState(null); // subjectId o null
  const [newSlot, setNewSlot] = useState({ day: 0, startSlot: 0, endSlot: 1 });

  /**
   * Genera un color consistente basado en el ID de la materia.
   * Usa 17 colores (número primo) para evitar colisiones con diferencias múltiplos de 15.
   * - dot: punto/indicador sólido
   * - block: bloque en la grilla (tinte + borde izquierdo de acento)
   * - chip: pill tintada
   */
  const getSubjectColor = (subjectId) => {
    const colors = [
      { dot: 'bg-blue-400', block: 'bg-blue-500/20 border-blue-400 text-blue-50', chip: 'bg-blue-500/15 text-blue-200' },
      { dot: 'bg-emerald-400', block: 'bg-emerald-500/20 border-emerald-400 text-emerald-50', chip: 'bg-emerald-500/15 text-emerald-200' },
      { dot: 'bg-amber-400', block: 'bg-amber-500/20 border-amber-400 text-amber-50', chip: 'bg-amber-500/15 text-amber-200' },
      { dot: 'bg-purple-400', block: 'bg-purple-500/20 border-purple-400 text-purple-50', chip: 'bg-purple-500/15 text-purple-200' },
      { dot: 'bg-rose-400', block: 'bg-rose-500/20 border-rose-400 text-rose-50', chip: 'bg-rose-500/15 text-rose-200' },
      { dot: 'bg-indigo-400', block: 'bg-indigo-500/20 border-indigo-400 text-indigo-50', chip: 'bg-indigo-500/15 text-indigo-200' },
      { dot: 'bg-cyan-400', block: 'bg-cyan-500/20 border-cyan-400 text-cyan-50', chip: 'bg-cyan-500/15 text-cyan-200' },
      { dot: 'bg-lime-400', block: 'bg-lime-500/20 border-lime-400 text-lime-50', chip: 'bg-lime-500/15 text-lime-200' },
      { dot: 'bg-fuchsia-400', block: 'bg-fuchsia-500/20 border-fuchsia-400 text-fuchsia-50', chip: 'bg-fuchsia-500/15 text-fuchsia-200' },
      { dot: 'bg-orange-400', block: 'bg-orange-500/20 border-orange-400 text-orange-50', chip: 'bg-orange-500/15 text-orange-200' },
      { dot: 'bg-teal-400', block: 'bg-teal-500/20 border-teal-400 text-teal-50', chip: 'bg-teal-500/15 text-teal-200' },
      { dot: 'bg-violet-400', block: 'bg-violet-500/20 border-violet-400 text-violet-50', chip: 'bg-violet-500/15 text-violet-200' },
      { dot: 'bg-sky-400', block: 'bg-sky-500/20 border-sky-400 text-sky-50', chip: 'bg-sky-500/15 text-sky-200' },
      { dot: 'bg-pink-400', block: 'bg-pink-500/20 border-pink-400 text-pink-50', chip: 'bg-pink-500/15 text-pink-200' },
      { dot: 'bg-green-400', block: 'bg-green-500/20 border-green-400 text-green-50', chip: 'bg-green-500/15 text-green-200' },
      { dot: 'bg-red-400', block: 'bg-red-500/20 border-red-400 text-red-50', chip: 'bg-red-500/15 text-red-200' },
      { dot: 'bg-yellow-400', block: 'bg-yellow-500/20 border-yellow-400 text-yellow-50', chip: 'bg-yellow-500/15 text-yellow-200' },
    ];

    return colors[subjectId % colors.length];
  };

  /**
   * Calcula el total de franjas horarias usadas por una materia
   */
  const getTotalSlotsUsed = (subjectId) => {
    const slots = schedule[subjectId] || [];
    return slots.reduce((total, slot) => total + (slot.endSlot - slot.startSlot), 0);
  };

  /**
   * Calcula si una celda es el inicio de un bloque contiguo de una materia
   * y cuántas celdas debe ocupar (rowSpan)
   */
  const getCellInfo = (day, slot, subjectId) => {
    // Verificar si esta materia está en esta celda
    const subjectsHere = getSubjectsInCell(day, slot);
    if (!subjectsHere.includes(subjectId)) {
      return { shouldRender: false, rowSpan: 1 };
    }

    // Solo se fusionan celdas donde la materia está sola: una celda con
    // conflicto se dibuja siempre por separado (con todas sus materias), así
    // un rowSpan nunca "tapa" una celda que igual se renderiza y descuadra la fila
    const isSoloCell = (cellSubjects) => cellSubjects.length === 1 && cellSubjects[0] === subjectId;

    if (!isSoloCell(subjectsHere)) {
      return { shouldRender: true, rowSpan: 1 };
    }

    // Verificar si es continuación de un bloque fusionado que empezó antes
    if (slot > 0 && isSoloCell(getSubjectsInCell(day, slot - 1))) {
      return { shouldRender: false, rowSpan: 1 };
    }

    // Es el inicio de un bloque, calcular cuántas celdas contiguas (sin conflicto) hay
    let rowSpan = 1;
    let currentSlot = slot + 1;
    while (currentSlot < TIME_SLOTS.length) {
      const subjectsBelow = getSubjectsInCell(day, currentSlot);
      if (isSoloCell(subjectsBelow)) {
        rowSpan++;
        currentSlot++;
      } else {
        break;
      }
    }

    return { shouldRender: true, rowSpan };
  };

  /**
   * Maneja el envío del formulario de agregar horario
   */
  const handleAddSlot = (subjectId) => {
    const success = onAddSlot(subjectId, newSlot.day, newSlot.startSlot, newSlot.endSlot);
    if (success) {
      setShowAddForm(null);
      setNewSlot({ day: 0, startSlot: 0, endSlot: 1 });
    }
  };

  /**
   * Renderiza el formulario para agregar horario
   */
  const renderAddSlotForm = (subject) => {
    if (showAddForm !== subject.id) return null;

    return (
      <div className="mt-3 p-3 bg-gray-900 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-sm font-medium text-gray-200">Agregar horario</h5>
          <button
            onClick={() => setShowAddForm(null)}
            className="btn-icon"
            aria-label="Cerrar formulario"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="space-y-2">
          {/* Selector de día */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Día</label>
            <select
              value={newSlot.day}
              onChange={(e) => setNewSlot({ ...newSlot, day: parseInt(e.target.value) })}
              className="input w-full py-1.5 px-2"
            >
              {DAYS.map(day => (
                <option key={day.id} value={day.id}>{day.name}</option>
              ))}
            </select>
          </div>

          {/* Selector de franja inicial */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Franja inicial</label>
            <select
              value={newSlot.startSlot}
              onChange={(e) => setNewSlot({ ...newSlot, startSlot: parseInt(e.target.value) })}
              className="input w-full py-1.5 px-2"
            >
              {TIME_SLOTS.map(slot => (
                <option key={slot.id} value={slot.id}>
                  {slot.label} {slot.time.split('-')[0]}
                </option>
              ))}
            </select>
          </div>

          {/* Selector de franja final */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Franja final</label>
            <select
              value={newSlot.endSlot}
              onChange={(e) => setNewSlot({ ...newSlot, endSlot: parseInt(e.target.value) })}
              className="input w-full py-1.5 px-2"
            >
              {/* Los bloques son [startSlot, endSlot); value=19 permite cubrir hasta
                  la última franja del día (id 18, 22:15-23:00). El label muestra la
                  última franja incluida y su hora de fin. */}
              {Array.from(
                { length: 19 - newSlot.startSlot },
                (_, i) => newSlot.startSlot + 1 + i
              ).map(endValue => {
                const lastIncludedSlot = TIME_SLOTS[endValue - 1];
                return (
                  <option key={endValue} value={endValue}>
                    {lastIncludedSlot.label} {lastIncludedSlot.time.split('-')[1]}
                  </option>
                );
              })}
            </select>
          </div>

          <button
            onClick={() => handleAddSlot(subject.id)}
            disabled={newSlot.startSlot >= newSlot.endSlot}
            className="btn-primary w-full"
          >
            Agregar
          </button>
        </div>
      </div>
    );
  };

  /**
   * Renderiza los bloques horarios de una materia
   */
  const renderSubjectSlots = (subject) => {
    const slots = schedule[subject.id] || [];
    const totalSlotsUsed = getTotalSlotsUsed(subject.id);
    const exceededHours = totalSlotsUsed > subject.h;

    return (
      <div key={subject.id} className="panel-inset relative pl-5 pr-4 py-4 overflow-hidden">
        <span className={`absolute left-0 top-3 bottom-3 w-1 rounded-r ${getSubjectColor(subject.id).dot}`} aria-hidden="true" />
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-100 text-sm">{subject.n}</h4>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`pill ${getSubjectColor(subject.id).chip}`}>
                {slots.length} {slots.length === 1 ? 'bloque' : 'bloques'}
              </span>
              <span className="text-xs text-gray-500">
                {totalSlotsUsed} {totalSlotsUsed === 1 ? 'franja' : 'franjas'} de {subject.h} hs semanales
              </span>
              {exceededHours && (
                <span
                  className="pill bg-amber-500/15 text-amber-300"
                  title={`Las franjas asignadas (${totalSlotsUsed}) superan las horas semanales de la materia (${subject.h} hs)`}
                >
                  <AlertTriangle className="w-3 h-3" />
                  Excede las horas
                </span>
              )}
            </div>
          </div>
          
          {showAddForm !== subject.id && (
            <button
              onClick={() => setShowAddForm(subject.id)}
              className="btn-secondary px-2.5 py-1.5 text-xs"
              title="Agregar horario"
            >
              <Plus className="w-3.5 h-3.5" />
              Horario
            </button>
          )}
        </div>

        {/* Lista de slots actuales */}
        {slots.length > 0 && (
          <div className="space-y-2 mb-2">
            {slots.map((slot, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between pl-2.5 pr-1 py-1 bg-gray-900 border border-gray-800 rounded-md text-xs"
              >
                <span className="text-gray-300">
                  {DAYS[slot.day].short}: {TIME_SLOTS[slot.startSlot].label} - {TIME_SLOTS[slot.endSlot - 1].label}
                  <span className="text-gray-500 ml-1">
                    ({TIME_SLOTS[slot.startSlot].time.split('-')[0]} - {TIME_SLOTS[slot.endSlot - 1].time.split('-')[1]})
                  </span>
                </span>
                <button
                  onClick={() => onRemoveSlot(subject.id, idx)}
                  className="btn-icon p-1 hover:text-red-300"
                  title="Eliminar"
                  aria-label="Eliminar bloque"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {renderAddSlotForm(subject)}
      </div>
    );
  };

  if (selectedSubjects.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Controles de asignación de horarios */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          Asignar horarios
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 items-start">
          {selectedSubjects.map(subject => renderSubjectSlots(subject))}
        </div>
      </div>

      {/* Calendario semanal */}
      <div className="overflow-x-auto">
        <h3 className="text-sm font-medium text-gray-300 mb-2">Grilla semanal</h3>
        
        <div className="min-w-[800px]">
          <table className="w-full table-fixed border-separate border-spacing-0 rounded-lg overflow-hidden border border-gray-800">
            <thead>
              <tr>
                <th className="border-b border-r border-gray-800 bg-gray-900 p-2 text-xs font-medium text-gray-400 w-24 text-left">
                  Horario
                </th>
                {DAYS.map(day => (
                  <th
                    key={day.id}
                    className="border-b border-r border-gray-800 last:border-r-0 bg-gray-900 p-2 text-xs font-medium text-gray-300"
                  >
                    {day.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map(slot => (
                <tr key={slot.id} className={slot.id === 7 || slot.id === 14 ? '[&>td]:border-t-gray-600' : ''}>
                  <td className="border-b border-r border-gray-800 bg-gray-900/70 px-2 py-1 text-xs text-gray-400 whitespace-nowrap">
                    <div className="font-medium text-gray-300">{slot.label}</div>
                    <div className="text-[10px] text-gray-500 tabular-nums">{slot.time}</div>
                  </td>
                  {DAYS.map(day => {
                    const subjectsInCell = getSubjectsInCell(day.id, slot.id);
                    const hasConflict = hasConflictInCell(day.id, slot.id);
                    const isEmpty = subjectsInCell.length === 0;

                    // Renderizar solo si es el inicio de un bloque o no hay fusión
                    const cellsToRender = [];
                    const renderedSubjects = new Set();

                    subjectsInCell.forEach(subjectId => {
                      if (renderedSubjects.has(subjectId)) return;

                      const cellInfo = getCellInfo(day.id, slot.id, subjectId);
                      if (cellInfo.shouldRender) {
                        renderedSubjects.add(subjectId);
                        const subject = selectedSubjects.find(s => s.id === subjectId);
                        if (subject) {
                          cellsToRender.push({
                            subjectId,
                            subject,
                            rowSpan: cellInfo.rowSpan
                          });
                        }
                      }
                    });

                    // Si todas las materias fueron filtradas (son continuación de bloques anteriores), skip esta celda
                    if (subjectsInCell.length > 0 && cellsToRender.length === 0) {
                      return null; // No renderizar esta celda, fue fusionada
                    }

                    // Determinar si usar rowSpan (solo si hay una sola materia sin conflicto)
                    const useRowSpan = cellsToRender.length === 1 && !hasConflict;
                    const blockTimeRange = useRowSpan
                      ? `${slot.time.split('-')[0]} - ${TIME_SLOTS[slot.id + cellsToRender[0].rowSpan - 1].time.split('-')[1]}`
                      : null;
                    
                    // Si hay fusión, aplicar el color de fondo a toda la celda
                    const cellBgColor = useRowSpan ? `${getSubjectColor(cellsToRender[0].subjectId).block} border-l-4` : '';

                    return (
                      <td
                        key={day.id}
                        rowSpan={useRowSpan ? cellsToRender[0].rowSpan : 1}
                        className={`border-b border-r border-gray-800 last:border-r-0 text-xs relative ${
                          useRowSpan
                            ? `${cellBgColor} px-3 py-2 align-middle`
                            : isEmpty
                            ? 'bg-gray-950/40 p-1'
                            : hasConflict
                            ? 'bg-red-500/15 p-1 shadow-[inset_0_0_0_1px_rgba(248,113,113,0.6)]'
                            : 'p-1'
                        }`}
                      >
                        {cellsToRender.map(({ subjectId, subject, rowSpan }) => (
                          <div
                            key={subjectId}
                            className={`${
                              useRowSpan 
                                ? 'font-medium text-[13px] leading-snug'
                                : `px-2 py-1 rounded border-l-2 ${getSubjectColor(subjectId).block} font-medium truncate`
                            }`}
                            title={subject.n}
                          >
                            <div>{useRowSpan ? subject.n : `${subject.n.substring(0, 15)}...`}</div>
                            {blockTimeRange && (
                              <div className="text-[11px] opacity-70 mt-0.5 tabular-nums">{blockTimeRange}</div>
                            )}
                          </div>
                        ))}
                        {hasConflict && (
                          <div className="absolute top-1 right-1">
                            <AlertTriangle className="w-3 h-3 text-red-400" />
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Nota sobre conflictos */}
        <div className="mt-3 flex items-start gap-2 text-xs text-gray-500">
          <AlertTriangle className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
          <p>
            Las celdas con borde rojo indican superposición de horarios. Ajustá los bloques para evitarla.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedule;
