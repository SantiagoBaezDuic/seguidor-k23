import React, { useLayoutEffect, useEffect, useState, useMemo, useCallback } from 'react';
import { getCorrelativeIds } from '../utils/correlations';

// Colores de las líneas (deben coincidir con la leyenda)
export const LINE_COLORS = {
  cursada: '#60a5fa',     // blue-400: falta regularizar
  aprobacion: '#fb923c',  // orange-400: falta aprobar el final
  cumplida: '#34d399'     // emerald-400: requisito ya cumplido
};

/**
 * Construye todas las aristas de correlatividad del plan (sin electivas).
 * Si una materia figura como correlativa de cursada y de aprobación a la vez,
 * se conserva solo la de aprobación (el requisito más fuerte).
 * @returns {Array<{from:number,to:number,type:'cursada'|'aprobacion',satisfied:boolean}>}
 */
const buildEdges = (subjectsWithStatus, states) => {
  const edges = new Map();

  subjectsWithStatus.forEach(subject => {
    if (subject.hideCorrelations || subject.isElective) return;

    getCorrelativeIds(subject.rc).forEach(reqId => {
      edges.set(`${reqId}-${subject.id}`, {
        from: reqId,
        to: subject.id,
        type: 'cursada',
        satisfied: (states[reqId] || 0) >= 2
      });
    });

    getCorrelativeIds(subject.ra).forEach(reqId => {
      edges.set(`${reqId}-${subject.id}`, {
        from: reqId,
        to: subject.id,
        type: 'aprobacion',
        satisfied: (states[reqId] || 0) >= 3
      });
    });
  });

  return [...edges.values()];
};

/**
 * Distribuye los extremos de varias líneas a lo largo del borde de una tarjeta,
 * ordenados por la altura del otro extremo, para que no converjan en un único punto.
 */
const assignPorts = (edges, rects, side) => {
  const groups = new Map();
  edges.forEach(edge => {
    const own = side === 'in' ? edge.to : edge.from;
    if (!groups.has(own)) groups.set(own, []);
    groups.get(own).push(edge);
  });

  const ports = new Map();
  groups.forEach((group, ownId) => {
    const rect = rects[ownId];
    const otherY = (edge) => rects[side === 'in' ? edge.from : edge.to].cy;
    group.sort((a, b) => otherY(a) - otherY(b));

    // Usar la franja central (60%) del alto de la tarjeta
    const span = rect.height * 0.6;
    const start = rect.cy - span / 2;
    group.forEach((edge, i) => {
      const y = group.length === 1 ? rect.cy : start + (span * i) / (group.length - 1);
      ports.set(`${edge.from}-${edge.to}`, y);
    });
  });

  return ports;
};

/**
 * Agrupa las tarjetas medidas en columnas (misma coordenada x) y calcula, para
 * cada columna, los huecos verticales entre tarjetas por donde puede cruzar una línea.
 * @returns {Array<{left:number,right:number,gaps:number[]}>}
 */
const buildColumns = (rects) => {
  const byLeft = new Map();
  Object.values(rects).forEach(rect => {
    if (!byLeft.has(rect.left)) byLeft.set(rect.left, []);
    byLeft.get(rect.left).push(rect);
  });

  return [...byLeft.entries()]
    .sort(([a], [b]) => a - b)
    .map(([left, cards]) => {
      cards.sort((a, b) => a.top - b.top);
      const gaps = [cards[0].top - 10];
      for (let i = 0; i < cards.length - 1; i++) {
        gaps.push((cards[i].top + cards[i].height + cards[i + 1].top) / 2);
      }
      const last = cards[cards.length - 1];
      gaps.push(last.top + last.height + 10);
      return { left, right: left + (cards[0].right - cards[0].left), gaps };
    });
};

/**
 * Curva S horizontal entre dos puntos (tangentes horizontales en los extremos)
 */
const sCurve = (a, b) => {
  const offset = Math.max(24, (b.x - a.x) * 0.5);
  return `C ${a.x + offset} ${a.y}, ${b.x - offset} ${b.y}, ${b.x} ${b.y}`;
};

/**
 * Path de una correlativa. Si salta columnas, cruza cada columna intermedia por
 * el hueco entre tarjetas más cercano a su trayectoria, en lugar de pasar por
 * detrás de materias que no tienen nada que ver.
 */
const routePath = (x1, y1, x2, y2, columns) => {
  const between = columns.filter(col => col.left > x1 && col.right < x2);
  const points = [{ x: x1, y: y1 }];

  between.forEach(col => {
    const t = ((col.left + col.right) / 2 - x1) / (x2 - x1);
    const idealY = y1 + (y2 - y1) * t;
    const gapY = col.gaps.reduce((best, g) => (Math.abs(g - idealY) < Math.abs(best - idealY) ? g : best));
    points.push({ x: col.left - 6, y: gapY, enter: true });
    points.push({ x: col.right + 6, y: gapY });
  });
  points.push({ x: x2, y: y2 });

  let d = `M ${x1} ${y1}`;
  for (let i = 1; i < points.length; i++) {
    const p = points[i];
    // Dentro de una columna intermedia: tramo recto por el hueco
    d += p.enter === undefined && points[i - 1].enter ? ` L ${p.x} ${p.y}` : ` ${sCurve(points[i - 1], p)}`;
  }
  return d;
};

/**
 * Líneas SVG de correlatividades entre materias.
 *
 * - Con una materia enfocada (hover/foco/click): muestra todas sus correlativas
 *   (entrantes) y las materias que habilita (salientes), coloreadas según si el
 *   requisito ya está cumplido.
 * - Sin foco y con `showNetwork`: muestra, tenues, solo los requisitos que hoy
 *   bloquean materias no cursadas.
 */
const CorrelationLines = ({ containerRef, states, subjectsWithStatus, focusId = null, showNetwork = false }) => {
  const [layout, setLayout] = useState({ rects: {}, width: 0, height: 0 });

  /**
   * Mide la posición de cada tarjeta en coordenadas del contenido scrolleable
   * (independiente del scroll actual). Solo actualiza el estado si algo cambió.
   */
  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const rects = {};
    container.querySelectorAll('[data-subject-id]').forEach(el => {
      const r = el.getBoundingClientRect();
      const left = Math.round(r.left - containerRect.left + container.scrollLeft);
      const top = Math.round(r.top - containerRect.top + container.scrollTop);
      rects[el.dataset.subjectId] = {
        left,
        right: left + Math.round(r.width),
        top,
        height: Math.round(r.height),
        cy: top + Math.round(r.height) / 2
      };
    });

    const next = { rects, width: container.scrollWidth, height: container.scrollHeight };
    setLayout(prev => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, [containerRef]);

  // Re-medir después de cada render (filtros, estados y búsqueda cambian el layout)
  useLayoutEffect(() => {
    measure();
  });

  // Re-medir ante cambios de tamaño que no pasan por React (ventana, fuentes)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    const observer = new ResizeObserver(() => measure());
    observer.observe(container);
    if (container.firstElementChild) observer.observe(container.firstElementChild);
    return () => observer.disconnect();
  }, [containerRef, measure]);

  const allEdges = useMemo(
    () => buildEdges(subjectsWithStatus, states),
    [subjectsWithStatus, states]
  );

  const lines = useMemo(() => {
    const { rects } = layout;
    const statusById = new Map(subjectsWithStatus.map(s => [s.id, s]));

    let visible;
    if (focusId !== null) {
      visible = allEdges.filter(e => e.from === focusId || e.to === focusId);
    } else if (showNetwork) {
      // Solo los requisitos pendientes de materias que hoy están bloqueadas
      visible = allEdges.filter(e => {
        const target = statusById.get(e.to);
        return target && target.state === 0 && !target.canEnroll && !e.satisfied;
      });
    } else {
      visible = [];
    }

    visible = visible.filter(e => rects[e.from] && rects[e.to] && rects[e.from].right < rects[e.to].left);

    const inPorts = assignPorts(visible, rects, 'in');
    const outPorts = assignPorts(visible, rects, 'out');
    const columns = buildColumns(rects);

    return visible.map(edge => {
      const key = `${edge.from}-${edge.to}`;
      const x1 = rects[edge.from].right;
      const y1 = outPorts.get(key);
      const x2 = rects[edge.to].left - 2; // dejar lugar a la punta de flecha
      const y2 = inPorts.get(key);
      return { ...edge, key, x1, y1, x2, y2, d: routePath(x1, y1, x2, y2, columns) };
    });
  }, [layout, allEdges, focusId, showNetwork, subjectsWithStatus]);

  if (lines.length === 0 || layout.width === 0) return null;

  const isFocusMode = focusId !== null;

  // Dibujar primero las cumplidas, para que las pendientes queden encima
  const ordered = [...lines].sort((a, b) => Number(b.satisfied) - Number(a.satisfied));

  return (
    <svg
      className="absolute top-0 left-0 pointer-events-none"
      style={{ zIndex: 0, width: layout.width, height: layout.height }}
      viewBox={`0 0 ${layout.width} ${layout.height}`}
      aria-hidden="true"
    >
      <defs>
        {Object.entries(LINE_COLORS).map(([name, color]) => (
          <marker
            key={name}
            id={`arrow-${name}`}
            viewBox="0 0 10 10"
            refX="9"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            markerUnits="userSpaceOnUse"
            orient="auto"
          >
            <path d="M 0 1 L 9 5 L 0 9 z" fill={color} />
          </marker>
        ))}
      </defs>

      {ordered.map(line => {
        const colorKey = line.satisfied ? 'cumplida' : line.type;
        const color = LINE_COLORS[colorKey];
        const opacity = isFocusMode ? (line.satisfied ? 0.6 : 0.95) : 0.28;

        return (
          <g key={line.key} opacity={opacity}>
            {/* Halo oscuro para separar la línea de lo que tiene detrás */}
            {isFocusMode && (
              <path d={line.d} stroke="#030712" strokeWidth="5" fill="none" opacity="0.6" />
            )}
            <path
              d={line.d}
              stroke={color}
              strokeWidth={isFocusMode && !line.satisfied ? 2 : 1.5}
              strokeDasharray={line.type === 'aprobacion' && !line.satisfied ? '6 4' : undefined}
              strokeLinecap="round"
              fill="none"
              markerEnd={`url(#arrow-${colorKey})`}
            />
            <circle cx={line.x1} cy={line.y1} r="2.5" fill={color} />
          </g>
        );
      })}
    </svg>
  );
};

export default CorrelationLines;
