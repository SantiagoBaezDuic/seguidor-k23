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
  // Noche (14-19)
  { id: 14, time: '18:15-19:00', period: 'N', label: 'N0' },
  { id: 15, time: '19:00-19:45', period: 'N', label: 'N1' },
  { id: 16, time: '19:45-20:30', period: 'N', label: 'N2' },
  { id: 17, time: '20:45-21:30', period: 'N', label: 'N3' },
  { id: 18, time: '21:30-22:15', period: 'N', label: 'N4' },
  { id: 19, time: '22:15-23:00', period: 'N', label: 'N5' },
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
   * Genera un color consistente basado en el ID de la materia
   */
  const getSubjectColor = (subjectId) => {
    const colors = [
      'bg-blue-600 border-blue-500',
      'bg-green-600 border-green-500',
      'bg-yellow-600 border-yellow-500',
      'bg-purple-600 border-purple-500',
      'bg-pink-600 border-pink-500',
      'bg-indigo-600 border-indigo-500',
      'bg-red-600 border-red-500',
      'bg-teal-600 border-teal-500',
      'bg-orange-600 border-orange-500',
      'bg-cyan-600 border-cyan-500',
    ];
    return colors[subjectId % colors.length];
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

    // Verificar si es parte de un bloque que empezó antes
    if (slot > 0) {
      const subjectsAbove = getSubjectsInCell(day, slot - 1);
      if (subjectsAbove.includes(subjectId)) {
        // Esta celda es continuación de un bloque, no debe renderizarse
        return { shouldRender: false, rowSpan: 1 };
      }
    }

    // Es el inicio de un bloque, calcular cuántas celdas contiguas hay
    let rowSpan = 1;
    let currentSlot = slot + 1;
    while (currentSlot < TIME_SLOTS.length) {
      const subjectsBelow = getSubjectsInCell(day, currentSlot);
      if (subjectsBelow.includes(subjectId)) {
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
      <div className="mt-2 p-3 bg-gray-700/50 rounded-lg border border-gray-600">
        <div className="flex items-center justify-between mb-3">
          <h5 className="text-sm font-medium text-gray-200">Agregar horario</h5>
          <button
            onClick={() => setShowAddForm(null)}
            className="p-1 hover:bg-gray-600 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        
        <div className="space-y-2">
          {/* Selector de día */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Día</label>
            <select
              value={newSlot.day}
              onChange={(e) => setNewSlot({ ...newSlot, day: parseInt(e.target.value) })}
              className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded 
                text-gray-200 focus:border-blue-500 focus:outline-none"
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
              className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded 
                text-gray-200 focus:border-blue-500 focus:outline-none"
            >
              {TIME_SLOTS.map(slot => (
                <option key={slot.id} value={slot.id}>
                  {slot.label} ({slot.time})
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
              className="w-full px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded 
                text-gray-200 focus:border-blue-500 focus:outline-none"
            >
              {TIME_SLOTS.filter(s => s.id > newSlot.startSlot).map(slot => (
                <option key={slot.id} value={slot.id}>
                  {slot.label} ({slot.time})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => handleAddSlot(subject.id)}
            disabled={newSlot.startSlot >= newSlot.endSlot}
            className="w-full px-3 py-2 text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 
              disabled:cursor-not-allowed text-white rounded font-medium transition-colors"
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

    return (
      <div key={subject.id} className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-medium text-gray-200 text-sm mb-1">{subject.n}</h4>
            <span className={`inline-block px-2 py-0.5 rounded text-xs ${getSubjectColor(subject.id)}`}>
              {slots.length} {slots.length === 1 ? 'bloque' : 'bloques'}
            </span>
          </div>
          
          {showAddForm !== subject.id && (
            <button
              onClick={() => setShowAddForm(subject.id)}
              className="p-1.5 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              title="Agregar horario"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
          )}
        </div>

        {/* Lista de slots actuales */}
        {slots.length > 0 && (
          <div className="space-y-2 mb-2">
            {slots.map((slot, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-2 bg-gray-700/50 rounded text-xs"
              >
                <span className="text-gray-300">
                  {DAYS[slot.day].short}: {TIME_SLOTS[slot.startSlot].label} - {TIME_SLOTS[slot.endSlot - 1].label}
                  <span className="text-gray-500 ml-1">
                    ({TIME_SLOTS[slot.startSlot].time.split('-')[0]} - {TIME_SLOTS[slot.endSlot - 1].time.split('-')[1]})
                  </span>
                </span>
                <button
                  onClick={() => onRemoveSlot(subject.id, idx)}
                  className="p-1 hover:bg-red-600/50 rounded transition-colors"
                  title="Eliminar"
                >
                  <Trash2 className="w-3 h-3 text-red-400" />
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
      <div className="bg-gray-800/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Asignar horarios
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {selectedSubjects.map(subject => renderSubjectSlots(subject))}
        </div>
      </div>

      {/* Calendario semanal */}
      <div className="bg-gray-800/30 rounded-lg p-4 overflow-x-auto">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">Horario semanal</h3>
        
        <div className="min-w-[800px]">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="border border-gray-700 bg-gray-800 p-2 text-xs font-semibold text-gray-300 w-24">
                  Horario
                </th>
                {DAYS.map(day => (
                  <th
                    key={day.id}
                    className="border border-gray-700 bg-gray-800 p-2 text-xs font-semibold text-gray-300"
                  >
                    {day.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TIME_SLOTS.map(slot => (
                <tr key={slot.id}>
                  <td className="border border-gray-700 bg-gray-800/50 p-2 text-xs text-gray-400 whitespace-nowrap">
                    <div className="font-medium">{slot.label}</div>
                    <div className="text-[10px]">{slot.time}</div>
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
                    const useRowSpan = cellsToRender.length === 1 && !hasConflict && cellsToRender[0].rowSpan > 1;

                    return (
                      <td
                        key={day.id}
                        rowSpan={useRowSpan ? cellsToRender[0].rowSpan : 1}
                        className={`border border-gray-700 p-1 text-xs relative ${
                          isEmpty 
                            ? 'bg-gray-900/30' 
                            : hasConflict 
                            ? 'bg-red-900/40' 
                            : ''
                        } ${useRowSpan ? 'align-middle' : ''}`}
                      >
                        {cellsToRender.map(({ subjectId, subject, rowSpan }) => (
                          <div
                            key={subjectId}
                            className={`px-2 py-1 rounded text-xs border ${getSubjectColor(subjectId)} 
                              text-white font-medium ${hasConflict ? 'opacity-70' : ''} ${
                              useRowSpan ? 'text-center' : 'truncate'
                            }`}
                            title={subject.n}
                          >
                            {useRowSpan ? subject.n : `${subject.n.substring(0, 15)}...`}
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
        <div className="mt-4 flex items-start gap-2 text-xs text-gray-400">
          <AlertTriangle className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
          <p>
            Las celdas con fondo rojo indican conflictos de horario. 
            Ajusta los bloques para evitar superposiciones.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WeeklySchedule;
