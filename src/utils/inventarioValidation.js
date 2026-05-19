import { isRequired } from './validators';

/**
 * UTILS: inventarioValidation (SOLID: Single Responsibility Principle)
 * 
 * Reglas de negocio y validación puras e independientes de React/UI,
 * aplicadas exclusivamente al formulario de insumos médicos.
 */

/**
 * Valida un campo individual de insumo para retroalimentación en tiempo real.
 * @param {string} name - Nombre del campo.
 * @param {*} value - Valor actual del campo.
 * @param {boolean} isEditMode - Indica si el formulario está en modo edición.
 */
export const validateInsumoField = (name, value, isEditMode = false) => {
  let error = '';
  switch (name) {
    case 'nombre_insumo':
      if (!isRequired(value)) {
        error = 'El nombre del insumo es obligatorio';
      } else if (value.trim().length < 3) {
        error = 'Mínimo 3 caracteres';
      } else if (value.trim().length > 100) {
        error = 'Máximo 100 caracteres';
      }
      break;
    case 'tipo_insumo':
      if (!isRequired(value)) {
        error = 'El tipo de insumo es obligatorio';
      }
      break;
    case 'id_presentacion':
      if (!isRequired(value)) {
        error = 'La presentación es obligatoria';
      }
      break;
    case 'fecha_vencimiento':
      if (!value) {
        error = 'La fecha de vencimiento es obligatoria';
      } else if (!isEditMode) {
        // Solo exigir fecha a futuro en modo creación
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const chosenDate = new Date(value);
        chosenDate.setHours(0, 0, 0, 0);
        if (chosenDate < today) {
          error = 'La fecha debe ser hoy o a futuro';
        }
      }
      break;
    case 'descripcion':
      if (!isRequired(value)) {
        error = 'La descripción es obligatoria';
      } else if (value.trim().length > 500) {
        error = 'Máximo 500 caracteres';
      }
      break;
  }
  return error;
};

/**
 * Valida de forma síncrona la totalidad de los datos del formulario de insumos.
 * @param {object} formData - Datos del formulario.
 * @param {boolean} isEditMode - Indica si el formulario está en modo edición.
 */
export const validateInsumoFormSync = (formData, isEditMode = false) => {
  const errors = {};
  const fieldsToValidate = ['nombre_insumo', 'tipo_insumo', 'id_presentacion', 'fecha_vencimiento', 'descripcion'];
  
  fieldsToValidate.forEach(field => {
    const error = validateInsumoField(field, formData[field], isEditMode);
    if (error) {
      errors[field] = error;
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
