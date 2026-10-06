import api from './api';

/**
 * SERVICIO: Perfil de Empleado (SOLID: SRP)
 *
 * Centraliza las peticiones HTTP del módulo de perfil de usuario
 * contra la API REST de DIRPOLES-4.
 *
 * Contrato de salida (consumido por usePerfil):
 *   { success: boolean, data: object|null, message: string }
 */

const perfilService = {
  /**
   * Obtiene los datos de perfil del empleado autenticado.
   *
   * Consumido por: usePerfil → perfilService.consultar()
   *
   * @returns {Promise<{success: boolean, data: object|null, message: string}>}
   */
  consultar: async () => {
    try {
      const response = await api.get('/perfil/obtener');
      const data     = response.data;

      return {
        success: data.exito === true || data.estado === 'exito',
        data:    data.datos || data.empleado || null,
        message: data.mensaje || '',
      };
    } catch (error) {
      console.error('[PerfilService] consultar:', error.message);
      return {
        success: false,
        data:    null,
        message: error.normalizedMessage || 'Error al obtener los datos del perfil',
      };
    }
  },

  /**
   * Actualiza los datos del perfil del empleado autenticado.
   *
   * Consumido por: usePerfil → perfilService.actualizar(payload)
   *
   * @param {object}  datos                    - Datos a actualizar.
   * @param {string}  [datos.correo]            - Nuevo correo.
   * @param {string}  [datos.telefono]          - Nuevo teléfono.
   * @param {string}  [datos.direccion]         - Nueva dirección.
   * @param {string}  [datos.clave_actual]      - Contraseña actual (requerida para confirmar identidad).
   * @param {string}  [datos.nueva_clave]       - Nueva contraseña (opcional).
   * @param {string}  [datos.clave_confirmacion]- Confirmación de la nueva contraseña.
   * @returns {Promise<{success: boolean, data: object|null, message: string}>}
   */
  actualizar: async (datos) => {
    try {
      const payload = { ...datos };

      // Si el usuario ingresó nueva contraseña, mapearla al campo 'clave' que espera PerfilModel.php
      if (payload.nueva_clave) {
        payload.clave = payload.nueva_clave;
        if (!payload.clave_confirmacion && payload.confirmar_clave) {
          payload.clave_confirmacion = payload.confirmar_clave;
        }
        delete payload.nueva_clave;
        delete payload.confirmar_clave;
      }

      const response = await api.post('/perfil/actualizar', payload);
      const data     = response.data;

      return {
        success: data.exito === true || data.estado === 'exito',
        data:    data.datos || null,
        message: data.mensaje || 'Perfil actualizado correctamente',
      };
    } catch (error) {
      console.error('[PerfilService] actualizar:', error.message);
      return {
        success: false,
        data:    null,
        message: error.normalizedMessage || 'Error al actualizar el perfil',
      };
    }
  },
};

export default perfilService;
