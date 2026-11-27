import React, { useState, useRef, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { useSubjectsState } from './hooks/useSubjectsState';
import { useScheduleState } from './hooks/useScheduleState';
import { useComparisonState } from './hooks/useComparisonState';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useToasts } from './hooks/useToasts';
import { getAffectedSubjects, getCorrelativeIds } from './utils/correlations';
import subjects from './data/subjects';

// Components
import LevelColumn from './components/LevelColumn';
import Statistics from './components/Statistics';
import Filters from './components/Filters';
import ExportImport from './components/ExportImport';
import CorrelationLines, { LINE_COLORS } from './components/CorrelationLines';
import TooltipLegend from './components/TooltipLegend';
import CoursePlanner from './components/CoursePlanner';
import WeeklySchedule from './components/WeeklySchedule';
import ClassmateComparison from './components/ClassmateComparison';
import PendingFinals from './components/PendingFinals';
import Toasts from './components/Toasts';
import SectionHeader from './components/SectionHeader';
import { Network, ListChecks, CalendarDays } from 'lucide-react';

const STATE_LABELS = ['No cursada', 'Cursando', 'Regular', 'Aprobada'];

const SECTIONS = [
  { id: 'plan', label: 'Plan' },
  { id: 'finales', label: 'Finales' },
  { id: 'companeros', label: 'Compañeros' },
  { id: 'planificador', label: 'Planificador' },
];

// Marcas diacríticas combinables (U+0300–U+036F), para buscar sin acentos
// eslint-disable-next-line no-misleading-character-class
const DIACRITICS_REGEX = /[̀-ͯ]/g;

/**
 * Normaliza texto para búsquedas: minúsculas y sin acentos
 */
const normalizeText = (text) => text
  .toLowerCase()
  .normalize('NFD')
  .replace(DIACRITICS_REGEX, '');

function App() {
  const [showElectives, setShowElectives] = useLocalStorage('isi-show-electives', true);

  const {
    states,
    exceptions,
    setSubjectState,
    toggleException,
    importExceptions,
    importStates,
    resetStates,
    progress,
    intermediateProgress,
    intermediateCompleted,
    subjectsWithStatus,
    pendingFinals
  } = useSubjectsState(showElectives);

  const [highlightedSubjects, setHighlightedSubjects] = useState([]);
  const [highlightedForLines, setHighlightedForLines] = useState(null);
  const [activeFilters, setActiveFilters] = useState(['todas']);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourses, setSelectedCourses] = useLocalStorage('isi-tracker-selected-courses', []);
  const [userName, setUserName] = useLocalStorage('isi-tracker-username', '');
  const [hoveredSubjectId, setHoveredSubjectId] = useState(null);
  const [showNetwork, setShowNetwork] = useLocalStorage('isi-show-network', false);
  const containerRef = useRef(null);
  const highlightTimeoutRef = useRef(null);
  const hoverTimeoutRef = useRef(null);
  const { toasts, notify, dismiss } = useToasts();

  /**
   * Materia enfocada por hover/teclado. Al salir se espera un instante antes de
   * limpiar, para no parpadear al mover el mouse de una tarjeta a otra.
   */
  const handleFocusChange = (subjectId) => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    if (subjectId === null) {
      hoverTimeoutRef.current = setTimeout(() => setHoveredSubjectId(null), 90);
    } else {
      setHoveredSubjectId(subjectId);
    }
  };

  // Hook para manejar horarios
  const {
    schedule,
    setSchedule,
    addSlot,
    removeSlot,
    syncWithSelectedSubjects,
    hasConflictInCell,
    getSubjectsInCell
  } = useScheduleState();

  // Hook para comparación con compañeros
  const {
    classmates,
    commonSubjects,
    compatibility,
    error: comparisonError,
    addClassmate,
    updateClassmateName,
    removeClassmate,
    clearAll: clearComparison,
    hasClassmates
  } = useComparisonState(states, showElectives, exceptions);

  // El planificador solo contiene materias por cursar o en curso (estado 0 o 1).
  // Una materia Regular o Aprobada ya terminó la cursada: se quita de la selección
  // (y, por la sincronización de abajo, también del horario). Esto cubre el
  // ciclo de estados por click, los imports y datos guardados de versiones viejas.
  useEffect(() => {
    if (selectedCourses.some(id => (states[id] || 0) >= 2)) {
      setSelectedCourses(prev => prev.filter(id => (states[id] || 0) < 2));
    }
  }, [states, selectedCourses, setSelectedCourses]);

  // Podar del horario las materias que el usuario deselecciona en el planificador
  useEffect(() => {
    syncWithSelectedSubjects(selectedCourses);
  }, [selectedCourses, syncWithSelectedSubjects]);

  /**
   * Aplica una lista de IDs de materias seleccionadas (ej. tras importar un backup)
   */
  const applyImportedSelectedCourses = (courseIds) => {
    if (!courseIds || courseIds.length === 0) return;
    const validIds = courseIds.filter(id => subjects.some(s => s.id === id));
    if (validIds.length > 0) {
      setSelectedCourses(validIds);
    }
  };

  /**
   * Resalta una materia y las relacionadas durante 2 segundos
   */
  const flashHighlight = (subjectId, relatedIds) => {
    if (highlightTimeoutRef.current) {
      clearTimeout(highlightTimeoutRef.current);
    }
    setHighlightedSubjects([subjectId, ...relatedIds]);
    setHighlightedForLines(subjectId);
    highlightTimeoutRef.current = setTimeout(() => {
      setHighlightedSubjects([]);
      setHighlightedForLines(null);
    }, 2000);
  };

  /**
   * Cambia el estado de una materia y ofrece deshacer el cambio
   */
  const changeSubjectState = (subjectId, newState) => {
    const subject = subjectsWithStatus.find(s => s.id === subjectId);
    const previousState = states[subjectId] || 0;
    if (!subject || newState === previousState) return;

    setSubjectState(subjectId, newState);

    // Si la materia pasa a "Cursando", seleccionarla automáticamente en el
    // Planificador de Cursada (dejó de ser solo una materia habilitada: ya se está cursando)
    const autoSelected = newState === 1 && !selectedCourses.includes(subjectId);
    if (autoSelected) {
      setSelectedCourses(prev => prev.includes(subjectId) ? prev : [...prev, subjectId]);
    }

    // Si terminó la cursada (Regular/Aprobada), sale del planificador. Se guardan
    // sus bloques horarios para poder restaurarlos al deshacer.
    const removedFromPlanner = newState >= 2 && selectedCourses.includes(subjectId);
    const savedSlots = removedFromPlanner ? schedule[subjectId] : undefined;
    if (removedFromPlanner) {
      setSelectedCourses(prev => prev.filter(id => id !== subjectId));
    }

    const message = `${subject.n}: ${STATE_LABELS[previousState]} → ${STATE_LABELS[newState]}`;
    notify(removedFromPlanner ? `${message} · se quitó del planificador` : message, {
      key: 'subject-state',
      action: {
        label: 'Deshacer',
        onClick: () => {
          setSubjectState(subjectId, previousState);
          if (autoSelected) {
            setSelectedCourses(prev => prev.filter(id => id !== subjectId));
          }
          if (removedFromPlanner) {
            setSelectedCourses(prev => prev.includes(subjectId) ? prev : [...prev, subjectId]);
            if (savedSlots) {
              setSchedule(prev => ({ ...prev, [subjectId]: savedSlots }));
            }
          }
        }
      }
    });

    // Resaltar las materias que dependen de esta
    const affected = getAffectedSubjects(subjectId, subjects);
    flashHighlight(subjectId, affected.map(s => s.id));
  };

  /**
   * Maneja el click en una materia: avanza al siguiente estado
   */
  const handleSubjectClick = (subjectId) => {
    const subject = subjectsWithStatus.find(s => s.id === subjectId);
    const currentState = states[subjectId] || 0;

    // Si la materia está bloqueada (no cursada, no habilitada y sin excepción), solo resaltar requisitos pendientes
    if (currentState === 0 && subject && !subject.canEnroll) {
      const pendingReqs = [];

      getCorrelativeIds(subject.rc).forEach(reqId => {
        if ((states[reqId] || 0) < 2) pendingReqs.push(reqId); // rc requiere Regular o Aprobada
      });

      getCorrelativeIds(subject.ra).forEach(reqId => {
        if ((states[reqId] || 0) < 3) pendingReqs.push(reqId); // ra requiere Aprobada
      });

      flashHighlight(subjectId, pendingReqs);
      notify(`${subject.n} está bloqueada: se resaltan las correlativas que te faltan.`, {
        key: 'subject-state',
        duration: 3000
      });
      return;
    }

    changeSubjectState(subjectId, (currentState + 1) % 4);
  };

  /**
   * Retrocede una materia al estado anterior (click derecho / Backspace)
   */
  const handleSubjectStepBack = (subjectId) => {
    const currentState = states[subjectId] || 0;
    if (currentState === 0) return;
    changeSubjectState(subjectId, currentState - 1);
  };

  const normalizedQuery = normalizeText(searchQuery.trim());

  /**
   * Filtra las materias según la búsqueda y los filtros activos
   */
  const filterSubjects = (subjectsList) => {
    const bySearch = normalizedQuery
      ? subjectsList.filter(subject =>
          normalizeText(subject.n).includes(normalizedQuery) ||
          (subject.code && normalizeText(subject.code).includes(normalizedQuery)))
      : subjectsList;

    if (activeFilters.includes('todas') || activeFilters.length === 0) {
      return bySearch;
    }

    return bySearch.filter(subject => {
      // Filtro por estado
      if (activeFilters.includes('no-cursadas') && subject.state === 0) return true;
      if (activeFilters.includes('cursando') && subject.state === 1) return true;
      if (activeFilters.includes('regulares') && subject.state === 2) return true;
      if (activeFilters.includes('aprobadas') && subject.state === 3) return true;

      // Filtro por habilitación
      if (activeFilters.includes('habilitadas-cursar') && subject.state === 0 && subject.canEnroll) return true;

      // Filtro por título intermedio
      if (activeFilters.includes('titulo-intermedio') && subject.it === true) return true;

      return false;
    });
  };

  /**
   * Obtiene materias de un nivel específico
   * Excluye nivel 6 (electivas) si el toggle está desactivado
   */
  const getSubjectsByLevel = (level) => {
    // Si es nivel 6 y el toggle está desactivado, devolver array vacío
    if (level === 6 && !showElectives) return [];

    const levelSubjects = subjectsWithStatus.filter(s => s.l === level);
    return filterSubjects(levelSubjects);
  };

  const subjectsByLevel = [1, 2, 3, 4, 5, 6].reduce((acc, level) => {
    acc[level] = getSubjectsByLevel(level);
    return acc;
  }, {});
  const visibleSubjectCount = Object.values(subjectsByLevel).reduce((sum, list) => sum + list.length, 0);
  const totalSubjectCount = subjectsWithStatus.filter(s => showElectives || s.l !== 6).length;

  /**
   * Obtiene materias disponibles para cursar (no cursadas y habilitadas)
   * Excluye electivas si el toggle está desactivado
   */
  const availableSubjects = subjectsWithStatus.filter(
    s => s.state === 0 && s.canEnroll === true && (showElectives || s.l !== 6)
  );

  /**
   * Obtiene los datos completos de las materias seleccionadas
   */
  const selectedSubjectsData = selectedCourses
    .map(id => subjectsWithStatus.find(s => s.id === id))
    .filter(Boolean);

  const comparisonData = hasClassmates
    ? { userStates: states, userExceptions: exceptions, classmates }
    : null;

  // Foco de la red de correlativas: hover/teclado tiene prioridad sobre el click
  const focusId = hoveredSubjectId ?? highlightedForLines;
  const focusedSubject = focusId !== null ? subjectsWithStatus.find(s => s.id === focusId) : null;
  const relatedIds = focusedSubject
    ? new Set([
        focusId,
        ...getCorrelativeIds(focusedSubject.rc),
        ...getCorrelativeIds(focusedSubject.ra),
        ...getAffectedSubjects(focusId, subjects).map(s => s.id)
      ])
    : null;

  // Progreso por año (sobre todas las materias del nivel, sin filtros)
  const levelStats = [1, 2, 3, 4, 5, 6].reduce((acc, level) => {
    const inLevel = subjectsWithStatus.filter(s => s.l === level);
    acc[level] = { aprobadas: inLevel.filter(s => s.state === 3).length, total: inLevel.length };
    return acc;
  }, {});

  const columnProps = {
    states,
    onSubjectClick: handleSubjectClick,
    onSubjectStepBack: handleSubjectStepBack,
    highlightedIds: highlightedSubjects,
    focusId,
    relatedIds,
    onFocusChange: handleFocusChange,
    comparisonData,
    onToggleException: toggleException
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="bg-gray-900/85 backdrop-blur-md border-b border-gray-800 sticky top-0 z-30">
        <div className="page-container pt-3 pb-1 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/logo.png" alt="" className="w-9 h-9 rounded-lg flex-shrink-0" />
            <div className="min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-gray-100 truncate">
                Plan K23 <span className="text-blue-400">· UTN FRBA</span>
              </h1>
              <p className="text-gray-400 text-xs truncate">
                Ingeniería en Sistemas de Información
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <label htmlFor="user-name" className="sr-only">Tu nombre</label>
            <input
              id="user-name"
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder="Tu nombre"
              title="Se usa en el nombre del backup y al compararte con compañeros"
              maxLength={40}
              className="w-28 sm:w-40 px-3 py-1.5 text-sm bg-gray-800 border border-gray-700 rounded-lg
                text-gray-200 placeholder:text-gray-500 focus:outline-none focus:border-blue-500"
            />
            <TooltipLegend />
          </div>
        </div>

        {/* Navegación por secciones */}
        <nav aria-label="Secciones" className="page-container">
          <ul className="flex gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SECTIONS.map(section => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="flex items-center px-3 py-2 text-sm text-gray-400 hover:text-gray-100 border-b-2
                    border-transparent hover:border-blue-500/60 whitespace-nowrap transition-colors"
                >
                  {section.label}
                  {section.id === 'finales' && pendingFinals.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-orange-500/20 text-orange-300">
                      {pendingFinals.length}
                    </span>
                  )}
                  {section.id === 'companeros' && classmates.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-cyan-500/20 text-cyan-300">
                      {classmates.length}
                    </span>
                  )}
                  {section.id === 'planificador' && selectedCourses.length > 0 && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-blue-500/20 text-blue-300">
                      {selectedCourses.length}
                    </span>
                  )}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Control Panel */}
      <div className="page-container pt-6 pb-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-stretch">
          <Statistics
            progress={progress}
            intermediateProgress={intermediateProgress}
            intermediateCompleted={intermediateCompleted}
          />
          <Filters
            activeFilters={activeFilters}
            onFilterChange={setActiveFilters}
            showElectives={showElectives}
            onToggleElectives={setShowElectives}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            resultCount={visibleSubjectCount}
            totalCount={totalSubjectCount}
          />
          <ExportImport
            currentStates={states}
            currentSchedule={schedule}
            currentSelectedCourses={selectedCourses}
            currentExceptions={exceptions}
            userName={userName}
            onImport={importStates}
            onImportExceptions={importExceptions}
            onImportSchedule={setSchedule}
            onImportSelectedCourses={applyImportedSelectedCourses}
            onReset={resetStates}
            notify={notify}
          />
        </div>
      </div>

      {/* Main Content - Grid de Niveles */}
      <section id="plan" className="page-container py-4 space-y-3">
        {/* Barra de herramientas del plan: ayuda, leyenda de líneas y toggle de red */}
        <SectionHeader icon={Network} title="Plan de estudios" />
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
          <p className="text-xs text-gray-500">
            <span className="text-gray-300 font-medium">Pasá el mouse</span> por una materia para ver sus correlativas ·{' '}
            <span className="text-gray-300 font-medium">Click</span> avanza el estado ·{' '}
            <span className="text-gray-300 font-medium">Click derecho</span> retrocede
          </p>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-400">
            <span className="flex items-center gap-1.5">
              <svg width="22" height="6" aria-hidden="true"><line x1="1" y1="3" x2="21" y2="3" stroke={LINE_COLORS.cursada} strokeWidth="2" strokeLinecap="round" /></svg>
              Falta regularizar
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="22" height="6" aria-hidden="true"><line x1="1" y1="3" x2="21" y2="3" stroke={LINE_COLORS.aprobacion} strokeWidth="2" strokeDasharray="6 4" strokeLinecap="round" /></svg>
              Falta aprobar
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="22" height="6" aria-hidden="true"><line x1="1" y1="3" x2="21" y2="3" stroke={LINE_COLORS.cumplida} strokeWidth="2" strokeLinecap="round" /></svg>
              Cumplida
            </span>
            <label className="flex items-center gap-2 cursor-pointer select-none pl-2 border-l border-gray-800">
              <input
                type="checkbox"
                checked={showNetwork}
                onChange={(e) => setShowNetwork(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-gray-600 bg-gray-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
              />
              Mostrar lo que bloquea cada materia
            </label>
          </div>
        </div>

        <div
          ref={containerRef}
          className="panel relative p-8 overflow-x-auto overflow-y-auto max-h-[800px]"
        >
          {/* Líneas de correlatividades */}
          <CorrelationLines
            focusId={focusId}
            showNetwork={showNetwork}
            containerRef={containerRef}
            states={states}
            subjectsWithStatus={subjectsWithStatus}
          />

          {/* Grid horizontal de niveles (el espacio entre columnas es el canal de las líneas) */}
          <div
            className="flex gap-20 w-max mx-auto"
            data-grid="levels"
          >
            {[1, 2, 3, 4, 5].map(level => (
              <LevelColumn
                key={level}
                level={level}
                subjects={subjectsByLevel[level]}
                levelStats={levelStats[level]}
                {...columnProps}
              />
            ))}
          </div>
        </div>

        {/* Electivas: sección propia (grilla compacta) en vez de una columna más
            del grid de correlativas, para no inflar su alto con 19 materias */}
        {showElectives && (
          <div className="panel relative p-6">
            <LevelColumn
              level={6}
              subjects={subjectsByLevel[6]}
              levelStats={{ aprobadas: Math.min(levelStats[6].aprobadas, 7), total: 7 }}
              {...columnProps}
              layout="grid"
            />
          </div>
        )}
      </section>

      {/* Finales Pendientes */}
      <section id="finales" className="page-container py-4">
        <PendingFinals pendingFinals={pendingFinals} />
      </section>

      {/* Comparación con Compañeros */}
      <section id="companeros" className="page-container py-4">
        <ClassmateComparison
          userStates={states}
          userExceptions={exceptions}
          classmates={classmates}
          commonSubjects={commonSubjects}
          compatibility={compatibility}
          showElectives={showElectives}
          error={comparisonError}
          onAddClassmate={addClassmate}
          onUpdateName={updateClassmateName}
          onRemoveClassmate={removeClassmate}
          onClearAll={clearComparison}
        />
      </section>

      {/* Planificador de Cursada */}
      <section id="planificador" className="page-container pt-4 pb-16 space-y-8">
        <div className="panel p-5 space-y-5">
          <SectionHeader
            icon={ListChecks}
            title="Planificador de cursada"
            description="Elegí las materias que pensás cursar para calcular la carga horaria y armar el horario."
          />
          <CoursePlanner
            availableSubjects={availableSubjects}
            selectedSubjects={selectedCourses}
            selectedSubjectsData={selectedSubjectsData}
            onSelectionChange={setSelectedCourses}
          />
        </div>

        {/* Horario Semanal */}
        {selectedCourses.length > 0 && (
          <div className="panel p-5 space-y-5">
            <SectionHeader
              icon={CalendarDays}
              title="Horario semanal"
              description="Cargá los bloques de cada comisión para detectar superposiciones."
            />

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
      </section>

      <Toasts toasts={toasts} onDismiss={dismiss} />

      {/* Vercel Analytics */}
      <Analytics />
    </div>
  );
}

export default App;
