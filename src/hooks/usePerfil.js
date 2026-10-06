import { useState, useEffect, useCallback } from 'react';
import perfilService from '../services/perfilService';
import { useAuth } from '../context/AuthContext';
import { validatePerfilField, validatePerfilFormSync } from '../utils/perfilValidation';

/**
 * CUSTOM HOOK: usePerfil (SOLID: SRP)
 * 
 * Gestiona el estado reactivo, la carga, la validación y actualización
 * de los datos de perfil de usuario del empleado logueado.
 */
export const usePerfil = () => {
  const { user, updateUser } = useAuth();

  const [perfilData, setPerfilData] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    correo: '',
    telefono: '',
    direccion: '',
    clave_actual: '',
    nueva_clave: '',
    confirmar_clave: '',
  });

  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados de control para el Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [modalConfig, setModalConfig] = useState({ title: '', message: '', type: 'info' });

  // Carga inicial del perfil
  const fetchPerfil = useCallback(async () => {
    setLoading(true);
    const result = await perfilService.consultar();
    
    if (result.success && result.data) {
      const d = result.data;
      const computedPerfil = {
        ...d,
        cedula_completa: d.cedula_completa || `${d.tipo_cedula || 'V'}-${d.cedula || ''}`,
        tipo: d.nombre_tipo || d.tipo || 'Personal',
        estatus: typeof d.estatus === 'number' ? (d.estatus === 1 ? 'Activo' : 'Inactivo') : (d.estatus || 'Activo'),
      };

      setPerfilData(computedPerfil);
      // Pre-cargar el formulario con los datos editables de BD
      setFormData({
        nombre: d.nombre || '',
        apellido: d.apellido || '',
        correo: d.correo || '',
        telefono: d.telefono || '',
        direccion: d.direccion || '',
        clave_actual: '',
        nueva_clave: '',
        confirmar_clave: '',
      });
      // Sincronizar también con AuthContext para asegurar coherencia
      updateUser({
        nombre: d.nombre,
        apellido: d.apellido,
        tipo_empleado: computedPerfil.tipo
      });
    } else {
      setModalConfig({
        title: 'Error de Carga',
        message: result.message || 'No logramos cargar tus datos de perfil en este momento.',
        type: 'error'
      });
      setModalVisible(true);
    }
    setLoading(false);
  }, [updateUser]);

  useEffect(() => {
    fetchPerfil();
  }, [fetchPerfil]);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));

    // Validación reactiva
    const error = validatePerfilField(name, value);
    if (error) {
      setErrors(prev => ({ ...prev, [name]: error }));
    } else {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSave = async () => {
    // Validación síncrona
    const { isValid, errors: validationErrors } = validatePerfilFormSync(formData);

    if (!isValid) {
      setErrors(validationErrors);
      setModalConfig({
        title: 'Campos Inválidos',
        message: 'Por favor, corrige los errores del formulario para poder continuar.',
        type: 'warning'
      });
      setModalVisible(true);
      return;
    }

    setIsSubmitting(true);
    
    // Armar payload acotado estrictamente a lo que acepta PerfilModel.php en DIRPOLES-4
    // (jamás enviar nombre/apellido ya que son institucionales y lanzan error de atributo no reconocido)
    const payload = {
      correo: formData.correo.trim(),
      telefono: formData.telefono.trim(),
      direccion: formData.direccion.trim(),
      clave_actual: formData.clave_actual,
    };

    if (formData.nueva_clave) {
      payload.nueva_clave = formData.nueva_clave;
      payload.confirmar_clave = formData.confirmar_clave;
    }

    const result = await perfilService.actualizar(payload);

    if (result.success) {
      setModalConfig({
        title: '¡Operación Exitosa!',
        message: result.message || 'Tu perfil se ha actualizado correctamente.',
        type: 'success'
      });
      
      // Limpiar claves
      setFormData(prev => ({
        ...prev,
        clave_actual: '',
        nueva_clave: '',
        confirmar_clave: ''
      }));

      // Actualizar datos del perfil en memoria local
      await fetchPerfil();
    } else {
      setModalConfig({
        title: 'Error de Actualización',
        message: result.message || 'Ocurrió un error inesperado al intentar guardar los cambios.',
        type: 'error'
      });
    }

    setModalVisible(true);
    setIsSubmitting(false);
  };

  return {
    perfilData,
    formData,
    loading,
    errors,
    isSubmitting,
    modalVisible,
    setModalVisible,
    modalConfig,
    handleChange,
    handleSave,
    refetch: fetchPerfil
  };
};
