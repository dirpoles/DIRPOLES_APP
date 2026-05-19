import { isRequired, isValidEmail, isValidPhone, isValidName, isValidAddress } from './validators';

/**
 * UTILS: perfilValidation (SOLID: SRP)
 * 
 * Reglas de negocio y validación para el perfil del empleado.
 */

export const validatePerfilField = (name, value) => {
  let error = '';
  switch (name) {
    case 'nombre':
      if (!isRequired(value)) {
        error = 'El nombre es obligatorio';
      } else if (!isValidName(value)) {
        error = 'Nombre inválido (solo letras, 2-50 caracteres)';
      }
      break;
    case 'apellido':
      if (!isRequired(value)) {
        error = 'El apellido es obligatorio';
      } else if (!isValidName(value)) {
        error = 'Apellido inválido (solo letras, 2-50 caracteres)';
      }
      break;
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
      if (!isRequired(value)) {
        error = 'La dirección es obligatoria';
      } else if (!isValidAddress(value)) {
        error = 'Mínimo 5 caracteres y caracteres permitidos';
      }
      break;
    case 'clave_actual':
      // Solo es obligatoria si se ingresó una nueva clave
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
  
  // Validar campos obligatorios
  const fields = ['nombre', 'apellido', 'correo', 'telefono', 'direccion'];
  fields.forEach(field => {
    const error = validatePerfilField(field, formData[field]);
    if (error) {
      errors[field] = error;
    }
  });

  // Validaciones cruzadas de contraseñas
  if (formData.nueva_clave) {
    const newPassErr = validatePerfilField('nueva_clave', formData.nueva_clave);
    if (newPassErr) {
      errors.nueva_clave = newPassErr;
    }

    if (!formData.clave_actual) {
      errors.clave_actual = 'Ingrese su contraseña actual para confirmar el cambio';
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
