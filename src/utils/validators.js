// ============================================
// VALIDADORES DE FORMULARIOS
// ============================================

/**
 * Valida un correo electrónico
 * @param {string} email 
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Valida que un campo no esté vacío
 * @param {string} value 
 * @returns {boolean}
 */
export const isRequired = (value) => {
  return value !== null && value !== undefined && String(value).trim() !== '';
};

/**
 * Valida una cédula venezolana (7-8 dígitos)
 * @param {string} cedula 
 * @returns {boolean}
 */
export const isValidCedula = (cedula) => {
  const regex = /^\d{7,8}$/;
  return regex.test(cedula);
};

/**
 * Valida un teléfono venezolano (11 dígitos: 4 prefijo + 7 número)
 * @param {string} telefono 
 * @returns {boolean}
 */
export const isValidTelefono = (telefono) => {
  const regex = /^\d{11}$/;
  return regex.test(telefono);
};

/**
 * Valida campos de un formulario contra reglas
 * @param {Object} data - Datos del formulario
 * @param {Object} rules - Reglas de validación { campo: 'required|email' }
 * @returns {Object} - Errores por campo
 */
export const validateForm = (data, rules) => {
  const errors = {};

  for (const [field, ruleString] of Object.entries(rules)) {
    const rulesArray = ruleString.split('|');
    const value = data[field];

    for (const rule of rulesArray) {
      if (rule === 'required' && !isRequired(value)) {
        errors[field] = 'Este campo es obligatorio';
        break;
      }

      if (rule === 'email' && value && !isValidEmail(value)) {
        errors[field] = 'Correo electrónico inválido';
        break;
      }

      if (rule === 'cedula' && value && !isValidCedula(value)) {
        errors[field] = 'La cédula debe tener 7 u 8 dígitos';
        break;
      }

      if (rule === 'telefono' && value && !isValidTelefono(value)) {
        errors[field] = 'El teléfono debe tener 11 dígitos';
        break;
      }
    }
  }

  return errors;
};
