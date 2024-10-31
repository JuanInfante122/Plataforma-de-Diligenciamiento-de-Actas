// src/components/FormularioDocumentacion.jsx
import axios from 'axios';
import React, { useContext, useEffect, useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { AppContext } from '../context/AppContext';

const FormularioDocumentacion = ({ rol, aprendizID }) => {
  const { formData, setFormData } = useContext(AppContext);
  const sigCanvasAprendiz = useRef(null);
  const sigCanvasJefe = useRef(null);
  const sigCanvasInstructor = useRef(null);
  const [documentoCargado, setDocumentoCargado] = useState(false); // Estado para verificar si hay documento guardado

  useEffect(() => {
    const cargarDatosGuardados = async () => {
      try {
        // Llamada a la API para obtener los datos del aprendiz específico por ID
        const response = await axios.get(`http://localhost:5000/documento/${aprendizID}`);
        if (response.data) {
          setFormData(response.data);
          setDocumentoCargado(true); // Documento cargado con éxito
        } else {
          setFormData({}); // Si no hay datos, inicializar en blanco
          setDocumentoCargado(false);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setFormData({}); // Si no hay documento guardado, inicializa vacío
          setDocumentoCargado(false);
        } else {
          console.error('Error al cargar datos guardados:', error);
        }
      }
    };
    cargarDatosGuardados();
  }, [setFormData, aprendizID]);

  const handleSignatureSave = (sigCanvasRef, fieldName) => {
    if (sigCanvasRef.current) {
      const signatureURL = sigCanvasRef.current.toDataURL();
      setFormData((prevData) => ({
        ...prevData,
        [fieldName]: signatureURL,
      }));
    }
  };

  const clearSignature = (sigCanvasRef) => {
    if (sigCanvasRef.current) {
      sigCanvasRef.current.clear();
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await axios.post('http://localhost:5000/guardar', formData);
      alert('Datos guardados y PDF enviado por correo.');
      setDocumentoCargado(true); // Después de guardar, el documento ya está disponible
    } catch (error) {
      console.error('Error al guardar y enviar el PDF:', error);
    }
  };

  return (
    <div className="w-full max-w-2xl p-6 bg-white shadow-lg rounded-lg overflow-y-auto">
      <h2 className="text-2xl font-bold mb-6">Formulario de Planeación y Evaluación de Etapa Productiva</h2>

      {/* Mostrar mensaje si no hay documento guardado y el rol es Jefe o Instructor */}
      {!documentoCargado && (rol === 'Jefe' || rol === 'Instructor') && (
        <p className="text-gray-600 mb-4">No hay datos disponibles para visualizar. El Aprendiz debe completar el formulario.</p>
      )}

      {/* Información General - visible para Aprendiz y siempre editable */}
      {(rol === 'Aprendiz' || documentoCargado) && (
        <section className="mb-4">
          <h3 className="text-lg font-semibold mb-2">1. Información General</h3>
          <label className="block mb-2">
            Regional:
            <input
              type="text"
              name="regional"
              value={formData.regional || ''}
              onChange={handleChange}
              className="block w-full p-2 border rounded"
              disabled={rol !== 'Aprendiz'}
            />
          </label>
          <label className="block mb-2">
            Centro de Formación:
            <input
              type="text"
              name="centroFormacion"
              value={formData.centroFormacion || ''}
              onChange={handleChange}
              className="block w-full p-2 border rounded"
              disabled={rol !== 'Aprendiz'}
            />
          </label>
          {/* Agrega más campos según sea necesario */}
        </section>
      )}

      {/* Información del Aprendiz - siempre visible para Aprendiz y editable */}
      {(rol === 'Aprendiz' || documentoCargado) && (
        <section className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Datos del Aprendiz</h3>
          <label className="block mb-2">
            Nombre Completo:
            <input
              type="text"
              name="nombreAprendiz"
              value={formData.nombreAprendiz || ''}
              onChange={handleChange}
              className="block w-full p-2 border rounded"
              disabled={rol !== 'Aprendiz'}
            />
          </label>
          {/* Otros campos adicionales */}
        </section>
      )}

      {/* Sección Firma Aprendiz */}
      {rol === 'Aprendiz' && (
        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Firma del Aprendiz</h3>
          <SignatureCanvas ref={sigCanvasAprendiz} penColor="black" canvasProps={{ width: 300, height: 100, className: 'border border-gray-400' }} />
          <div className="mt-2">
            <button onClick={() => handleSignatureSave(sigCanvasAprendiz, 'firmaAprendizURL')} className="px-4 py-2 bg-blue-500 text-white rounded mr-2">Guardar Firma</button>
            <button onClick={() => clearSignature(sigCanvasAprendiz)} className="px-4 py-2 bg-red-500 text-white rounded">Borrar</button>
          </div>
        </section>
      )}

      {/* Sección Firma Jefe */}
      {rol === 'Jefe' && (
        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Firma del Jefe Inmediato</h3>
          <SignatureCanvas ref={sigCanvasJefe} penColor="black" canvasProps={{ width: 300, height: 100, className: 'border border-gray-400' }} />
          <div className="mt-2">
            <button onClick={() => handleSignatureSave(sigCanvasJefe, 'firmaJefeURL')} className="px-4 py-2 bg-blue-500 text-white rounded mr-2">Guardar Firma</button>
            <button onClick={() => clearSignature(sigCanvasJefe)} className="px-4 py-2 bg-red-500 text-white rounded">Borrar</button>
          </div>
        </section>
      )}

      {/* Sección Firma Instructor */}
      {rol === 'Instructor' && (
        <section className="mb-8">
          <h3 className="text-lg font-semibold mb-4">Firma del Instructor</h3>
          <SignatureCanvas ref={sigCanvasInstructor} penColor="black" canvasProps={{ width: 300, height: 100, className: 'border border-gray-400' }} />
          <div className="mt-2">
            <button onClick={() => handleSignatureSave(sigCanvasInstructor, 'firmaInstructorURL')} className="px-4 py-2 bg-blue-500 text-white rounded mr-2">Guardar Firma</button>
            <button onClick={() => clearSignature(sigCanvasInstructor)} className="px-4 py-2 bg-red-500 text-white rounded">Borrar</button>
          </div>
        </section>
      )}

      {/* Guardar y Enviar PDF */}
      {rol === 'Aprendiz' && (
        <button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white rounded mt-4">
          Guardar y Enviar PDF
        </button>
      )}
    </div>
  );
};

export default FormularioDocumentacion;
