import React, { useState, useRef } from 'react';
import { Users, Upload, Trash2, X, Edit2, Check, AlertCircle, TrendingUp, ChevronDown } from 'lucide-react';
import { getComparisonMatrix, findPairwiseCommonSubjects } from '../utils/compareProgress';
import subjects from '../data/subjects';
import SectionHeader from './SectionHeader';

// Estado -> color del punto (mismo código de color que las tarjetas del plan)
const STATE_DOTS = ['bg-gray-500', 'bg-sky-400', 'bg-amber-400', 'bg-emerald-400'];

/**
 * Componente para comparar progreso con compañeros
 */
const ClassmateComparison = ({
  userStates,
  userExceptions = [],
  classmates,
  commonSubjects,
  compatibility,
  showElectives = true,
  error,
  onAddClassmate,
  onUpdateName,
  onRemoveClassmate,
  onClearAll
}) => {
  const fileInputRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [expandedClassmates, setExpandedClassmates] = useState(new Set());

  /**
   * Toggle expansión de comparación individual
   */
  const toggleClassmateExpansion = (classmateId) => {
    setExpandedClassmates(prev => {
      const newSet = new Set(prev);
      if (newSet.has(classmateId)) {
        newSet.delete(classmateId);
      } else {
        newSet.add(classmateId);
      }
      return newSet;
    });
  };

  /**
   * Maneja la carga de archivos
   */
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);

    for (const file of files) {
      if (file.type !== 'application/json') continue;

      try {
        const text = await file.text();
        const data = JSON.parse(text);
        onAddClassmate(data, file.name);
      } catch (err) {
        console.error('Error parsing JSON:', err);
      }
    }

    // Reset input
    e.target.value = '';
  };

  /**
   * Inicia edición de nombre
   */
  const startEditing = (classmate) => {
    setEditingId(classmate.id);
    setEditingName(classmate.name);
  };

  /**
   * Guarda el nombre editado
   */
  const saveEdit = () => {
    if (editingName.trim()) {
      onUpdateName(editingId, editingName.trim());
    }
    setEditingId(null);
    setEditingName('');
  };

  /**
   * Cancela edición
   */
  const cancelEdit = () => {
    setEditingId(null);
    setEditingName('');
  };

  /**
   * Obtiene el nombre del estado
   */
  const getStateName = (state) => {
    switch (state) {
      case 0: return 'No cursada';
      case 1: return 'Cursando';
      case 2: return 'Regular';
      case 3: return 'Aprobada';
      default: return 'Desconocido';
    }
  };

  const fileInput = (
    <input
      ref={fileInputRef}
      type="file"
      accept=".json"
      multiple
      onChange={handleFileUpload}
      className="hidden"
    />
  );

  const errorBox = error && (
    <div className="p-3 bg-red-500/10 border border-red-500/40 rounded-lg flex items-start gap-2">
      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
      <p className="text-red-300 text-sm">{error}</p>
    </div>
  );

  // Vista vacía: todavía no hay compañeros cargados
  if (classmates.length === 0) {
    return (
      <div className="panel p-5 space-y-4">
        <SectionHeader
          icon={Users}
          title="Comparar con compañeros"
          description="Cargá los backups (JSON) de tus compañeros para encontrar materias pendientes que puedan cursar juntos."
          actions={
            <button onClick={() => fileInputRef.current?.click()} className="btn-primary">
              <Upload className="w-4 h-4" />
              Cargar archivos
            </button>
          }
        />
        {fileInput}
        {errorBox}
      </div>
    );
  }

  const summary = [
    {
      icon: TrendingUp,
      label: 'Compatibilidad',
      value: `${compatibility.percentage}%`,
      hint: `${compatibility.commonSubjects} de ${compatibility.totalAvailable} materias pendientes`,
      accent: 'bg-emerald-400'
    },
    {
      icon: Users,
      label: 'En común con todos',
      value: commonSubjects.length,
      hint: 'Materias que todos pueden cursar',
      accent: 'bg-cyan-400'
    },
    {
      icon: Users,
      label: 'Grupo',
      value: classmates.length + 1,
      hint: `Vos + ${classmates.length} ${classmates.length === 1 ? 'compañero' : 'compañeros'}`,
      accent: 'bg-blue-400'
    }
  ];

  return (
    <div className="panel p-5 space-y-6">
      <SectionHeader
        icon={Users}
        title="Comparar con compañeros"
        badge={<span className="pill bg-cyan-500/15 text-cyan-300">{classmates.length}</span>}
        actions={
          <>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="btn-secondary"
              disabled={classmates.length >= 10}
            >
              <Upload className="w-4 h-4" />
              Agregar
            </button>
            <button onClick={onClearAll} className="btn-danger">
              <Trash2 className="w-4 h-4" />
              Quitar todos
            </button>
          </>
        }
      />
      {fileInput}
      {errorBox}

      {/* Resumen de compatibilidad */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {summary.map(stat => (
          <div key={stat.label} className="panel-inset relative pl-4 pr-3 py-3 overflow-hidden">
            <span className={`absolute left-0 top-3 bottom-3 w-1 rounded-r ${stat.accent}`} aria-hidden="true" />
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              <stat.icon className="w-3.5 h-3.5" />
              {stat.label}
            </p>
            <p className="text-2xl font-semibold text-gray-100 tabular-nums mt-1">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.hint}</p>
          </div>
        ))}
      </div>

      {/* Lista de compañeros */}
      <div>
        <h3 className="text-sm font-medium text-gray-300 mb-2">Compañeros cargados</h3>
        <div className="flex flex-wrap gap-2">
          {classmates.map(classmate => (
            <div
              key={classmate.id}
              className="panel-inset pl-3 pr-1.5 py-1.5 flex items-center gap-2 min-w-0"
            >
              {editingId === classmate.id ? (
                <>
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') cancelEdit();
                    }}
                    className="input py-1 px-2 w-40"
                    aria-label="Nombre del compañero"
                    autoFocus
                  />
                  <button onClick={saveEdit} className="btn-icon" aria-label="Guardar nombre">
                    <Check className="w-4 h-4 text-emerald-400" />
                  </button>
                  <button onClick={cancelEdit} className="btn-icon" aria-label="Cancelar">
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <span className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-200 text-xs font-semibold flex items-center justify-center flex-shrink-0">
                    {classmate.name.trim().charAt(0).toUpperCase() || '?'}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-200 truncate max-w-[12rem]">{classmate.name}</p>
                    <p className="text-[11px] text-gray-500 leading-tight">
                      {new Date(classmate.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => startEditing(classmate)}
                    className="btn-icon"
                    title="Editar nombre"
                    aria-label={`Editar nombre de ${classmate.name}`}
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onRemoveClassmate(classmate.id)}
                    className="btn-icon hover:text-red-300"
                    title="Quitar"
                    aria-label={`Quitar a ${classmate.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Materias comunes */}
      {commonSubjects.length > 0 ? (
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">
            Pueden cursar todos juntos <span className="text-gray-500">({commonSubjects.length})</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {commonSubjects.map(subjectId => {
              const subject = subjects.find(s => s.id === subjectId);
              if (!subject) return null;

              const matrix = getComparisonMatrix(subjectId, userStates, classmates, userExceptions);

              return (
                <div key={subjectId} className="panel-inset relative pl-4 pr-3 py-3 overflow-hidden">
                  <span className="absolute left-0 top-3 bottom-3 w-1 rounded-r bg-cyan-400" aria-hidden="true" />
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h4 className="font-medium text-gray-100 text-sm">{subject.n}</h4>
                      <p className="text-xs text-gray-500">{subject.l === 6 ? 'Electiva' : `${subject.l}° año`}</p>
                    </div>
                    <span className="pill bg-cyan-500/15 text-cyan-300 flex-shrink-0">
                      <Users className="w-3 h-3" />
                      {matrix.canEnrollCount}/{matrix.total}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {matrix.participants.map((p, idx) => (
                      <li key={idx} className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-gray-300 truncate">{p.name}</span>
                        <span className="flex items-center gap-1.5 text-gray-400 flex-shrink-0">
                          <span className={`w-1.5 h-1.5 rounded-full ${STATE_DOTS[p.state] || 'bg-gray-600'}`} />
                          {getStateName(p.state)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="panel-inset p-6 flex flex-col items-center text-center gap-2">
          <Users className="w-6 h-6 text-gray-500" />
          <p className="text-sm text-gray-300">No hay materias pendientes que puedan cursar todos juntos</p>
          <p className="text-xs text-gray-500">Puede que ya hayan cursado las mismas o que tengan distintas correlativas cumplidas.</p>
        </div>
      )}

      {/* Comparaciones individuales */}
      <div>
        <h3 className="text-sm font-medium text-gray-300">Con cada compañero</h3>
        <p className="text-xs text-gray-500 mb-2">
          Materias que pueden cursar de a dos (sin contar las comunes a todos)
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 items-start">
          {classmates.map(classmate => {
            const pairwiseCommon = findPairwiseCommonSubjects(userStates, classmate, commonSubjects, showElectives, userExceptions);
            const isOpen = expandedClassmates.has(classmate.id);

            if (pairwiseCommon.length === 0) return null;

            return (
              <div key={classmate.id} className="panel-inset overflow-hidden">
                <button
                  onClick={() => toggleClassmateExpansion(classmate.id)}
                  aria-expanded={isOpen}
                  className="w-full px-4 py-3 flex items-center justify-between gap-3 hover:bg-gray-800/40 transition-colors
                    focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400"
                >
                  <div className="text-left min-w-0">
                    <p className="font-medium text-sm text-gray-100 truncate">Vos + {classmate.name}</p>
                    <p className="text-xs text-gray-500">
                      {pairwiseCommon.length} {pairwiseCommon.length === 1 ? 'materia adicional' : 'materias adicionales'}
                    </p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <ul className="px-4 pb-4 pt-3 border-t border-gray-800 flex flex-wrap gap-1.5">
                    {pairwiseCommon.map(subjectId => {
                      const subject = subjects.find(s => s.id === subjectId);
                      if (!subject) return null;
                      return (
                        <li key={subjectId} className="pill bg-gray-800 text-gray-300 border border-gray-700">
                          {subject.n}
                          <span className="text-gray-500">· {subject.l === 6 ? 'Elec.' : `${subject.l}°`}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ClassmateComparison;
