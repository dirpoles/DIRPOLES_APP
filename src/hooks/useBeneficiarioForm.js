import { useState } from 'react';
import { 
  isRequired, 
  isValidPhone, 
  isValidEmail, 
  isValidName, 
  isValidCedula, 
  isValidAddress, 
  isMinAge, 
  isValidSectionNumber 
} from '../utils/validators';

/**
 * CUSTOM HOOK: useBeneficiarioForm (SOLID: Separación de Lógica)
 * 
 * Este hook gestiona el estado del formulario de beneficiarios,
 * permitiendo que la vista se mantenga limpia y enfocada en el diseño.
 */
export const useBeneficiarioForm = (initialState = {}) => {
  const [formData, setFormData] = useState({
    id_pnf: '',
    seccion_numero: '',
    seccion_sede: '',
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Estados para el Modal (Feedback)
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'info' });

  /**
   * Da formato visual al número de teléfono (ej: 0414-1234567)
   */
  const formatPhone = (text) => {
    const cleaned = text.replace(/\D/g, ''); // Solo números
    if (cleaned.length > 4) {
      return `${cleaned.substring(0, 4)}-${cleaned.substring(4, 11)}`;
    }
    return cleaned;
  };

  /**
   * Validación específica para el formulario de Beneficiario
   * Combina las reglas de la Capa 1 según las necesidades de este formulario.
   */
  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'cedula':
        if (!isRequired(value)) error = 'La cédula es obligatoria';
        else if (!isValidCedula(value)) error = 'Debe tener entre 6 y 8 dígitos';
        break;
      case 'nombres':
        if (!isRequired(value)) error = 'El nombre es obligatorio';
        else if (!isValidName(value)) error = 'Solo letras y espacios (máx 50)';
        break;
      case 'apellidos':
        if (!isRequired(value)) error = 'El apellido es obligatorio';
        else if (!isValidName(value)) error = 'Solo letras y espacios (máx 50)';
        break;
      case 'correo':
        if (!isRequired(value)) error = 'El correo es obligatorio';
        else if (!isValidEmail(value)) error = 'Formato de correo inválido';
        break;
      case 'telefono':
        if (!isRequired(value)) error = 'El teléfono es obligatorio';
        else if (!isValidPhone(value)) error = 'Formato inválido (ej: 0414-1234567)';
        break;
      case 'fecha_nac':
        if (!isRequired(value)) error = 'La fecha es obligatoria';
        else if (!isMinAge(value, 15)) error = 'Debe tener al menos 15 años';
        break;
      case 'direccion':
        if (!isRequired(value)) error = 'La dirección es obligatoria';
        else if (!isValidAddress(value)) error = 'Dirección inválida (5-250 caracteres)';
        break;
      case 'seccion_numero':
        if (!isRequired(value)) error = 'El número es obligatorio';
        else if (!isValidSectionNumber(value)) error = '4 dígitos (1-4 al inicio)';
        break;
      case 'seccion_sede':
        if (!isRequired(value)) error = 'La sede es obligatoria';
        break;
      case 'id_pnf':
        if (!isRequired(value)) error = 'El PNF es obligatorio';
        break;
      case 'genero':
        if (!isRequired(value)) error = 'El género es obligatorio';
        break;
    }
    return error;
  };

  /**
   * Actualiza un campo específico del formulario
   */
  const handleChange = (name, value) => {
    let finalValue = value;

    // Aplicar formateo si es el campo de teléfono
    if (name === 'telefono') {
      finalValue = formatPhone(value);
    }

    // Si es seccion_numero, solo permitir números
    if (name === 'seccion_numero') {
      finalValue = value.replace(/\D/g, '');
    }

    setFormData(prev => ({
      ...prev,
      [name]: finalValue
    }));
    
    // Validación en tiempo real
    const error = validateField(name, finalValue);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    } else if (errors[name]) {
      // Limpiar error si ya es válido
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  /**
   * Valida todos los campos y envía al backend
   */
  const handleSubmit = async (onSubmitSuccess) => {
    // Validar todos los campos (como el Dirpoles_4 script)
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setModalConfig({
        title: 'Formulario Incompleto',
        message: 'Por favor, corrige los errores resaltados antes de guardar.',
        type: 'warning'
      });
      setModalVisible(true);
      return;
    }

    setIsSubmitting(true);
    
    // Preparar datos para el backend
    const { seccion_numero, seccion_sede, ...restoData } = formData;
    const dataToSend = {
      ...restoData,
      seccion: `${seccion_numero}-${seccion_sede}`, // Unir en el formato NNNN-S
      fecha_nac: formData.fecha_nac.toISOString().split('T')[0]
    };

    const result = await onSubmitSuccess(dataToSend);
    
    if (result.success) {
      setModalConfig({
        title: '¡Éxito!',
        message: result.message,
        type: 'success'
      });
      resetForm();
    } else {
      setModalConfig({
        title: 'Error de Registro',
        message: result.message,
        type: 'error'
      });
    }
    
    setModalVisible(true);
    setIsSubmitting(false);
  };

  /**
   * Resetear el formulario a su estado inicial
   */
  const resetForm = () => {
    setFormData({
      id_pnf: '',
      seccion_numero: '',
      seccion_sede: '',
      nombres: '',
      apellidos: '',
      tipo_cedula: 'V',
      cedula: '',
      fecha_nac: new Date(),
      telefono: '',
      correo: '',
      genero: 'M',
      direccion: '',
      estatus: 1,
    });
    setErrors({});
  };

  return {
    formData,
    errors,
    isSubmitting,
    modalVisible,
    setModalVisible,
    modalConfig,
    handleChange,
    handleSubmit,
    resetForm
  };
};

