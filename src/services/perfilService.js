import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/config';

/**
 * SERVICIO: Perfil
 * Centraliza las peticiones API relacionadas con el perfil del usuario.
 */
const perfilService = {

    /**
     * Consulta los datos de perfil del empleado logueado
     */
    consultar: async () => {
        try {
            const token = await SecureStore.getItemAsync('user_token');

            const response = await axios.post(`${API_URL}/movil`, {
                modulo: 'perfil',
                accion: 'consultar_perfil'
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
                message: error.response?.data?.mensaje || 'Error al conectar con el servidor'
            };
        }
    },

    /**
     * Actualiza los datos del perfil de empleado logueado
     */
    actualizar: async (datos) => {
        try {
            const token = await SecureStore.getItemAsync('user_token');

            const response = await axios.post(`${API_URL}/movil`, {
                modulo: 'perfil',
                accion: 'actualizar_perfil',
                ...datos
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: response.data.estado === 'exito',
                message: response.data.mensaje || 'Perfil actualizado correctamente.',
                data: response.data
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.mensaje || 'Error al actualizar el perfil'
            };
        }
    },

};

export default perfilService;
