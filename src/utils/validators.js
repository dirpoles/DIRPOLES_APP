/**
 * VALIDADORES DE FORMULARIOS - DIRPOLES_APP
 * 
 * Basado en las reglas de negocio de DIRPOLES_4 (Monolito).
 */

/**
 * Valida un correo electrónico con dominios específicos
 * @param {string} email 
 */
export const isValidEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@(hotmail|yahoo|gmail|outlook)\.(com|es|net|org)$/i;
  return regex.test(email);
};

/**
 * Valida una contraseña (exactamente 8 caracteres, al menos una letra)
 * @param {string} password 
 */
export const isValidPassword = (password) => {
  const regex = /^(?=.*[A-Za-z])[A-Za-z\d]{8}$/;
  return regex.test(password);
};

/**
 * Valida que un campo no esté vacío
 */
export const isRequired = (value) => {
  return value !== null && value !== undefined && String(value).trim() !== '';
};

/**
 * Motor de validación centralizado (SOLID)
 * Procesa un objeto de datos contra un conjunto de reglas.
 */
export const validateField = (name, value) => {
  let error = '';

  switch (name) {
    case 'correo':
      if (!isRequired(value)) {
        error = 'El correo es obligatorio';
      } else if (!isValidEmail(value)) {
        error = 'Correo inválido (ej: usuario@gmail.com)';
      }
      break;
    case 'password':
      if (!isRequired(value)) {
        error = 'La contraseña es obligatoria';
      } else if (!isValidPassword(value)) {
        error = 'Debe tener 8 caracteres (letras y números)';
      }
      break;
    default:
      if (!isRequired(value)) {
        error = 'Este campo es obligatorio';
      }
  }

  return error;
};
