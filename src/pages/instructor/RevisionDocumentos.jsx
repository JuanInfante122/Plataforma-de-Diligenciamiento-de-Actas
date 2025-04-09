import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';
import { useNavigate } from 'react-router-dom';

const RevisionDocumentos = () => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [documentoSeleccionado, setDocumentoSeleccionado] = useState(null);
  const [comentario, setComentario] = useState('');
  const [showFirmaModal, setShowFirmaModal] = useState(false);
  const [loadingFirma, setLoadingFirma] = useState(false);
  const [firmaSeleccionada, setFirmaSeleccionada] = useState(null);
  const navigate = useNavigate();
  
  // Obtener el usuario del localStorage de forma segura
  const usuario = (() => {
    try {
      const usuarioGuardado = localStorage.getItem('usuario');
      if (!usuarioGuardado) return null;
      
      const usuarioParsed = JSON.parse(usuarioGuardado);
      console.log('Usuario recuperado:', usuarioParsed);
      return usuarioParsed;
    } catch (error) {
      console.error('Error al obtener usuario del localStorage:', error);
      return null;
    }
  })();

  useEffect(() => {
    // Validar que sea un instructor
    if (!usuario) {
      setError('No se ha encontrado la información del usuario');
      setLoading(false);
      return;
    }

    if (usuario.rol !== 'INSTRUCTOR') {
      setError('Acceso no autorizado. Solo instructores pueden acceder a esta página.');
      setLoading(false);
      return;
    }

    console.log('ID del instructor:', usuario.id);
    cargarDocumentos();
  }, []);

  const cargarDocumentos = async () => {
    if (!usuario?.id) {
      console.error('No hay ID de instructor disponible');
      return;
    }

    try {
      setLoading(true);
      console.log('Solicitando documentos para instructor:', usuario.id);
      const response = await axios.get(API_ENDPOINTS.documentosPendientes(usuario.id));
      console.log('Documentos cargados:', response.data);
      setDocumentos(response.data);
    } catch (error) {
      console.error('Error al cargar documentos:', error);
      setError('Error al cargar los documentos pendientes');
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = (documento) => {
    setDocumentoSeleccionado(documento);
    setComentario('');
  };

  const obtenerFirmaInstructor = async () => {
    try {
      setLoadingFirma(true);
      const response = await axios.get(API_ENDPOINTS.obtenerFirmaInstructor(usuario.id));
      if (response.data.firma) {
        setFirmaSeleccionada(response.data.firma);
      } else {
        setError('No se encontró una firma registrada. Por favor, configure su firma primero.');
      }
    } catch (error) {
      console.error('Error al obtener firma:', error);
      setError('Error al obtener la firma');
    } finally {
      setLoadingFirma(false);
    }
  };

  const handleRevisar = async (estado) => {
    if (!comentario.trim()) {
      alert('Por favor, agregue un comentario para la revisión');
      return;
    }

    try {
      if (estado === 'APROBADO') {
        setShowFirmaModal(true);
        obtenerFirmaInstructor();
      } else {
        await enviarRevision(estado);
      }
    } catch (error) {
      console.error('Error al revisar documento:', error);
      setError('Error al procesar la revisión');
    }
  };

  const enviarRevision = async (estado, firma = null) => {
    if (!usuario?.id) {
      setError('No se ha encontrado la información del instructor');
      return;
    }
    
    try {
      const data = {
        documento_id: documentoSeleccionado.id,
        estado,
        comentario,
        firma,
        instructor_id: usuario.id
      };

      console.log('Enviando revisión:', data); // Debug

      const endpoint = estado === 'APROBADO' 
        ? API_ENDPOINTS.aprobarDocumento 
        : API_ENDPOINTS.rechazarDocumento;

      const response = await axios.post(endpoint, data);
      console.log('Respuesta del servidor:', response.data); // Debug

      if (response.data.success) {
        setDocumentos(documentos.filter(doc => doc.id !== documentoSeleccionado.id));
        setDocumentoSeleccionado(null);
        setShowFirmaModal(false);
        setComentario('');
      } else {
        setError(response.data.message || 'Error al enviar la revisión');
      }
    } catch (error) {
      console.error('Error al enviar revisión:', error);
      setError('Error al enviar la revisión: ' + (error.response?.data?.message || error.message));
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        <p>{error}</p>
        {!usuario && (
          <button
            onClick={() => navigate('/login')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Ir al Login
          </button>
        )}
        {usuario && (
          <button
            onClick={cargarDocumentos}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Intentar Nuevamente
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Revisión de Documentos</h2>
      
      {!documentoSeleccionado ? (
        <div className="grid gap-6">
          {documentos.map((documento) => (
            <div key={documento.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{documento.titulo}</h3>
                  <p className="text-gray-600">Aprendiz: {documento.nombre_aprendiz}</p>
                  <p className="text-gray-600">
                    Ficha: {documento.numero_ficha || 'No especificada'}
                  </p>
                  <p className="text-gray-600">
                    Programa: {documento.programa_formacion}
                  </p>
                  <p className="text-gray-600">Fecha: {new Date(documento.fecha).toLocaleDateString()}</p>
                </div>
                <button
                  onClick={() => handleVerDetalle(documento)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  Revisar
                </button>
              </div>
            </div>
          ))}

          {documentos.length === 0 && (
            <div className="text-center p-8 bg-white rounded-lg shadow-md">
              <p className="text-gray-600">No hay documentos pendientes de revisión</p>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-xl font-semibold mb-2">{documentoSeleccionado.titulo}</h3>
              <p className="text-gray-600">Aprendiz: {documentoSeleccionado.nombre_aprendiz}</p>
              <p className="text-gray-600">Ficha: {documentoSeleccionado.numero_ficha || 'No especificada'}</p>
              <p className="text-gray-600">Programa: {documentoSeleccionado.programa_formacion}</p>
            </div>
            <button
              onClick={() => setDocumentoSeleccionado(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contenido del documento */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2">Contenido del Documento</h4>
            <div className="bg-gray-50 p-4 rounded">
              {documentoSeleccionado.contenido && Object.entries(documentoSeleccionado.contenido).map(([campo, valor]) => (
                <div key={campo} className="mb-2">
                  <strong className="text-gray-700">{campo}:</strong> {valor}
                </div>
              ))}
              {!documentoSeleccionado.contenido && (
                <p>No hay contenido detallado disponible para este documento.</p>
              )}
            </div>
          </div>

          {/* Descripción del documento */}
          {documentoSeleccionado.descripcion && (
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Descripción</h4>
              <div className="bg-gray-50 p-4 rounded">
                <p>{documentoSeleccionado.descripcion}</p>
              </div>
            </div>
          )}

          {/* Comentario de revisión */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Comentario de Revisión
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows="4"
              placeholder="Agregue un comentario sobre la revisión..."
            ></textarea>
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => handleRevisar('RECHAZADO')}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
            >
              Rechazar
            </button>
            <button
              onClick={() => handleRevisar('APROBADO')}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Aprobar
            </button>
          </div>
        </div>
      )}

      {/* Modal de firma */}
      {showFirmaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirmar Firma</h3>
            
            {loadingFirma ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : firmaSeleccionada ? (
              <div className="border rounded-lg p-4 mb-4">
                <img src={firmaSeleccionada} alt="Firma" className="max-w-full" />
              </div>
            ) : (
              <div className="text-center py-4 text-red-600">
                No se encontró una firma registrada
              </div>
            )}

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowFirmaModal(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
              >
                Cancelar
              </button>
              {firmaSeleccionada && (
                <button
                  onClick={() => enviarRevision('APROBADO', firmaSeleccionada)}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Confirmar y Aprobar
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RevisionDocumentos;
