import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { isRequired, isValidEmail, isValidPassword } from '../utils/validators';

/**
 * CUSTOM HOOK: useLoginForm (SOLID: Separación de Lógica)
 * 
 * Gestiona el estado, validación y envío del formulario de inicio de sesión.
 */
export const useLoginForm = () => {
  const [formData, setFormData] = useState({ correo: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Estado del Modal para alertas visuales
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'info' });

  const { login } = useAuth();

  /**
   * Validación específica para el formulario de Login
   * Utiliza las funciones puras de la Capa 1 (validators.js)
   */
  const validateField = (name, value) => {
    let error = '';
    switch (name) {
      case 'correo':
        if (!isRequired(value)) error = 'El correo es obligatorio';
        else if (!isValidEmail(value)) error = 'Correo inválido (ej: usuario@gmail.com)';
        break;
      case 'password':
        if (!isRequired(value)) error = 'La contraseña es obligatoria';
        else if (!isValidPassword(value)) error = 'Debe tener 8 caracteres (letras y números)';
        break;
      default:
        break;
    }
    return error;
  };

  /**
   * Actualiza el valor y valida en tiempo real
   */
  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  /**
   * Envía el formulario si todas las validaciones pasan
   */
  const handleSubmit = async () => {
    const errorCorreo = validateField('correo', formData.correo);
    const errorPass = validateField('password', formData.password);

    if (errorCorreo || errorPass) {
      setErrors({ correo: errorCorreo, password: errorPass });
      setModalConfig({
        title: 'Formulario Incompleto',
        message: 'Por favor, corrige los errores en el formulario antes de continuar.',
        type: 'warning'
      });
      setModalVisible(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await login(formData.correo, formData.password);
      if (!result.success) {
        setModalConfig({
          title: 'Error de Acceso',
          message: result.message,
          type: 'error'
        });
        setModalVisible(true);
      }
    } catch (error) {
      setModalConfig({
        title: 'Error Inesperado',
        message: 'No se pudo conectar con el servidor.',
        type: 'error'
      });
      setModalVisible(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    isSubmitting,
    showPassword,
    setShowPassword,
    modalVisible,
    setModalVisible,
    modalConfig,
    handleChange,
    handleSubmit
  };
};
