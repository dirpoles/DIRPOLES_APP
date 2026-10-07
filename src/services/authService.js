import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL, API_URL, STORAGE_KEYS } from '../constants/config';
import { encryptRSA } from '../utils/rsaEncrypt';

/**
 * SERVICIO DE AUTENTICACIÓN — DIRPOLES-4
 *
 * Todos los tokens llegan ahora en el body JSON (data.datos).
 * El interceptor de Axios inyecta Authorization: Bearer en cada petición.
 *
 * Endpoints:
 *  - Login:          POST  /iniciar_sesion
 *  - Validar sesión: GET   /api/perfil/obtener
 *  - Logout:         GET   /logout
 *  - Refresh token:  POST  /refresh_token  { "refresh_token": "..." }
 */

const authService = {
  /**
   * Inicia sesión cifrando la contraseña con RSA.
   *
   * Respuesta del backend:
   * {
   *   "exito": true,
   *   "datos": {
   *     "token": "eyJ...",
   *     "refresh_token": "33efcf...",
   *     "jwt_exp": 3600,
   *     "usuario": { id_empleado, nombre, apellido, correo, tipo_empleado, ... }
   *   }
   * }
   *
   * @param {string} correo
   * @param {string} password - En texto plano; se cifra aquí con RSA.
   * @returns {Promise<{success: boolean, user: object|null, message: string}>}
   */
  login: async (correo, password) => {
    try {
      const encryptedPassword = encryptRSA(password);

      const response = await axios.post(
        `${BASE_URL}/iniciar_sesion`,
        { correo, password: encryptedPassword },
        {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        },
      );

      const datos = response.data?.datos;

      if (!datos?.token) {
        return {
          success: false,
          user:    null,
          message: response.data?.datos?.mensaje || 'El servidor no devolvió un token.',
        };
      }

      // Persistir credenciales en el almacenamiento seguro del dispositivo
      await SecureStore.setItemAsync(STORAGE_KEYS.JWT_TOKEN,     datos.token);
      await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, datos.refresh_token ?? '');
      await SecureStore.setItemAsync(
        STORAGE_KEYS.USER_DATA,
        JSON.stringify(datos.usuario ?? {}),
      );

      return {
        success: true,
        user:    datos.usuario ?? null,
        message: datos.mensaje || 'Inicio de sesión exitoso',
      };
    } catch (error) {
      console.error('[AuthService] login error:', error.message);
      let message;
      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx (ej: 400 Bad Request, 401 Unauthorized, 500)
        message =
          error.response.data?.datos?.mensaje ||
          error.response.data?.error?.mensaje ||
          error.response.data?.mensaje       ||
          error.response.data?.error         ||
          error.response.data?.message       ||
          (error.response.status === 400 || error.response.status === 401
            ? 'Correo o contraseña incorrectos. Por favor, verifica tus datos.'
            : `Error en el servidor (${error.response.status}). Inténtalo más tarde.`);
      } else if (error.request) {
        // La petición fue enviada pero no se recibió respuesta (error de red)
        message = 'No se pudo conectar con el servidor.\nVerifica que el servidor esté encendido y que estés en la misma red WiFi.';
      } else {
        message = error.message || 'Error inesperado al intentar iniciar sesión.';
      }
      return { success: false, user: null, message };
    }
  },

  /**
   * Verifica la sesión al arrancar la app.
   *
   * Endpoint: GET /api/perfil/obtener
   * Respuesta: { "exito": true, "datos": { id_empleado, nombre, apellido, ... } }
   *
   * @returns {Promise<{isAuthenticated: boolean, user: object|null}>}
   */
  checkSession: async () => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.JWT_TOKEN);
      if (!token) return { isAuthenticated: false, user: null };

      const response = await axios.get(`${API_URL}/perfil/obtener`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        timeout: 8000,
      });

      const datos = response.data?.datos;
      if (response.data?.exito && datos) {
        // Actualizar datos locales con los del servidor
        await SecureStore.setItemAsync(STORAGE_KEYS.USER_DATA, JSON.stringify(datos));
        return { isAuthenticated: true, user: datos };
      }

      await authService.logout();
      return { isAuthenticated: false, user: null };
    } catch (error) {
      console.warn('[AuthService] checkSession error:', error.message);
      // Fallo de red → confiar en los datos locales temporalmente
      const localData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
      if (localData) {
        try { return { isAuthenticated: true, user: JSON.parse(localData) }; } catch { /* corrupto */ }
      }
      return { isAuthenticated: false, user: null };
    }
  },

  /**
   * Cierra sesión: notifica al backend y limpia el almacenamiento local.
   *
   * Endpoint: GET /logout
   * El backend revoca el refresh_token en BD y destruye la sesión PHP.
   *
   * @returns {Promise<void>}
   */
  logout: async () => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.JWT_TOKEN);
      if (token) {
        await axios
          .get(`${BASE_URL}/logout`, {
            headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
            timeout: 4000,
          })
          .catch((e) => console.warn('[AuthService] logout backend error:', e.message));
      }
    } finally {
      await Promise.allSettled([
        SecureStore.deleteItemAsync(STORAGE_KEYS.JWT_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
        SecureStore.deleteItemAsync(STORAGE_KEYS.USER_DATA),
      ]);
    }
  },

  /**
   * Renueva el access token usando el refresh token.
   * Llamado internamente por el interceptor de api.js.
   *
   * Endpoint: POST /refresh_token
   * Body:     { "refresh_token": "..." }
   * Respuesta: { "exito": true, "datos": { "token": "nuevo_jwt", "refresh_token": "nuevo_refresh" } }
   *
   * @param {string} refreshToken
   * @returns {Promise<string|null>} Nuevo JWT o null si falló.
   */
  refreshToken: async (refreshToken) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/refresh_token`,
        { refresh_token: refreshToken },
        {
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          timeout: 8000,
        },
      );

      const datos    = response.data?.datos;
      const newToken = datos?.token || datos?.access_token;

      if (newToken) {
        await SecureStore.setItemAsync(STORAGE_KEYS.JWT_TOKEN, newToken);
        // Rotar también el refresh token si el backend devuelve uno nuevo
        if (datos?.refresh_token) {
          await SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, datos.refresh_token);
        }
        return newToken;
      }
      return null;
    } catch (error) {
      console.error('[AuthService] refreshToken error:', error.message);
      return null;
    }
  },
};

export default authService;
