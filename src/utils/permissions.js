/**
 * UTILIDAD DE PERMISOS Y CONTROL DE ACCESO (DIRPOLES)
 *
 * Centraliza la matriz de permisos por rol/tipo de empleado:
 * - Administrador / Superusuario: Acceso Total
 * - Psicólogo: Citas, Beneficiarios, Reportes, Inicio, Perfil
 * - Médico: Inventario, Beneficiarios, Reportes, Inicio, Perfil
 */

export const canAccessModule = (user, moduleName) => {
  if (!user) return false;

  const role = String(user.tipo_empleado || user.rol || '').toLowerCase();

  // 1. Administrador y Superusuario tienen acceso total
  if (role.includes('admin') || role.includes('super')) {
    return true;
  }

  // 2. Módulos universales (acceso permitido para todos los empleados autenticados)
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
  const roleName = user?.tipo_empleado || 'tu rol actual';
  if (moduleName === 'Inventario') {
    return `No tienes permisos para acceder al módulo de Inventario Médico. Tu usuario (${roleName}) tiene acceso a Citas, Beneficiarios y Reportes.`;
  }
  if (moduleName === 'Citas') {
    return `No tienes permisos para acceder al módulo de Citas. Tu usuario (${roleName}) tiene acceso a Inventario Médico, Beneficiarios y Reportes.`;
  }
  return `No tienes permisos para acceder al módulo de ${moduleName} con el rol ${roleName}.`;
};
