import { useState } from 'react';

/**
 * CUSTOM HOOK: useBeneficiarioForm (SOLID: Separación de Lógica)
 * 
 * Este hook gestiona el estado del formulario de beneficiarios,
 * permitiendo que la vista se mantenga limpia y enfocada en el diseño.
 */
export const useBeneficiarioForm = (initialState = {}) => {
  const [formData, setFormData] = useState({
    id_pnf: '',
    seccion: '',
    nombres: '',
    apellidos: '',
    tipo_cedula: 'V', // Valor por defecto
    cedula: '',
    fecha_nac: new Date(),
    telefono: '',
    correo: '',
    genero: 'M', // Valor por defecto
    direccion: '',
    estatus: 1,
    ...initialState
  });

  const [errors, setErrors] = useState({});

  /**
   * Actualiza un campo específico del formulario
   */
  const handleChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo cuando el usuario empieza a escribir
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Resetear el formulario a su estado inicial
   */
  const resetForm = () => {
    setFormData(initialState);
    setErrors({});
  };

  return {
    formData,
    errors,
    setErrors,
    handleChange,
    resetForm
  };
};
