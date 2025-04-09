import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const PerfilAprendiz = ({ aprendizID }) => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarPerfil = async () => {
      try {
        setLoading(true);
        const response = await axios.get(API_ENDPOINTS.perfilAprendiz(aprendizID));
        setPerfil(response.data);
      } catch (error) {
        console.error('Error al cargar perfil:', error);
        setError('Error al cargar la información del perfil');
      } finally {
        setLoading(false);
      }
    };

    if (aprendizID) {
      cargarPerfil();
    }
  }, [aprendizID]);

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
        {error}
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-700 rounded-lg">
        No se encontró información del perfil
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Encabezado */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
        <h2 className="text-2xl font-bold text-white">Perfil del Aprendiz</h2>
      </div>

      <div className="p-6">
        {/* Información Personal */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
            Información Personal
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nombres</p>
              <p className="font-medium">{perfil.nombres}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Apellidos</p>
              <p className="font-medium">{perfil.apellidos}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Tipo de Documento</p>
              <p className="font-medium">{perfil.tipo_documento}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Número de Documento</p>
              <p className="font-medium">{perfil.numero_documento}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{perfil.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Teléfono</p>
              <p className="font-medium">{perfil.telefono || 'No registrado'}</p>
            </div>
          </div>
        </div>

        {/* Información Académica */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
            Información Académica
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Programa de Formación</p>
              <p className="font-medium">{perfil.programa_formacion}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Número de Ficha</p>
              <p className="font-medium">{perfil.numero_ficha}</p>
            </div>
          </div>
        </div>

        {/* Información de Contacto Instructor y Jefe */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Instructor */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-blue-800 mb-3">
              Instructor Asignado
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Nombre</p>
              <p className="font-medium">{perfil.instructor_nombre}</p>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{perfil.instructor_email}</p>
            </div>
          </div>

          {/* Jefe */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-green-800 mb-3">
              Jefe Asignado
            </h3>
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Nombre</p>
              <p className="font-medium">{perfil.jefe_nombre}</p>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium">{perfil.jefe_email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerfilAprendiz;