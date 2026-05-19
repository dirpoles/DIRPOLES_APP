// ============================================
// CONFIGURACIÓN DE LA API DIRPOLES 4
// ============================================

// IMPORTANTE: Cambia esta URL por la IP de tu computadora en la red local
// Ejemplo: 'http://192.168.1.100/DIRPOLES_4/api'
// Para pruebas locales con Expo Go en el mismo PC, usa la IP local
export const API_URL = 'http://192.168.1.108/DIRPOLES_4/api';
export const BASE_URL = 'http://192.168.1.108/DIRPOLES_4';

// ============================================
// PALETA DE COLORES
// ============================================
export const COLORS = {
  // Colores primarios
  primary: '#2563EB',      // Azul principal
  primaryDark: '#1D4ED8', // Azul oscuro
  primaryLight: '#DBEAFE', // Azul claro

  // Colores secundarios
  secondary: '#64748B',    // Gris azulado
  accent: '#10B981',       // Verde éxito
  danger: '#EF4444',       // Rojo error
  warning: '#F59E0B',      // Amarillo advertencia
  info: '#3B82F6',         // Azul info

  // Colores de fondo
  background: '#F8FAFC',   // Fondo pantalla
  surface: '#FFFFFF',      // Tarjetas/contenedores
  border: '#E2E8F0',       // Bordes

  // Colores de texto
  text: '#1E293B',         // Texto principal
  textSecondary: '#64748B', // Texto secundario
  textMuted: '#94A3B8',    // Texto desactivado
  textInverse: '#FFFFFF',  // Texto sobre fondos oscuros
};

// ============================================
// CONFIGURACIÓN DE LA APP
// ============================================
export const APP_CONFIG = {
  name: 'DIRPOLES Mobile',
  version: '1.0.0',
  defaultTimeout: 10000, // 10 segundos para peticiones HTTP
};
