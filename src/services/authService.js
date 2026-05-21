import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/config';
import { encryptRSA } from '../utils/rsaEncrypt';

/**
 * SERVICIO DE AUTENTICACIÓN (SOLID: Responsabilidad Única)
 * 
 * Este servicio se encarga exclusivamente de la comunicación con el 
 * backend DIRPOLES_4 para temas de acceso.
 */

const TOKEN_KEY = 'user_token';
const USER_DATA_KEY = 'user_data';

const authService = {
  /**
   * Intenta iniciar sesión en el backend
   * @param {string} correo - Correo electrónico del usuario
   * @param {string} password - Contraseña
   */
  login: async (correo, password) => {
    try {
      // Cifrar la contraseña con RSA antes de enviarla al backend
      const encryptedPassword = encryptRSA(password);
      
      // Petición centralizada al controlador móvil
      // Enviamos el campo 'accion' para que el switch del backend lo identifique
      const response = await axios.post(`${API_URL}/movil`, {
        modulo: 'general',
        accion: 'login',
        correo,
        password: encryptedPassword
      }, {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      // El backend movilController retorna { estado: 'exito', mensaje: '...', token: '...', empleado: {...} }
      if (response.data && response.data.estado === 'exito') {
        // Persistencia del token y datos del empleado de forma segura
        await SecureStore.setItemAsync(TOKEN_KEY, response.data.token);
        await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(response.data.empleado));
        
        return {
          success: true,
          user: response.data.empleado,
          message: response.data.mensaje
        };
      }

      // Manejo de estados específicos (error, bloqueado, etc.)
      return {
        success: false,
        message: response.data.mensaje || 'Credenciales inválidas'
      };
    } catch (error) {
      console.error('[AuthService] Login Error:', error);
      
      let message = 'Error de conexión con el servidor';
      if (error.response) {
        message = error.response.data?.mensaje || `Error del servidor (${error.response.status})`;
      } else if (error.request) {
        message = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
      }
      
      return {
        success: false,
        message: message
      };
    }
  },

  /**
   * Cierra la sesión eliminando los datos persistidos
   */
  logout: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      
      // Intentar avisar al backend (opcional, no bloquea el cierre local)
      if (token) {
        await axios.post(`${API_URL}/movil`, {
          modulo: 'general',
          accion: 'logout'
        }, {
          headers: { 'Authorization': `Bearer ${token}` },
          timeout: 3000 // Timeout corto para no dejar esperando al usuario
        }).catch(e => console.log('[AuthService] No se pudo avisar al backend del logout'));
      }

      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_DATA_KEY);
      return true;
    } catch (error) {
      console.error('[AuthService] Logout Error:', error);
      return false;
    }
  },

  /**
   * Recupera la sesión persistida y valida con el backend
   */
  checkSession: async () => {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      
      if (!token) return { isAuthenticated: false };

      // Opcional: Validar el token con la acción 'me' del movilController
      const response = await axios.post(`${API_URL}/movil`, {
        modulo: 'general',
        accion: 'me'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (response.data && response.data.estado === 'exito') {
        return {
          isAuthenticated: true,
          user: response.data.empleado,
          token: token
        };
      }
      
      // Si el token es inválido (según el backend), limpiamos
      await authService.logout();
      return { isAuthenticated: false };

    } catch (error) {
      console.error('[AuthService] CheckSession Error:', error);
      // En caso de error de red, podríamos confiar en los datos locales
      // pero por seguridad es mejor re-validar.
      const userData = await SecureStore.getItemAsync(USER_DATA_KEY);
      if (userData) {
        return {
          isAuthenticated: true,
          user: JSON.parse(userData),
          token: await SecureStore.getItemAsync(TOKEN_KEY)
        };
      }
      return { isAuthenticated: false };
    }
  }
};

export default authService;
