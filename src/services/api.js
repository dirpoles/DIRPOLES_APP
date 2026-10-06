import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL, API_URL, APP_CONFIG, STORAGE_KEYS } from '../constants/config';

// ============================================
// INSTANCIA AXIOS CONFIGURADA
// ============================================
const api = axios.create({
  baseURL: API_URL,
  timeout: APP_CONFIG.defaultTimeout,
  headers: {
    'Content-Type': 'application/json',
    Accept:         'application/json',
  },
});

// ============================================
// VARIABLES DE CONTROL DE REFRESH TOKEN
// Evitan que múltiples peticiones 401 simultáneas
// disparen varios procesos de renovación en paralelo.
// ============================================
let isRefreshing = false;
/** @type {Array<{resolve: Function, reject: Function}>} */
let failedQueue = [];

/**
 * Procesa la cola de peticiones que fallaron mientras se renovaba el token.
 * @param {Error|null} error  - Error si el refresh falló.
 * @param {string|null} token - Nuevo token si el refresh fue exitoso.
 */
const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Referencia externa para que el interceptor pueda llamar a logout()
 * sin importar AuthContext directamente (evita dependencia circular).
 * Se registra llamando a `setLogoutHandler(fn)` desde AuthContext.
 */
let _logoutHandler = null;

/**
 * Registra el callback de cierre de sesión forzado.
 * Debe invocarse desde AuthContext al inicializarse.
 * @param {() => void} fn
 */
export const setLogoutHandler = (fn) => {
  _logoutHandler = fn;
};

// ============================================
// INTERCEPTOR DE PETICIONES — inyección de JWT
// ============================================
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.JWT_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('[API] No se pudo leer el token:', err.message);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// ============================================
// INTERCEPTOR DE RESPUESTAS — refresh & errores
// ============================================
api.interceptors.response.use(
  // ——— Respuesta exitosa: la devolvemos tal cual ———
  (response) => response,

  // ——— Respuesta con error ———
  async (error) => {
    const originalRequest = error.config;

    // Extraer código de negocio del backend (si existe)
    const backendCode    = error.response?.data?.error?.codigo;
    const backendStatus  = error.response?.status;

    // ----- 401 con TOKEN_EXPIRED: intentar renovar -----
    if (
      backendStatus === 401 &&
      backendCode === 'TOKEN_EXPIRED' &&
      !originalRequest._retry
    ) {
      // Si ya hay un refresh en curso, encolar esta petición
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN);

        if (!refreshToken) {
          throw new Error('No hay refresh token disponible');
        }

        // Petición de renovación (sin pasar por el interceptor para evitar bucle)
        const refreshResponse = await axios.post(
          `${BASE_URL}/refresh_token`,  // ⚠️ Sin prefijo /api/ en DIRPOLES-4
          { refresh_token: refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
              Accept:         'application/json',
            },
          },
        );

        // La respuesta de /refresh_token tiene estructura: { exito: true, datos: { token, refresh_token } }
        const newToken = refreshResponse.data?.datos?.token
          || refreshResponse.data?.token
          || refreshResponse.data?.access_token;

        if (!newToken) {
          throw new Error('El backend no devolvió un token de renovación válido');
        }

        // Persistir el nuevo JWT
        await SecureStore.setItemAsync(STORAGE_KEYS.JWT_TOKEN, newToken);

        // Rotar el refresh token si el backend devuelve uno nuevo (single-use rotation)
        const newRefresh = refreshResponse.data?.datos?.refresh_token;
        if (newRefresh) {
          await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, newRefresh);
        }

        // Actualizar la instancia global y reintentar la petición original
        api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        originalRequest.headers.Authorization     = `Bearer ${newToken}`;

        processQueue(null, newToken);

        return api(originalRequest);
      } catch (refreshError) {
        console.error('[API] Falló la renovación del token:', refreshError.message);
        processQueue(refreshError, null);

        // Limpiar credenciales y disparar logout global
        await SecureStore.deleteItemAsync(STORAGE_KEYS.JWT_TOKEN);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
        await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);

        if (typeof _logoutHandler === 'function') {
          _logoutHandler();
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ----- 401 con UNAUTHENTICATED (token inválido/revocado) -----
    if (backendStatus === 401 && backendCode === 'UNAUTHENTICATED') {
      console.warn('[API] Sesión inválida — cerrando sesión forzosamente');
      await SecureStore.deleteItemAsync(STORAGE_KEYS.JWT_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN);
      await SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA);

      if (typeof _logoutHandler === 'function') {
        _logoutHandler();
      }
    }

    // ----- Normalización del mensaje de error de negocio -----
    // El backend retorna: { "exito": false, "error": { "codigo": "...", "mensaje": "..." } }
    const normalizedMessage =
      error.response?.data?.error?.mensaje ||
      error.response?.data?.mensaje ||
      error.message ||
      'Error de conexión con el servidor';

    // Adjuntamos el mensaje normalizado para facilitar su lectura en los servicios
    error.normalizedMessage = normalizedMessage;

    return Promise.reject(error);
  },
);

export default api;
