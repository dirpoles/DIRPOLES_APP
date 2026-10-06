// ============================================
// CONFIGURACIÓN GLOBAL DE DIRPOLES MOBILE
// ============================================

/**
 * URL base del servidor backend DIRPOLES-4.
 * Cambia la IP por la dirección de tu servidor local o de producción.
 * Ejemplo local: 'http://192.168.50.100/DIRPOLES-4'
 */
export const BASE_URL = 'http://192.168.50.100/DIRPOLES-4';

/**
 * Prefijo de la API REST de DIRPOLES-4.
 * Todas las rutas de servicios se construyen a partir de esta URL.
 */
export const API_URL = `${BASE_URL}/api`;

// ============================================
// PALETA DE COLORES CORPORATIVA
// ============================================
export const COLORS = {
  // Primarios
  primary:      '#2563EB',
  primaryDark:  '#1D4ED8',
  primaryLight: '#DBEAFE',

  // Secundarios / Estado
  secondary: '#64748B',
  accent:    '#10B981',
  danger:    '#EF4444',
  warning:   '#F59E0B',
  info:      '#3B82F6',

  // Fondos / Superficie
  background: '#F8FAFC',
  surface:    '#FFFFFF',
  border:     '#E2E8F0',

  // Tipografía
  text:          '#1E293B',
  textSecondary: '#64748B',
  textMuted:     '#94A3B8',
  textInverse:   '#FFFFFF',
};

// ============================================
// CONFIGURACIÓN GENERAL DE LA APLICACIÓN
// ============================================
export const APP_CONFIG = {
  name:           'DIRPOLES Mobile',
  version:        '2.0.0',
  defaultTimeout: 10000, // ms
};

// ============================================
// CLAVES DE ALMACENAMIENTO SEGURO (SecureStore)
// ============================================
export const STORAGE_KEYS = {
  JWT_TOKEN:     'jwt_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA:     'user_data',
};
