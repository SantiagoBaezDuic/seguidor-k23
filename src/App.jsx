import React, { useState, useRef, useEffect } from 'react';
import { useSubjectsState } from './hooks/useSubjectsState';
import { useScheduleState } from './hooks/useScheduleState';
import { getAffectedSubjects } from './utils/correlations';
import subjects from './data/subjects';

// Components
import LevelColumn from './components/LevelColumn';
import Statistics from './components/Statistics';
import Filters from './components/Filters';
import ExportImport from './components/ExportImport';
import CorrelationLines from './components/CorrelationLines';
import TooltipLegend from './components/TooltipLegend';
import CoursePlanner from './components/CoursePlanner';
import WeeklySchedule from './components/WeeklySchedule';

function App() {
  const {
    states,
    toggleSubjectState,
    importStates,
    resetStates,
    progress,
    intermediateProgress,
    intermediateCompleted,
    subjectsWithStatus
  } = useSubjectsState();

  const [highlightedSubjects, setHighlightedSubjects] = useState([]);
  const [highlightedForLines, setHighlightedForLines] = useState(null);
  const [activeFilters, setActiveFilters] = useState(['todas']);
  const [selectedCourses, setSelectedCourses] = useState([]);
  const containerRef = useRef(null);
  const highlightTimeoutRef = useRef(null);

  // Hook para manejar horarios
  const {
    schedule,
    addSlot,
    removeSlot,
    syncWithSelectedSubjects,
    hasConflictInCell,
    getSubjectsInCell
  } = useScheduleState();

  // Sincronizar horarios cuando cambian las materias seleccionadas
  useEffect(() => {
    syncWithSelectedSubjects(selectedCourses);
  }, [selectedCourses, syncWithSelectedSubjects]);

  /**
   * Maneja el click en una materia
   */
  const handleSubjectClick = (subjectId) => {
    // Limpiar timeout anterior si existe
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    
    // Buscar la materia con su status
    const subject = subjectsWithStatus.find(s => s.id === subjectId);
    const currentState = states[subjectId] || 0;
    
    // Si la materia está bloqueada (no cursada y no habilitada), solo resaltar requisitos pendientes
    if (currentState === 0 && subject && !subject.canEnroll) {
      // Encontrar requisitos pendientes (los que no están en estado 1 o 2)
      const pendingReqs = [];
      
      if (subject.rc) {
        subject.rc.forEach(reqId => {
          const reqState = states[reqId] || 0;
          if (reqState === 0) pendingReqs.push(reqId);
        });
      }
      
      if (subject.ra) {
        subject.ra.forEach(reqId => {
          const reqState = states[reqId] || 0;
          if (reqState < 2) pendingReqs.push(reqId);
        });
      }
      
      // Solo resaltar la materia y sus requisitos pendientes SIN cambiar estado
      setHighlightedSubjects([subjectId, ...pendingReqs]);
      setHighlightedForLines(subjectId);
    } else {
      // Materia no bloqueada: hacer toggle normal
      toggleSubjectState(subjectId);

      // Calcular materias afectadas y resaltar
      const affected = getAffectedSubjects(subjectId, subjects);
      const affectedIds = affected.map(s => s.id);
      
      setHighlightedSubjects([subjectId, ...affectedIds]);
      setHighlightedForLines(subjectId);
    }

    // Remover highlight después de 2 segundos
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedSubjects([]);
      setHighlightedForLines(null);
    }, 2000);
  };

  /**
   * Filtra las materias según los filtros activos
   */
  const filterSubjects = (subjectsList) => {
    if (activeFilters.includes('todas') || activeFilters.length === 0) {
      return subjectsList;
    }

    return subjectsList.filter(subject => {
      // Filtro por estado
      if (activeFilters.includes('no-cursadas') && subject.state === 0) return true;
      if (activeFilters.includes('regulares') && subject.state === 1) return true;
      if (activeFilters.includes('aprobadas') && subject.state === 2) return true;
      
      // Filtro por habilitación
      if (activeFilters.includes('habilitadas-cursar') && subject.state === 0 && subject.canEnroll) return true;
      
      // Filtro por título intermedio
      if (activeFilters.includes('titulo-intermedio') && subject.it === true) return true;

      return false;
    });
  };

  /**
   * Obtiene materias de un nivel específico
   */
  const getSubjectsByLevel = (level) => {
    const levelSubjects = subjectsWithStatus.filter(s => s.l === level);
    return filterSubjects(levelSubjects);
  };

  /**
   * Obtiene materias disponibles para cursar (no cursadas y habilitadas)
   */
  const availableSubjects = subjectsWithStatus.filter(
    s => s.state === 0 && s.canEnroll === true
  );

  /**
   * Obtiene los datos completos de las materias seleccionadas
   */
  const selectedSubjectsData = selectedCourses
    .map(id => subjectsWithStatus.find(s => s.id === id))
    .filter(Boolean);

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 sticky top-0 z-20">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-center text-blue-400">
              Plan de Estudios ISI 2023 - UTN FRBA
            </h1>
            <p className="text-center text-gray-400 text-sm mt-1">
              Ingeniería en Sistemas de Información
            </p>
          </div>
          <TooltipLegend />
        </div>
      </header>

      {/* Control Panel */}
      <div className="container mx-auto px-4 py-6 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Statistics
            progress={progress}
            intermediateProgress={intermediateProgress}
            intermediateCompleted={intermediateCompleted}
          />
          <Filters
            activeFilters={activeFilters}
            onFilterChange={setActiveFilters}
          />
          <ExportImport
            currentStates={states}
            onImport={importStates}
            onReset={resetStates}
          />
        </div>
      </div>

      {/* Main Content - Grid de Niveles */}
      <div className="w-full px-4 pb-8">
        <div 
          ref={containerRef}
          className="relative bg-gray-900/50 rounded-lg p-8 overflow-x-auto"
        >
          {/* Líneas de correlatividades */}
          <CorrelationLines
            highlightedSubjectId={highlightedForLines}
            containerRef={containerRef}
            states={states}
            subjectsWithStatus={subjectsWithStatus}
          />

          {/* Grid horizontal de niveles */}
          <div className="flex gap-10 min-w-min">
            {[1, 2, 3, 4, 5].map(level => {
              const levelSubjects = getSubjectsByLevel(level);
              
              return (
                <LevelColumn
                  key={level}
                  level={level}
                  subjects={levelSubjects}
                  states={states}
                  onSubjectClick={handleSubjectClick}
                  highlightedIds={highlightedSubjects}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Planificador de Cursada */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold text-blue-400 mb-6">
          Planificador de Cursada
        </h2>
        
        <CoursePlanner
          availableSubjects={availableSubjects}
          selectedSubjects={selectedCourses}
          onSelectionChange={setSelectedCourses}
        />

        {/* Horario Semanal */}
        {selectedCourses.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-blue-400 mb-6">
              Horario Semanal
            </h2>
            
            <WeeklySchedule
              selectedSubjects={selectedSubjectsData}
              schedule={schedule}
              onAddSlot={addSlot}
              onRemoveSlot={removeSlot}
              hasConflictInCell={hasConflictInCell}
              getSubjectsInCell={getSubjectsInCell}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
