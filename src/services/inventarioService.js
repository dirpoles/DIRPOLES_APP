import api from './api';

/**
 * SERVICIO: Inventario Médico (SOLID: SRP)
 *
 * Centraliza todas las peticiones HTTP relacionadas con el módulo de
 * inventario de insumos médicos contra la API REST de DIRPOLES-4.
 *
 * Contrato de salida (consumido por useInventarioList y useInsumoForm):
 *   { success: boolean, data: any, message: string }
 */

const inventarioService = {
  /**
   * Obtiene el catálogo completo de insumos médicos con su stock calculado.
   *
   * Consumido por: useInventarioList → inventarioService.consultar_inventario()
   *
   * @returns {Promise<{success: boolean, data: Array, message: string}>}
   */
  consultar_inventario: async () => {
    try {
      const response = await api.get('/inventario/listar');
      const data     = response.data;

      return {
        success: true,
        data:    data.datos || data.data || [],
        message: data.mensaje || '',
      };
    } catch (error) {
      console.error('[InventarioService] consultar_inventario:', error.message);
      return {
        success: false,
        data:    [],
        message: error.normalizedMessage || 'Error al obtener el inventario',
      };
    }
  },

  /**
   * Obtiene los tipos de presentación de insumos (frasco, caja, ampolla, etc.).
   *
   * Consumido por: useInsumoForm → inventarioService.consultar_presentaciones()
   *
   * @returns {Promise<{success: boolean, data: Array, message: string}>}
   */
  consultar_presentaciones: async () => {
    try {
      const response = await api.get('/inventario/presentaciones');
      const data     = response.data;

      return {
        success: true,
        data:    data.datos || data.data || [],
        message: data.mensaje || '',
      };
    } catch (error) {
      console.error('[InventarioService] consultar_presentaciones:', error.message);
      return {
        success: false,
        data:    [],
        message: error.normalizedMessage || 'Error al obtener las presentaciones',
      };
    }
  },

  /**
   * Registra un nuevo insumo en el inventario médico.
   *
   * Consumido por: InsumoForm → inventarioService.registrar(payload)
   *
   * @param {object} datosInsumo - Datos del insumo a registrar.
   * @param {string}  datosInsumo.nombre_insumo      - Nombre del insumo.
   * @param {string}  datosInsumo.tipo_insumo         - Tipo (Medicamento, Material, etc.).
   * @param {number}  datosInsumo.id_presentacion     - ID del tipo de presentación.
   * @param {string}  datosInsumo.fecha_vencimiento   - Fecha en formato YYYY-MM-DD.
   * @param {string}  [datosInsumo.descripcion]       - Descripción opcional.
   * @returns {Promise<{success: boolean, data: object|null, message: string}>}
   */
  registrar: async (datosInsumo) => {
    try {
      const payload = {
        nombre_insumo:    datosInsumo.nombre_insumo,
        tipo_insumo:      datosInsumo.tipo_insumo,
        id_presentacion:  datosInsumo.id_presentacion,
        fecha_vencimiento: datosInsumo.fecha_vencimiento,
        descripcion:      datosInsumo.descripcion || '',
      };

      const response = await api.post('/inventario/crear', payload);
      const data     = response.data;

      return {
        success: data.exito === true || data.estado === 'exito',
        data:    data.datos || data.insumo || null,
        message: data.mensaje || 'Insumo registrado correctamente',
      };
    } catch (error) {
      console.error('[InventarioService] registrar:', error.message);
      return {
        success: false,
        data:    null,
        message: error.normalizedMessage || 'Error al registrar el insumo',
      };
    }
  },

  /**
   * Actualiza los datos de un insumo existente en el inventario.
   *
   * Consumido por: InsumoForm → inventarioService.actualizar(payload)
   *
   * @param {object} datosInsumo - Datos del insumo (debe incluir id_insumo).
   * @returns {Promise<{success: boolean, data: object|null, message: string}>}
   */
  actualizar: async (datosInsumo) => {
    try {
      const response = await api.post('/inventario/actualizar', datosInsumo);
      const data     = response.data;

      return {
        success: data.exito === true || data.estado === 'exito',
        data:    data.datos || null,
        message: data.mensaje || 'Insumo actualizado correctamente',
      };
    } catch (error) {
      console.error('[InventarioService] actualizar:', error.message);
      return {
        success: false,
        data:    null,
        message: error.normalizedMessage || 'Error al actualizar el insumo',
      };
    }
  },

  /**
   * Desactiva (borrado lógico) un insumo del inventario.
   *
   * @param {number|string} id_insumo - ID del insumo a desactivar.
   * @returns {Promise<{success: boolean, message: string}>}
   */
  desactivar: async (id_insumo) => {
    try {
      const response = await api.post('/inventario/eliminar', { id_insumo });
      const data     = response.data;

      return {
        success: data.exito === true || data.estado === 'exito',
        message: data.mensaje || 'Insumo desactivado correctamente',
      };
    } catch (error) {
      console.error('[InventarioService] desactivar:', error.message);
      return {
        success: false,
        message: error.normalizedMessage || 'Error al desactivar el insumo',
      };
    }
  },
};

export default inventarioService;
