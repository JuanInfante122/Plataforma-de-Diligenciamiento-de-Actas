import React, { useState, useRef, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const GestionFirma = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firmaActual, setFirmaActual] = useState(null);
  const [showCanvas, setShowCanvas] = useState(false);
  const sigCanvas = useRef(null);

  // Obtener el usuario del localStorage
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
    if (usuario?.id) {
      cargarFirma();
    } else {
      setError('No se encontró información del usuario');
      setLoading(false);
    }
  }, []);

  const cargarFirma = async () => {
    try {
      setLoading(true);
      console.log('Solicitando firma para instructor:', usuario.id);
      const response = await axios.get(API_ENDPOINTS.obtenerFirmaInstructor(usuario.id));
      console.log('Respuesta de firma:', response.data);
      if (response.data.firma) {
        setFirmaActual(response.data.firma);
      }
    } catch (error) {
      console.error('Error al cargar firma:', error);
      setError('Error al cargar la firma');
    } finally {
      setLoading(false);
    }
  };

  const guardarFirma = async () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      alert('Por favor, dibuje su firma antes de guardar');
      return;
    }

    try {
      setLoading(true);
      const firma = sigCanvas.current.toDataURL();
      console.log('Guardando firma para instructor:', usuario.id);
      const response = await axios.post(API_ENDPOINTS.guardarFirmaInstructor, {
        instructor_id: usuario.id,
        firma
      });
      
      if (response.data.success) {
        setFirmaActual(firma);
        setShowCanvas(false);
        alert('Firma guardada exitosamente');
      } else {
        throw new Error(response.data.message || 'Error al guardar la firma');
      }
    } catch (error) {
      console.error('Error al guardar firma:', error);
      setError('Error al guardar la firma');
    } finally {
      setLoading(false);
    }
  };

  if (!usuario) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded-lg">
        No se ha encontrado información del usuario. Por favor, inicie sesión nuevamente.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-gray-800">Gestión de Firma Digital</h2>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Firma Actual */}
      {firmaActual && !showCanvas && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Firma Actual</h3>
          <div className="border rounded-lg p-4">
            <img 
              src={firmaActual} 
              alt="Firma actual" 
              className="max-w-md mx-auto"
            />
          </div>
          <button
            onClick={() => setShowCanvas(true)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Modificar Firma
          </button>
        </div>
      )}

      {/* Canvas para nueva firma */}
      {(showCanvas || !firmaActual) && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">
            {firmaActual ? 'Nueva Firma' : 'Crear Firma'}
          </h3>
          <div className="border rounded-lg p-4 bg-white">
            <SignatureCanvas
              ref={sigCanvas}
              canvasProps={{
                width: 500,
                height: 200,
                className: 'signature-canvas border rounded'
              }}
            />
          </div>
          <div className="flex space-x-4">
            <button
              onClick={() => sigCanvas.current.clear()}
              className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600"
            >
              Limpiar
            </button>
            {firmaActual && (
              <button
                onClick={() => setShowCanvas(false)}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                Cancelar
              </button>
            )}
            <button
              onClick={guardarFirma}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            >
              Guardar Firma
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GestionFirma;
