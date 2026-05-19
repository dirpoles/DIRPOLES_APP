import { useState, useEffect, useCallback } from 'react';
import { Linking, Alert } from 'react-native';
import { BASE_URL } from '../constants/config';
import reporteService from '../services/reporteService';

/**
 * HOOK PERSONALIZADO: useReportes (SOLID: SRP)
 * 
 * Centraliza la lógica de carga, refresco y formateo de datos
 * para el módulo de reportes estadísticos consolidados.
 */
export const useReportes = () => {
  const [reporteData, setReporteData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchReportes = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    const result = await reporteService.obtenerEstadisticas();

    if (result.success && result.data) {
      setReporteData(result.data);
    } else {
      setError(result.message || 'No se pudieron recuperar las estadísticas.');
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchReportes();
  }, [fetchReportes]);

  const handleRefresh = () => {
    fetchReportes(true);
  };

  /**
   * Redirige al usuario al panel de reportes oficial del sistema web
   * para que pueda descargar un PDF formal e interactuar con más filtros.
   */
  const abrirReporteWeb = async () => {
    const url = `${BASE_URL}/reportes_general`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'No se pudo abrir el navegador web.');
      }
    } catch (e) {
      Alert.alert('Error', 'Ocurrió un error al intentar abrir la página de reportes.');
    }
  };

  return {
    reporteData,
    loading,
    refreshing,
    error,
    handleRefresh,
    abrirReporteWeb
  };
};
