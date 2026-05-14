import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/config';

/**
 * SERVICIO DE DATOS (CATÁLOGOS)
 * 
 * Se encarga de traer información necesaria para los formularios (PNFs, Secciones, etc.)
 */
const dataService = {
  /**
   * Obtiene la lista de PNFs activos desde el backend
   */
  getPNFs: async () => {
    try {
      const token = await SecureStore.getItemAsync('user_token');
      const response = await axios.post(`${API_URL}/movil`, {
        modulo: 'beneficiarios',
        accion: 'obtener_pnf'
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.estado === 'exito') {
        return response.data.datos;
      }
      return [];
    } catch (error) {
      console.error('[DataService] Error al obtener PNFs:', error);
      return [];
    }
  }
};

export default dataService;
