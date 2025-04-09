const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const API_ENDPOINTS = {
  // Endpoints de autenticación y validación
  validar: `${API_BASE_URL}/validar`,
  
  // Endpoints de plantillas
  plantillas: (rol) => `${API_BASE_URL}/plantillas/${rol}`,
  
  // Endpoints de documentos
  documento: (aprendizId, plantillaId) => `${API_BASE_URL}/documento/${aprendizId}/${plantillaId}`,
  documentosAprendiz: (aprendizId) => `${API_BASE_URL}/documentos-aprendiz/${aprendizId}`,
  guardarDocumento: `${API_BASE_URL}/guardar-documento`,
  
  // Endpoints de perfiles
  perfilAprendiz: (aprendizId) => `${API_BASE_URL}/perfil-aprendiz/${aprendizId}`,
  perfilInstructor: (instructorId) => `${API_BASE_URL}/perfil-instructor/${instructorId}`,
  
  // Endpoints de estadísticas
  estadisticasInstructor: (instructorId) => 
    instructorId 
      ? `${API_BASE_URL}/estadisticas-instructor/${instructorId}`
      : `${API_BASE_URL}/estadisticas-instructor`,
  
  // Endpoints de revisión de documentos
  documentosPendientes: (instructorId) => `${API_BASE_URL}/documentos-pendientes/${instructorId}`,
  aprobarDocumento: `${API_BASE_URL}/aprobar-documento`,
  rechazarDocumento: `${API_BASE_URL}/rechazar-documento`,
  
  // Endpoints de gestión de firmas
  guardarFirma: `${API_BASE_URL}/guardar-firma`,
  obtenerFirmas: (documentoId) => `${API_BASE_URL}/firmas/${documentoId}`,
  obtenerFirmaInstructor: (instructorId) => `${API_BASE_URL}/firma-instructor/${instructorId}`,
  guardarFirmaInstructor: `${API_BASE_URL}/guardar-firma-instructor`,
  
  // Endpoints de notificaciones
  notificaciones: (usuarioId) => `${API_BASE_URL}/notificaciones/${usuarioId}`,
  marcarNotificacionLeida: `${API_BASE_URL}/marcar-notificacion-leida`,
  contadorNotificaciones: (usuarioId) => `${API_BASE_URL}/contador-notificaciones/${usuarioId}`,
  borrarNotificacion: `${API_BASE_URL}/borrar-notificacion`,
  
  // Endpoints de gestión de aprendices
  aprendicesInstructor: (instructorId) => `${API_BASE_URL}/aprendices-instructor/${instructorId}`,
  
  // Endpoints de reportes
  reportesRecientes: (usuarioId) => `${API_BASE_URL}/reportes-recientes/${usuarioId}`,
  generarReporte: `${API_BASE_URL}/generar-reporte`,
  descargarReporte: (reporteId) => `${API_BASE_URL}/descargar-reporte/${reporteId}`
};
export default API_BASE_URL;
