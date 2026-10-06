import { isRequired, isValidEmail, isValidPhone, isValidName, isValidAddress } from './validators';

/**
 * UTILS: perfilValidation (SOLID: SRP)
 * 
 * Reglas de negocio y validación para el perfil del empleado.
 */

export const validatePerfilField = (name, value) => {
  let error = '';
  switch (name) {
    case 'correo':
      if (!isRequired(value)) {
        error = 'El correo electrónico es obligatorio';
      } else if (!isValidEmail(value)) {
        error = 'Ingrese un correo electrónico válido';
      }
      break;
    case 'telefono':
      if (!isRequired(value)) {
        error = 'El teléfono es obligatorio';
      } else if (!isValidPhone(value)) {
        error = 'Teléfono inválido (ej: 04141234567)';
      }
      break;
    case 'direccion':
      if (value && !isValidAddress(value)) {
        error = 'Mínimo 5 caracteres y caracteres permitidos';
      }
      break;
    case 'clave_actual':
      if (!isRequired(value)) {
        error = 'Debes ingresar tu contraseña actual para guardar los cambios';
      }
      break;
    case 'nueva_clave':
      if (value && value.length < 8) {
        error = 'La contraseña debe tener mínimo 8 caracteres';
      }
      break;
    case 'confirmar_clave':
      // Se valida en conjunto en el form sync
      break;
  }
  return error;
};

export const validatePerfilFormSync = (formData) => {
  const errors = {};
  
  // Validar campos editables (correo, telefono, direccion)
  const fields = ['correo', 'telefono'];
  fields.forEach(field => {
    const error = validatePerfilField(field, formData[field]);
    if (error) {
      errors[field] = error;
    }
  });

  if (formData.direccion) {
    const dirErr = validatePerfilField('direccion', formData.direccion);
    if (dirErr) errors.direccion = dirErr;
  }

  // La contraseña actual siempre es requerida por el backend para confirmar la identidad
  const passActualErr = validatePerfilField('clave_actual', formData.clave_actual);
  if (passActualErr) {
    errors.clave_actual = passActualErr;
  }

  // Validaciones cruzadas de nueva contraseña
  if (formData.nueva_clave) {
    const newPassErr = validatePerfilField('nueva_clave', formData.nueva_clave);
    if (newPassErr) {
      errors.nueva_clave = newPassErr;
    }

    if (formData.nueva_clave !== formData.confirmar_clave) {
      errors.confirmar_clave = 'Las contraseñas no coinciden';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
