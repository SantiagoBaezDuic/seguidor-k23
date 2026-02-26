# Guía de Verificación - Tracker ISI 2023

## 🔍 Checklist de Funcionalidades

### ✅ 1. Visualización Básica
- [ ] La aplicación carga correctamente en http://localhost:5173/
- [ ] Se muestran 5 columnas (niveles 1° a 5°)
- [ ] Todas las materias se ven en su columna correspondiente
- [ ] El tema dark mode está activo por defecto

### ✅ 2. Estados de Materias
- [ ] Click en una materia cambia su estado: Gris → Amarillo → Verde → Gris
- [ ] El color de fondo y borde cambia según el estado
- [ ] El icono cambia según el estado (Circle → Clock → CheckCircle)
- [ ] El badge "IT" aparece en las 26 materias del título intermedio

### ✅ 3. Sistema de Correlatividades

#### Prueba 1: Materia sin correlativas
1. Click en "Análisis Matemático I" (nivel 1) para aprobarla (verde)
2. Verifica que "Análisis Matemático II" (nivel 2) muestre "✓ Habilitada cursar"

#### Prueba 2: Correlativas de cursada
1. Aprueba "Algoritmos y Estructuras de Datos" (ID 6)
2. Aprueba "Sistemas y Procesos de Negocio" (ID 8)
3. Verifica que "Análisis de Sistemas de Información" (ID 16) pueda cursarse

#### Prueba 3: Correlativas de aprobación
1. Marca "Bases de Datos" como regular (amarillo)
2. Verifica que NO aparezca "✓ Habilitada final" todavía
3. Aprueba sus correlativas de aprobación (IDs 5 y 6)
4. Ahora debería aparecer "✓ Habilitada final"

#### Prueba 4: Resaltado de correlativas
1. Click en "Diseño de Sistemas de Información" (ID 23)
2. Verifica que se resaltan brevemente (2 segundos):
   - Las materias que dependen de ella (pulsan con borde azul)
   - La materia misma

### ✅ 4. Líneas de Correlatividades SVG
1. Click en cualquier materia de nivel 3 o superior
2. Verifica que aparezcan líneas conectando con sus correlativas
3. Líneas azules sólidas = correlativas de cursada
4. Líneas naranjas punteadas = correlativas de aprobación
5. Las líneas desaparecen después de 2 segundos

### ✅ 5. Estadísticas

#### Progreso General
1. Aprueba 3 materias (verde), deja 2 regulares (amarillo)
2. Verifica que los contadores se actualicen en tiempo real
3. La barra de progreso verde debe reflejar el % de aprobadas

#### Título Intermedio
1. Verifica que muestre "0/26" inicialmente
2. Aprueba una materia con badge "IT"
3. El contador debe incrementar a "1/26"
4. Aprueba las 26 materias del título intermedio:
   - Nivel 1: IDs 1, 2, 3, 4, 5, 6, 7, 8, 11 (9 materias)
   - Nivel 2: IDs 9, 10, 12, 13, 14, 15, 16, 17 (8 materias)
   - Nivel 3: IDs 18, 19, 20, 21, 22, 23, 37, 38 (8 materias)
   - Nivel 4: ID 30 (1 materia)
5. Al completar la 26°, debe aparecer mensaje de felicitaciones con trofeo

### ✅ 6. Filtros

#### Filtro "Todas"
- Por defecto, todas las materias son visibles

#### Filtro "No Cursadas"
1. Click en badge "No Cursadas"
2. Solo deben verse materias grises
3. Las columnas vacías deben mostrar "No hay materias para mostrar"

#### Filtro "Regulares"
1. Marca algunas materias como regulares (amarillo)
2. Activa filtro "Regulares"
3. Solo deben verse materias amarillas

#### Filtro "Aprobadas"
1. Aprueba algunas materias (verde)
2. Activa filtro "Aprobadas"
3. Solo deben verse materias verdes

#### Filtro "Habilitadas Cursar"
1. Aprueba correlativas de una materia
2. Activa filtro "Habilitadas Cursar"
3. Solo deben verse materias con badge "✓ Habilitada cursar"

#### Filtro "Título Intermedio"
1. Activa filtro "Título Intermedio"
2. Deben verse exactamente 26 materias con badge "IT"
3. Nivel 4 debe tener solo 1 materia visible (ID 30)
4. Nivel 5 debe estar completamente vacío

#### Múltiples Filtros
1. Activa "Regulares" y "Aprobadas" simultáneamente
2. Deben verse ambas categorías
3. El texto inferior debe decir "Mostrando: Regulares, Aprobadas"

### ✅ 7. Exportar/Importar

#### Exportar
1. Aprueba algunas materias para tener progreso
2. Click en "Exportar"
3. Se descarga archivo JSON con nombre: `plan-isi-backup-YYYY-MM-DD.json`
4. Abre el archivo y verifica estructura:
   ```json
   {
     "version": "1.0",
     "timestamp": "...",
     "states": { "1": 2, "2": 1, ... }
   }
   ```

#### Importar
1. Con progreso existente, click en "Importar"
2. Selecciona un archivo JSON exportado previamente
3. Debe aparecer confirmación: "¿Estás seguro...?"
4. Acepta
5. El progreso debe restaurarse según el archivo
6. Mensaje: "Datos importados correctamente"

#### Importar archivo inválido
1. Crea un archivo de texto con contenido inválido
2. Intenta importarlo
3. Debe aparecer error: "Error al leer el archivo..."

#### Resetear
1. Con progreso existente, click en "Resetear"
2. Debe aparecer confirmación: "¿Estás seguro...?"
3. Acepta
4. Todas las materias vuelven a gris (estado 0)
5. Estadísticas vuelven a 0/36

### ✅ 8. Persistencia (localStorage)
1. Aprueba varias materias y activa un filtro
2. Recarga la página (F5)
3. El progreso debe mantenerse
4. **NOTA**: El filtro activo NO persiste (comportamiento esperado)

### ✅ 9. Responsive Design

#### Desktop (≥768px)
- Grid horizontal con scroll
- 5 columnas visibles en fila
- Panel de control en 3 columnas

#### Mobile (<768px)
- ⚠️ **Nota**: La implementación actual es optimizada para desktop
- En mobile, usar scroll horizontal para navegar entre niveles

### ✅ 10. Interactividad Avanzada

#### Hover
- Las tarjetas escalan ligeramente al hacer hover
- El cursor cambia a pointer
- Aparece sombra

#### Focus (Teclado)
1. Usa Tab para navegar entre materias
2. Las tarjetas deben mostrar ring azul al hacer focus
3. Enter o Espacio debe cambiar el estado

#### Transiciones
- Cambios de estado son suaves (300ms)
- Highlight de correlativas tiene animación de pulso
- Barras de progreso se animan al cambiar

### ✅ 11. Verificaciones Específicas del Título Intermedio

#### Seminario Integrador (ID 37)
- Está en nivel 3
- Tiene badge "IT" morado
- Correlativas: rc: [16], ra: [8, 6, 13, 14]
- NO es correlativa de ninguna materia de nivel 4 o 5
- Puede quedar sin cursar sin bloquear el título de Ingeniero

#### Redes de Datos (ID 38)
- Está en nivel 3 (no en nivel 4)
- Tiene badge "IT" morado
- Correlativas: rc: [15, 21], ra: []
- Las materias de nivel 5 que la necesitan:
  - ID 35: tiene 38 en rc
  - ID 36: tiene 38 en rc

#### Admin. de Sistemas de Información (ID 30)
- Única materia de nivel 4 con badge "IT"
- Necesaria para título intermedio

### ✅ 12. Leyenda
- Verifica que la leyenda al final explique:
  - Colores de estados
  - Badge de título intermedio
  - Tipos de líneas de correlatividades

## 🐛 Errores Conocidos (Falsos Positivos)

### CSS Linter
- VSCode puede mostrar errores en `@tailwind` y `@apply`
- Estos son falsos positivos - Tailwind los procesa correctamente
- La aplicación funciona sin problemas

## 📊 Estadísticas del Proyecto

- **Total de materias**: 36
- **Materias Título Intermedio**: 26
- **Niveles**: 5
- **Estados posibles**: 3 (No cursada, Regular, Aprobada)
- **Componentes React**: 6
- **Hooks personalizados**: 2
- **Funciones de utilidad**: 6

## 🎯 Casos de Prueba Rápidos

### Test Rápido (5 minutos)
1. Verifica que la app cargue
2. Cambia estado de 3 materias diferentes
3. Activa un filtro
4. Exporta datos
5. Recarga página y verifica persistencia

### Test Completo (15 minutos)
- Ejecuta todos los checkpoints de esta guía

### Test de Correlatividades (10 minutos)
- Enfócate en las Pruebas 1-4 de la sección "Sistema de Correlatividades"
- Verifica cadenas largas (ej: aprobar hasta llegar a Proyecto Final)

### Test del Título Intermedio (5 minutos)
- Aprueba solo las 26 materias marcadas con "IT"
- Verifica mensaje de felicitaciones
- Confirma que las otras 10 materias quedan sin afectar el título intermedio

---

**¿Encontraste un bug?**
1. Anota el comportamiento esperado vs. el actual
2. Lista los pasos para reproducirlo
3. Revisa la consola del navegador (F12) para errores

**¡Happy Testing! 🚀**
