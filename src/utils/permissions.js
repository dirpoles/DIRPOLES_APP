/**
 * UTILIDAD DE PERMISOS Y CONTROL DE ACCESO (DIRPOLES)
 *
 * Centraliza la matriz de permisos por rol/tipo de empleado:
 * - Empleados autorizados para la app móvil: Administrador, Médico, Psicólogo.
 * - Administrador / Superusuario: Acceso Total
 * - Psicólogo: Citas, Beneficiarios, Reportes, Inicio, Perfil
 * - Médico: Inventario, Beneficiarios, Reportes, Inicio, Perfil
 */

/**
 * Verifica si el tipo de empleado/rol está autorizado para ingresar a la aplicación móvil.
 * Únicamente permitido: Administrador, Médico, Psicólogo.
 * 
 * @param {object} user - Objeto del usuario autenticado
 * @returns {boolean}
 */
export const isMobileAccessAuthorized = (user) => {
  if (!user) return false;

  const role = String(
    user.tipo_empleado || 
    user.nombre_tipo || 
    user.tipo || 
    user.rol || 
    ''
  ).toLowerCase().trim();

  if (!role) return false;

  // 1. Administrador y Superusuario
  if (role.includes('admin') || role.includes('super') || role.includes('director')) {
    return true;
  }

  // 2. Médico
  if (role.includes('médic') || role.includes('medic')) {
    return true;
  }

  // 3. Psicólogo
  if (role.includes('psic')) {
    return true;
  }

  return false;
};

export const canAccessModule = (user, moduleName) => {
  if (!user || !isMobileAccessAuthorized(user)) return false;

  const role = String(
    user.tipo_empleado || 
    user.nombre_tipo || 
    user.tipo || 
    user.rol || 
    ''
  ).toLowerCase();

  // 1. Administrador y Superusuario tienen acceso total
  if (role.includes('admin') || role.includes('super') || role.includes('director')) {
    return true;
  }

  // 2. Módulos universales (acceso permitido para los roles autorizados en la app)
  if (moduleName === 'Inicio' || moduleName === 'Beneficiarios' || moduleName === 'Reportes' || moduleName === 'Perfil') {
    return true;
  }

  // 3. Módulo de Citas (Psicología)
  if (moduleName === 'Citas') {
    return role.includes('psic');
  }

  // 4. Módulo de Inventario (Medicina)
  if (moduleName === 'Inventario') {
    return role.includes('médic') || role.includes('medic');
  }

  return true;
};

/**
 * Retorna el mensaje amigable a mostrar en el modal cuando se niega el acceso
 */
export const getAccessDeniedMessage = (user, moduleName) => {
  const roleName = user?.tipo_empleado || user?.nombre_tipo || user?.tipo || user?.rol || 'tu rol actual';
  
  if (!isMobileAccessAuthorized(user)) {
    return `Acceso no autorizado: Esta aplicación móvil está restringida exclusivamente para personal Administrador, Médico y Psicólogo.\n\nTu cargo (${roleName}) no tiene permisos para ingresar a la aplicación móvil.`;
  }
  
  if (moduleName === 'Inventario') {
    return `No tienes permisos para acceder al módulo de Inventario Médico. Tu usuario (${roleName}) tiene acceso a Citas, Beneficiarios y Reportes.`;
  }
  if (moduleName === 'Citas') {
    return `No tienes permisos para acceder al módulo de Citas. Tu usuario (${roleName}) tiene acceso a Inventario Médico, Beneficiarios y Reportes.`;
  }
  return `No tienes permisos para acceder al módulo de ${moduleName} con el rol ${roleName}.`;
};
