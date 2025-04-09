import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const Estadisticas = ({ instructorId }) => {
  const [stats, setStats] = useState({
    totalDocumentos: 0,
    aprobados: 0,
    rechazados: 0,
    pendientes: 0,
    porFicha: [],
    aprendices: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cargarEstadisticas = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          instructorId 
            ? API_ENDPOINTS.estadisticasInstructor(instructorId)
            : 'http://localhost:5000/estadisticas-instructor'
        );
        setStats(response.data);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
        setError('Error al cargar las estadísticas');
      } finally {
        setLoading(false);
      }
    };

    cargarEstadisticas();
  }, [instructorId]);

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

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-gray-800">Estadísticas de Documentos</h2>

      {/* Resumen General */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Total Documentos</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalDocumentos}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Aprobados</h3>
          <p className="text-3xl font-bold text-green-600">{stats.aprobados}</p>
          <p className="text-sm text-gray-500">
            {stats.totalDocumentos > 0 
              ? `${Math.round((stats.aprobados / stats.totalDocumentos) * 100)}%`
              : '0%'}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Rechazados</h3>
          <p className="text-3xl font-bold text-red-600">{stats.rechazados}</p>
          <p className="text-sm text-gray-500">
            {stats.totalDocumentos > 0 
              ? `${Math.round((stats.rechazados / stats.totalDocumentos) * 100)}%`
              : '0%'}
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold text-gray-600">Pendientes</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.pendientes}</p>
          <p className="text-sm text-gray-500">
            {stats.totalDocumentos > 0 
              ? `${Math.round((stats.pendientes / stats.totalDocumentos) * 100)}%`
              : '0%'}
          </p>
        </div>
      </div>

      {/* Estadísticas por Ficha */}
      {stats.porFicha && stats.porFicha.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Estadísticas por Ficha</h3>
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
                    Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aprobados
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rechazados
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pendientes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.porFicha.map((ficha, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {ficha.ficha}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ficha.programa}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {ficha.totalDocumentos}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {ficha.aprobados}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        {ficha.rechazados}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                        {ficha.pendientes}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Aprendices con Documentos Pendientes */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Aprendices con Documentos Pendientes</h3>
        <div className="divide-y">
          {stats.aprendices.map((aprendiz) => (
            <div key={aprendiz.id} className="py-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold">{aprendiz.nombre}</p>
                  {aprendiz.ficha && <p className="text-sm text-gray-600">Ficha: {aprendiz.ficha}</p>}
                  <p className="text-sm text-gray-600">
                    Documentos pendientes: {aprendiz.documentosPendientes}
                  </p>
                </div>
                <div className="space-x-2">
                  {aprendiz.email && (
                    <button 
                      onClick={() => window.location.href = `mailto:${aprendiz.email}`}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                    >
                      Contactar
                    </button>
                  )}
                  <button 
                    onClick={() => window.location.href = `/revision?aprendiz=${aprendiz.id}`}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    Ver Documentos
                  </button>
                </div>
              </div>
            </div>
          ))}

          {stats.aprendices.length === 0 && (
            <div className="py-4 text-center text-gray-500">
              No hay aprendices con documentos pendientes
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Estadisticas;
