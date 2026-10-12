/**
 * UTILIDAD: formErrorHelper (SOLID: Principio de Responsabilidad Única)
 * 
 * Centraliza la transformación y diagnóstico amigable de errores de formularios
 * para presentar modales específicos y adaptados a la experiencia móvil (UI/UX).
 */

// Diccionario centralizado de nombres de campos legibles para el usuario
export const DEFAULT_FIELD_LABELS = {
  // Autenticación
  correo: 'Correo Electrónico',
  password: 'Contraseña',

  // Beneficiarios
  cedula: 'Cédula',
  nombres: 'Nombres',
  apellidos: 'Apellidos',
  fecha_nac: 'Fecha de Nacimiento',
  genero: 'Género',
  telefono: 'Teléfono',
  id_pnf: 'Programa Académico (PNF)',
  trayecto: 'Trayecto',
  seccion: 'Sección',
  seccion_numero: 'Número de Sección',
  seccion_sede: 'Sede de Sección',
  id_tipo_beneficiario: 'Tipo de Beneficiario',

  // Inventario / Insumos
  nombre_insumo: 'Nombre del Insumo',
  tipo_insumo: 'Tipo de Insumo',
  id_presentacion: 'Presentación',
  descripcion: 'Descripción',
  fecha_vencimiento: 'Fecha de Vencimiento',
  cantidad: 'Cantidad',

  // Citas
  id_beneficiario: 'Paciente / Beneficiario',
  id_empleado: 'Especialista',
  fecha: 'Fecha de la Cita',
  hora: 'Hora de la Cita',
  estatus: 'Estado de la Cita',

  // Perfil
  direccion: 'Dirección',
  clave_actual: 'Contraseña Actual',
  nueva_clave: 'Nueva Contraseña',
  confirmar_clave: 'Confirmación de Contraseña',
};

/**
 * Genera la configuración de CustomModal según la cantidad y tipo de errores.
 * 
 * @param {Object} errors Objeto { campo: 'mensaje de error' }
 * @param {Object} customLabels Diccionario opcional para sobreescribir etiquetas
 * @returns {Object|null} { title, message, type: 'warning' } o null si no hay errores
 */
export const getValidationErrorModalConfig = (errors = {}, customLabels = {}) => {
  if (!errors || typeof errors !== 'object') return null;

  const labels = { ...DEFAULT_FIELD_LABELS, ...customLabels };

  // Filtrar únicamente los campos que contengan un mensaje de error no vacío
  const activeErrors = Object.entries(errors)
    .filter(([_, msg]) => !!msg && typeof msg === 'string' && msg.trim().length > 0)
    .map(([field, msg]) => ({
      field,
      label: labels[field] || field.charAt(0).toUpperCase() + field.slice(1),
      message: msg.trim()
    }));

  if (activeErrors.length === 0) return null;

  // CASO 1: Exactamente 1 solo error (Diagnóstico Directo y Específico)
  if (activeErrors.length === 1) {
    const { label, message } = activeErrors[0];
    const isRequiredError = message.toLowerCase().includes('obligatori') || 
                            message.toLowerCase().includes('requerid') ||
                            message.toLowerCase().includes('debe seleccionar') ||
                            message.toLowerCase().includes('seleccione');

    return {
      title: isRequiredError ? `${label} Requerido` : `${label} Inválido`,
      message: message,
      type: 'warning'
    };
  }

  // CASO 2: Múltiples errores (2 o más campos por corregir)
  // Mostramos hasta 4 campos para mantener el modal compacto y agregar resumen si hay más
  const MAX_VISIBLE = 4;
  const visibleErrors = activeErrors.slice(0, MAX_VISIBLE);
  const extraCount = activeErrors.length - MAX_VISIBLE;

  const bulletList = visibleErrors
    .map(err => `• ${err.label}: ${err.message}`)
    .join('\n');

  const extraMessage = extraCount > 0
    ? `\n• ...y ${extraCount} campo${extraCount > 1 ? 's' : ''} más por corregir.`
    : '';

  return {
    title: 'Campos por Corregir',
    message: `Por favor, verifica los siguientes datos:\n\n${bulletList}${extraMessage}`,
    type: 'warning'
  };
};
