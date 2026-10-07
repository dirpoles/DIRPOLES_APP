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
 * Centraliza la lógica de carga, refresco, filtrado por período
 * y generación de PDF nativo con respaldo automático de datos.
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
   * Procesa y calcula métricas consolidando listas si el endpoint /reportes/stats
   * devuelve 0 o estructura vacía.
   */
  const fetchReportes = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      // 1. Intentar consultar endpoint primario de estadísticas del backend
      const resStats = await reporteService.obtenerEstadisticas(periodo);

      let beneficiariosData = { total: 0, genero: [], pnf: [], lista: [] };
      let citasData = { total: 0, estados: [], lista: [] };
      let inventarioData = { total_insumos: 0, total_unidades: 0, estatus: [], tipos: [], lista: [] };

      // 2. Cargar listas de respaldo directamente de los servicios si hace falta
      const [resBen, resCitas, resInv] = await Promise.all([
        beneficiarioService.obtenerTodos().catch(() => ({ success: false, data: [] })),
        citaService.consultar_citas().catch(() => ({ success: false, data: { data: [] } })),
        inventarioService.obtenerTodos().catch(() => ({ success: false, data: [] }))
      ]);

      const listBen = resBen.success && Array.isArray(resBen.data) ? resBen.data : [];
      const listCitas = resCitas.success && Array.isArray(resCitas.data?.data) ? resCitas.data.data : [];
      const listInv = resInv.success && Array.isArray(resInv.data) ? resInv.data : [];

      // A) Procesar Beneficiarios
      if (resStats.success && resStats.data?.beneficiarios?.total > 0) {
        beneficiariosData = resStats.data.beneficiarios;
      } else {
        const femCount = listBen.filter(b => (b.genero || b.sexo) === 'F').length;
        const mascCount = listBen.filter(b => (b.genero || b.sexo) === 'M').length;

        // Agrupar por PNF
        const pnfMap = {};
        listBen.forEach(b => {
          const pnfName = b.pnf || b.nombre_pnf || 'Sin PNF';
          pnfMap[pnfName] = (pnfMap[pnfName] || 0) + 1;
        });

        const pnfArray = Object.keys(pnfMap).map(k => ({ nombre_pnf: k, total: pnfMap[k] }));

        beneficiariosData = {
          total: listBen.length,
          genero: [
            { genero: 'F', total: femCount },
            { genero: 'M', total: mascCount }
          ],
          pnf: pnfArray,
          lista: listBen
        };
      }

      // B) Procesar Citas
      if (resStats.success && resStats.data?.citas?.total > 0) {
        citasData = resStats.data.citas;
      } else {
        const estadoMap = {};
        listCitas.forEach(c => {
          const st = c.nombre_estado || c.estado || 'Pendiente';
          estadoMap[st] = (estadoMap[st] || 0) + 1;
        });

        const estadosArray = Object.keys(estadoMap).map(k => ({ estado: k, total: estadoMap[k] }));

        citasData = {
          total: listCitas.length,
          estados: estadosArray,
          lista: listCitas
        };
      }

      // C) Procesar Inventario
      if (resStats.success && resStats.data?.inventario?.total_insumos > 0) {
        inventarioData = resStats.data.inventario;
      } else {
        let totalUnidades = 0;
        const estatusMap = {};
        listInv.forEach(i => {
          const cant = parseInt(i.cantidad || i.stock || 0);
          totalUnidades += cant;
          const st = cant > 5 ? 'Disponible' : cant > 0 ? 'Bajo Stock' : 'Agotado';
          estatusMap[st] = (estatusMap[st] || 0) + 1;
        });

        const estatusArray = Object.keys(estatusMap).map(k => ({ estatus: k, total: estatusMap[k] }));

        inventarioData = {
          total_insumos: listInv.length,
          total_unidades: totalUnidades,
          estatus: estatusArray,
          tipos: [],
          lista: listInv
        };
      }

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
      Alert.alert('Error', 'No hay datos cargados para exportar.');
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
        beneficiarios: reporteData.beneficiarios,
        citas: reporteData.citas,
        inventario: reporteData.inventario
      });

      // Generar archivo PDF
      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      // Abrir diálogo nativo del teléfono para guardar o enviar por WhatsApp/Email
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          UTI: '.pdf',
          mimeType: 'application/pdf',
          dialogTitle: 'Exportar Reporte DIRPOLES'
        });
      } else {
        Alert.alert('PDF Generado', `Guardado temporalmente en: ${uri}`);
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
