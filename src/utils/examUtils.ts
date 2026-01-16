// Utilidades para manejar tipos de examen

export const EXAM_TYPES = {
  exam: "exam",
  homework: "homework",
  project: "project",
  oral: "oral",
  remedial: "remedial",
  selfassessable: "selfassessable",
} as const;

export type ExamType = (typeof EXAM_TYPES)[keyof typeof EXAM_TYPES];

// Traducciones al español
export const EXAM_TYPE_TRANSLATIONS: Record<ExamType, string> = {
  [EXAM_TYPES.exam]: "Examen",
  [EXAM_TYPES.homework]: "Tarea",
  [EXAM_TYPES.project]: "Proyecto",
  [EXAM_TYPES.oral]: "Oral",
  [EXAM_TYPES.remedial]: "Recuperatorio",
  [EXAM_TYPES.selfassessable]: "Autoevaluable",
};

// Colores para cada tipo de examen
export const EXAM_TYPE_COLORS: Record<ExamType, string> = {
  [EXAM_TYPES.exam]:
    "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  [EXAM_TYPES.homework]:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  [EXAM_TYPES.project]:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
  [EXAM_TYPES.oral]:
    "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400",
  [EXAM_TYPES.remedial]:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  [EXAM_TYPES.selfassessable]:
    "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
};

// Colores para indicadores (solo el color de fondo)
export const EXAM_TYPE_INDICATOR_COLORS: Record<ExamType, string> = {
  [EXAM_TYPES.exam]: "bg-red-500",
  [EXAM_TYPES.homework]: "bg-blue-500",
  [EXAM_TYPES.project]: "bg-purple-500",
  [EXAM_TYPES.oral]: "bg-orange-500",
  [EXAM_TYPES.remedial]: "bg-yellow-500",
  [EXAM_TYPES.selfassessable]: "bg-green-500",
};

// Iconos para cada tipo (usando Heroicons)
export const EXAM_TYPE_ICONS = {
  [EXAM_TYPES.exam]: "DocumentTextIcon",
  [EXAM_TYPES.homework]: "BookOpenIcon",
  [EXAM_TYPES.project]: "FolderIcon",
  [EXAM_TYPES.oral]: "MicrophoneIcon",
  [EXAM_TYPES.remedial]: "ArrowPathIcon",
  [EXAM_TYPES.selfassessable]: "SparklesIcon",
} as const;

// Funciones de utilidad
export function translateExamType(type: string): string {
  return EXAM_TYPE_TRANSLATIONS[type as ExamType] || type;
}

export function getExamTypeColor(type: string): string {
  return (
    EXAM_TYPE_COLORS[type as ExamType] ||
    "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400"
  );
}

export function getExamTypeIndicatorColor(type: string): string {
  return EXAM_TYPE_INDICATOR_COLORS[type as ExamType] || "bg-gray-500";
}

export function isValidExamType(type: string): type is ExamType {
  return Object.values(EXAM_TYPES).includes(type as ExamType);
}

// Función para obtener descripción de cada tipo
export const EXAM_TYPE_DESCRIPTIONS: Record<ExamType, string> = {
  [EXAM_TYPES.exam]: "Evaluación escrita tradicional",
  [EXAM_TYPES.homework]: "Trabajo para realizar en casa",
  [EXAM_TYPES.project]: "Trabajo de investigación o desarrollo",
  [EXAM_TYPES.oral]: "Evaluación verbal o presentación",
  [EXAM_TYPES.remedial]: "Examen de recuperación",
  [EXAM_TYPES.selfassessable]:
    "Evaluación automática con preguntas de opción múltiple",
};

export function getExamTypeDescription(type: string): string {
  return EXAM_TYPE_DESCRIPTIONS[type as ExamType] || "Tipo de evaluación";
}
