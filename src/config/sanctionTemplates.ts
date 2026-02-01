import { SANCTION_TYPES, SanctionType } from "@/types/disciplinarySanction";

export interface SanctionTemplate {
  id: string;
  label: string;
  description: string;
  sanctionType: SanctionType;
  quantity: number;
}

export const SANCTION_TEMPLATES: SanctionTemplate[] = [
  {
    id: "late_arrival",
    label: "Llegada tarde sin justificacion",
    description: "El estudiante llego tarde a la institucion sin presentar justificativo correspondiente.",
    sanctionType: SANCTION_TYPES.WARNING,
    quantity: 1,
  },
  {
    id: "no_materials",
    label: "No trajo materiales de estudio",
    description: "El estudiante no trajo los materiales de estudio requeridos para la clase (cuaderno, libros, utiles escolares).",
    sanctionType: SANCTION_TYPES.WARNING,
    quantity: 1,
  },
  {
    id: "cellphone_use",
    label: "Uso de celular en clase",
    description: "El estudiante utilizo el telefono celular durante la clase sin autorizacion del docente.",
    sanctionType: SANCTION_TYPES.WARNING,
    quantity: 1,
  },
  {
    id: "disrespect_peers",
    label: "Falta de respeto a companeros",
    description: "El estudiante mostro comportamiento irrespetuoso hacia sus companeros de clase.",
    sanctionType: SANCTION_TYPES.ADMONITION,
    quantity: 1,
  },
  {
    id: "disrespect_authority",
    label: "Falta de respeto a autoridades",
    description: "El estudiante mostro comportamiento irrespetuoso hacia docentes o personal de la institucion.",
    sanctionType: SANCTION_TYPES.ADMONITION,
    quantity: 2,
  },
  {
    id: "uniform_violation",
    label: "Incumplimiento de uniforme",
    description: "El estudiante no cumplio con el codigo de vestimenta/uniforme establecido por la institucion.",
    sanctionType: SANCTION_TYPES.WARNING,
    quantity: 1,
  },
  {
    id: "class_disruption",
    label: "Interrupcion del dictado de clase",
    description: "El estudiante interrumpio reiteradamente el normal desarrollo de la clase afectando el aprendizaje de sus companeros.",
    sanctionType: SANCTION_TYPES.ADMONITION,
    quantity: 1,
  },
  {
    id: "homework_incomplete",
    label: "Tareas incompletas reiteradas",
    description: "El estudiante no completo las tareas asignadas en multiples ocasiones sin justificacion valida.",
    sanctionType: SANCTION_TYPES.WARNING,
    quantity: 1,
  },
  {
    id: "physical_aggression",
    label: "Agresion fisica",
    description: "El estudiante incurrio en agresion fisica hacia otro integrante de la comunidad educativa.",
    sanctionType: SANCTION_TYPES.ADMONITION,
    quantity: 3,
  },
  {
    id: "verbal_aggression",
    label: "Agresion verbal",
    description: "El estudiante incurrio en agresion verbal hacia otro integrante de la comunidad educativa.",
    sanctionType: SANCTION_TYPES.ADMONITION,
    quantity: 2,
  },
  {
    id: "leaving_premises",
    label: "Retiro sin autorizacion",
    description: "El estudiante abandono las instalaciones de la institucion sin la autorizacion correspondiente.",
    sanctionType: SANCTION_TYPES.ADMONITION,
    quantity: 2,
  },
  {
    id: "cheating",
    label: "Copia en evaluacion",
    description: "El estudiante fue sorprendido copiando durante una evaluacion o examen.",
    sanctionType: SANCTION_TYPES.ADMONITION,
    quantity: 2,
  },
];

export const TEMPLATE_CUSTOM_ID = "custom";
