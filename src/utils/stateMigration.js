/**
 * Migración del esquema de estados de materias.
 *
 * Hasta la versión '1.1' del formato de export/import, los estados eran:
 *   0 = No cursada, 1 = Regular, 2 = Aprobada
 * A partir de la versión '1.2' se agrega el estado "Cursando" entre No cursada
 * y Regular, por lo que los valores existentes deben remaparse:
 *   0 = No cursada, 1 = Cursando, 2 = Regular, 3 = Aprobada
 * Un estado viejo != 0 simplemente se corre un lugar (+1); nada mapea al nuevo
 * valor 1 (Cursando) porque ese estado no existía antes.
 */

export const CURRENT_STATES_SCHEMA_VERSION = '2';
const LEGACY_PAYLOAD_VERSIONS = [undefined, null, '1.0', '1.1'];

export const migrateLegacyState = (oldState) => (oldState === 0 ? 0 : oldState + 1);

export const migrateLegacyStates = (statesMap) => {
  const migrated = {};
  Object.keys(statesMap).forEach(key => {
    migrated[key] = migrateLegacyState(statesMap[key]);
  });
  return migrated;
};

/**
 * Determina si un payload (export propio o de un compañero) usa el esquema
 * viejo de 3 estados, a partir de su campo `version`.
 */
export const isLegacyStatesPayload = (version) => LEGACY_PAYLOAD_VERSIONS.includes(version);
