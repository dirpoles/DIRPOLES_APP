import api from './api';

/**
 * SERVICIO: Reportes Estadísticos (SOLID: SRP)
 *
 * Centraliza las peticiones HTTP del módulo de reportes y métricas
 * contra la API REST de DIRPOLES-4.
 *
 * Contrato de salida (consumido por useReportes):
 *   { success: boolean, data: object|null, message: string }
 */

const reporteService = {
  /**
   * Obtiene el resumen consolidado de indicadores estadísticos del sistema.
   *
   * Consumido por: useReportes → reporteService.obtenerEstadisticas()
   *
   * @param {'general'|string} [tipo='general'] - Tipo de reporte a consultar.
   * @returns {Promise<{success: boolean, data: object|null, message: string}>}
   */
  obtenerEstadisticas: async (tipo = 'general') => {
    try {
      const response = await api.get(`/reportes/stats?reporte=${encodeURIComponent(tipo)}`);
      const data     = response.data;

      return {
        success: data.exito === true || data.estado === 'exito',
        data:    data.datos || data.data || null,
        message: data.mensaje || '',
      };
    } catch (error) {
      console.error('[ReporteService] obtenerEstadisticas:', error.message);
      return {
        success: false,
        data:    null,
        message: error.normalizedMessage || 'Error al obtener las estadísticas del sistema',
      };
    }
  },
};

export default reporteService;
