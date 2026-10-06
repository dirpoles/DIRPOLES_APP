import api from './api';

/**
 * SERVICIO: Beneficiarios (SOLID: SRP)
 *
 * Centraliza todas las peticiones HTTP relacionadas con el módulo de
 * beneficiarios contra la API REST de DIRPOLES-4.
 *
 * Contrato de salida (consumido por hooks y componentes):
 *   { success: boolean, data: any, message: string }
 *
 * La propiedad `existe` se incluye en validarDuplicado para que
 * useBeneficiarioForm pueda detectar duplicados sin romper su lógica actual.
 */

const beneficiarioService = {
  /**
   * Obtiene la lista de beneficiarios con soporte opcional de búsqueda
   * y paginación.
   *
   * Consumido por: useBeneficiariosList → beneficiarioService.obtenerTodos()
   *
   * @param {string} [buscar='']   - Texto libre de búsqueda (nombre o cédula).
   * @param {number} [limit=200]   - Cantidad máxima de registros.
   * @param {number} [offset=0]    - Desplazamiento para paginación.
   * @returns {Promise<{success: boolean, data: Array, message: string}>}
   */
  obtenerTodos: async (buscar = '', limit = 200, offset = 0) => {
    try {
      const params = new URLSearchParams({ limit: String(limit), offset: String(offset) });
      if (buscar.trim()) {
        params.append('buscar', buscar.trim());
      }

      const response = await api.get(`/beneficiarios/listar?${params.toString()}`);
      const data     = response.data;

      return {
        success: true,
        data:    data.datos || data.data || [],
        message: data.mensaje || '',
      };
    } catch (error) {
      console.error('[BeneficiarioService] obtenerTodos:', error.message);
      return {
        success: false,
        data:    [],
        message: error.normalizedMessage || 'Error al obtener beneficiarios',
      };
    }
  },

  /**
   * Valida si un campo (cédula, correo o teléfono) ya existe en la base de datos.
   *
   * Consumido por: useBeneficiarioForm → beneficiarioService.validarDuplicado(campo, valor, id)
   *
   * @param {'cedula'|'correo'|'telefono'} tipo - Campo a validar.
   * @param {string}    valor        - Valor a verificar.
   * @param {number|null} [idExcluir=null] - ID del beneficiario a excluir (modo edición).
   * @returns {Promise<{success: boolean, existe: boolean, message: string}>}
   */
  validarDuplicado: async (tipo, valor, idExcluir = null) => {
    try {
      let endpoint = '';
      let payload  = {};

      switch (tipo) {
        case 'cedula': {
          // La cédula puede incluir el prefijo tipo (V/E), separarlo si viene junto
          const tipoCedula = /^[VE]/i.test(valor) ? valor.charAt(0).toUpperCase() : 'V';
          const numCedula  = valor.replace(/^[VE]/i, '').trim();
          endpoint         = '/beneficiarios/validar_cedula';
          payload          = { tipo_cedula: tipoCedula, cedula: numCedula, id_excluir: idExcluir };
          break;
        }
        case 'correo':
          endpoint = '/beneficiarios/validar_correo';
          payload  = { correo: valor, id_excluir: idExcluir };
          break;
        case 'telefono':
          endpoint = '/beneficiarios/validar_telefono';
          payload  = { telefono: valor, id_excluir: idExcluir };
          break;
        default:
          return { success: false, existe: false, message: 'Tipo de campo no soportado' };
      }

      const response = await api.post(endpoint, payload);
      const data     = response.data;

      // La API puede responder con { exito, existe } o { exito, datos: { existe } }
      const existe = data.existe ?? data.datos?.existe ?? false;

      return {
        success: true,
        existe,
        message: existe
          ? data.mensaje || `Este ${tipo} ya se encuentra registrado`
          : '',
      };
    } catch (error) {
      console.error(`[BeneficiarioService] validarDuplicado (${tipo}):`, error.message);
      // En caso de error de red, no bloqueamos el formulario
      return { success: false, existe: false, message: '' };
    }
  },

  /**
   * Registra un nuevo beneficiario en el sistema.
   *
   * Consumido por: BeneficiarioForm → beneficiarioService.registrar(data)
   *
   * @param {object} datos - Datos del beneficiario a crear.
   * @returns {Promise<{success: boolean, data: object|null, message: string}>}
   */
  registrar: async (datos) => {
    try {
      const response = await api.post('/beneficiarios/crear', datos);
      const data     = response.data;

      return {
        success: data.exito === true || data.estado === 'exito',
        data:    data.datos || data.beneficiario || null,
        message: data.mensaje || 'Beneficiario registrado correctamente',
      };
    } catch (error) {
      console.error('[BeneficiarioService] registrar:', error.message);
      return {
        success: false,
        data:    null,
        message: error.normalizedMessage || 'Error al registrar el beneficiario',
      };
    }
  },

  /**
   * Actualiza los datos de un beneficiario existente.
   *
   * Consumido por: BeneficiarioForm → beneficiarioService.actualizar(data)
   *
   * @param {object} datos - Datos del beneficiario (debe incluir id_beneficiario).
   * @returns {Promise<{success: boolean, data: object|null, message: string}>}
   */
  actualizar: async (datos) => {
    try {
      const response = await api.post('/beneficiarios/actualizar', datos);
      const data     = response.data;

      return {
        success: data.exito === true || data.estado === 'exito',
        data:    data.datos || null,
        message: data.mensaje || 'Beneficiario actualizado correctamente',
      };
    } catch (error) {
      console.error('[BeneficiarioService] actualizar:', error.message);
      return {
        success: false,
        data:    null,
        message: error.normalizedMessage || 'Error al actualizar el beneficiario',
      };
    }
  },

  /**
   * Desactiva (borrado lógico) un beneficiario.
   *
   * Consumido por: BeneficiarioList → beneficiarioService.desactivar(id)
   *
   * @param {number|string} id_beneficiario - ID del beneficiario a desactivar.
   * @returns {Promise<{success: boolean, message: string}>}
   */
  desactivar: async (id_beneficiario) => {
    try {
      const response = await api.post('/beneficiarios/eliminar', { id_beneficiario });
      const data     = response.data;

      return {
        success: data.exito === true || data.estado === 'exito',
        message: data.mensaje || 'Beneficiario desactivado correctamente',
      };
    } catch (error) {
      console.error('[BeneficiarioService] desactivar:', error.message);
      return {
        success: false,
        message: error.normalizedMessage || 'Error al desactivar el beneficiario',
      };
    }
  },
};

export default beneficiarioService;
