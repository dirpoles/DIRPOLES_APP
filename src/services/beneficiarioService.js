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
    }
};

export default beneficiarioService;
