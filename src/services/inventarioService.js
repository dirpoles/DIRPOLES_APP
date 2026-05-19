import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/config';

/**
 * SERVICIO: Inventario
 * Centraliza las peticiones API relacionadas con el inventario.
 */
const inventarioService = {

    /**
     * Registra una nueva cita en el sistema
     */
    registrar: async (datos) => {
        try {
            const token = await SecureStore.getItemAsync('user_token');

            const response = await axios.post(`${API_URL}/movil`, {
                modulo: 'inventario',
                accion: 'registrar_insumo',
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
     * Obtiene la lista de todos los insumos
     */
    consultar_inventario: async () => {
        try {
            const token = await SecureStore.getItemAsync('user_token');

            const response = await axios.post(`${API_URL}/movil`, {
                modulo: 'inventario',
                accion: 'consultar_inventario_medico'
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
                message: error.response?.data?.mensaje || 'Error al obtener los insumos',
                data: []
            };
        }
    },

    /**
     * Obtiene la lista de todas las presentaciones
     */
    consultar_presentaciones: async () => {
        try {
            const token = await SecureStore.getItemAsync('user_token');

            const response = await axios.post(`${API_URL}/movil`, {
                modulo: 'inventario',
                accion: 'consultar_presentaciones_insumo'
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
                message: error.response?.data?.mensaje || 'Error al obtener las presentaciones',
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
                modulo: 'inventario',
                accion: 'actualizar_insumo',
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
    desactivar: async (id_insumo) => {
        try {
            const token = await SecureStore.getItemAsync('user_token');
            const response = await axios.post(`${API_URL}/movil`, {
                modulo: 'inventario',
                accion: 'desactivar_insumo',
                id_insumo
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
                message: error.response?.data?.mensaje || 'Error al desactivar el insumo'
            };
        }
    }
};

export default inventarioService;
