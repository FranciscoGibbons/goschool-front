export interface Submission {
  id: number;
  student_id: number;
  task_id: number;
  path: string;
  submitted_at: string;
  // Campos adicionales que pueden venir del backend con joins
  student_name?: string;
  student_last_name?: string;
  student_full_name?: string;
  task_name?: string;
  subject_name?: string;
  course_name?: string;
  due_date?: string;
  assessment_type?: string;
}

export interface NewSubmission {
  student_id: number;
  task_id: number;
  file: File;
}

export interface UpdateSubmission {
  path?: string;
  student_id?: number;
  task_id?: number;
}

export interface SubmissionFilter {
  student_id?: number;
  task_id?: number;
  subject_id?: number;
  course_id?: number;
  academic_year_id?: number;
}

// Tipos de archivos permitidos (solo PDF y DOCX como el backend)
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const;

// Extensiones de archivos permitidas (solo PDF y DOCX como el backend)
export const ALLOWED_FILE_EXTENSIONS = [
  '.pdf',
  '.docx',
] as const;

// Tamaño máximo de archivo en bytes (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// Helper function para validar archivos
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Verificar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: 'El archivo es demasiado grande. Máximo 10MB permitido.'
    };
  }

  // Verificar tipo
  if (!ALLOWED_FILE_TYPES.includes(file.type as typeof ALLOWED_FILE_TYPES[number])) {
    // Si el tipo MIME no es reconocido, verificar por extensión
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_FILE_EXTENSIONS.includes(extension as typeof ALLOWED_FILE_EXTENSIONS[number])) {
      return {
        valid: false,
        error: 'Tipo de archivo no permitido. Formatos aceptados: PDF y DOCX.'
      };
    }
  }

  return { valid: true };
}

// Helper function para obtener el icono del archivo basado en su extensión
export function getFileIcon(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return '📄';
    case 'doc':
    case 'docx':
      return '📝';
    case 'xls':
    case 'xlsx':
      return '📊';
    case 'ppt':
    case 'pptx':
      return '📈';
    case 'txt':
      return '📋';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      return '🖼️';
    case 'zip':
    case 'rar':
      return '🗜️';
    default:
      return '📎';
  }
}

// Helper function para formatear el tamaño del archivo
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}