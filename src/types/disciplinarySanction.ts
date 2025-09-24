export interface DisciplinarySanction {
  disciplinary_sanction_id: number;
  student_id: number;
  sanction_type: string;
  quantity: number;
  description: string;
  date: string;
}

export interface NewDisciplinarySanction {
  student_id: number;
  sanction_type: string;
  quantity: number;
  description: string;
  date: string;
}

export interface UpdateDisciplinarySanction {
  sanction_type: string;
  quantity: number;
  description: string;
  date: string;
}

export interface DisciplinarySanctionFilter {
  disciplinary_sanction_id?: number;
  student_id?: number;
  sanction_type?: string;
}

// Tipos de sanciones disponibles (deben coincidir con el ENUM del backend)
export const SANCTION_TYPES = {
  ADMONITION: "admonition",
  WARNING: "warning"
} as const;

export type SanctionType = typeof SANCTION_TYPES[keyof typeof SANCTION_TYPES];

// Labels para mostrar en la UI
export const SANCTION_LABELS: Record<SanctionType, string> = {
  [SANCTION_TYPES.ADMONITION]: "Amonestación",
  [SANCTION_TYPES.WARNING]: "Apercibimiento"
};