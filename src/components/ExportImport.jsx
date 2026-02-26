import React, { useRef } from 'react';
import { Download, Upload, RotateCcw } from 'lucide-react';

/**
 * Componente para exportar e importar datos de progreso
 */
const ExportImport = ({ currentStates, onImport, onReset }) => {
  const fileInputRef = useRef(null);

  /**
   * Exporta el estado actual a un archivo JSON
   */
  const handleExport = () => {
    const data = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      states: currentStates
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `plan-isi-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  /**
   * Importa estados desde un archivo JSON
   */
  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result;
        const data = JSON.parse(content);

        // Validar estructura
        if (!data.states || typeof data.states !== 'object') {
          alert('Archivo inválido: formato incorrecto');
          return;
        }

        // Confirmar antes de sobrescribir
        const confirmation = window.confirm(
          '¿Estás seguro de que deseas importar estos datos? Se sobrescribirá tu progreso actual.'
        );

        if (confirmation) {
          onImport(data.states);
          alert('Datos importados correctamente');
        }
      } catch (error) {
        console.error('Error al importar:', error);
        alert('Error al leer el archivo. Asegúrate de que sea un archivo JSON válido.');
      }
    };

    reader.readAsText(file);
    
    // Reset input para permitir importar el mismo archivo nuevamente
    event.target.value = '';
  };

  /**
   * Resetea todos los estados
   */
  const handleReset = () => {
    const confirmation = window.confirm(
      '¿Estás seguro de que deseas resetear TODO el progreso? Esta acción no se puede deshacer.'
    );

    if (confirmation) {
      onReset();
      alert('Progreso reseteado correctamente');
    }
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
      <h2 className="text-lg font-bold text-blue-400">
        Gestión de Datos
      </h2>

      <div className="flex flex-wrap gap-2">
        {/* Botón Exportar */}
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Exportar
        </button>

        {/* Botón Importar */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Upload className="w-4 h-4" />
          Importar
        </button>

        {/* Input oculto para archivo */}
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />

        {/* Botón Reset */}
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <RotateCcw className="w-4 h-4" />
          Resetear
        </button>
      </div>

      <p className="text-xs text-gray-400 italic">
        Exporta tu progreso para crear un respaldo o compartirlo.
      </p>
    </div>
  );
};

export default ExportImport;
