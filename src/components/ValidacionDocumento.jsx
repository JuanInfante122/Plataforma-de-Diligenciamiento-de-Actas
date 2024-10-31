// src/components/ValidacionDocumento.jsx
import React, { useState } from 'react';
import axios from 'axios';

const ValidacionDocumento = ({ onValidacionExitosa }) => {
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/validar', {
        tipoDocumento,
        numeroDocumento,
      });

      if (response.data.accesoPermitido) {
        // Pasa el rol y aprendizID al componente principal
        onValidacionExitosa(response.data.rol, response.data.aprendizID);
      } else {
        setError('Documento no válido. Verifique su información.');
      }
    } catch (err) {
      console.error(err);
      setError('Hubo un error en la validación.');
    }
  };

  return (
    <div className="w-full max-w-md p-6 mx-auto">
      <h2 className="text-2xl font-bold mb-6">Validación de Documento</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <label className="block mb-2">
          Tipo de Documento:
          <select
            value={tipoDocumento}
            onChange={(e) => setTipoDocumento(e.target.value)}
            className="block w-full p-2 border rounded"
          >
            <option value="">Seleccionar</option>
            <option value="CÉDULA DE CIUDADANÍA">Cédula de Ciudadanía</option>
            <option value="TARJETA DE IDENTIDAD">Tarjeta de Identidad</option>
            <option value="PASAPORTE">Pasaporte</option>
            {/* Agregar otros tipos de documentos necesarios */}
          </select>
        </label>
        <label className="block mb-4">
          Número de Documento:
          <input
            type="text"
            value={numeroDocumento}
            onChange={(e) => setNumeroDocumento(e.target.value)}
            className="block w-full p-2 border rounded"
          />
        </label>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
          Validar Documento
        </button>
      </form>
    </div>
  );
};

export default ValidacionDocumento;
