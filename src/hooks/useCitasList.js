import { useState, useEffect, useCallback } from 'react';
import citaService from '../services/citaService';

/**
 * CUSTOM HOOK: useCitasList
 * Gestiona el estado y la lógica para listar y filtrar citas.
 */
export const useCitasList = () => {
    const [citas, setCitas] = useState([]);
    const [filteredCitas, setFilteredCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchCitas = useCallback(async () => {
        setLoading(true);
        setError(null);

        const result = await citaService.consultar_citas();

        if (result.success) {
            const rawLista = Array.isArray(result.data.data) ? result.data.data : [];
            const listaCitas = rawLista.map(c => {
                const nombreBeneficiario = c.beneficiario 
                    || (c.beneficiario_nombres ? `${c.beneficiario_nombres} ${c.beneficiario_apellidos || ''}`.trim() : 'Paciente Desconocido');
                const nombrePsicologo = c.psicologo || c.empleado || 'Psicólogo';
                return {
                    ...c,
                    beneficiario: nombreBeneficiario,
                    empleado: nombrePsicologo,
                    psicologo: nombrePsicologo,
                    cedula: c.cedula_beneficiario || c.cedula || ''
                };
            });

            setCitas(listaCitas);
            setFilteredCitas(listaCitas);
        } else {
            setError(result.message);
        }

        setLoading(false);
    }, []);

    // Cargar citas al montar el componente
    useEffect(() => {
        fetchCitas();
    }, [fetchCitas]);

    // Manejar el filtro de búsqueda
    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredCitas(citas);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = citas.filter(c => {
                const nombreBeneficiario = (c.beneficiario || '').toLowerCase();
                const nombreEmpleado = (c.empleado || '').toLowerCase();
                const cedula = String(c.cedula || '').toLowerCase();
                
                return nombreBeneficiario.includes(query) || 
                       nombreEmpleado.includes(query) || 
                       cedula.includes(query);
            });
            setFilteredCitas(filtered);
        }
    }, [searchQuery, citas]);

    const handleSearch = (query) => {
        setSearchQuery(query);
    };

    return {
        citas: filteredCitas,
        loading,
        error,
        searchQuery,
        handleSearch,
        refetch: fetchCitas
    };
};
