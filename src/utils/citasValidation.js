/**
 * UTILS: citasValidation
 * Reglas de validación para el formulario de citas.
 */

export const validateCitaFormSync = (formData) => {
  const errors = {};
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (!formData.id_beneficiario) {
    errors.id_beneficiario = 'El beneficiario es obligatorio';
  }

  if (!formData.id_empleado) {
    errors.id_empleado = 'El psicólogo es obligatorio';
  }

  if (!formData.fecha) {
    errors.fecha = 'La fecha es obligatoria';
  } else {
    // Validar fecha pasada (asegurando zona horaria local)
    const [year, month, day] = formData.fecha.split('-');
    const fechaSeleccionada = new Date(year, month - 1, day);
    fechaSeleccionada.setHours(0, 0, 0, 0);

    if (fechaSeleccionada < hoy) {
      errors.fecha = 'No puede seleccionar fechas pasadas';
    }
  }

  if (!formData.hora) {
    errors.hora = 'La hora es obligatoria';
  }

  // Reglas de precedencia (orden lógico)
  if (formData.fecha && !formData.id_empleado) {
    errors.fecha = 'Primero seleccione un psicólogo';
  }

  if (formData.hora && !formData.id_empleado) {
    errors.hora = 'Primero seleccione un psicólogo';
  } else if (formData.hora && !formData.fecha) {
    errors.hora = 'Primero seleccione una fecha';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const getDiaSemana = (fechaStr) => {
  // fechaStr format: YYYY-MM-DD
  const [year, month, day] = fechaStr.split('-');
  const date = new Date(year, month - 1, day);
  const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return dias[date.getDay()];
};

/**
 * Verifica si una fecha (YYYY-MM-DD) es anterior al día de hoy.
 */
export const isPastDate = (fechaStr) => {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const [year, month, day] = fechaStr.split('-');
  const fecha = new Date(year, month - 1, day);
  fecha.setHours(0, 0, 0, 0);
  return fecha < hoy;
};
