import { useState, useEffect, useCallback } from 'react';
import inventarioService from '../services/inventarioService';

/**
 * CUSTOM HOOK: useInventarioList (SOLID: Separación de Lógica)
 * 
 * Gestiona el estado y la lógica de negocio para listar y filtrar insumos médicos.
 */
export const useInventarioList = () => {
  const [insumos, setInsumos] = useState([]);
  const [filteredInsumos, setFilteredInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  /**
   * Obtiene los insumos desde la Capa de Servicios (inventarioService)
   */
  const fetchInsumos = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await inventarioService.consultar_inventario();
      
      if (result.success) {
        setInsumos(result.data);
        setFilteredInsumos(result.data);
      } else {
        setError(result.message || 'Error al obtener los insumos del inventario');
      }
    } catch (err) {
      setError('Ocurrió un error inesperado al cargar el inventario.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial de datos
  useEffect(() => {
    fetchInsumos();
  }, [fetchInsumos]);

  // Filtrado reactivo en tiempo real al cambiar la búsqueda
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredInsumos(insumos);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = insumos.filter(item => {
        const nombre = (item.nombre_insumo || '').toLowerCase();
        const tipo = (item.tipo_insumo || '').toLowerCase();
        const presentacion = (item.presentacion || '').toLowerCase();
        const estatus = (item.estatus || '').toLowerCase();
        
        return nombre.includes(query) || 
               tipo.includes(query) || 
               presentacion.includes(query) || 
               estatus.includes(query);
      });
      setFilteredInsumos(filtered);
    }
  }, [searchQuery, insumos]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return {
    insumos: filteredInsumos,
    loading,
    error,
    searchQuery,
    handleSearch,
    refetch: fetchInsumos
  };
};
