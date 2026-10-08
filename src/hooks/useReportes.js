import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import reporteService from '../services/reporteService';
import beneficiarioService from '../services/beneficiarioService';
import citaService from '../services/citaService';
import inventarioService from '../services/inventarioService';
import { generateReporteHTML } from '../utils/reportePdfTemplate';
import { useAuth } from '../context/AuthContext';

/**
 * HOOK PERSONALIZADO: useReportes (SOLID: SRP)
 * 
 * Centraliza la carga de estadísticas, filtrado dinámico multicriterio
 * (Período, Género, PNF, Estado y Nivel de Stock) y exportador PDF nativo.
 */
export const useReportes = () => {
  const { user } = useAuth();
  const [reporteData, setReporteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [exportingingPdf, setExportingingPdf] = useState(false);
  const [error, setError] = useState(null);
  
  // Estados de Filtros Dinámicos
  const [periodo, setPeriodo] = useState('todos'); // 'todos', 'mes', 'semana', 'hoy'
  const [generoFiltro, setGeneroFiltro] = useState('todos'); // 'todos', 'F', 'M'
  const [pnfFiltro, setPnfFiltro] = useState('todos'); // 'todos' o nombre del PNF
  const [estadoInvFiltro, setEstadoInvFiltro] = useState('todos'); // 'todos', 'Disponible', 'Vencido'
  const [stockInvFiltro, setStockInvFiltro] = useState('todos'); // 'todos', 'disponible', 'bajo', 'agotado'
  
  const [pnfOptions, setPnfOptions] = useState([]);

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
   * Extrae arreglos de forma segura de cualquier formato de respuesta HTTP
   */
  const extractSafeArray = (res) => {
    if (!res || !res.success) return [];
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray(res.data.data)) return res.data.data;
    if (res.data && Array.isArray(res.data.datos)) return res.data.datos;
    return [];
  };

  /**
   * Carga y procesa métricas del backend o listas locales aplicando todos los filtros activos
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

      // Cargar listas de respaldo directamente de los servicios locales
      const [resBen, resCitas, resInv] = await Promise.all([
        beneficiarioService.obtenerTodos().catch(() => ({ success: false, data: [] })),
        citaService.consultar_citas().catch(() => ({ success: false, data: { data: [] } })),
        inventarioService.consultar_inventario().catch(() => ({ success: false, data: [] }))
      ]);

      const listBen = extractSafeArray(resBen);
      const listCitas = extractSafeArray(resCitas);
      const listInv = extractSafeArray(resInv);

      // Extraer lista única de PNFs disponibles para el selector
      const pnfSet = new Set();
      listBen.forEach(b => {
        const pName = b?.pnf || b?.nombre_pnf;
        if (pName) pnfSet.add(pName);
      });
      setPnfOptions(Array.from(pnfSet));

      // Evaluador de rango de fecha
      const isDateInRange = (dateVal) => {
        if (!dateVal) return true;
        const d = String(dateVal).substring(0, 10);
        if (filtrosFechas.fecha_inicio && d < filtrosFechas.fecha_inicio) return false;
        if (filtrosFechas.fecha_fin && d > filtrosFechas.fecha_fin) return false;
        return true;
      };

      // 1. Filtrar Beneficiarios (Fecha + Género + PNF)
      const filteredBen = listBen.filter(b => {
        if (!b) return false;
        if (!isDateInRange(b.fecha_creacion || b.created_at)) return false;
        
        if (generoFiltro !== 'todos') {
          const g = String(b.genero || b.sexo || '').toUpperCase();
          if (g !== generoFiltro) return false;
        }

        if (pnfFiltro !== 'todos') {
          const p = String(b.pnf || b.nombre_pnf || '');
          if (p !== pnfFiltro) return false;
        }

        return true;
      });

      // 2. Filtrar Citas (Fecha + Género del paciente + PNF del paciente)
      const filteredCitas = listCitas.filter(c => {
        if (!c) return false;
        if (!isDateInRange(c.fecha || c.fecha_creacion)) return false;

        if (generoFiltro !== 'todos') {
          const g = String(c.beneficiario_genero || c.genero || c.sexo || '').toUpperCase();
          if (g && g !== generoFiltro) return false;
        }

        if (pnfFiltro !== 'todos') {
          const p = String(c.beneficiario_pnf || c.pnf || '');
          if (p && p !== pnfFiltro) return false;
        }

        return true;
      });

      // 3. Filtrar Inventario (Fecha + Estado + Nivel de Stock)
      const filteredInv = listInv.filter(i => {
        if (!i) return false;
        if (!isDateInRange(i.fecha_creacion || i.created_at)) return false;

        if (estadoInvFiltro !== 'todos') {
          const st = String(i.estatus || i.estado || '');
          if (st.toLowerCase() !== estadoInvFiltro.toLowerCase()) return false;
        }

        if (stockInvFiltro !== 'todos') {
          const cant = parseInt(i.cantidad || i.stock || 0) || 0;
          if (stockInvFiltro === 'disponible' && cant <= 5) return false;
          if (stockInvFiltro === 'bajo' && (cant === 0 || cant > 5)) return false;
          if (stockInvFiltro === 'agotado' && cant !== 0) return false;
        }

        return true;
      });

      // --- CÁLCULO DE MÉTRICAS CONSOLIDADAS ---

      // A) Beneficiarios
      let femCount = 0;
      let mascCount = 0;
      const pnfMap = {};

      filteredBen.forEach(b => {
        const g = String(b.genero || b.sexo || '').toUpperCase();
        if (g === 'F') femCount++;
        if (g === 'M') mascCount++;

        const pnfName = String(b.pnf || b.nombre_pnf || 'Sin PNF');
        pnfMap[pnfName] = (pnfMap[pnfName] || 0) + 1;
      });

      const pnfArray = Object.keys(pnfMap).map(k => ({ nombre_pnf: k, total: pnfMap[k] }));

      const beneficiariosData = {
        total: filteredBen.length,
        genero: [
          { genero: 'F', total: femCount },
          { genero: 'M', total: mascCount }
        ],
        pnf: pnfArray,
        lista: filteredBen
      };

      // B) Citas
      const estadoMap = {};
      filteredCitas.forEach(c => {
        const st = String(c.nombre_estado || c.estado || 'Pendiente');
        estadoMap[st] = (estadoMap[st] || 0) + 1;
      });

      const estadosArray = Object.keys(estadoMap).map(k => ({ estado: k, total: estadoMap[k] }));

      const citasData = {
        total: filteredCitas.length,
        estados: estadosArray,
        lista: filteredCitas
      };

      // C) Inventario
      let totalUnidades = 0;
      const estatusMap = {};

      filteredInv.forEach(i => {
        const cant = parseInt(i.cantidad || i.stock || 0) || 0;
        totalUnidades += cant;
        const st = cant > 5 ? 'Disponible' : cant > 0 ? 'Bajo Stock' : 'Agotado';
        estatusMap[st] = (estatusMap[st] || 0) + 1;
      });

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
  }, [periodo, generoFiltro, pnfFiltro, estadoInvFiltro, stockInvFiltro]);

  useEffect(() => {
    fetchReportes();
  }, [fetchReportes]);

  const handleRefresh = () => {
    fetchReportes(true);
  };

  /**
   * Genera el PDF con todos los filtros aplicados reflejados explícitamente en la cabecera
   */
  const exportarPDF = async () => {
    if (!reporteData) {
      Alert.alert('Atención', 'Los datos aún no están listos.');
      return;
    }

    setExportingingPdf(true);
    let htmlContent = '';
    try {
      const nombreUsuario = user ? `${user.nombre || ''} ${user.apellido || ''}`.trim() || user.correo : 'Usuario DIRPOLES';
      
      const etiquetasPeriodo = {
        todos: 'Histórico General',
        mes: 'Este Mes',
        semana: 'Esta Semana',
        hoy: 'Hoy'
      };

      // Compilar etiquetas de filtros activos para la cabecera del PDF
      const activeFiltersList = [];
      if (generoFiltro !== 'todos') activeFiltersList.push(`Género: ${generoFiltro === 'F' ? 'Femenino' : 'Masculino'}`);
      if (pnfFiltro !== 'todos') activeFiltersList.push(`PNF: ${pnfFiltro}`);
      if (estadoInvFiltro !== 'todos') activeFiltersList.push(`Estado Stock: ${estadoInvFiltro}`);
      if (stockInvFiltro !== 'todos') activeFiltersList.push(`Nivel Stock: ${stockInvFiltro.toUpperCase()}`);

      htmlContent = generateReporteHTML({
        titulo: 'Reporte Estadístico Consolidado',
        usuario: nombreUsuario,
        periodo: etiquetasPeriodo[periodo] || 'Histórico General',
        filtrosAplicados: activeFiltersList,
        beneficiarios: reporteData.beneficiarios || { total: 0, genero: [], pnf: [], lista: [] },
        citas: reporteData.citas || { total: 0, estados: [], lista: [] },
        inventario: reporteData.inventario || { total_insumos: 0, total_unidades: 0, estatus: [], tipos: [], lista: [] }
      });

      const { uri } = await Print.printToFileAsync({ html: htmlContent });
      
      let shareSuccess = false;
      if (await Sharing.isAvailableAsync()) {
        try {
          await Sharing.shareAsync(uri, {
            UTI: '.pdf',
            mimeType: 'application/pdf',
            dialogTitle: 'Guardar o Compartir Reporte PDF'
          });
          shareSuccess = true;
        } catch (shareErr) {
          console.log('[useReportes] shareAsync no disponible en este dispositivo, usando vista previa de impresión');
        }
      }

      if (!shareSuccess) {
        await Print.printAsync({ html: htmlContent });
      }
    } catch (e) {
      console.error('[useReportes] Error exportando PDF:', e);
      Alert.alert('Error', 'No se pudo generar o guardar el archivo PDF.');
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
    generoFiltro,
    setGeneroFiltro,
    pnfFiltro,
    setPnfFiltro,
    estadoInvFiltro,
    setEstadoInvFiltro,
    stockInvFiltro,
    setStockInvFiltro,
    pnfOptions,
    handleRefresh,
    exportarPDF
  };
};
