import React from 'react';
import { useNavigate } from 'react-router-dom';

const ErrorAcceso = ({ mensaje }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Error de Acceso
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {mensaje || 'No tienes acceso a esta sección'}
          </p>
        </div>
        <div className="mt-5 text-center">
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorAcceso;