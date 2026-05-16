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
     * Obtiene la lista de todos los beneficiarios
     */
    consultar_beneficiarios_activos: async () => {
        try {
            const token = await SecureStore.getItemAsync('user_token');
            const response = await axios.post(`${API_URL}/movil`, {
                modulo: 'citas',
                accion: 'consultar_beneficiarios_activos'
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
                message: error.response?.data?.mensaje || 'Error al obtener los beneficiarios',
                data: []
            };
        }
    },

    /**
     * Obtiene la lista de todos los beneficiarios
     */
    consultar_psicologos: async () => {
        try {
            const token = await SecureStore.getItemAsync('user_token');
            const response = await axios.post(`${API_URL}/movil`, {
                modulo: 'citas',
                accion: 'consultar_psicologos'
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
                message: error.response?.data?.mensaje || 'Error al obtener los psicologos',
                data: []
            };
        }
    },

    /**
     * Valida si un psicólogo trabaja en un día determinado
     */
    validar_fecha_cita: async (datos) => {
        try {
            const token = await SecureStore.getItemAsync('user_token');
            const response = await axios.post(`${API_URL}/movil`, {
                modulo: 'citas',
                accion: 'validar_fecha_cita',
                ...datos
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data.estado === 'exito' ? response.data.datos : response.data;
        } catch (error) {
            return { exito: false, mensaje: 'Error al validar fecha' };
        }
    },

    /**
     * Valida si la hora está en el rango y disponible
     */
    validar_hora_cita: async (datos) => {
        try {
            const token = await SecureStore.getItemAsync('user_token');
            const response = await axios.post(`${API_URL}/movil`, {
                modulo: 'citas',
                accion: 'validar_hora_cita',
                ...datos
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return response.data.estado === 'exito' ? response.data.datos : response.data;
        } catch (error) {
            return { exito: false, mensaje: 'Error al validar hora' };
        }
    },

    /**
     * Obtiene los días y horas que trabaja un psicólogo específico
     */
    obtener_horario_psicologo: async (id_empleado) => {
        try {
            const token = await SecureStore.getItemAsync('user_token');
            const response = await axios.post(`${API_URL}/movil`, {
                modulo: 'citas',
                accion: 'obtener_horario_psicologo',
                id_empleado
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            return {
                success: response.data.estado === 'exito',
                data: response.data.datos || null,
                message: response.data.mensaje || ''
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.mensaje || 'Error al cargar horario del psicólogo',
                data: null
            };
        }
    },

    /**
     * Obtiene la lista de estados de cita (Pendiente, Confirmada, etc.)
     */
    consultar_estados_cita: async () => {
        try {
            const token = await SecureStore.getItemAsync('user_token');
            const response = await axios.post(`${API_URL}/movil`, {
                modulo: 'citas',
                accion: 'consultar_estados_cita'
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            return {
                success: response.data.estado === 'exito',
                data: response.data.datos || [],
                message: response.data.mensaje || ''
            };
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.mensaje || 'Error al obtener estados',
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
