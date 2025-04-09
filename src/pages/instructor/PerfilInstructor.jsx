import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const PerfilInstructor = () => {
  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const navigate = useNavigate();

  // Obtener el usuario del localStorage
  const usuario = (() => {
    try {
      return JSON.parse(localStorage.getItem('usuario'));
    } catch (error) {
      console.error('Error al obtener usuario del localStorage:', error);
      return null;
    }
  })();

  useEffect(() => {
    if (!usuario) {
      navigate('/');
      return;
    }
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      const [perfilRes, statsRes] = await Promise.all([
        axios.get(API_ENDPOINTS.perfilInstructor(usuario.id)),
        axios.get(API_ENDPOINTS.estadisticasInstructor(usuario.id))
      ]);

      setPerfil(perfilRes.data);
      setStats(statsRes.data);
    } catch (error) {
      console.error('Error al cargar perfil:', error);
      setError('Error al cargar la información del perfil');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Información Personal */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Información Personal
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-gray-600">Nombre completo</p>
            <p className="font-semibold">{`${perfil?.nombres} ${perfil?.apellidos}`}</p>
          </div>
          <div>
            <p className="text-gray-600">Documento</p>
            <p className="font-semibold">{`${perfil?.tipo_documento} ${perfil?.numero_documento}`}</p>
          </div>
          <div>
            <p className="text-gray-600">Email</p>
            <p className="font-semibold">{perfil?.email}</p>
          </div>
          <div>
            <p className="text-gray-600">Teléfono</p>
            <p className="font-semibold">{perfil?.telefono}</p>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Estadísticas de Documentos
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-600">Total Documentos</p>
            <p className="text-2xl font-bold text-blue-800">{stats?.totalDocumentos || 0}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-green-600">Aprobados</p>
            <p className="text-2xl font-bold text-green-800">{stats?.aprobados || 0}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm text-red-600">Rechazados</p>
            <p className="text-2xl font-bold text-red-800">{stats?.rechazados || 0}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-sm text-yellow-600">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-800">{stats?.pendientes || 0}</p>
          </div>
        </div>
      </div>

      {/* Fichas Asignadas */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Fichas Asignadas
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ficha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Programa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Documentos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pendientes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {stats?.porFicha?.map((ficha, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ficha.ficha}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ficha.programa}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ficha.totalDocumentos}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {ficha.pendientes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PerfilInstructor;