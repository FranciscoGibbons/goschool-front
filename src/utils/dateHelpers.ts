/**
 * Utilidades para manejo de fechas, especialmente para evitar problemas de zona horaria
 */

/**
 * Convierte una fecha en formato YYYY-MM-DD a un objeto Date local
 * para evitar problemas de zona horaria donde JavaScript interpreta
 * la fecha como UTC medianoche y la convierte a hora local.
 * 
 * @param dateString - Fecha en formato YYYY-MM-DD (ej: "2024-09-24")
 * @returns Date object con la fecha a las 12:00 PM hora local
 */
export function parseLocalDate(dateString: string): Date {
  // Agregar tiempo al mediodía para evitar problemas de zona horaria
  return new Date(dateString + 'T12:00:00');
}

/**
 * Formatea una fecha de asistencia/sanción para mostrar al usuario
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @param options - Opciones de formato (opcional)
 * @returns Fecha formateada en español
 */
export function formatAssistanceDate(
  dateString: string, 
  options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric", 
    month: "long",
    day: "numeric"
  }
): string {
  return parseLocalDate(dateString).toLocaleDateString("es-ES", options);
}

/**
 * Obtiene el timestamp de una fecha de asistencia para ordenamiento
 * @param dateString - Fecha en formato YYYY-MM-DD  
 * @returns Timestamp en milisegundos
 */
export function getAssistanceTimestamp(dateString: string): number {
  return parseLocalDate(dateString).getTime();
}

/**
 * Convierte una fecha de asistencia a clave para agrupamiento (YYYY-MM)
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns Clave en formato YYYY-MM
 */
export function getMonthKey(dateString: string): string {
  const date = parseLocalDate(dateString);
  return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
}

/**
 * Obtiene el nombre del mes de una fecha de asistencia
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns Nombre del mes en español (ej: "septiembre 2024")
 */
export function getMonthName(dateString: string): string {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
}

/**
 * Convierte una fecha de asistencia a formato ISO para keys de mapas
 * @param dateString - Fecha en formato YYYY-MM-DD
 * @returns Fecha en formato YYYY-MM-DD (normalizada)
 */
export function getDateKey(dateString: string): string {
  return parseLocalDate(dateString).toISOString().split('T')[0];
}