import React, { useRef, useState } from 'react';
import { Download, Upload, RotateCcw, Database } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';
import SectionHeader from './SectionHeader';

/**
 * Convierte un nombre libre en un slug apto para nombre de archivo
 */
// eslint-disable-next-line no-misleading-character-class
const DIACRITICS_REGEX = /[̀-ͯ]/g;

const slugify = (text) => {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD').replace(DIACRITICS_REGEX, '') // quitar acentos
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

/**
 * Componente para exportar e importar datos de progreso
 */
const ExportImport = ({
  currentStates,
  currentSchedule,
  currentSelectedCourses,
  currentExceptions,
  userName,
  onImport,
  onImportExceptions,
  onImportSchedule,
  onImportSelectedCourses,
  onReset,
  notify = () => {}
}) => {
  const fileInputRef = useRef(null);
  // Acción pendiente de confirmación: { kind: 'import', data } | { kind: 'reset' } | null
  const [pending, setPending] = useState(null);

  /**
   * Exporta el estado actual a un archivo JSON
   */
  const handleExport = () => {
    const data = {
      version: '1.3',
      timestamp: new Date().toISOString(),
      name: userName || '',
      states: currentStates,
      exceptions: currentExceptions || [],
      schedule: currentSchedule || {},
      selectedCourses: currentSelectedCourses || []
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const nameSlug = userName ? slugify(userName) : '';
    const fileName = nameSlug
      ? `plan-k23-backup-${nameSlug}-${new Date().toISOString().split('T')[0]}.json`
      : `plan-k23-backup-${new Date().toISOString().split('T')[0]}.json`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify(`Backup descargado: ${fileName}`, { type: 'success' });
  };

  /**
   * Aplica un backup ya validado y confirmado
   */
  const applyImport = (data) => {
    onImport(data.states, data.version);

    // Excepciones de correlativas (>= v1.3); backups viejos no las traen
    if (onImportExceptions) {
      onImportExceptions(Array.isArray(data.exceptions) ? data.exceptions : []);
    }

    // Importar horarios si existen (compatibilidad con versiones antiguas)
    if (data.schedule && typeof data.schedule === 'object' && onImportSchedule) {
      onImportSchedule(data.schedule);
    }

    // Restaurar materias seleccionadas: preferir el campo dedicado (>= v1.2);
    // si no viene, derivarlas de las keys del schedule (backups viejos)
    if (onImportSelectedCourses) {
      const idsFromSelectedCourses = Array.isArray(data.selectedCourses)
        ? data.selectedCourses
        : null;
      const idsFromSchedule = data.schedule && typeof data.schedule === 'object'
        ? Object.keys(data.schedule).map(id => parseInt(id))
        : null;
      const idsToApply = idsFromSelectedCourses || idsFromSchedule;

      if (idsToApply) {
        onImportSelectedCourses(idsToApply);
      }
    }

    notify('Datos importados correctamente', { type: 'success' });
  };

  /**
   * Lee y valida un archivo JSON; si es válido, pide confirmación
   */
  const handleImport = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result);

        // Validar estructura
        if (!data.states || typeof data.states !== 'object') {
          notify('Archivo inválido: no contiene un progreso exportado desde esta app.', { type: 'error' });
          return;
        }

        setPending({ kind: 'import', data });
      } catch (error) {
        console.error('Error al importar:', error);
        notify('No se pudo leer el archivo. Asegurate de que sea un JSON válido.', { type: 'error' });
      }
    };

    reader.readAsText(file);

    // Reset input para permitir importar el mismo archivo nuevamente
    event.target.value = '';
  };

  const handleConfirm = () => {
    if (pending?.kind === 'import') {
      applyImport(pending.data);
    } else if (pending?.kind === 'reset') {
      onReset();
      notify('Progreso reseteado', { type: 'success' });
    }
    setPending(null);
  };

  const importOwner = pending?.kind === 'import' && pending.data.name
    ? ` de ${pending.data.name}`
    : '';

  return (
    <div className="panel p-5 flex flex-col gap-4">
      <SectionHeader
        icon={Database}
        title="Tus datos"
        description="Se guardan solo en este navegador. Exportá un backup para no perderlos o para compartirlo con compañeros."
      />

      <div className="grid grid-cols-2 gap-2">
        <button onClick={handleExport} className="btn-primary">
          <Download className="w-4 h-4" />
          Exportar
        </button>

        <button onClick={() => fileInputRef.current?.click()} className="btn-secondary">
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
      </div>

      {/* Zona de peligro, separada de las acciones habituales */}
      <div className="mt-auto pt-4 border-t border-gray-800 flex items-center justify-between gap-3">
        <p className="text-xs text-gray-500">Borra estados y excepciones.</p>
        <button onClick={() => setPending({ kind: 'reset' })} className="btn-danger">
          <RotateCcw className="w-4 h-4" />
          Resetear
        </button>
      </div>

      <ConfirmDialog
        open={pending !== null}
        danger
        title={pending?.kind === 'reset' ? '¿Resetear todo el progreso?' : `¿Importar progreso${importOwner}?`}
        message={pending?.kind === 'reset'
          ? 'Se borrarán los estados de todas las materias y las excepciones. Esta acción no se puede deshacer; si querés, exportá un backup antes.'
          : 'Se sobrescribirá tu progreso actual, tus horarios y las materias seleccionadas en el planificador.'}
        confirmLabel={pending?.kind === 'reset' ? 'Resetear' : 'Importar'}
        onConfirm={handleConfirm}
        onCancel={() => setPending(null)}
      />
    </div>
  );
};

export default ExportImport;
