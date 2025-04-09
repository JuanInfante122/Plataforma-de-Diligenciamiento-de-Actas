import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import SignatureCanvas from 'react-signature-canvas';
import { API_ENDPOINTS } from '../config/api';

const FormularioDocumentacion = ({ rol, aprendizID }) => {
  const [plantillas, setPlantillas] = useState([]);
  const [plantillaSeleccionada, setPlantillaSeleccionada] = useState(null);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const sigCanvas = useRef(null);

  // Cargar plantillas disponibles
  useEffect(() => {
    const cargarPlantillas = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_ENDPOINTS.plantillas(rol));
        console.log('Plantillas cargadas:', response.data); // Debug log
        setPlantillas(response.data);
      } catch (error) {
        console.error('Error al cargar plantillas:', error);
        setError('No se pudieron cargar las plantillas disponibles');
      } finally {
        setLoading(false);
      }
    };
    cargarPlantillas();
  }, [rol]);

  // Cargar datos del documento si existe
  useEffect(() => {
    const cargarDocumento = async () => {
      if (!plantillaSeleccionada) return;

      try {
        setLoading(true);
        const response = await axios.get(
          API_ENDPOINTS.documento(aprendizID, plantillaSeleccionada.id)
        );
        if (response.data) {
          setFormData(response.data.contenido);
        } else {
          // Inicializar con valores por defecto según la estructura de la plantilla
          const contenidoInicial = {};
          plantillaSeleccionada.estructura.campos.forEach(campo => {
            contenidoInicial[campo.nombre] = '';
          });
          setFormData(contenidoInicial);
        }
      } catch (error) {
        console.error('Error al cargar documento:', error);
        setError('Error al cargar el documento');
      } finally {
        setLoading(false);
      }
    };

    cargarDocumento();
  }, [aprendizID, plantillaSeleccionada]);

  const handlePlantillaChange = (e) => {
    const plantillaId = parseInt(e.target.value);
    if (!plantillaId) {
      setPlantillaSeleccionada(null);
      return;
    }
    const plantilla = plantillas.find(p => p.id === plantillaId);
    console.log('Plantilla seleccionada:', plantilla); // Debug log
    setPlantillaSeleccionada(plantilla);
    // Limpiar el formulario al cambiar de plantilla
    setFormData({});
    if (sigCanvas.current) {
      sigCanvas.current.clear();
    }
  };

  const handleInputChange = (e, campo) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const renderCampo = (campo) => {
    if (!campo || !campo.tipo) {
      console.error('Campo inválido:', campo);
      return null;
    }

    switch (campo.tipo) {
      case 'texto':
        return (
          <input
            type="text"
            name={campo.nombre}
            value={formData[campo.nombre] || ''}
            onChange={(e) => handleInputChange(e, campo)}
            className="w-full p-2 border rounded"
            placeholder={campo.etiqueta}
            required={campo.requerido}
          />
        );
      case 'textarea':
        return (
          <textarea
            name={campo.nombre}
            value={formData[campo.nombre] || ''}
            onChange={(e) => handleInputChange(e, campo)}
            className="w-full p-2 border rounded"
            placeholder={campo.etiqueta}
            required={campo.requerido}
            rows={4}
          />
        );
      case 'select':
        return (
          <select
            name={campo.nombre}
            value={formData[campo.nombre] || ''}
            onChange={(e) => handleInputChange(e, campo)}
            className="w-full p-2 border rounded"
            required={campo.requerido}
          >
            <option value="">Seleccione una opción</option>
            {campo.opciones && campo.opciones.map((opcion, index) => (
              <option key={index} value={opcion}>{opcion}</option>
            ))}
          </select>
        );
      case 'fecha':
        return (
          <input
            type="date"
            name={campo.nombre}
            value={formData[campo.nombre] || ''}
            onChange={(e) => handleInputChange(e, campo)}
            className="w-full p-2 border rounded"
            required={campo.requerido}
          />
        );
      default:
        console.warn(`Tipo de campo no soportado: ${campo.tipo}`);
        return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!plantillaSeleccionada) {
      setError('Por favor seleccione una plantilla');
      return;
    }

    try {
      setLoading(true);
      const documentoData = {
        plantilla_id: plantillaSeleccionada.id,
        aprendiz_id: aprendizID,
        contenido: formData,
        firma: sigCanvas.current ? sigCanvas.current.toDataURL() : null
      };

      console.log('Enviando documento:', documentoData); // Debug log

      const response = await axios.post(API_ENDPOINTS.guardarDocumento, documentoData);
      
      if (response.data.success) {
        alert('Documento guardado exitosamente');
        // Limpiar el formulario después de guardar
        setFormData({});
        setPlantillaSeleccionada(null);
        if (sigCanvas.current) {
          sigCanvas.current.clear();
        }
      } else {
        setError(response.data.message || 'Error al guardar el documento');
      }
    } catch (error) {
      console.error('Error al guardar el documento:', error);
      setError(error.response?.data?.message || 'Error al guardar el documento');
    } finally {
      setLoading(false);
    }
  };

  // Renderizado condicional para el estado de carga inicial
  if (loading && plantillas.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-6">Formulario de Documentación</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-6">
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Seleccione el tipo de documento:
        </label>
        <select
          onChange={handlePlantillaChange}
          className="w-full p-2 border rounded"
          value={plantillaSeleccionada?.id || ''}
          disabled={loading}
        >
          <option value="">Seleccione una plantilla</option>
          {plantillas.map(plantilla => (
            <option key={plantilla.id} value={plantilla.id}>
              {plantilla.titulo}
            </option>
          ))}
        </select>
      </div>

      {plantillaSeleccionada && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {plantillaSeleccionada.estructura.campos.map((campo, index) => (
            <div key={index} className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                {campo.etiqueta}
                {campo.requerido && <span className="text-red-500">*</span>}
              </label>
              {renderCampo(campo)}
            </div>
          ))}

          {/* Sección de firma */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Firma</h3>
            <SignatureCanvas
              ref={sigCanvas}
              penColor="black"
              canvasProps={{
                width: 500,
                height: 200,
                className: 'border border-gray-300 rounded'
              }}
            />
            <div className="mt-2 space-x-2">
              <button
                type="button"
                onClick={() => sigCanvas.current.clear()}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Limpiar Firma
              </button>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="submit"
              disabled={loading}
              className={`px-6 py-2 text-white rounded ${
                loading 
                  ? 'bg-blue-300 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {loading ? 'Guardando...' : 'Guardar Documento'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default FormularioDocumentacion;
