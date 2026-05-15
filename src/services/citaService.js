import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/config';

/**
 * SERVICIO: Citas
 * Centraliza las peticiones API relacionadas con las citas.
 */
const citaService = {

    /**
     * Registra una nueva cita en el sistema
     */
    registrar: async (datos) => {
        try {
            const token = await SecureStore.getItemAsync('user_token');

            const response = await axios.post(`${API_URL}/movil`, {
                modulo: 'citas',
                accion: 'registrar_cita',
                ...datos
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: response.data.estado === 'exito',
                message: response.data.mensaje || 'El servidor no envió un mensaje.',
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.mensaje || 'Error al conectar con el servidor'
            };
        }
    },

    /**
     * Obtiene la lista de todas las citas
     */
    consultar_citas: async () => {
        try {
            const token = await SecureStore.getItemAsync('user_token');
            const userDataStr = await SecureStore.getItemAsync('user_data');
            const user = userDataStr ? JSON.parse(userDataStr) : null;

            const response = await axios.post(`${API_URL}/movil`, {
                modulo: 'citas',
                accion: 'consultar_citas',
                id_empleado: user?.id_empleado,
                tipo_empleado: user?.tipo_empleado || user?.tipo_usuario || 'Administrador'
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: response.data.estado === 'exito',
                data: response.data.datos || [],
                message: response.data.mensaje || ''
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.mensaje || 'Error al obtener las citas',
                data: []
            };
        }
    },

    /**
     * Actualiza los datos de una cita existente
     */
    actualizar: async (datos) => {
        try {
            const token = await SecureStore.getItemAsync('user_token');

            const response = await axios.post(`${API_URL}/movil`, {
                modulo: 'citas',
                accion: 'actualizar_cita',
                ...datos
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: response.data.estado === 'exito',
                message: response.data.mensaje || 'El servidor no envió un mensaje.',
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.mensaje || 'Error al conectar con el servidor'
            };
        }
    },

    /**
     * Desactiva una cita (Borrado lógico)
     */
    desactivar: async (id_cita) => {
        try {
            const token = await SecureStore.getItemAsync('user_token');
            const response = await axios.post(`${API_URL}/movil`, {
                modulo: 'citas',
                accion: 'desactivar_cita',
                id_cita
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return {
                success: response.data.estado === 'exito',
                message: response.data.mensaje
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.mensaje || 'Error al desactivar la cita'
            };
        }
    }
};

export default citaService;
