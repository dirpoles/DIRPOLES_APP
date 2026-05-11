/**
 * VALIDADORES DE FORMULARIOS - DIRPOLES_APP
 * 
 * Basado en las reglas de negocio de DIRPOLES_4 (Monolito).
 */

/**
 * Valida un correo electrónico con dominios específicos (incluyendo dominios institucionales)
 */
export const isValidEmail = (email) => {
  const regex = /^[a-zA-Z0-9._%+-]+@(hotmail|yahoo|gmail|outlook|uptaeb)\.(com|es|net|org|edu|ve)$/i;
  return regex.test(email);
};

/**
 * Valida nombres y apellidos (letras, acentos, espacios, 2-50 caracteres)
 */
export const isValidName = (name) => {
  const regex = /^[A-Za-zÀ-ÿ\u00f1\u00d1\s]{2,50}$/;
  return regex.test(name.trim());
};

/**
 * Valida la cédula (solo números, 6 a 8 dígitos)
 */
export const isValidCedula = (cedula) => {
  const regex = /^[0-9]{6,8}$/;
  return regex.test(cedula);
};

/**
 * Valida la dirección (letras, números, espacios, comas, puntos, guiones y #)
 */
export const isValidAddress = (address) => {
  const regex = /^[A-Za-zÀ-ÿ0-9 ,.\-#]+$/;
  return regex.test(address) && address.length >= 5 && address.length <= 250;
};

/**
 * Valida edad mínima
 */
export const isMinAge = (date, minAge) => {
  if (!date) return false;
  const birthDate = new Date(date);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const month = today.getMonth() - birthDate.getMonth();
  if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= minAge;
};

/**
 * Valida número de sección (4 dígitos, empieza con 1-4)
 */
export const isValidSectionNumber = (section) => {
  const regex = /^[1-4]\d{3}$/;
  return regex.test(section);
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
 * Valida un número de teléfono de Venezuela
 * Formatos aceptados: 04141234567, 0414-1234567
 * @param {string} phone 
 */
export const isValidPhone = (phone) => {
  // Eliminar guiones para validar solo números
  const cleanPhone = phone.replace(/-/g, '');
  // Validar prefijos comunes de Venezuela (0414, 0424, 0412, 0416, 0426, 02xx...) y exactamente 11 dígitos
  const regex = /^(0414|0424|0412|0416|0426|02[0-9]{2})\d{7}$/;
  return regex.test(cleanPhone);
};


