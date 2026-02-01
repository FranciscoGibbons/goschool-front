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
  [EXAM_TYPES.exam]: "sacred-badge sacred-badge-info",
  [EXAM_TYPES.homework]: "sacred-badge sacred-badge-warning",
  [EXAM_TYPES.project]: "sacred-badge sacred-badge-success",
  [EXAM_TYPES.oral]: "sacred-badge sacred-badge-neutral",
  [EXAM_TYPES.remedial]: "sacred-badge sacred-badge-error",
  [EXAM_TYPES.selfassessable]: "sacred-badge sacred-badge-success",

};

// Colores para indicadores (solo el color de fondo)
export const EXAM_TYPE_INDICATOR_COLORS: Record<ExamType, string> = {
  [EXAM_TYPES.exam]: "bg-error",
  [EXAM_TYPES.homework]: "bg-warning",
  [EXAM_TYPES.project]: "bg-success",
  [EXAM_TYPES.oral]: "bg-text-muted",
  [EXAM_TYPES.remedial]: "bg-error",
  [EXAM_TYPES.selfassessable]: "bg-success",
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
  return EXAM_TYPE_COLORS[type as ExamType] || "sacred-badge sacred-badge-neutral";

}

export function getExamTypeIndicatorColor(type: string): string {
  return EXAM_TYPE_INDICATOR_COLORS[type as ExamType] || "bg-muted-foreground";
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
