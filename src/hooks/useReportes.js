import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import reporteService from '../services/reporteService';
import beneficiarioService from '../services/beneficiarioService';
import citaService from '../services/citaService';
import inventarioService from '../services/inventarioService';
import { generateReporteHTML } from '../utils/reportePdfTemplate';
import { useAuth } from '../context/AuthContext';

/**
 * HOOK PERSONALIZADO: useReportes (SOLID: SRP)
 * 
 * Centraliza la carga de estadísticas enviando `reporte=general` y filtros de fecha
 * válidos al backend PHP DIRPOLES-4, con consolidación local defensiva.
 */
export const useReportes = () => {
  const { user } = useAuth();
  const [reporteData, setReporteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exportingingPdf, setExportingingPdf] = useState(false);
  const [error, setError] = useState(null);
  const [periodo, setPeriodo] = useState('todos'); // 'todos', 'mes', 'semana', 'hoy'

  /**
   * Helper para calcular el rango de fechas en formato YYYY-MM-DD
   */
  const getFiltroFechas = (periodoKey) => {
    const hoy = new Date();
    const hoyStr = hoy.toISOString().split('T')[0];

    if (periodoKey === 'hoy') {
      return { fecha_inicio: hoyStr, fecha_fin: hoyStr };
    }
    if (periodoKey === 'semana') {
      const hace7dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
      return { fecha_inicio: hace7dias.toISOString().split('T')[0], fecha_fin: hoyStr };
    }
    if (periodoKey === 'mes') {
      const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      return { fecha_inicio: primerDiaMes.toISOString().split('T')[0], fecha_fin: hoyStr };
    }
    return {};
  };

  /**
   * Carga y procesa métricas del backend o listas locales
   */
  const fetchReportes = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const filtrosFechas = getFiltroFechas(periodo);

      // 1. Consultar estadísticas generales del backend PHP (reporte=general)
      const resStatsGen = await reporteService.obtenerEstadisticas('general', filtrosFechas);
      const resStatsMed = await reporteService.obtenerEstadisticas('medicina', filtrosFechas);

      // 2. Cargar listas de respaldo directamente de los servicios locales
      const [resBen, resCitas, resInv] = await Promise.all([
        beneficiarioService.obtenerTodos().catch(() => ({ success: false, data: [] })),
        citaService.consultar_citas().catch(() => ({ success: false, data: { data: [] } })),
        inventarioService.obtenerTodos().catch(() => ({ success: false, data: [] }))
      ]);

      const listBen = (resBen && resBen.success && Array.isArray(resBen.data)) ? resBen.data : [];
      const listCitas = (resCitas && resCitas.success && Array.isArray(resCitas.data?.data)) ? resCitas.data.data : [];
      const listInv = (resInv && resInv.success && Array.isArray(resInv.data)) ? resInv.data : [];

      // Filtrado por fecha en listas locales
      const isDateInRange = (dateStr) => {
        if (!dateStr) return true;
        const d = dateStr.substring(0, 10);
        if (filtrosFechas.fecha_inicio && d < filtrosFechas.fecha_inicio) return false;
        if (filtrosFechas.fecha_fin && d > filtrosFechas.fecha_fin) return false;
        return true;
      };

      const filteredBen = listBen.filter(b => isDateInRange(b.fecha_creacion || b.created_at));
      const filteredCitas = listCitas.filter(c => isDateInRange(c.fecha || c.fecha_creacion));
      const filteredInv = listInv.filter(i => isDateInRange(i.fecha_creacion || i.created_at));

      // A) Procesar Beneficiarios
      let femCount = 0;
      let mascCount = 0;
      const pnfMap = {};

      filteredBen.forEach(b => {
        const g = (b.genero || b.sexo || '').toUpperCase();
        if (g === 'F') femCount++;
        if (g === 'M') mascCount++;

        const pnfName = b.pnf || b.nombre_pnf || 'Sin PNF';
        pnfMap[pnfName] = (pnfMap[pnfName] || 0) + 1;
      });

      const pnfArray = Object.keys(pnfMap).map(k => ({ nombre_pnf: k, total: pnfMap[k] }));

      // Si el backend devolvió datos válidos de género en resStatsGen
      if (resStatsGen && resStatsGen.success && resStatsGen.data) {
        if (resStatsGen.data.mujeres !== undefined) femCount = resStatsGen.data.mujeres;
        if (resStatsGen.data.hombres !== undefined) mascCount = resStatsGen.data.hombres;
      }

      const beneficiariosData = {
        total: filteredBen.length,
        genero: [
          { genero: 'F', total: femCount },
          { genero: 'M', total: mascCount }
        ],
        pnf: pnfArray,
        lista: filteredBen
      };

      // B) Procesar Citas
      const estadoMap = {};
      filteredCitas.forEach(c => {
        const st = c.nombre_estado || c.estado || 'Pendiente';
        estadoMap[st] = (estadoMap[st] || 0) + 1;
      });

      const estadosArray = Object.keys(estadoMap).map(k => ({ estado: k, total: estadoMap[k] }));

      const citasData = {
        total: filteredCitas.length,
        estados: estadosArray,
        lista: filteredCitas
      };

      // C) Procesar Inventario
      let totalUnidades = 0;
      const estatusMap = {};

      filteredInv.forEach(i => {
        const cant = parseInt(i.cantidad || i.stock || 0);
        totalUnidades += cant;
        const st = cant > 5 ? 'Disponible' : cant > 0 ? 'Bajo Stock' : 'Agotado';
        estatusMap[st] = (estatusMap[st] || 0) + 1;
      });

      if (resStatsMed && resStatsMed.success && resStatsMed.data?.insumos_total) {
        // Aprovechar métricas de insumos del backend de medicina si existen
      }

      const estatusArray = Object.keys(estatusMap).map(k => ({ estatus: k, total: estatusMap[k] }));

      const inventarioData = {
        total_insumos: filteredInv.length,
        total_unidades: totalUnidades,
        estatus: estatusArray,
        tipos: [],
        lista: filteredInv
      };

      setReporteData({
        beneficiarios: beneficiariosData,
        citas: citasData,
        inventario: inventarioData
      });

    } catch (err) {
      console.error('[useReportes] Error procesando estadísticas:', err);
      setError('No se pudieron recuperar las estadísticas.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [periodo]);

  useEffect(() => {
    fetchReportes();
  }, [fetchReportes]);

  const handleRefresh = () => {
    fetchReportes(true);
  };

  /**
   * Genera el PDF estilizado y dispara la hoja nativa para compartir/guardar
   */
  const exportarPDF = async () => {
    if (!reporteData) {
      Alert.alert('Atención', 'Los datos aún no están listos.');
      return;
    }

    setExportingingPdf(true);
    try {
      const nombreUsuario = user ? `${user.nombre || ''} ${user.apellido || ''}`.trim() || user.correo : 'Usuario DIRPOLES';
      
      const etiquetasPeriodo = {
        todos: 'Histórico General',
        mes: 'Este Mes',
        semana: 'Esta Semana',
        hoy: 'Hoy'
      };

      const htmlContent = generateReporteHTML({
        titulo: 'Reporte Estadístico Consolidado',
        usuario: nombreUsuario,
        periodo: etiquetasPeriodo[periodo] || 'Histórico General',
        beneficiarios: reporteData.beneficiarios || { total: 0, genero: [], pnf: [], lista: [] },
        citas: reporteData.citas || { total: 0, estados: [], lista: [] },
        inventario: reporteData.inventario || { total_insumos: 0, total_unidades: 0, estatus: [], tipos: [], lista: [] }
      });

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: 'Exportar Reporte DIRPOLES'
        });
      } else {
        Alert.alert('Reporte PDF Generado', `Guardado en: ${uri}`);
      }
    } catch (e) {
      console.error('[useReportes] Error exportando PDF:', e);
      Alert.alert('Error', 'No se pudo generar el documento PDF.');
    } finally {
      setExportingingPdf(false);
    }
  };

  return {
    reporteData,
    loading,
    refreshing,
    exportingingPdf,
    error,
    periodo,
    setPeriodo,
    handleRefresh,
    exportarPDF
  };
};
