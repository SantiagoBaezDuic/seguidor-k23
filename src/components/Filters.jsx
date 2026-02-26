import React from 'react';
import { Filter } from 'lucide-react';

/**
 * Componente para filtrar materias por diferentes criterios
 */
const Filters = ({ activeFilters = [], onFilterChange }) => {
  const filterOptions = [
    { id: 'todas', label: 'Todas', color: 'gray' },
    { id: 'no-cursadas', label: 'No Cursadas', color: 'gray' },
    { id: 'regulares', label: 'Regulares', color: 'yellow' },
    { id: 'aprobadas', label: 'Aprobadas', color: 'green' },
    { id: 'habilitadas-cursar', label: 'Habilitadas Cursar', color: 'blue' },
    { id: 'titulo-intermedio', label: 'Título Intermedio', color: 'purple' },
  ];

  const getFilterStyles = (filter, isActive) => {
    const colorMap = {
      gray: isActive ? 'bg-gray-600 text-white' : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600',
      yellow: isActive ? 'bg-yellow-600 text-white' : 'bg-yellow-500/20 text-yellow-200 hover:bg-yellow-500/30',
      green: isActive ? 'bg-green-600 text-white' : 'bg-green-500/20 text-green-200 hover:bg-green-500/30',
      blue: isActive ? 'bg-blue-600 text-white' : 'bg-blue-500/20 text-blue-200 hover:bg-blue-500/30',
      purple: isActive ? 'bg-purple-600 text-white' : 'bg-purple-500/20 text-purple-200 hover:bg-purple-500/30',
    };

    return colorMap[filter.color] || colorMap.gray;
  };

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

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
      <h2 className="text-lg font-bold text-blue-400 flex items-center gap-2">
        <Filter className="w-5 h-5" />
        Filtros
      </h2>

      <div className="flex flex-wrap gap-2">
        {filterOptions.map(filter => {
          const isActive = effectiveFilters.includes(filter.id);
          
          return (
            <button
              key={filter.id}
              onClick={() => handleFilterToggle(filter.id)}
              className={`
                px-3 py-1.5 rounded-full text-xs font-medium
                transition-all duration-200
                ${getFilterStyles(filter, isActive)}
                ${isActive ? 'ring-2 ring-offset-2 ring-offset-gray-900' : ''}
              `}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {effectiveFilters.length > 0 && !effectiveFilters.includes('todas') && (
        <div className="text-xs text-gray-400 italic">
          Mostrando: {effectiveFilters.map(f => 
            filterOptions.find(opt => opt.id === f)?.label
          ).join(', ')}
        </div>
      )}
    </div>
  );
};

export default Filters;
