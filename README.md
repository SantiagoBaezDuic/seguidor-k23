# Tracker Plan de Estudios ISI 2023 - UTN FRBA

Una Single Page Application (SPA) moderna para hacer seguimiento del Plan de Estudios 2023 de Ingeniería en Sistemas de Información de la Universidad Tecnológica Nacional - Facultad Regional Buenos Aires.

## 🎯 Características

### Funcionalidades Principales

- **Gestión de Estados**: Click en cada materia para ciclar entre 3 estados:
  - 🔘 **No Cursada** (Gris): Estado inicial
  - 🕐 **Regular** (Amarillo): Cursada aprobada, falta rendir final
  - ✅ **Aprobada** (Verde): Final aprobado o materia promocionada

- **Sistema de Correlatividades Inteligente**: 
  - Validación automática de correlativas de cursada (para poder cursar)
  - Validación automática de correlativas de aprobación (para rendir final)
  - Indicadores visuales de materias habilitadas/bloqueadas
  - Click en materias bloqueadas para ver requisitos pendientes

- **Planificador de Cursada** ✨ NUEVO:
  - Selecciona materias disponibles para cursar
  - Visualiza carga horaria semanal total
  - Alertas de sobrecarga (>30 horas) o carga considerable (>24 horas)
  - Información de modalidad (Anual/Cuatrimestral) y horas por materia

- **Calendario Semanal** ✨ NUEVO:
  - Asigna franjas horarias a cada materia
  - Visualización en grid semanal (Lunes a Sábado)
  - **20 franjas horarias** según schedule de UTN FRBA:
    - **Mañana**: M0-M6 (07:45 - 13:15)
    - **Tarde**: T0-T6 (13:30 - 19:00)
    - **Noche**: N0-N5 (18:15 - 23:00)
  - Detección automática de conflictos de horario
  - Persistencia independiente en localStorage

- **Título Intermedio**: 
  - Tracking especial del **Analista Universitario de Sistemas**
  - 24 materias marcadas específicamente para el título intermedio
  - Progreso independiente y mensaje de felicitaciones al completar

- **Visualización Avanzada**:
  - Bordes brillantes resaltando materias afectadas al cambiar estado
  - Líneas SVG conectando materias con sus correlativas
  - Líneas diferenciadas por tipo (cursada vs. aprobación)
  - Solo muestra líneas para materias bloqueadas (reduce visual clutter)

### Funcionalidades Adicionales

- **Estadísticas Duales**: 
  - Progreso general (todas las materias)
  - Progreso del Título Intermedio

- **Sistema de Filtros**:
  - Ver todas las materias
  - Filtrar por estado (No Cursadas, Regulares, Aprobadas)
  - Ver solo materias habilitadas para cursar
  - Ver solo materias del Título Intermedio

- **Gestión de Datos**:
  - **Exportar**: Descarga tu progreso en formato JSON
  - **Importar**: Restaura o comparte tu progreso
  - **Resetear**: Limpia todo el progreso
  - **Persistencia**: Guardado automático en localStorage

## 🚀 Instalación y Uso

### Requisitos Previos

- Node.js (versión 18 o superior)
- npm (viene con Node.js)

### Instalación

```bash
# Clonar o descargar el repositorio
cd tracker

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en: **http://localhost:5173/**

### Comandos Disponibles

```bash
# Desarrollo
npm run dev          # Inicia servidor de desarrollo

# Producción
npm run build        # Construye para producción
npm run preview      # Vista previa de build de producción
```

## 📚 Estructura del Proyecto

```
tracker/
├── src/
│   ├── components/              # Componentes React
│   │   ├── SubjectCard.jsx      # Tarjeta de materia individual
│   │   ├── LevelColumn.jsx      # Columna de nivel (año)
│   │   ├── CorrelationLines.jsx # Líneas SVG de correlatividades
│   │   ├── Statistics.jsx       # Panel de estadísticas
│   │   ├── Filters.jsx          # Sistema de filtros
│   │   ├── ExportImport.jsx     # Gestión de datos
│   │   ├── TooltipLegend.jsx    # Leyenda en tooltip
│   │   ├── CoursePlanner.jsx    # Planificador de cursada ✨
│   │   └── WeeklySchedule.jsx   # Calendario semanal ✨
│   ├── data/
│   │   └── subjects.js          # Datos del plan de estudios
│   ├── hooks/
│   │   ├── useLocalStorage.js   # Hook de persistencia
│   │   ├── useSubjectsState.js  # Hook de gestión de estados
│   │   └── useScheduleState.js  # Hook de horarios ✨
│   ├── utils/
│   │   └── correlations.js      # Lógica de correlatividades
│   ├── App.jsx                  # Componente principal
│   ├── main.jsx                 # Punto de entrada
│   └── index.css                # Estilos globales
├── index.html                   # HTML base
├── package.json                 # Dependencias y scripts
├── vite.config.js              # Configuración de Vite
└── tailwind.config.js          # Configuración de Tailwind
```

## 🎨 Tecnologías Utilizadas

- **React 18**: Framework de UI
- **Vite 6**: Build tool y dev server
- **Tailwind CSS 3**: Framework de estilos
- **Lucide React**: Iconos modernos
- **localStorage**: Persistencia de datos

## 📖 Datos del Plan de Estudios

El plan incluye **37 materias** distribuidas en 5 niveles:

### Título Intermedio (24 materias)
- ✅ **Nivel 1**: 7 materias
- ✅ **Nivel 2**: 8 materias  
- ✅ **Nivel 3**: 7 materias (incluye Seminario Integrador, excluye Redes de Datos)
- ✅ **Nivel 4**: 2 materias (Análisis Numérico y Admin. de Sistemas de Información)

### Título de Ingeniero
- Requiere completar **todas las 37 materias**
- Incluye Proyecto Final en 5° año

### Información de Carga Horaria
Cada materia incluye:
- **Horas semanales**: Entre 2-8 horas según la materia
- **Modalidad**: Anual (A) o Cuatrimestral (C)
- Esta información es útil para planificar tu cursada

## 🎯 Cómo Usar

### Seguimiento de Progreso

1. **Click en una materia** para cambiar su estado (ciclo: No Cursada → Regular → Aprobada)
2. **Click en materia bloqueada** para ver qué requisitos te faltan (no cambia estado)
3. **Observa las correlatividades**: Las materias que dependen de la que modificaste se resaltarán brevemente
4. **Revisa los badges**: Indica si una materia está habilitada para cursar o rendir
5. **Usa los filtros**: Enfócate en lo que necesitas ver
6. **Consulta la leyenda**: Click en el ícono ℹ️ en el header para ver significado de colores y símbolos

### Planificador de Cursada ✨

1. **Scroll hacia abajo** después del diagrama de materias
2. **Selecciona materias**: Usa checkboxes para elegir qué materias cursar
   - Solo aparecen materias disponibles (habilitadas y no cursadas)
3. **Revisa carga horaria**: El panel superior muestra:
   - Total de horas semanales
   - Cantidad de materias seleccionadas
   - Alertas si superas 24-30 horas (carga recomendada)

### Horario Semanal ✨

1. **Aparece automáticamente** cuando seleccionas materias en el planificador
2. **Asignar horarios**:
   - Click en botón **+** de cada materia
   - Selecciona día, franja inicial y franja final
   - Las franjas se basan en el schedule oficial de UTN FRBA:
     - **Mañana (M)**: 07:45 - 13:15 (M0 a M6)
     - **Tarde (T)**: 13:30 - 19:00 (T0 a T6)
     - **Noche (N)**: 18:15 - 23:00 (N0 a N5)
   - Click **Agregar** para confirmar
3. **Gestionar bloques**:
   - Puedes agregar múltiples bloques por materia
   - Click en 🗑️ para eliminar un bloque
4. **Visualizar calendario**:
   - Grid muestra todas las materias asignadas
   - Celdas rojas indican **conflictos** (dos materias en mismo horario)
   - Cada materia tiene un color distinto para fácil identificación

### Persistencia de Datos

- **Progreso**: Se guarda automáticamente en localStorage
- **Horarios**: También se guardan automáticamente (clave separada)
- **Exportar tu progreso**: Guarda un backup JSON regularmente
- **Importar**: Restaura desde archivo JSON
- **Nota**: Los horarios persisten independientemente del progreso

### Celebra tu Progreso 🎉

- Completa las 24 materias del **Título Intermedio** y recibe tu mensaje de felicitaciones
- El progreso del TI se muestra en panel separado con badge morado

## 📝 Notas Importantes

### Correlatividades
- **Para cursar**: Debes tener las correlativas en estado Regular (1) o Aprobada (2)
- **Para rendir final**: Debes tener las correlativas en estado Aprobada (2)
- Las líneas de correlatividad solo se muestran para materias bloqueadas (optimiza la visualización)

### Seminario Integrador
- Materia **obligatoria para el Título Intermedio**
- Ubicado en 3° año (nivel 3)

### Horarios
- Los horarios se guardan en localStorage con clave separada del progreso
- Puedes exportar/importar el progreso sin afectar los horarios guardados
- Asigna múltiples bloques por materia si tiene clases no consecutivas
- El sistema detecta y marca conflictos, pero permite guardarlos (útil para ver opciones)

### Carga Horaria Recomendada
- **Balanceada**: Hasta 24 horas semanales
- **Considerable**: 24-30 horas semanales
- **Muy alta**: Más de 30 horas semanales (no recomendado)

## 🛠️ Desarrollo

### Estructura de Datos

Cada materia tiene la siguiente estructura:

```javascript
{
  id: 1,                              // ID único
  n: "Análisis Matemático I",        // Nombre
  l: 1,                               // Nivel (1-5)
  rc: [],                             // Requiere cursada (IDs)
  ra: [],                             // Requiere aprobación (IDs)
  it: true,                           // Parte del título intermedio
  h: 8,                               // Horas semanales ✨
  m: 'A'                              // Modalidad: 'A' (Anual) o 'C' (Cuatrimestral) ✨
}
```

### Estados de Materias

```javascript
0 // No cursada
1 // Regular (cursada aprobada)
2 // Aprobada (final aprobado)
```

### Estructura de Horarios ✨

Los horarios se guardan en localStorage con la estructura:

```javascript
{
  [materiaId]: [
    {
      day: 0-5,        // 0=Lunes, 1=Martes, ..., 5=Sábado
      startSlot: 0-19, // Franja inicial (M0-N5)
      endSlot: 1-20    // Franja final (exclusiva)
    }
  ]
}
```

## 🤝 Contribuciones

Si encuentras algún error en las correlatividades o tienes sugerencias:

1. Verifica contra el plan oficial de la UTN FRBA
2. Reporta el issue con detalles
3. Si conoces la solución, propón un fix

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🎓 Créditos

Plan de Estudios 2023 - Ingeniería en Sistemas de Información  
Universidad Tecnológica Nacional  
Facultad Regional Buenos Aires

---

**¡Éxitos en tu carrera! 🚀**
