import { useState, useEffect } from 'react';
import citaService from '../services/citaService';
import { validateCitaFormSync, getDiaSemana, isPastDate } from '../utils/citasValidation';

/**
 * CUSTOM HOOK: useCitaForm
 * Gestiona la lógica del formulario de citas con validaciones asíncronas reales.
 * Soporta modo creación y edición.
 */
export const useCitaForm = (initialData = null, onSuccess = null) => {
  const isEditMode = !!(initialData && initialData.id_cita);

  const [formData, setFormData] = useState({
    id_beneficiario: '',
    id_empleado: '',
    fecha: '',
    hora: '',
    estatus: 1, // Por defecto Pendiente
    ...initialData
  });

  const [beneficiarios, setBeneficiarios] = useState([]);
  const [psicologos, setPsicologos] = useState([]);
  const [estadosCita, setEstadosCita] = useState([]);
  const [horarioPsicologo, setHorarioPsicologo] = useState(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(true);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    loadOptions();
  }, []);

  // Cargar horario cuando se seleccione un psicólogo
  useEffect(() => {
    if (formData.id_empleado) {
      cargarHorario(formData.id_empleado);
    } else {
      setHorarioPsicologo(null);
    }
  }, [formData.id_empleado]);

  const loadOptions = async () => {
    setLoadingOptions(true);
    try {
      const promises = [
        citaService.consultar_beneficiarios_activos(),
        citaService.consultar_psicologos(),
        citaService.consultar_estados_cita()
      ];

      const [resBen, resPsi, resEstados] = await Promise.all(promises);

      if (resBen.success) setBeneficiarios(resBen.data);
      if (resPsi.success) setPsicologos(resPsi.data);
      if (resEstados.success) setEstadosCita(resEstados.data);
    } catch (error) {
      console.error('Error cargando opciones:', error);
    } finally {
      setLoadingOptions(false);
    }
  };

  const cargarHorario = async (id_empleado) => {
    setLoadingSchedule(true);
    const result = await citaService.obtener_horario_psicologo(id_empleado);
    if (result.success && Array.isArray(result.data)) {
        setHorarioPsicologo(result.data);
    } else {
        setHorarioPsicologo([]);
    }
    setLoadingSchedule(false);
  };

  const handleChange = async (name, value) => {
    const newData = { ...formData, [name]: value };
    setFormData(newData);
    
    let currentErrors = { ...errors };
    delete currentErrors[name];

    // Si cambió el estatus, no necesitamos validar fecha/hora
    if (name === 'estatus') {
      setErrors(currentErrors);
      return;
    }

    // Validar Fecha asíncronamente
    if (name === 'fecha' || name === 'id_empleado') {
      const id = name === 'id_empleado' ? value : formData.id_empleado;
      const f = name === 'fecha' ? value : formData.fecha;
      
      if (f && isPastDate(f)) {
        currentErrors.fecha = 'No puede programar citas en fechas pasadas';
      } else if (id && f) {
        const dia = getDiaSemana(f);
        const res = await citaService.validar_fecha_cita({ id_empleado: id, dia_semana: dia, fecha: f });
        
        if (res?.exito === false || res?.existe === false || res?.status === false) {
          currentErrors.fecha = res?.mensaje || 'El psicólogo no trabaja este día';
        } else {
          delete currentErrors.fecha;
        }
      }
    }

    // Validar Hora asíncronamente
    if (name === 'hora' || name === 'fecha' || name === 'id_empleado') {
      const id = name === 'id_empleado' ? value : formData.id_empleado;
      const f = name === 'fecha' ? value : formData.fecha;
      const h = name === 'hora' ? value : formData.hora;
      
      if (id && f && h) {
        if (!currentErrors.fecha) {
          const dia = getDiaSemana(f);
          const res = await citaService.validar_hora_cita({ 
            id_empleado: id, 
            hora: h, 
            dia_semana: dia, 
            fecha: f,
            id_cita: formData.id_cita 
          });
          
          if (res?.exito === false || res?.existe === false || res?.disponible === false || res?.en_rango === false || res?.status === false) {
            currentErrors.hora = res?.mensaje || 'Hora no disponible';
          } else {
            delete currentErrors.hora;
          }
        }
      }
    }

    setErrors(currentErrors);
  };

  const handleSubmit = async () => {
    // 1. Validaciones Síncronas (en modo edición no validamos beneficiario/empleado ya que están bloqueados)
    const { isValid, errors: validationErrors } = validateCitaFormSync(formData);
    
    // Combinar errores síncronos con los asíncronos existentes
    const finalErrors = { ...errors, ...validationErrors };

    if (Object.keys(finalErrors).length > 0) {
      setErrors(finalErrors);
      return { success: false, message: 'Por favor corrija los errores del formulario' };
    }

    // 2. Re-validar fecha y hora contra el backend antes de enviar
    setLoading(true);
    try {
      const dia = getDiaSemana(formData.fecha);

      // Validar fecha contra el backend
      const resFecha = await citaService.validar_fecha_cita({
        id_empleado: formData.id_empleado,
        dia_semana: dia,
        fecha: formData.fecha
      });

      if (resFecha?.exito === false || resFecha?.existe === false) {
        setErrors(prev => ({ ...prev, fecha: resFecha?.mensaje || 'El psicólogo no trabaja este día' }));
        setLoading(false);
        return { success: false, message: resFecha?.mensaje || 'El psicólogo no trabaja este día' };
      }

      // Validar hora contra el backend
      const resHora = await citaService.validar_hora_cita({
        id_empleado: formData.id_empleado,
        hora: formData.hora,
        dia_semana: dia,
        fecha: formData.fecha,
        id_cita: formData.id_cita
      });

      if (resHora?.exito === false || resHora?.en_rango === false || resHora?.disponible === false) {
        setErrors(prev => ({ ...prev, hora: resHora?.mensaje || 'Hora no disponible' }));
        setLoading(false);
        return { success: false, message: resHora?.mensaje || 'Hora no disponible' };
      }

      // 3. Todo validado — proceder con el registro o actualización
      const serviceCall = isEditMode 
        ? citaService.actualizar(formData) 
        : citaService.registrar(formData);

      const result = await serviceCall;
      
      if (result.success && onSuccess) {
        onSuccess(result);
      }
      return result;
    } catch (error) {
      return { success: false, message: 'Error de red al procesar la cita' };
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    beneficiarios,
    psicologos,
    estadosCita,
    horarioPsicologo,
    loadingSchedule,
    loading,
    loadingOptions,
    errors,
    isEditMode,
    handleChange,
    handleSubmit,
    setFormData
  };
};
