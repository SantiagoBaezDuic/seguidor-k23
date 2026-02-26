// Plan de Estudios 2023 - Ingeniería en Sistemas de Información
// UTN Facultad Regional Buenos Aires
// 
// Total: 56 materias (37 obligatorias + 19 electivas) - falta ID 26 y 38 en la secuencia
// IMPORTANTE: Los arrays rc y ra referencian IDs de materias, NO índices del array
// 
// Estructura:
// - id: ID único de la materia
// - n: Nombre de la materia
// - l: Nivel (1 a 5 para obligatorias, 6 para electivas)
// - rc: Requiere cursada/regularizada (Array o {all: [], any: []} para lógica OR)
// - ra: Requiere aprobación (Array o {all: [], any: []})
// - it: Forma parte del Título Intermedio "Analista Universitario de Sistemas" (true/false)
// - h: Horas semanales
// - m: Modalidad ('A' = Anual, 'C' = Cuatrimestral)
// - isElective: Marca materias electivas (opcional, solo en nivel 6)
// - hideCorrelations: Oculta flechas de correlatividad en la UI (opcional)
// - code: Código abreviado para mostrar en la card (opcional)

export const subjects = [
  // NIVEL 1 (orden de arriba a abajo según imagen oficial)
  { id: 8, n: "Sistemas y Procesos de Negocio", l: 1, rc: [], ra: [], it: true, h: 5, m: 'A' },
  { id: 1, n: "Análisis Matemático I", l: 1, rc: [], ra: [], it: true, h: 5, m: 'A' },
  { id: 5, n: "Lógica y Estructuras Discretas", l: 1, rc: [], ra: [], it: true, h: 5, m: 'A' },
  { id: 6, n: "Algoritmos y Estructuras de Datos", l: 1, rc: [], ra: [], it: true, h: 5, m: 'A' },
  { id: 7, n: "Arquitectura de Computadoras", l: 1, rc: [], ra: [], it: true, h: 4, m: 'A' },
  { id: 2, n: "Álgebra y Geometría Analítica", l: 1, rc: [], ra: [], it: true, h: 5, m: 'A' },
  { id: 3, n: "Física I", l: 1, rc: [], ra: [], it: true, h: 5, m: 'A' },
  { id: 11, n: "Ingeniería y Sociedad", l: 1, rc: [], ra: [], it: false, h: 4, m: 'C' },
  
  // NIVEL 2 (orden de arriba a abajo según imagen oficial)
  { id: 16, n: "Análisis de Sistemas de Información", l: 2, rc: [8, 6], ra: [], it: true, h: 6, m: 'A' },
  { id: 9, n: "Análisis Matemático II", l: 2, rc: [1, 2], ra: [], it: true, h: 5, m: 'A' },
  { id: 13, n: "Sintaxis y Semántica de Lenguajes", l: 2, rc: [5, 6], ra: [], it: true, h: 4, m: 'A' },
  { id: 14, n: "Paradigmas de Programación", l: 2, rc: [5, 6], ra: [], it: true, h: 4, m: 'A' },
  { id: 4, n: "Inglés I", l: 2, rc: [], ra: [], it: true, h: 2, m: 'A' },
  { id: 10, n: "Física II", l: 2, rc: [1, 3], ra: [], it: true, h: 5, m: 'A' },
  { id: 15, n: "Sistemas Operativos", l: 2, rc: [7], ra: [], it: true, h: 8, m: 'C' },
  { id: 17, n: "Probabilidad y Estadística", l: 2, rc: [1, 2], ra: [], it: true, h: 6, m: 'C' },
  
  // NIVEL 3 (orden de arriba a abajo según imagen oficial)
  { id: 23, n: "Diseño de Sistemas de Información", l: 3, rc: [16, 14], ra: [4, 6, 8], it: true, h: 6, m: 'A' },
  { id: 18, n: "Economía", l: 3, rc: [], ra: [1, 2], it: true, h: 6, m: 'C' },
  { id: 12, n: "Inglés II", l: 3, rc: [4], ra: [], it: true, h: 2, m: 'A' },
  { id: 20, n: "Desarrollo de Software", l: 3, rc: [14, 16], ra: [5, 6], it: true, h: 8, m: 'C' },
  { id: 19, n: "Bases de Datos", l: 3, rc: [13, 16], ra: [5, 6], it: true, h: 8, m: 'C' },
  { id: 37, n: "Seminario Integrador", l: 3, rc: [16], ra: [8, 6, 13, 14], it: true, h: 8, m: 'C' },
  { id: 21, n: "Comunicación de Datos", l: 3, rc: [7], ra: [7, 3], it: true, h: 8, m: 'C' },
  { id: 38, n: "Redes de Datos", l: 3, rc: [15, 21], ra: [], it: false, h: 8, m: 'C' },
  
  // NIVEL 4 (orden de arriba a abajo según imagen oficial)
  { id: 30, n: "Admin. de Sistemas de Información", l: 4, rc: [18, 23], ra: [16], it: true, h: 6, m: 'C' },
  { id: 22, n: "Análisis Numérico", l: 4, rc: [9], ra: [1, 2], it: true, h: 6, m: 'C' },
  { id: 25, n: "Ingeniería y Calidad de Software", l: 4, rc: [19, 20, 23], ra: [13, 14], it: false, h: 6, m: 'C' },
  { id: 28, n: "Simulación", l: 4, rc: [17], ra: [9], it: false, h: 6, m: 'C' },
  { id: 24, n: "Legislación", l: 4, rc: [11], ra: [], it: false, h: 4, m: 'C' },
  { id: 27, n: "Investigación Operativa", l: 4, rc: [17, 22], ra: [1, 2, 9], it: false, h: 6, m: 'C' },
  { id: 29, n: "Tecnologías para la Automatización", l: 4, rc: [10, 22], ra: [9], it: false, h: 6, m: 'C' },
  { id: 32, n: "Ciencia de Datos", l: 4, rc: [28], ra: [17, 19], it: false, h: 6, m: 'C' },
  
  // NIVEL 5 (orden de arriba a abajo según imagen oficial)
  { id: 36, n: "Proyecto Final", l: 5, rc: [25, 38, 30], ra: [12, 20, 23], it: false, h: 6, m: 'A' },
  { id: 31, n: "Inteligencia Artificial", l: 5, rc: [28], ra: [17, 22], it: false, h: 6, m: 'C' },
  { id: 34, n: "Gestión Gerencial", l: 5, rc: [24, 30], ra: [18], it: false, h: 6, m: 'C' },
  { id: 33, n: "Sistemas de Gestión", l: 5, rc: [30, 27], ra: [23], it: false, h: 6, m: 'C' },
  { id: 35, n: "Seguridad en los Sistemas de Info.", l: 5, rc: [38, 30], ra: [20, 21], it: false, h: 6, m: 'C' },

  // ELECTIVAS (pueden cursarse en 3° o 4° año)
  // 19 materias electivas - Todas cuatrimestrales de 6 horas
  // Correlativas: Análisis SI (16) Y (Sintaxis (13) O Paradigmas (14))
  // Excepción: TAP requiere las 3 materias
  { id: 39, n: "Administración Estratégica del Capital Humano", l: 6, rc: { all: [16], any: [13, 14] }, ra: [], it: false, h: 6, m: 'C', isElective: true, hideCorrelations: true, code: 'AECH' },
  { id: 40, n: "Ciberseguridad", l: 6, rc: { all: [16], any: [13, 14] }, ra: [], it: false, h: 6, m: 'C', isElective: true, hideCorrelations: true, code: 'Ciber' },
  { id: 41, n: "Comunicación Gráfica y Visual", l: 6, rc: { all: [16], any: [13, 14] }, ra: [], it: false, h: 6, m: 'C', isElective: true, hideCorrelations: true, code: 'CGV' },
  { id: 42, n: "Creatividad e Innovación", l: 6, rc: { all: [16], any: [13, 14] }, ra: [], it: false, h: 6, m: 'C', isElective: true, hideCorrelations: true, code: 'CeI' },
  { id: 43, n: "Criptografía", l: 6, rc: { all: [16], any: [13, 14] }, ra: [], it: false, h: 6, m: 'C', isElective: true, hideCorrelations: true, code: 'Cripto' },
  { id: 44, n: "Experiencia de Usuario y Accesibilidad", l: 6, rc: { all: [16], any: [13, 14] }, ra: [], it: false, h: 6, m: 'C', isElective: true, hideCorrelations: true, code: 'EXUA' },
  { id: 45, n: "Gerenciamiento de Proyectos de Sistemas de Información", l: 6, rc: { all: [16], any: [13, 14] }, ra: [], it: false, h: 6, m: 'C', isElective: true, hideCorrelations: true, code: 'GPSI' },
  { id: 46, n: "Gestión del Talento Humano", l: 6, rc: { all: [16], any: [13, 14] }, ra: [], it: false, h: 6, m: 'C', isElective: true, hideCorrelations: true, code: 'GTH' },
  { id: 47, n: "Ingeniería de Requisitos", l: 6, rc: { all: [16], any: [13, 14] }, ra: [], it: false, h: 6, m: 'C', isElective: true, hideCorrelations: true, code: 'IR' },
  { id: 48, n: "Metodología de Investigación Científico-Tecnológica", l: 6, rc: { all: [16], any: [13, 14] }, ra: [], it: false, h: 6, m: 'C', isElective: true, hideCorrelations: true, code: 'MICT' },
  { id: 49, n: "Metodología de la Conducción de Equipos de Trabajo", l: 6, rc: { all: [16], any: [13, 14] }, ra: [], it: false, h: 6, m: 'C', isElective: true, hideCorrelations: true, code: 'MCET' },
  { id: 50, n: "Patrones Algorítmicos", l: 6, rc: { all: [16], any: [13, 14] }, ra: [], it: false, h: 6, m: 'C', isElective: true, hideCorrelations: true, code: 'PA' },
  { id: 51, n: "Procesamiento del Lenguaje Natural", l: 6, rc: { all: [16], any: [13, 14] }, ra: [], it: false, h: 6, m: 'C', isElective: true, hideCorrelations: true, code: 'PLN' },
  { id: 52, n: "Química Ambiental", l: 6, rc: { all: [16], any: [13, 14] }, ra: [], it: false, h: 6, m: 'C', isElective: true, hideCorrelations: true, code: 'QA' },
  { id: 53, n: "Técnicas Avanzadas de Programación", l: 6, rc: { all: [16, 13, 14] }, ra: [], it: false, h: 6, m: 'C', isElective: true, hideCorrelations: true, code: 'TAP' },
  { id: 54, n: "Técnicas de Gráficos por Computadora", l: 6, rc: { all: [16], any: [13, 14] }, ra: [], it: false, h: 6, m: 'C', isElective: true, hideCorrelations: true, code: 'TGC' },
  { id: 55, n: "Tecnologías Avanzadas en la Construcción de Software", l: 6, rc: { all: [16], any: [13, 14] }, ra: [], it: false, h: 6, m: 'C', isElective: true, hideCorrelations: true, code: 'TACS' },
  { id: 56, n: "Tendencias y Escenarios Tecnológicos", l: 6, rc: { all: [16], any: [13, 14] }, ra: [], it: false, h: 6, m: 'C', isElective: true, hideCorrelations: true, code: 'TET' },
  { id: 57, n: "Transformación Digital", l: 6, rc: { all: [16], any: [13, 14] }, ra: [], it: false, h: 6, m: 'C', isElective: true, hideCorrelations: true, code: 'TD' },
];

export default subjects;
