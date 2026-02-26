import React, { useState, useRef } from 'react';
import { Users, Upload, Trash2, X, Edit2, Check, AlertCircle, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { getComparisonMatrix, findPairwiseCommonSubjects } from '../utils/compareProgress';
import subjects from '../data/subjects';

/**
 * Componente para comparar progreso con compañeros
 */
const ClassmateComparison = ({
  userStates,
  classmates,
  commonSubjects,
  compatibility,
  error,
  onAddClassmate,
  onUpdateName,
  onRemoveClassmate,
  onClearAll
}) => {
  const fileInputRef = useRef(null);
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
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
      case 1: return 'Regular';
      case 2: return 'Aprobada';
      default: return 'Desconocido';
    }
  };

  /**
   * Obtiene color del estado
   */
  const getStateColor = (state) => {
    switch (state) {
      case 0: return 'text-gray-400';
      case 1: return 'text-yellow-400';
      case 2: return 'text-green-400';
      default: return 'text-gray-500';
    }
  };

  // Vista colapsada - solo mostrar si hay compañeros
  if (!isExpanded && classmates.length === 0) {
    return (
      <div className="container mx-auto px-4 py-4">
        <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-gray-200">Comparar con Compañeros</h2>
          </div>
          
          <p className="text-gray-400 mb-4">
            Carga los archivos JSON de tus compañeros para encontrar materias pendientes que puedan cursar juntos
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium 
              transition-colors flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Cargar archivos JSON
          </button>

          {error && (
            <div className="mt-4 p-3 bg-red-900/20 border border-red-700 rounded-lg flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="bg-gray-800/30 rounded-lg p-6 border border-gray-700">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="w-6 h-6 text-blue-400" />
            <h2 className="text-xl font-bold text-gray-200">Comparar con Compañeros</h2>
            {classmates.length > 0 && (
              <span className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded-full text-sm font-medium">
                {classmates.length} {classmates.length === 1 ? 'compañero' : 'compañeros'}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
            
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium 
                transition-colors flex items-center gap-2"
              disabled={classmates.length >= 10}
            >
              <Upload className="w-4 h-4" />
              Agregar más
            </button>

            {classmates.length > 0 && (
              <button
                onClick={onClearAll}
                className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-sm 
                  font-medium transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Limpiar todo
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/20 border border-red-700 rounded-lg flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        {classmates.length > 0 && (
          <>
            {/* Resumen de compatibilidad */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                  <h3 className="text-sm font-semibold text-gray-300">Compatibilidad</h3>
                </div>
                <p className="text-2xl font-bold text-green-400">{compatibility.percentage}%</p>
                <p className="text-xs text-gray-400 mt-1">
                  {compatibility.commonSubjects} de {compatibility.totalAvailable} materias pendientes
                </p>
              </div>

              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <h3 className="text-sm font-semibold text-gray-300">Pendientes comunes</h3>
                </div>
                <p className="text-2xl font-bold text-blue-400">{commonSubjects.length}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Materias que nadie cursó aún
                </p>
              </div>

              <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  <h3 className="text-sm font-semibold text-gray-300">Grupo</h3>
                </div>
                <p className="text-2xl font-bold text-purple-400">{classmates.length + 1}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Tú + {classmates.length} {classmates.length === 1 ? 'compañero' : 'compañeros'}
                </p>
              </div>
            </div>

            {/* Lista de compañeros */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-300 mb-3">Compañeros cargados</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {classmates.map(classmate => (
                  <div
                    key={classmate.id}
                    className="bg-gray-700/50 p-3 rounded-lg border border-gray-600 flex items-center justify-between"
                  >
                    {editingId === classmate.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit();
                            if (e.key === 'Escape') cancelEdit();
                          }}
                          className="flex-1 px-2 py-1 bg-gray-800 border border-gray-600 rounded text-sm text-gray-200 
                            focus:outline-none focus:border-blue-500"
                          autoFocus
                        />
                        <button
                          onClick={saveEdit}
                          className="p-1 hover:bg-green-600/20 rounded transition-colors"
                        >
                          <Check className="w-4 h-4 text-green-400" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1 hover:bg-gray-600 rounded transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-200 truncate">{classmate.name}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(classmate.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => startEditing(classmate)}
                            className="p-1 hover:bg-blue-600/20 rounded transition-colors"
                            title="Editar nombre"
                          >
                            <Edit2 className="w-4 h-4 text-blue-400" />
                          </button>
                          <button
                            onClick={() => onRemoveClassmate(classmate.id)}
                            className="p-1 hover:bg-red-600/20 rounded transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Materias comunes */}
            {commonSubjects.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-300 mb-3">
                  Materias pendientes que pueden cursar juntos ({commonSubjects.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {commonSubjects.map(subjectId => {
                    const subject = subjects.find(s => s.id === subjectId);
                    if (!subject) return null;

                    const matrix = getComparisonMatrix(subjectId, userStates, classmates);

                    return (
                      <div
                        key={subjectId}
                        className="bg-green-900/20 border border-green-700/50 p-3 rounded-lg"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-200 text-sm">{subject.n}</h4>
                            <p className="text-xs text-gray-400">Nivel {subject.l}</p>
                          </div>
                          <span className="px-2 py-1 bg-green-600 text-white text-xs rounded font-medium">
                            ✓ {matrix.canEnrollCount}/{matrix.total}
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          {matrix.participants.map((p, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <span className="text-gray-300">{p.name}</span>
                              <span className={getStateColor(p.state)}>
                                {getStateName(p.state)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Comparaciones individuales */}
            {classmates.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-semibold text-gray-300 mb-3">
                  Comparaciones individuales
                </h3>
                <p className="text-xs text-gray-400 mb-3">
                  Materias que pueden cursar con cada compañero (excluye las comunes a todos)
                </p>
                
                <div className="space-y-3">
                  {classmates.map(classmate => {
                    const pairwiseCommon = findPairwiseCommonSubjects(userStates, classmate, commonSubjects);
                    const isExpanded = expandedClassmates.has(classmate.id);
                    
                    if (pairwiseCommon.length === 0) return null;

                    return (
                      <div key={classmate.id} className="bg-gray-700/30 rounded-lg border border-gray-600">
                        {/* Header - siempre visible */}
                        <button
                          onClick={() => toggleClassmateExpansion(classmate.id)}
                          className="w-full p-4 flex items-center justify-between hover:bg-gray-700/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Users className="w-5 h-5 text-indigo-400" />
                            <div className="text-left">
                              <p className="font-medium text-gray-200">
                                Tú + {classmate.name}
                              </p>
                              <p className="text-xs text-gray-400">
                                {pairwiseCommon.length} {pairwiseCommon.length === 1 ? 'materia adicional' : 'materias adicionales'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 bg-indigo-600/30 text-indigo-300 text-xs rounded font-medium">
                              {pairwiseCommon.length}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </button>

                        {/* Contenido expandible */}
                        {isExpanded && (
                          <div className="px-4 pb-4 border-t border-gray-600">
                            <div className="grid grid-cols-1 gap-2 mt-3">
                              {pairwiseCommon.map(subjectId => {
                                const subject = subjects.find(s => s.id === subjectId);
                                if (!subject) return null;

                                return (
                                  <div
                                    key={subjectId}
                                    className="bg-indigo-900/20 border border-indigo-700/50 p-3 rounded"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <h4 className="font-medium text-gray-200 text-sm">{subject.n}</h4>
                                        <p className="text-xs text-gray-400">Nivel {subject.l}</p>
                                      </div>
                                      <span className="px-2 py-1 bg-indigo-600 text-white text-xs rounded font-medium">
                                        ✓ Ambos
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {commonSubjects.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay materias pendientes en común</p>
                <p className="text-sm">Todos ya cursaron las mismas materias o tienen diferentes correlativas cumplidas</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ClassmateComparison;
