/**
 * Date utilities that handle timezone issues properly
 *
 * The main issue: When parsing "2025-01-15", JavaScript treats it as UTC midnight.
 * When displayed in a local timezone like Argentina (UTC-3), it shows as
 * "2025-01-14 21:00" - the previous day.
 *
 * Solution: Parse dates at noon to avoid day boundary issues.
 */

/**
 * Parse a date string safely without timezone shifting
 * @param dateString - Date string in YYYY-MM-DD format
 * @returns Date object at noon
 */
export function parseLocalDate(dateString: string): Date {
  if (!dateString) return new Date();
  if (dateString.includes("T")) {
    return new Date(dateString);
  }
  return new Date(dateString + "T12:00:00");
}

/**
 * Format date for display - short format
 */
export function formatDate(
  dateString: string | Date,
  options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
  }
): string {
  const date =
    typeof dateString === "string" ? parseLocalDate(dateString) : dateString;
  return date.toLocaleDateString("es-AR", options);
}

/**
 * Format date with weekday
 */
export function formatAssistanceDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  return parseLocalDate(dateString).toLocaleDateString("es-AR", options);
}

/**
 * Format date - full format
 */
export function formatDateFull(dateString: string | Date): string {
  return formatDate(dateString, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Format time from HH:MM:SS
 */
export function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(":");
  const h = parseInt(hours, 10);
  const m = parseInt(minutes, 10);
  return `${h}:${m.toString().padStart(2, "0")}`;
}

/**
 * Format datetime
 */
export function formatDateTime(dateString: string | Date): string {
  const date =
    typeof dateString === "string" ? new Date(dateString) : dateString;
  return date.toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Get timestamp for sorting
 */
export function getAssistanceTimestamp(dateString: string): number {
  return parseLocalDate(dateString).getTime();
}

/**
 * Get month key for grouping (YYYY-MM)
 */
export function getMonthKey(dateString: string): string {
  const date = parseLocalDate(dateString);
  return `${date.getFullYear()}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
}

/**
 * Get month name
 */
export function getMonthName(dateString: string): string {
  const date = parseLocalDate(dateString);
  return date.toLocaleDateString("es-AR", { year: "numeric", month: "long" });
}

/**
 * Get date key for maps
 */
export function getDateKey(dateString: string): string {
  return parseLocalDate(dateString).toISOString().split("T")[0];
}

/**
 * Get relative time description
 */
export function getRelativeTime(dateString: string | Date): string {
  const date =
    typeof dateString === "string" ? parseLocalDate(dateString) : dateString;
  const now = new Date();
  const diffTime = date.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Manana";
  if (diffDays === -1) return "Ayer";
  if (diffDays > 0 && diffDays <= 7) return `En ${diffDays} dias`;
  if (diffDays < 0 && diffDays >= -7) return `Hace ${Math.abs(diffDays)} dias`;

  return formatDate(date);
}

/**
 * Check if date is today
 */
export function isToday(dateString: string | Date): boolean {
  const date =
    typeof dateString === "string" ? parseLocalDate(dateString) : dateString;
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Check if date is in the past
 */
export function isPast(dateString: string | Date): boolean {
  const date =
    typeof dateString === "string" ? parseLocalDate(dateString) : dateString;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const targetDate = new Date(date);
  targetDate.setHours(0, 0, 0, 0);
  return targetDate < today;
}

/**
 * Get date string for input[type="date"]
 */
export function toInputDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

/**
 * Get short weekday names
 */
export const WEEKDAYS_SHORT = ["Dom", "Lun", "Mar", "Mie", "Jue", "Vie", "Sab"];

/**
 * Get full weekday names
 */
export const WEEKDAYS = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miercoles",
  "Jueves",
  "Viernes",
  "Sabado",
];

/**
 * Get short month names
 */
export const MONTHS_SHORT = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

/**
 * Get full month names
 */
export const MONTHS = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];
