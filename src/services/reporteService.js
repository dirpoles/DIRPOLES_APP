import api from './api';

/**
 * SERVICIO: Reportes Estadísticos (SOLID: SRP)
 *
 * Centraliza las peticiones HTTP del módulo de reportes y métricas
 * contra la API REST de DIRPOLES-4.
 */

const reporteService = {
  /**
   * Obtiene estadísticas de tarjetas del backend.
   * @param {'general'|'psicologia'|'medicina'} [reporte='general']
   * @param {{ fecha_inicio?: string, fecha_fin?: string }} [filtros={}]
   */
  obtenerEstadisticas: async (reporte = 'general', filtros = {}) => {
    try {
      let url = `/reportes/stats?reporte=${encodeURIComponent(reporte)}`;
      if (filtros.fecha_inicio) url += `&fecha_inicio=${encodeURIComponent(filtros.fecha_inicio)}`;
      if (filtros.fecha_fin) url += `&fecha_fin=${encodeURIComponent(filtros.fecha_fin)}`;

      const response = await api.get(url);
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
        message: error.response?.data?.mensaje || error.normalizedMessage || 'Error al obtener las estadísticas',
      };
    }
  },

  /**
   * Obtiene el reporte detallado del módulo (general, medicina, psicologia, etc.)
   * @param {'general'|'medicina'|'psicologia'} [modulo='general']
   * @param {{ fecha_inicio?: string, fecha_fin?: string }} [filtros={}]
   */
  obtenerReporteDetallado: async (modulo = 'general', filtros = {}) => {
    try {
      let url = `/reportes/${encodeURIComponent(modulo)}`;
      const params = [];
      if (filtros.fecha_inicio) params.push(`fecha_inicio=${encodeURIComponent(filtros.fecha_inicio)}`);
      if (filtros.fecha_fin) params.push(`fecha_fin=${encodeURIComponent(filtros.fecha_fin)}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const response = await api.get(url);
      const data     = response.data;

      return {
        success: data.exito === true || data.estado === 'exito',
        data:    data.datos || data.data || null,
        message: data.mensaje || '',
      };
    } catch (error) {
      console.error('[ReporteService] obtenerReporteDetallado:', error.message);
      return {
        success: false,
        data:    null,
        message: error.response?.data?.mensaje || error.normalizedMessage || 'Error al obtener reporte detallado',
      };
    }
  }
};

export default reporteService;
