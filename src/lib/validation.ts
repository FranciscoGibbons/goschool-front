import { z } from 'zod';

// Esquemas de validación base
export const emailSchema = z.string().email('Email inválido').min(1, 'Email requerido');
export const passwordSchema = z.string().min(6, 'La contraseña debe tener al menos 6 caracteres');
export const nameSchema = z.string().min(1, 'Nombre requerido').max(100, 'Nombre muy largo');
export const idSchema = z.number().int().positive('ID debe ser positivo');
export const stringIdSchema = z.string().regex(/^\d+$/, 'ID debe ser numérico');

// Esquemas para roles
export const roleSchema = z.enum(['admin', 'teacher', 'student', 'preceptor', 'father']);

export const examTypeSchema = z.enum([
  'exam', 'homework', 'project', 'oral', 'remedial', 'selfassessable'
]);

export const gradeTypeSchema = z.enum(['numerical', 'conceptual', 'percentage']);

// Esquema para información de usuario
export const userInfoSchema = z.object({
  id: idSchema,
  name: nameSchema,
  last_name: nameSchema,
  full_name: z.string().optional(),
  email: emailSchema,
  role: roleSchema,
  photo: z.string().url('URL de foto inválida').optional().nullable(),
  children: z.array(z.object({
    id: idSchema,
    name: nameSchema,
    last_name: nameSchema,
    course_id: idSchema,
    course_name: z.string().optional()
  })).optional(),
  course_id: idSchema.optional()
});

// Esquema para login (JWT validation handled by Rust backend)
export const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema
});

// Esquema para examen base
export const baseExamSchema = z.object({
  id: idSchema,
  subject_id: idSchema,
  task: z.string().min(1, 'Tarea requerida').max(500, 'Tarea muy larga'),
  due_date: z.string().refine((date) => {
    const parsedDate = new Date(date);
    return !isNaN(parsedDate.getTime()) && parsedDate > new Date();
  }, 'Fecha de vencimiento debe ser válida y futura'),
  created_at: z.string(),
  type: examTypeSchema,
  questions: z.array(z.string()).optional()
});

// Esquema para examen autoevaluable
export const selfAssessableExamSchema = baseExamSchema.extend({
  type: z.literal('selfassessable'),
  questions: z.array(z.string().min(1, 'Pregunta no puede estar vacía')).min(1, 'Debe haber al menos una pregunta'),
  correct: z.array(z.string().min(1, 'Respuesta correcta requerida')),
  incorrect1: z.array(z.string().min(1, 'Respuesta incorrecta requerida')),
  incorrect2: z.array(z.string().min(1, 'Respuesta incorrecta requerida'))
}).refine((data) => {
  return data.questions.length === data.correct.length &&
         data.questions.length === data.incorrect1.length &&
         data.questions.length === data.incorrect2.length;
}, 'Todas las preguntas deben tener sus respectivas respuestas');

// Esquema para formulario de examen
export const examFormSchema = z.discriminatedUnion('type', [
  z.object({
    subject: stringIdSchema,
    task: z.string().min(1, 'Tarea requerida').max(500, 'Tarea muy larga'),
    due_date: z.string().refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime()) && parsedDate > new Date();
    }, 'Fecha de vencimiento debe ser válida y futura'),
    type: z.enum(['exam', 'homework', 'project', 'oral', 'remedial'])
  }),
  z.object({
    subject: stringIdSchema,
    task: z.string().min(1, 'Tarea requerida').max(500, 'Tarea muy larga'),
    due_date: z.string().refine((date) => {
      const parsedDate = new Date(date);
      return !isNaN(parsedDate.getTime()) && parsedDate > new Date();
    }, 'Fecha de vencimiento debe ser válida y futura'),
    type: z.literal('selfassessable'),
    questions: z.array(z.string().min(1, 'Pregunta no puede estar vacía')).min(1, 'Debe haber al menos una pregunta'),
    correct: z.array(z.string().min(1, 'Respuesta correcta requerida')),
    incorrect1: z.array(z.string().min(1, 'Respuesta incorrecta requerida')),
    incorrect2: z.array(z.string().min(1, 'Respuesta incorrecta requerida'))
  }).refine((data) => {
    return data.questions.length === data.correct.length &&
           data.questions.length === data.incorrect1.length &&
           data.questions.length === data.incorrect2.length;
  }, 'Todas las preguntas deben tener sus respectivas respuestas')
]);

// Esquema para mensaje
export const messageFormSchema = z.object({
  title: z.string().min(1, 'Título requerido').max(200, 'Título muy largo'),
  message: z.string().min(1, 'Mensaje requerido').max(2000, 'Mensaje muy largo'),
  courses: z.array(idSchema).min(1, 'Debe seleccionar al menos un curso')
});

// Esquema para calificación
export const gradeFormSchema = z.object({
  subject: stringIdSchema,
  assessment_id: stringIdSchema,
  student_id: stringIdSchema,
  grade_type: gradeTypeSchema,
  description: z.string().min(1, 'Descripción requerida').max(500, 'Descripción muy larga'),
  grade: z.string().refine((grade) => {
    const numGrade = parseFloat(grade);
    return !isNaN(numGrade) && numGrade >= 0 && numGrade <= 10;
  }, 'La calificación debe ser un número entre 0 y 10')
});

// Esquema para mensaje de materia
export const subjectMessageFormSchema = z.object({
  subject_id: stringIdSchema,
  title: z.string().min(1, 'Título requerido').max(200, 'Título muy largo'),
  content: z.string().min(1, 'Contenido requerido').max(5000, 'Contenido muy largo'),
  type: z.enum(['message', 'file', 'link']),
  file: z.instanceof(File).optional()
});

// Esquema para perfil
export const profileUpdateSchema = z.object({
  name: nameSchema.optional(),
  last_name: nameSchema.optional(),
  email: emailSchema.optional(),
  photo: z.string().url('URL de foto inválida').optional().nullable(),
  current_password: z.string().optional(),
  new_password: passwordSchema.optional()
}).refine((data) => {
  // Si se proporciona nueva contraseña, la actual es requerida
  if (data.new_password && !data.current_password) {
    return false;
  }
  return true;
}, 'Contraseña actual requerida para cambiar contraseña');

// Esquemas de respuesta de API
export const apiResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  data: z.unknown().optional(),
  error: z.string().optional()
});

export const coursesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.object({
    id: idSchema,
    course_name: z.string(),
    year: z.number().int().min(1).max(7)
  }))
});

export const subjectsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(z.object({
    id: idSchema,
    subject_name: z.string(),
    course_id: idSchema
  }))
});

// Tipos derivados de los esquemas
export type LoginData = z.infer<typeof loginSchema>;
export type UserInfo = z.infer<typeof userInfoSchema>;
export type ExamFormData = z.infer<typeof examFormSchema>;
export type MessageFormData = z.infer<typeof messageFormSchema>;
export type GradeFormData = z.infer<typeof gradeFormSchema>;
export type SubjectMessageFormData = z.infer<typeof subjectMessageFormSchema>;
export type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;
export type ApiResponse = z.infer<typeof apiResponseSchema>;
export type CoursesResponse = z.infer<typeof coursesResponseSchema>;
export type SubjectsResponse = z.infer<typeof subjectsResponseSchema>;

// Función de validación genérica
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { 
  success: true; 
  data: T; 
} | { 
  success: false; 
  errors: string[]; 
} {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        errors: error.issues.map((issue) => issue.message)
      };
    }
    return { 
      success: false, 
      errors: ['Error de validación desconocido'] 
    };
  }
}

// Sanitizadores
export function sanitizeString(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}

export function sanitizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

// Validadores específicos para roles
export function canAccessRoute(userRole: string, route: string): boolean {
  const rolePermissions: Record<string, string[]> = {
    admin: ['/dashboard', '/asignaturas', '/calificaciones', '/examenes', '/horario', '/mensajes', '/perfil'],
    preceptor: ['/dashboard', '/asignaturas', '/calificaciones', '/examenes', '/horario', '/mensajes', '/perfil'],
    teacher: ['/dashboard', '/asignaturas', '/calificaciones', '/examenes', '/horario', '/mensajes', '/perfil'],
    student: ['/dashboard', '/asignaturas', '/calificaciones', '/examenes', '/horario', '/mensajes', '/perfil'],
    father: ['/dashboard', '/asignaturas', '/calificaciones', '/examenes', '/horario', '/mensajes', '/perfil']
  };

  const allowedRoutes = rolePermissions[userRole] || [];
  return allowedRoutes.some(allowedRoute => route.startsWith(allowedRoute));
}

export function canPerformAction(userRole: string, action: string): boolean {
  const roleActions: Record<string, string[]> = {
    admin: ['create', 'read', 'update', 'delete', 'manage_users', 'view_all_data'],
    preceptor: ['create', 'read', 'update', 'delete', 'manage_grades'],
    teacher: ['create', 'read', 'update', 'manage_own_subjects'],
    student: ['read', 'submit_assignments'],
    father: ['read', 'view_children_data']
  };

  const allowedActions = roleActions[userRole] || [];
  return allowedActions.includes(action);
}