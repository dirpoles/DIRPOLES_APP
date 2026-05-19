import { useState, useEffect } from 'react';
import inventarioService from '../services/inventarioService';
import { useAuth } from '../context/AuthContext';
import { validateInsumoField, validateInsumoFormSync } from '../utils/inventarioValidation';

/**
 * CUSTOM HOOK: useInsumoForm (SOLID: Separación de Lógica)
 * 
 * Gestiona el estado local del formulario de insumos, delegando
 * las validaciones a la capa de utilidades (inventarioValidation)
 * y la persistencia al callback que lo invoca.
 * Soporta modo creación y modo edición.
 */
export const useInsumoForm = (initialState = {}) => {
  const { user } = userAuthHookHelper();
  
  // Procesar initialState para convertir fecha_vencimiento (de la BD) a un objeto Date
  const processedInitialState = { ...initialState };
  if (processedInitialState.fecha_vencimiento && typeof processedInitialState.fecha_vencimiento === 'string') {
    const parts = processedInitialState.fecha_vencimiento.split('-');
    if (parts.length === 3) {
      // Formato YYYY-MM-DD
      processedInitialState.fecha_vencimiento = new Date(parts[0], parts[1] - 1, parts[2]);
    } else {
      processedInitialState.fecha_vencimiento = new Date(processedInitialState.fecha_vencimiento);
    }
  }

  const [formData, setFormData] = useState({
    nombre_insumo: '',
    tipo_insumo: '',
    id_presentacion: '',
    fecha_vencimiento: new Date(),
    descripcion: '',
    ...processedInitialState
  });

  const [presentaciones, setPresentaciones] = useState([]);
  const [loadingPresentaciones, setLoadingPresentaciones] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para el Modal (Feedback)
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'info' });

  const isEditMode = !!formData.id_insumo;

  // Cargar presentaciones al iniciar
  useEffect(() => {
    const loadPresentaciones = async () => {
      setLoadingPresentaciones(true);
      try {
        const result = await inventarioService.consultar_presentaciones();
        if (result.success) {
          setPresentaciones(result.data);
        }
      } catch (err) {
        console.error('Error al cargar presentaciones:', err);
      } finally {
        setLoadingPresentaciones(false);
      }
    };
    loadPresentaciones();
  }, []);

  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Validación en tiempo real delegada a la utilidad pura
    const error = validateInsumoField(name, value, isEditMode);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    } else if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Valida y delega la llamada API al componente que lo invoca
   */
  const handleSubmit = async (onSubmitSuccess) => {
    // Validación síncrona completa delegada a la utilidad pura
    const { isValid, errors: validationErrors } = validateInsumoFormSync(formData, isEditMode);

    if (!isValid) {
      setErrors(validationErrors);
      setModalConfig({
        title: 'Formulario Incompleto',
        message: 'Por favor, corrige los campos resaltados antes de continuar.',
        type: 'warning'
      });
      setModalVisible(true);
      return;
    }

    setIsSubmitting(true);
    
    // Preparar el payload a enviar
    const payload = {
      id_insumo: isEditMode ? parseInt(formData.id_insumo, 10) : undefined,
      nombre_insumo: formData.nombre_insumo.trim(),
      tipo_insumo: formData.tipo_insumo,
      id_presentacion: parseInt(formData.id_presentacion, 10),
      descripcion: formData.descripcion.trim(),
      fecha_vencimiento: formData.fecha_vencimiento.toISOString().split('T')[0],
      estatus: formData.estatus || 'Agotado', // Mantener el estatus si se edita, o 'Agotado' por defecto
      id_empleado: user?.id_empleado // Empleado que realiza la acción
    };

    const result = await onSubmitSuccess(payload);
    
    if (result.success) {
      setModalConfig({
        title: '¡Operación Exitosa!',
        message: result.message || (isEditMode ? 'El insumo médico se ha actualizado correctamente.' : 'El insumo médico se ha registrado de manera correcta.'),
        type: 'success'
      });
      // Solo resetear si es un registro nuevo
      if (!isEditMode) {
        resetForm();
      }
    } else {
      setModalConfig({
        title: 'Error en la Operación',
        message: result.message || 'No se pudo guardar el insumo en el sistema.',
        type: 'error'
      });
    }
    
    setModalVisible(true);
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setFormData({
      nombre_insumo: '',
      tipo_insumo: '',
      id_presentacion: '',
      fecha_vencimiento: new Date(),
      descripcion: '',
    });
    setErrors({});
  };

  // Helper local para extraer auth de forma segura
  function userAuthHookHelper() {
    return useAuth();
  }

  return {
    formData,
    presentaciones,
    loadingPresentaciones,
    errors,
    isSubmitting,
    modalVisible,
    setModalVisible,
    modalConfig,
    handleChange,
    handleSubmit,
    resetForm,
    isEditMode
  };
};
