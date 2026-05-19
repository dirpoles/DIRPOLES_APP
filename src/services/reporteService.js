import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/config';

/**
 * SERVICIO: Reportes (SOLID: SRP)
 * Centraliza las llamadas API de consulta estadística consolidada.
 */
const reporteService = {

  /**
   * Obtiene todos los indicadores estadísticos del sistema móvil
   */
  obtenerEstadisticas: async () => {
    try {
      const token = await SecureStore.getItemAsync('user_token');

      const response = await axios.post(`${API_URL}/movil`, {
        modulo: 'reportes',
        accion: 'consultar_reportes_movil'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: response.data.estado === 'exito',
        message: response.data.mensaje || '',
        data: response.data.datos || null
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.mensaje || 'Error al conectar con el servidor para cargar reportes'
      };
    }
  }

};

export default reporteService;
