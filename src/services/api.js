import axios from 'axios';
import { API_URL, APP_CONFIG } from '../constants/config';
import * as SecureStore from 'expo-secure-store';

// ============================================
// INSTANCIA AXIOS CONFIGURADA
// ============================================
const api = axios.create({
  baseURL: API_URL,
  timeout: APP_CONFIG.defaultTimeout,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ============================================
// INTERCEPTOR DE PETICIONES
// Agrega el token JWT automáticamente a todas las peticiones
// ============================================
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.log('[API] Error al obtener token:', error.message);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ============================================
// INTERCEPTOR DE RESPUESTAS
// Maneja errores globales (401 = token inválido)
// ============================================
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token inválido o expirado
      console.log('[API] Token inválido, limpiando...');
      await SecureStore.deleteItemAsync('token');
      // Nota: La navegación al login se maneja desde el AuthContext
    }
    return Promise.reject(error);
  }
);

export default api;
