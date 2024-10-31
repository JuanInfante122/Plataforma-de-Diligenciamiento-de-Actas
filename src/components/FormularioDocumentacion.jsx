// src/components/FormularioDocumentacion.jsx
import React, { useContext, useRef } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { AppContext } from '../context/AppContext';
import axios from 'axios';


const FormularioDocumentacion = () => {
  const { formData, setFormData } = useContext(AppContext);
  const sigCanvasAprendiz = useRef(null);
  const sigCanvasJefe = useRef(null);
  const sigCanvasInstructor = useRef(null);

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
    } catch (error) {
      console.error('Error al guardar y enviar el PDF:', error);
    }
  };

  return (
    <div className="w-1/2 p-6 bg-white shadow-lg rounded-lg overflow-y-auto h-screen">

        <h2 className="text-2xl font-bold mb-6">Formulario de Planeación y Evaluación de Etapa Productiva</h2>

    {/* Información General */}
    <section className="mb-4">
        <h3 className="text-lg font-semibold mb-2">1. Información General</h3>
        
        <label className="block mb-2">
          Regional:
          <input
            type="text"
            name="regional"
            value={formData.regional}
            onChange={handleChange}
            className="block w-full p-2 border rounded"
          />
        </label>
        <label className="block mb-2">
          Centro de Formación:
          <input
            type="text"
            name="centroFormacion"
            value={formData.centroFormacion}
            onChange={handleChange}
            className="block w-full p-2 border rounded"
          />
        </label>
        <label className="block mb-2">
          Programa de Formación:
          <input
            type="text"
            name="programaFormacion"
            value={formData.programaFormacion}
            onChange={handleChange}
            className="block w-full p-2 border rounded"
          />
        </label>
        <label className="block mb-2">
          No. Ficha:
          <input
            type="text"
            name="noFicha"
            value={formData.noFicha}
            onChange={handleChange}
            className="block w-full p-2 border rounded"
          />
        </label>

        <label className="block mb-2">
          Modalidad de Formación:
          <select
            name="modalidadFormacion"
            value={formData.modalidadFormacion}
            onChange={handleChange}
            className="block w-full p-2 border rounded"
          >
            <option value="">Seleccionar</option>
            <option value="Presencial">Presencial</option>
            <option value="Virtual">Virtual</option>
            <option value="Distancia">A Distancia</option>
          </select>
        </label>
    </section>
    {/* Información del Aprendiz */}
    <section className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Datos del Aprendiz</h3>
        
        <label className="block mb-2">
          Nombre Completo:
          <input
            type="text"
            name="nombreAprendiz"
            value={formData.nombreAprendiz}
            onChange={handleChange}
            className="block w-full p-2 border rounded"
          />
        </label>

        <label className="block mb-2">
          Tipo de Documento:
          <select
            name="tipoDocumento"
            value={formData.tipoDocumento}
            onChange={handleChange}
            className="block w-full p-2 border rounded"
          >
            <option value="">Seleccionar</option>
            <option value="NUIP">NUIP</option>
            <option value="Tarjeta de Identidad">Tarjeta de Identidad</option>
            <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
            <option value="Cédula Digital">Cédula Digital</option>
            <option value="Cédula de Extranjería">Cédula de Extranjería</option>
            <option value="Permiso Especial Permanente">Permiso Especial Permanente</option>
          </select>
        </label>

        <label className="block mb-2">
          Número de Identificación:
          <input
            type="text"
            name="noIdentificacion"
            value={formData.noIdentificacion}
            onChange={handleChange}
            className="block w-full p-2 border rounded"
          />
        </label>
        
        {/* Añadir más campos... */}
      </section>
      {/* Sección Firma Aprendiz */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Firma del Aprendiz</h3>
        <SignatureCanvas ref={sigCanvasAprendiz} penColor="black" canvasProps={{ width: 300, height: 100, className: 'border border-gray-400' }} />
        <div className="mt-2">
          <button onClick={() => handleSignatureSave(sigCanvasAprendiz, 'firmaAprendizURL')} className="px-4 py-2 bg-blue-500 text-white rounded mr-2">Guardar Firma</button>
          <button onClick={() => clearSignature(sigCanvasAprendiz)} className="px-4 py-2 bg-red-500 text-white rounded">Borrar</button>
        </div>
      </section>

      {/* Sección Firma Jefe */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Firma del Jefe Inmediato</h3>
        <SignatureCanvas ref={sigCanvasJefe} penColor="black" canvasProps={{ width: 300, height: 100, className: 'border border-gray-400' }} />
        <div className="mt-2">
          <button onClick={() => handleSignatureSave(sigCanvasJefe, 'firmaJefeURL')} className="px-4 py-2 bg-blue-500 text-white rounded mr-2">Guardar Firma</button>
          <button onClick={() => clearSignature(sigCanvasJefe)} className="px-4 py-2 bg-red-500 text-white rounded">Borrar</button>
        </div>
      </section>

      {/* Sección Firma Instructor */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Firma del Instructor</h3>
        <SignatureCanvas ref={sigCanvasInstructor} penColor="black" canvasProps={{ width: 300, height: 100, className: 'border border-gray-400' }} />
        <div className="mt-2">
          <button onClick={() => handleSignatureSave(sigCanvasInstructor, 'firmaInstructorURL')} className="px-4 py-2 bg-blue-500 text-white rounded mr-2">Guardar Firma</button>
          <button onClick={() => clearSignature(sigCanvasInstructor)} className="px-4 py-2 bg-red-500 text-white rounded">Borrar</button>
        </div>

        <button onClick={handleSave} className="px-4 py-2 bg-green-500 text-white rounded mt-4">
            Guardar y Enviar PDF
        </button>
      </section>
    </div>
  );
};

export default FormularioDocumentacion;
