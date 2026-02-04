import { z } from 'zod';

// Constantes de seguridad
export const SECURITY_CONSTANTS = {
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_MAX_LENGTH: 128,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutos
  SESSION_TIMEOUT: 24 * 60 * 60 * 1000, // 24 horas (manejado por Rust backend)
  CSRF_TOKEN_LENGTH: 32,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
  RATE_LIMIT_REQUESTS: 100,
  RATE_LIMIT_WINDOW: 15 * 60 * 1000 // 15 minutos
} as const;

// Patrones de validación seguros
export const SECURITY_PATTERNS = {
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  SQL_INJECTION: /('|(\')|;|--|\||select|union|insert|update|delete|drop|create|alter|exec|script)/i,
  XSS: /<script|javascript:|on\w+\s*=/i,
  PATH_TRAVERSAL: /\.\.\/|\.\.\\|\%2e\%2e\%2f|\%2e\%2e\%5c/i,
  EMAIL_VALID: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
} as const;

// Funciones de sanitización
export class SecuritySanitizer {
  /**
   * Sanitiza entrada de texto para prevenir XSS
   */
  static sanitizeHtml(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Sanitiza entrada SQL para prevenir inyección
   */
  static sanitizeSql(input: string): string {
    return input.replace(/['"\\;]/g, '');
  }

  /**
   * Sanitiza nombre de archivo
   */
  static sanitizeFileName(fileName: string): string {
    return fileName
      .replace(/[^a-zA-Z0-9._-]/g, '')
      .substring(0, 255);
  }

  /**
   * Sanitiza URL para prevenir redirecciones maliciosas
   */
  static sanitizeUrl(url: string): string {
    // Permitir rutas relativas (pero no protocol-relative URLs como //evil.com)
    if (url.startsWith('/') && !url.startsWith('//')) {
      return url;
    }
    try {
      const parsed = new URL(url);
      // Solo permitir protocolos http y https
      if (parsed.protocol === 'https:' || parsed.protocol === 'http:') {
        return url;
      }
      return '/';
    } catch {
      return '/';
    }
  }

  /**
   * Limpia y valida input de texto general
   */
  static cleanTextInput(input: string, maxLength: number = 1000): string {
    return input
      .trim()
      .substring(0, maxLength)
      .replace(/[\r\n\t]/g, ' ')
      .replace(/\s+/g, ' ');
  }
}

// Validador de archivos
export class FileValidator {
  static validateFile(file: File): { valid: boolean; error?: string } {
    // Verificar tamaño
    if (file.size > SECURITY_CONSTANTS.MAX_FILE_SIZE) {
      return { 
        valid: false, 
        error: `Archivo muy grande. Máximo permitido: ${SECURITY_CONSTANTS.MAX_FILE_SIZE / 1024 / 1024}MB` 
      };
    }

    // Verificar tipo MIME
    if (!SECURITY_CONSTANTS.ALLOWED_FILE_TYPES.includes(file.type as typeof SECURITY_CONSTANTS.ALLOWED_FILE_TYPES[number])) {
      return { 
        valid: false, 
        error: 'Tipo de archivo no permitido' 
      };
    }

    // Verificar extensión
    const extension = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf'];
    if (!extension || !allowedExtensions.includes(extension)) {
      return { 
        valid: false, 
        error: 'Extensión de archivo no permitida' 
      };
    }

    return { valid: true };
  }

  static async validateImageFile(file: File): Promise<{ valid: boolean; error?: string }> {
    const basicValidation = this.validateFile(file);
    if (!basicValidation.valid) {
      return basicValidation;
    }

    // Verificar que sea realmente una imagen
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      
      // Verificar magic numbers para imágenes
      const isJPEG = uint8Array[0] === 0xFF && uint8Array[1] === 0xD8;
      const isPNG = uint8Array[0] === 0x89 && uint8Array[1] === 0x50 && 
                   uint8Array[2] === 0x4E && uint8Array[3] === 0x47;
      const isWebP = uint8Array[8] === 0x57 && uint8Array[9] === 0x45 && 
                     uint8Array[10] === 0x42 && uint8Array[11] === 0x50;

      if (!isJPEG && !isPNG && !isWebP) {
        return { valid: false, error: 'Archivo no es una imagen válida' };
      }

      return { valid: true };
    } catch {
      return { valid: false, error: 'Error al validar archivo de imagen' };
    }
  }
}

// Rate Limiter simple para cliente
export class ClientRateLimiter {
  private static requests: Map<string, number[]> = new Map();

  static isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(key) || [];
    
    // Limpiar requests antiguos
    const validRequests = requests.filter(
      time => now - time < SECURITY_CONSTANTS.RATE_LIMIT_WINDOW
    );
    
    // Verificar límite
    if (validRequests.length >= SECURITY_CONSTANTS.RATE_LIMIT_REQUESTS) {
      return false;
    }
    
    // Añadir nueva request
    validRequests.push(now);
    this.requests.set(key, validRequests);
    
    return true;
  }

  static reset(key: string): void {
    this.requests.delete(key);
  }
}

// Validadores de entrada seguros
export const secureValidators = {
  password: z.string()
    .min(SECURITY_CONSTANTS.PASSWORD_MIN_LENGTH, `Contraseña debe tener al menos ${SECURITY_CONSTANTS.PASSWORD_MIN_LENGTH} caracteres`)
    .max(SECURITY_CONSTANTS.PASSWORD_MAX_LENGTH, `Contraseña muy larga`)
    .regex(SECURITY_PATTERNS.PASSWORD, 'Contraseña debe contener al menos: 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial'),
  
  email: z.string()
    .email('Email inválido')
    .regex(SECURITY_PATTERNS.EMAIL_VALID, 'Formato de email inválido')
    .max(254, 'Email muy largo'),
  
  safeText: z.string()
    .max(1000, 'Texto muy largo')
    .refine(
      (val) => !SECURITY_PATTERNS.XSS.test(val),
      'Contenido no permitido detectado'
    )
    .refine(
      (val) => !SECURITY_PATTERNS.SQL_INJECTION.test(val),
      'Caracteres no permitidos detectados'
    ),
  
  safeUrl: z.string()
    .url('URL inválida')
    .refine(
      (val) => val.startsWith('https://') || val.startsWith('/'),
      'Solo se permiten URLs HTTPS o rutas relativas'
    ),
  
  safePath: z.string()
    .refine(
      (val) => !SECURITY_PATTERNS.PATH_TRAVERSAL.test(val),
      'Ruta no permitida'
    )
};

// Utilidades para tokens CSRF
export class CSRFUtils {
  static generateToken(): string {
    const array = new Uint8Array(SECURITY_CONSTANTS.CSRF_TOKEN_LENGTH);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  }

  static validateToken(token: string, sessionToken: string): boolean {
    return token === sessionToken && token.length === SECURITY_CONSTANTS.CSRF_TOKEN_LENGTH * 2;
  }
}

// Headers de seguridad recomendados
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  'Content-Security-Policy': 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "img-src 'self' data: https:; " +
    "font-src 'self' data:; " +
    "connect-src 'self' https://163.176.141.4; " +
    "frame-ancestors 'none';"
} as const;

// Validación de rutas internas para redirección post-login (prevención de open redirect)
const BLOCKED_REDIRECT_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0'];

export function getSafeRedirectPath(from: string | null, fallback = '/dashboard'): string {
  if (!from) return fallback;
  const lower = from.toLowerCase();
  if (
    from !== '/login' &&
    from.startsWith('/') &&
    !from.startsWith('//') &&
    !from.includes('\\') &&
    !from.includes('://') &&
    !BLOCKED_REDIRECT_HOSTS.some((h) => lower.includes(h))
  ) {
    return from;
  }
  return fallback;
}

// Función para logs de seguridad
export function logSecurityEvent(event: string, details: Record<string, unknown>, severity: 'low' | 'medium' | 'high' = 'medium'): void {
  if (process.env.NODE_ENV === 'development') {
    console.warn(`[SECURITY-${severity.toUpperCase()}] ${event}:`, details);
  }
  
  // En producción, aquí se enviaría a un servicio de logging
  // como Sentry, DataDog, etc.
}

// Función para validar permisos de usuario
export function validateUserPermissions(userRole: string, requiredPermission: string): boolean {
  const permissions: Record<string, string[]> = {
    admin: ['*'], // Admin tiene todos los permisos
    preceptor: ['read_all', 'write_grades', 'write_messages', 'manage_students'],
    teacher: ['read_own', 'write_own', 'write_grades', 'write_messages'],
    student: ['read_own', 'submit_assignments'],
    father: ['read_children']
  };

  const userPermissions = permissions[userRole] || [];
  return userPermissions.includes('*') || userPermissions.includes(requiredPermission);
}