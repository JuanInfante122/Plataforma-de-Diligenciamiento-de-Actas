// src/components/ValidacionDocumento.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const ValidacionDocumento = ({ onValidacionExitosa }) => {
  const [tipoDocumento, setTipoDocumento] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Colores del diseño
  const colors = {
    primary: '#2C3E50',    // Azul oscuro
    secondary: '#E74C3C',  // Rojo
    accent: '#3498DB',     // Azul claro
    background: '#ECF0F1', // Gris claro
    text: '#2C3E50',       // Azul oscuro para texto
    white: '#FFFFFF'       // Blanco
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!tipoDocumento || !numeroDocumento) {
      setError('Por favor complete todos los campos');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Enviando petición a:', API_ENDPOINTS.validar);
      console.log('Datos:', { tipoDocumento, numeroDocumento });

      const response = await axios.post(API_ENDPOINTS.validar, {
        tipoDocumento,
        numeroDocumento
      });

      console.log('Respuesta recibida:', response.data);

      if (response.data.accesoPermitido) {
        // Guardar información completa del usuario
        const usuarioData = {
          id: response.data.id,
          rol: response.data.rol,
          nombres: response.data.nombres,
          apellidos: response.data.apellidos,
          email: response.data.email,
          tipoDocumento: response.data.tipoDocumento,
          numeroDocumento: response.data.numeroDocumento,
          telefono: response.data.telefono
        };

        // Guardar en localStorage
        try {
          localStorage.setItem('usuario', JSON.stringify(usuarioData));
          console.log('Usuario guardado en localStorage:', usuarioData);
        } catch (error) {
          console.error('Error al guardar en localStorage:', error);
        }

        onValidacionExitosa(response.data.rol, response.data.id);
      } else {
        setError(response.data.mensaje || 'Documento no válido. Verifique su información.');
      }
    } catch (err) {
      console.error('Error detallado:', err);
      
      if (err.code === 'ECONNABORTED') {
        setError('La conexión ha tardado demasiado. Por favor intente nuevamente.');
      } else if (err.code === 'ERR_NETWORK') {
        setError('No se puede conectar al servidor. Por favor verifique su conexión.');
      } else {
        setError('Error en la validación. Por favor intente nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: colors.background }}
    >
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg">
        <div>
          <h2 
            className="text-center text-3xl font-extrabold"
            style={{ color: colors.primary }}
          >
            Validación de Documento
          </h2>
          <p 
            className="mt-2 text-center text-sm"
            style={{ color: colors.text }}
          >
            Ingrese sus datos para continuar
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm" style={{ color: colors.secondary }}>{error}</p>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text }}
              >
                Tipo de Documento
              </label>
              <select
                value={tipoDocumento}
                onChange={(e) => setTipoDocumento(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                style={{ borderColor: colors.primary }}
              >
                <option value="">Seleccionar</option>
                <option value="CÉDULA DE CIUDADANÍA">Cédula de Ciudadanía</option>
                <option value="TARJETA DE IDENTIDAD">Tarjeta de Identidad</option>
                <option value="PASAPORTE">Pasaporte</option>
              </select>
            </div>

            <div className="mb-4">
              <label 
                className="block text-sm font-medium mb-2"
                style={{ color: colors.text }}
              >
                Número de Documento
              </label>
              <input
                type="text"
                value={numeroDocumento}
                onChange={(e) => setNumeroDocumento(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                style={{ borderColor: colors.primary }}
                placeholder="Ingrese su número de documento"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200"
              style={{ 
                backgroundColor: isLoading ? colors.accent : colors.primary,
                opacity: isLoading ? 0.7 : 1
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Validando...
                </span>
              ) : (
                'Validar Documento'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ValidacionDocumento;
