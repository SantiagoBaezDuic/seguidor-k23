import React, { useEffect, useState, useRef } from 'react';
import subjects from '../data/subjects';

/**
 * Componente para dibujar líneas SVG permanentes entre materias y sus correlativas
 */
const CorrelationLines = ({ highlightedSubjectId, containerRef, states, subjectsWithStatus }) => {
  const [allLines, setAllLines] = useState([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const updateTimeoutRef = useRef(null);

  // Calcular todas las líneas de correlatividad
  useEffect(() => {
    if (!containerRef.current) {
      return;
    }

    const updateLines = () => {
      const container = containerRef.current;
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newLines = [];

      // Actualizar dimensiones del SVG
      setDimensions({
        width: container.scrollWidth,
        height: container.scrollHeight
      });

      // Para cada materia, dibujar líneas a sus correlativas
      // Solo mostrar líneas que llegan a materias NO CURSADAS y NO HABILITADAS
      subjectsWithStatus.forEach(subject => {
        // Filtrar: solo dibujar líneas si la materia destino no está cursada Y no está habilitada
        const subjectState = states[subject.id] || 0;
        if (subjectState !== 0) return; // Saltar materias regulares o aprobadas
        if (subject.canEnroll) return; // Saltar materias ya habilitadas para cursar

        const subjectElement = container.querySelector(`[data-subject-id="${subject.id}"]`);
        if (!subjectElement) return;

        const subjectRect = subjectElement.getBoundingClientRect();
        const subjectLeft = {
          x: subjectRect.left - containerRect.left + container.scrollLeft,
          y: subjectRect.top + subjectRect.height / 2 - containerRect.top + container.scrollTop
        };

        // Líneas de correlativas de cursada (rc)
        subject.rc.forEach(reqId => {
          const reqElement = container.querySelector(`[data-subject-id="${reqId}"]`);
          if (reqElement) {
            const reqRect = reqElement.getBoundingClientRect();
            const reqRight = {
              x: reqRect.right - containerRect.left + container.scrollLeft,
              y: reqRect.top + reqRect.height / 2 - containerRect.top + container.scrollTop
            };

            newLines.push({
              id: `${reqId}-${subject.id}-rc`,
              x1: reqRight.x,
              y1: reqRight.y,
              x2: subjectLeft.x,
              y2: subjectLeft.y,
              type: 'cursada',
              fromId: reqId,
              toId: subject.id,
              isHighlighted: highlightedSubjectId === subject.id || highlightedSubjectId === reqId
            });
          }
        });

        // Líneas de correlativas de aprobación (ra)
        subject.ra.forEach(reqId => {
          const reqElement = container.querySelector(`[data-subject-id="${reqId}"]`);
          if (reqElement) {
            const reqRect = reqElement.getBoundingClientRect();
            const reqRight = {
              x: reqRect.right - containerRect.left + container.scrollLeft,
              y: reqRect.top + reqRect.height / 2 - containerRect.top + container.scrollTop
            };

            newLines.push({
              id: `${reqId}-${subject.id}-ra`,
              x1: reqRight.x,
              y1: reqRight.y,
              x2: subjectLeft.x,
              y2: subjectLeft.y,
              type: 'aprobacion',
              fromId: reqId,
              toId: subject.id,
              isHighlighted: highlightedSubjectId === subject.id || highlightedSubjectId === reqId
            });
          }
        });
      });

      console.log(`CorrelationLines: Dibujadas ${newLines.length} líneas totales`);
      setAllLines(newLines);
    };

    // Delay para dar tiempo a que el DOM se renderice
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    updateTimeoutRef.current = setTimeout(updateLines, 200);

    // Actualizar líneas cuando se hace scroll
    const handleScroll = () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      updateTimeoutRef.current = setTimeout(updateLines, 100);
    };

    const container = containerRef.current;
    container.addEventListener('scroll', handleScroll);

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
    };
  }, [containerRef, highlightedSubjectId, states, subjectsWithStatus]);

  /**
   * Genera un path SVG con curva bezier
   */
  const generateCurvePath = (x1, y1, x2, y2) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    
    // Control points para una curva suave
    const cx1 = x1 + dx * 0.5;
    const cy1 = y1;
    const cx2 = x1 + dx * 0.5;
    const cy2 = y2;

    return `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`;
  };

  if (allLines.length === 0 || dimensions.width === 0) return null;

  return (
    <svg
      className="absolute inset-0 pointer-events-none overflow-visible"
      style={{ 
        zIndex: 0,
        width: '100%',
        height: '100%',
        minWidth: `${dimensions.width}px`,
        minHeight: `${dimensions.height}px`
      }}
      viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
    >
      <defs>
        {/* Marcador de flecha para cursada (azul) */}
        <marker
          id="arrowhead-cursada"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="2.5"
          orient="auto"
        >
          <polygon
            points="0 0, 8 2.5, 0 5"
            fill="#60a5fa"
            opacity="0.6"
          />
        </marker>
        {/* Marcador de flecha para aprobación (naranja) */}
        <marker
          id="arrowhead-aprobacion"
          markerWidth="8"
          markerHeight="8"
          refX="7"
          refY="2.5"
          orient="auto"
        >
          <polygon
            points="0 0, 8 2.5, 0 5"
            fill="#fb923c"
            opacity="0.6"
          />
        </marker>
        {/* Marcador de flecha destacada para cursada */}
        <marker
          id="arrowhead-cursada-highlighted"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3, 0 6"
            fill="#60a5fa"
          />
        </marker>
        {/* Marcador de flecha destacada para aprobación */}
        <marker
          id="arrowhead-aprobacion-highlighted"
          markerWidth="10"
          markerHeight="10"
          refX="9"
          refY="3"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3, 0 6"
            fill="#fb923c"
          />
        </marker>
      </defs>

      {allLines.map(line => {
        const path = generateCurvePath(line.x1, line.y1, line.x2, line.y2);
        const isHighlighted = line.isHighlighted;
        const baseColor = line.type === 'cursada' ? '#60a5fa' : '#fb923c';
        
        return (
          <path
            key={line.id}
            d={path}
            stroke={baseColor}
            strokeWidth={isHighlighted ? '2.5' : '1.5'}
            strokeDasharray={line.type === 'aprobacion' ? '5,5' : '0'}
            fill="none"
            opacity={isHighlighted ? '0.9' : '0.3'}
            markerEnd={`url(#arrowhead-${line.type}${isHighlighted ? '-highlighted' : ''})`}
            strokeLinecap="round"
            className={isHighlighted ? 'transition-all duration-300' : ''}
          />
        );
      })}
    </svg>
  );
};

export default CorrelationLines;
