import { useState, useEffect, useCallback } from 'react';
import beneficiarioService from '../services/beneficiarioService';

/**
 * CUSTOM HOOK: useBeneficiariosList
 * Gestiona el estado y la lógica para listar y filtrar beneficiarios.
 */
export const useBeneficiariosList = () => {
  const [beneficiarios, setBeneficiarios] = useState([]);
  const [filteredBeneficiarios, setFilteredBeneficiarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchBeneficiarios = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const result = await beneficiarioService.obtenerTodos();
    
    if (result.success) {
      setBeneficiarios(result.data);
      setFilteredBeneficiarios(result.data);
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  }, []);

  // Cargar beneficiarios al montar el componente
  useEffect(() => {
    fetchBeneficiarios();
  }, [fetchBeneficiarios]);

  // Manejar el filtro de búsqueda
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredBeneficiarios(beneficiarios);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = beneficiarios.filter(b => {
        const nombreCompleto = `${b.nombres} ${b.apellidos}`.toLowerCase();
        const cedula = String(b.cedula).toLowerCase();
        return nombreCompleto.includes(query) || cedula.includes(query);
      });
      setFilteredBeneficiarios(filtered);
    }
  }, [searchQuery, beneficiarios]);

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  return {
    beneficiarios: filteredBeneficiarios,
    loading,
    error,
    searchQuery,
    handleSearch,
    refetch: fetchBeneficiarios
  };
};
