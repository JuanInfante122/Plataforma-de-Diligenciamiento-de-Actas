import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../../config/api';

const AprendicesAsignados = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fichas, setFichas] = useState([]);
  const [fichaSeleccionada, setFichaSeleccionada] = useState('todos');
  const navigate = useNavigate();

  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    if (!usuario?.id) {
      setError('No se encontró información del usuario');
      setLoading(false);
      return;
    }
    cargarAprendices();
  }, []);

  const cargarAprendices = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.aprendicesInstructor(usuario.id));
      console.log('Datos recibidos:', response.data); // Debug
      
      if (Array.isArray(response.data)) {
        setFichas(response.data);
      } else {
        console.error('Formato de respuesta inesperado:', response.data);
        setError('Error en el formato de datos recibidos');
      }
    } catch (error) {
      console.error('Error al cargar aprendices:', error);
      setError('Error al cargar la información de los aprendices');
    } finally {
      setLoading(false);
    }
  };

  const filtrarAprendices = () => {
    if (!fichas || !Array.isArray(fichas) || fichas.length === 0) {
      return [];
    }

    if (fichaSeleccionada === 'todos') {
      return fichas.reduce((acc, ficha) => {
        if (ficha.aprendices && Array.isArray(ficha.aprendices)) {
          return acc.concat(ficha.aprendices);
        }
        return acc;
      }, []);
    }

    const fichaEncontrada = fichas.find(f => f.id.toString() === fichaSeleccionada);
    return (fichaEncontrada && fichaEncontrada.aprendices) ? fichaEncontrada.aprendices : [];
  };

  const aprendicesFiltrados = filtrarAprendices();

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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Aprendices Asignados</h2>
        {fichas.length > 0 && (
          <select
            value={fichaSeleccionada}
            onChange={(e) => setFichaSeleccionada(e.target.value)}
            className="px-4 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todos">Todas las fichas</option>
            {fichas.map(ficha => (
              <option key={ficha.id} value={ficha.id}>
                Ficha {ficha.numero} - {ficha.programa}
              </option>
            ))}
          </select>
        )}
      </div>

      {fichas.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No hay fichas asignadas al instructor</p>
        </div>
      ) : aprendicesFiltrados.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No hay aprendices en la ficha seleccionada</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aprendicesFiltrados.map((aprendiz) => (
            <div key={aprendiz.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {aprendiz.nombres} {aprendiz.apellidos}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {aprendiz.tipo_documento}: {aprendiz.numero_documento}
                  </p>
                </div>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  aprendiz.estado === 'ACTIVO' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {aprendiz.estado}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm">
                  <span className="font-medium text-gray-600">Email:</span>{' '}
                  {aprendiz.email}
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-600">Ficha:</span>{' '}
                  {aprendiz.ficha_numero}
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-600">Programa:</span>{' '}
                  {aprendiz.programa}
                </p>
              </div>

              <div className="flex justify-between items-center pt-4 border-t">
                <div className="text-sm">
                  <p className="font-medium text-gray-600">Documentos pendientes:</p>
                  <p className="text-gray-800">{aprendiz.documentos_pendientes || 0}</p>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => window.location.href = `mailto:${aprendiz.email}`}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Contactar
                  </button>
                  <button
                    onClick={() => navigate(`/revision?aprendiz=${aprendiz.id}`)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Ver Documentos
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AprendicesAsignados;
