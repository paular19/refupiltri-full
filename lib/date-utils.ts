// utils/date-utils.ts

/**
 * Convierte un Timestamp de Firebase a Date de forma segura
 */
export function timestampToDate(timestamp: any): Date {
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (timestamp && typeof timestamp.toDate === 'function') {
    return timestamp.toDate();
  }
  if (timestamp && timestamp._seconds) {
    return new Date(timestamp._seconds * 1000);
  }
  if (typeof timestamp === 'string' || typeof timestamp === 'number') {
    return new Date(timestamp);
  }
  throw new Error(`Cannot convert to Date: ${timestamp}`);
}

/**
 * Formatea una fecha para mostrar SOLO la fecha (sin hora)
 * Mantiene la fecha UTC sin conversión de zona horaria
 */
export function formatDateOnly(dateValue: any): string {
  const date = timestampToDate(dateValue);
  
  // Usar UTC para evitar problemas de zona horaria
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  
  return `${day}/${month}/${year}`;
}

/**
 * Formatea un rango de fechas
 */
export function formatDateRange(startDate: any, endDate: any): string {
  const start = formatDateOnly(startDate);
  const end = formatDateOnly(endDate);
  return `${start} - ${end}`;
}

/**
 * Convierte una fecha a string para inputs de tipo date
 */
export function dateToInputString(dateValue: any): string {
  const date = timestampToDate(dateValue);
  
  // Para inputs HTML date, necesitamos YYYY-MM-DD en UTC
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Formatea fecha con hora (si la necesitas)
 */
export function formatDateTime(dateValue: any): string {
  const date = timestampToDate(dateValue);
  
  // Usar zona horaria local para mostrar fecha y hora
  return date.toLocaleString('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Debug function - eliminar después de arreglar
 */
export function debugDate(dateValue: any, label: string = '') {
  const date = timestampToDate(dateValue);
  console.log(`=== DEBUG DATE ${label} ===`);
  console.log('Original value:', dateValue);
  console.log('Converted to Date:', date);
  console.log('UTC ISO:', date.toISOString());
  console.log('Local string:', date.toLocaleString());
  console.log('UTC components:', {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1,
    day: date.getUTCDate()
  });
  console.log('Local components:', {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate()
  });
  console.log('Formatted (our function):', formatDateOnly(dateValue));
}