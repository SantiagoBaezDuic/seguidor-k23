import React from 'react';
import { Filter, Search, X } from 'lucide-react';
import SectionHeader from './SectionHeader';

// `dot`: color del estado (mismo que la barra de acento de las tarjetas)
const FILTER_OPTIONS = [
  { id: 'todas', label: 'Todas' },
  { id: 'no-cursadas', label: 'No cursadas', dot: 'bg-gray-500' },
  { id: 'cursando', label: 'Cursando', dot: 'bg-sky-400' },
  { id: 'regulares', label: 'Regulares', dot: 'bg-amber-400' },
  { id: 'aprobadas', label: 'Aprobadas', dot: 'bg-emerald-400' },
  { id: 'habilitadas-cursar', label: 'Habilitadas', dot: 'bg-blue-400' },
  { id: 'titulo-intermedio', label: 'Título intermedio', dot: 'bg-purple-400' },
];

const chipClass = (isActive) => `
  inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border
  transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400
  ${isActive
    ? 'bg-blue-500/15 border-blue-500/60 text-blue-100'
    : 'bg-gray-950/40 border-gray-700 text-gray-300 hover:border-gray-500 hover:text-gray-100'}
`;

/**
 * Componente para filtrar materias por diferentes criterios
 */
const Filters = ({
  activeFilters = [],
  onFilterChange,
  showElectives = true,
  onToggleElectives,
  searchQuery = '',
  onSearchChange,
  resultCount,
  totalCount
}) => {
  const handleFilterToggle = (filterId) => {
    if (filterId === 'todas') {
      onFilterChange([]);
    } else {
      const newFilters = activeFilters.includes(filterId)
        ? activeFilters.filter(f => f !== filterId)
        : [...activeFilters.filter(f => f !== 'todas'), filterId];

      onFilterChange(newFilters.length === 0 ? ['todas'] : newFilters);
    }
  };

  const effectiveFilters = activeFilters.length === 0 ? ['todas'] : activeFilters;
  const isFiltering = !effectiveFilters.includes('todas');

  return (
    <div className="panel p-5 space-y-4">
      <SectionHeader icon={Filter} title="Filtros" />

      {/* Buscador por nombre */}
      {onSearchChange && (
        <div className="relative">
          <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && onSearchChange('')}
            placeholder="Buscar materia…"
            aria-label="Buscar materia por nombre"
            className="input w-full pl-9 pr-9 [&::-webkit-search-cancel-button]:hidden"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="btn-icon absolute right-1.5 top-1/2 -translate-y-1/2"
              aria-label="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {FILTER_OPTIONS.map(filter => {
          const isActive = effectiveFilters.includes(filter.id);
          return (
            <button
              key={filter.id}
              onClick={() => handleFilterToggle(filter.id)}
              aria-pressed={isActive}
              className={chipClass(isActive)}
            >
              {filter.dot && <span className={`w-2 h-2 rounded-full ${filter.dot}`} aria-hidden="true" />}
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Toggle de Electivas (separado) */}
      {onToggleElectives && (
        <label className="flex items-center justify-between gap-3 pt-3 border-t border-gray-800 cursor-pointer select-none">
          <span className="text-sm text-gray-300">Mostrar electivas</span>
          <span className="relative inline-flex">
            <input
              type="checkbox"
              role="switch"
              checked={showElectives}
              onChange={(e) => onToggleElectives(e.target.checked)}
              className="peer sr-only"
            />
            <span className="w-9 h-5 rounded-full bg-gray-700 peer-checked:bg-blue-600 transition-colors
              peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400" />
            <span className="absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform
              peer-checked:translate-x-4" />
          </span>
        </label>
      )}

      {(isFiltering || searchQuery) && (
        <div className="flex items-center justify-between gap-2 text-xs text-gray-400">
          <span>
            {typeof resultCount === 'number' && (
              <span className="font-semibold text-gray-200">{resultCount}</span>
            )}
            {typeof resultCount === 'number' && typeof totalCount === 'number' && ` de ${totalCount} materias`}
            {isFiltering && (
              <span className="italic">
                {' · '}{effectiveFilters.map(f => FILTER_OPTIONS.find(opt => opt.id === f)?.label).join(', ')}
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={() => {
              onFilterChange(['todas']);
              onSearchChange?.('');
            }}
            className="text-blue-400 hover:text-blue-300 font-medium whitespace-nowrap"
          >
            Limpiar
          </button>
        </div>
      )}
    </div>
  );
};

export default Filters;
