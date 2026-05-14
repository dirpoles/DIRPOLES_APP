import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../constants/config';

/**
 * SERVICIO: Beneficiarios
 * Centraliza las peticiones API relacionadas con los beneficiarios.
 */
const beneficiarioService = {
    
    /**
     * Registra un nuevo beneficiario en el sistema
     */
    registrar: async (datos) => {
        try {
            const token = await SecureStore.getItemAsync('user_token');
            
            const response = await axios.post(`${API_URL}/movil`, {
                modulo: 'beneficiarios',
                accion: 'registrar_beneficiario',
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
     * Obtiene la lista de todos los beneficiarios
     */
    obtenerTodos: async () => {
        try {
            const token = await SecureStore.getItemAsync('user_token');
            
            // Nota: Aunque conceptualmente es un GET, usamos POST porque el backend 
            // espera leer el campo "accion" desde el body JSON (php://input)
            const response = await axios.post(`${API_URL}/movil`, {
                modulo: 'beneficiarios',
                accion: 'consultar_beneficiarios'
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
                message: error.response?.data?.mensaje || 'Error al obtener beneficiarios',
                data: []
            };
        }
    },

    /**
     * Actualiza los datos de un beneficiario existente
     */
    actualizar: async (datos) => {
        try {
            const token = await SecureStore.getItemAsync('user_token');
            
            const response = await axios.post(`${API_URL}/movil`, {
                modulo: 'beneficiarios',
                accion: 'actualizar_beneficiario',
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
     * Desactiva un beneficiario (Borrado lógico)
     */
    desactivar: async (id_beneficiario) => {
        try {
            const token = await SecureStore.getItemAsync('user_token');
            const response = await axios.post(`${API_URL}/movil`, {
                modulo: 'beneficiarios',
                accion: 'desactivar_beneficiario',
                id_beneficiario
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
                message: error.response?.data?.mensaje || 'Error al desactivar beneficiario'
            };
        }
    },

    validarDuplicado: async (campo, valor, idExcluir = null) => {
        try {
            const token = await SecureStore.getItemAsync('user_token');
            const response = await axios.post(`${API_URL}/movil`, {
                modulo: 'beneficiarios',
                accion: 'validar_duplicado',
                campo,
                valor,
                id_excluir: idExcluir
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            return {
                success: response.data.estado === 'exito',
                existe: response.data.existe,
                message: response.data.mensaje
            };
        } catch (error) {
            return { success: false, existe: false };
        }
    }
};

export default beneficiarioService;
