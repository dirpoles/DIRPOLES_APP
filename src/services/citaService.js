import api from './api';

/**
 * SERVICIO: Citas y Agenda (SOLID: SRP)
 *
 * Centraliza todas las peticiones HTTP relacionadas con el módulo de citas
 * contra la API REST de DIRPOLES-4.
 *
 * Contrato de salida (consumido por useCitaForm y useCitasList):
 *   { success: boolean, data: any, message: string }
 *
 * Los métodos de validación devuelven la estructura que useCitaForm ya consume:
 *   { exito: boolean, disponible: boolean, mensaje: string, ... }
 */

const citaService = {
  /**
   * Obtiene el listado de citas según el alcance del usuario en sesión.
   *
   * Consumido por: useCitasList → citaService.consultar_citas()
   *
   * @returns {Promise<{success: boolean, data: {data: Array}, message: string}>}
   */
  consultar_citas: async () => {
    try {
      const response = await api.get('/citas/listar');
      const data     = response.data;

      // Preservar la estructura { data: { data: [...] } } que useCitasList ya espera
      const lista = data.datos || data.data || [];
      return {
        success: true,
        // useCitasList accede a result.data.data
        data:    { data: Array.isArray(lista) ? lista : [] },
        message: data.mensaje || '',
      };
    } catch (error) {
      console.error('[CitaService] consultar_citas:', error.message);
      return {
        success: false,
        data:    { data: [] },
        message: error.normalizedMessage || 'Error al obtener las citas',
      };
    }
  },

  /**
   * Obtiene beneficiarios activos disponibles para agendar citas.
   *
   * Consumido por: useCitaForm → citaService.consultar_beneficiarios_activos()
   *
   * @returns {Promise<{success: boolean, data: Array, message: string}>}
   */
  consultar_beneficiarios_activos: async () => {
    try {
      const response = await api.get('/citas/beneficiarios');
      const data     = response.data;

      return {
        success: true,
        data:    data.datos || data.data || [],
        message: data.mensaje || '',
      };
    } catch (error) {
      console.error('[CitaService] consultar_beneficiarios_activos:', error.message);
      return {
        success: false,
        data:    [],
        message: error.normalizedMessage || 'Error al obtener los beneficiarios',
      };
    }
  },

  /**
   * Obtiene el listado de psicólogos/especialistas activos.
   *
   * Consumido por: useCitaForm → citaService.consultar_psicologos()
   *
   * @returns {Promise<{success: boolean, data: Array, message: string}>}
   */
  consultar_psicologos: async () => {
    try {
      const response = await api.get('/citas/psicologos');
      const data     = response.data;

      return {
        success: true,
        data:    data.datos || data.data || [],
        message: data.mensaje || '',
      };
    } catch (error) {
      console.error('[CitaService] consultar_psicologos:', error.message);
      return {
        success: false,
        data:    [],
        message: error.normalizedMessage || 'Error al obtener los psicólogos',
      };
    }
  },

  /**
   * Obtiene los estados de cita disponibles (Pendiente, Confirmada, etc.).
   *
   * Consumido por: useCitaForm → citaService.consultar_estados_cita()
   * Nota: Si el nuevo backend no expone este endpoint, devuelve un catálogo
   * estático de emergencia para no romper el formulario.
   *
   * @returns {Promise<{success: boolean, data: Array, message: string}>}
   */
  consultar_estados_cita: async () => {
    try {
      const response = await api.get('/citas/estados');
      const data     = response.data;

      return {
        success: true,
        data:    data.datos || data.data || [],
        message: data.mensaje || '',
      };
    } catch (error) {
      console.warn('[CitaService] consultar_estados_cita: usando catálogo local de emergencia');
      // Catálogo local de respaldo para no romper el formulario
      return {
        success: true,
        data: [
          { id_estado: 1, nombre: 'Pendiente' },
          { id_estado: 2, nombre: 'Confirmada' },
          { id_estado: 3, nombre: 'Cancelada' },
          { id_estado: 4, nombre: 'Atendida' },
        ],
        message: '',
      };
    }
  },

  /**
   * Obtiene la jornada semanal de trabajo de un psicólogo.
   *
   * Consumido por: useCitaForm → citaService.obtener_horario_psicologo(id)
   *
   * @param {number|string} idEmpleado - ID del psicólogo/especialista.
   * @returns {Promise<{success: boolean, data: Array|null, message: string}>}
   */
  obtener_horario_psicologo: async (idEmpleado) => {
    try {
      const response = await api.get(`/citas/horario?id_empleado=${idEmpleado}`);
      const data     = response.data;

      return {
        success: true,
        data:    data.datos || data.data || [],
        message: data.mensaje || '',
      };
    } catch (error) {
      console.error('[CitaService] obtener_horario_psicologo:', error.message);
      return {
        success: false,
        data:    null,
        message: error.normalizedMessage || 'Error al cargar el horario del psicólogo',
      };
    }
  },

  /**
   * Valida si un psicólogo atiende en una fecha/día específico.
   *
   * Consumido por: useCitaForm → citaService.validar_fecha_cita({ id_empleado, dia_semana, fecha })
   *
   * La respuesta se normaliza a la estructura que useCitaForm ya evalúa:
   *   { exito: boolean, existe: boolean, disponible: boolean, mensaje: string }
   *
   * @param {{ id_empleado: number|string, dia_semana?: string, fecha: string }} datos
   * @returns {Promise<{exito: boolean, existe: boolean, disponible: boolean, mensaje: string}>}
   */
  validar_fecha_cita: async (datos) => {
    try {
      const response = await api.post('/citas/disponibilidad', {
        id_empleado: datos.id_empleado,
        fecha:       datos.fecha,
        hora:        '08:00', // Hora centinela para validar solo la fecha
      });
      const data = response.data;

      const disponible = data.disponible ?? data.exito ?? data.estado === 'exito' ?? true;
      return {
        exito:      disponible,
        existe:     disponible,
        disponible,
        en_rango:   true,
        mensaje:    data.mensaje || '',
        status:     disponible,
      };
    } catch (error) {
      // El backend devuelve 400/409 cuando la fecha no es válida → capturamos el mensaje
      const mensaje =
        error.response?.data?.error?.mensaje ||
        error.response?.data?.mensaje ||
        'El psicólogo no trabaja en la fecha seleccionada';

      return { exito: false, existe: false, disponible: false, en_rango: false, mensaje, status: false };
    }
  },

  /**
   * Valida si una hora concreta está disponible en la agenda del psicólogo.
   *
   * Consumido por: useCitaForm → citaService.validar_hora_cita({ id_empleado, hora, dia_semana, fecha, id_cita? })
   *
   * @param {{ id_empleado: number|string, hora: string, dia_semana?: string, fecha: string, id_cita?: number }} datos
   * @returns {Promise<{exito: boolean, existe: boolean, disponible: boolean, en_rango: boolean, mensaje: string}>}
   */
  validar_hora_cita: async (datos) => {
    try {
      const payload = {
        id_empleado: datos.id_empleado,
        fecha:       datos.fecha,
        hora:        datos.hora,
      };
      // Si estamos editando, enviar el id_cita para excluirlo del chequeo de colisión
      if (datos.id_cita) {
        payload.id_cita = datos.id_cita;
      }

      const response = await api.post('/citas/disponibilidad', payload);
      const data     = response.data;

      const disponible = data.disponible ?? data.exito ?? data.estado === 'exito' ?? true;
      return {
        exito:     disponible,
        existe:    disponible,
        disponible,
        en_rango:  data.en_rango ?? true,
        mensaje:   data.mensaje || '',
        status:    disponible,
      };
    } catch (error) {
      const mensaje =
        error.response?.data?.error?.mensaje ||
        error.response?.data?.mensaje ||
        'Hora no disponible o fuera del rango de atención';

      return { exito: false, existe: false, disponible: false, en_rango: false, mensaje, status: false };
    }
  },

  /**
   * Registra una nueva cita en el sistema.
   *
   * Consumido por: useCitaForm → citaService.registrar(formData)
   *
   * @param {object} datosCita - Datos de la cita (id_beneficiario, id_empleado, fecha, hora, estatus).
   * @returns {Promise<{success: boolean, data: object|null, message: string}>}
   */
  registrar: async (datosCita) => {
    try {
      const payload = {
        id_beneficiario: datosCita.id_beneficiario,
        id_empleado:     datosCita.id_empleado,
        fecha:           datosCita.fecha,
        hora:            datosCita.hora,
      };
      if (datosCita.estatus !== undefined) {
        payload.estatus = datosCita.estatus;
      }

      const response = await api.post('/citas/crear', payload);
      const data     = response.data;

      return {
        success: data.exito === true || data.estado === 'exito',
        data:    data.datos || data.cita || null,
        message: data.mensaje || 'Cita registrada correctamente',
      };
    } catch (error) {
      console.error('[CitaService] registrar:', error.message);
      return {
        success: false,
        data:    null,
        message: error.normalizedMessage || 'Error al registrar la cita',
      };
    }
  },

  /**
   * Actualiza los datos de una cita existente.
   *
   * Consumido por: useCitaForm → citaService.actualizar(formData)
   *
   * @param {object} datosCita - Datos de la cita (debe incluir id_cita).
   * @returns {Promise<{success: boolean, data: object|null, message: string}>}
   */
  actualizar: async (datosCita) => {
    try {
      const response = await api.post('/citas/actualizar', datosCita);
      const data     = response.data;

      return {
        success: data.exito === true || data.estado === 'exito',
        data:    data.datos || null,
        message: data.mensaje || 'Cita actualizada correctamente',
      };
    } catch (error) {
      console.error('[CitaService] actualizar:', error.message);
      return {
        success: false,
        data:    null,
        message: error.normalizedMessage || 'Error al actualizar la cita',
      };
    }
  },

  /**
   * Cancela/desactiva una cita (borrado lógico).
   *
   * @param {number|string} id_cita - ID de la cita a desactivar.
   * @returns {Promise<{success: boolean, message: string}>}
   */
  desactivar: async (id_cita) => {
    try {
      const response = await api.post('/citas/eliminar', { id_cita });
      const data     = response.data;

      return {
        success: data.exito === true || data.estado === 'exito',
        message: data.mensaje || 'Cita cancelada correctamente',
      };
    } catch (error) {
      console.error('[CitaService] desactivar:', error.message);
      return {
        success: false,
        message: error.normalizedMessage || 'Error al cancelar la cita',
      };
    }
  },
};

export default citaService;
