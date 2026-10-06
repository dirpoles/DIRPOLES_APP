import api from './api';

/**
 * SERVICIO DE DATOS (CATÁLOGOS) (SOLID: SRP)
 *
 * Centraliza la obtención de catálogos generales del sistema
 * que no pertenecen a ningún módulo específico (PNFs, secciones, etc.).
 */
const dataService = {
  /**
   * Obtiene la lista de Programas Nacionales de Formación (PNFs) activos.
   *
   * Consumido por: BeneficiarioForm → dataService.getPNFs()
   *
   * @returns {Promise<Array>} Array de PNFs o array vacío en caso de error.
   */
  getPNFs: async () => {
    try {
      const response = await api.get('/beneficiarios/pnfs');
      const data     = response.data;

      return data.datos || data.data || [];
    } catch (error) {
      console.error('[DataService] getPNFs:', error.message);
      return [];
    }
  },
};

export default dataService;
