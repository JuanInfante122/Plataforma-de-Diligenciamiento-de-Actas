import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Reportes = () => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [tipoReporte, setTipoReporte] = useState('general');
  const [generando, setGenerando] = useState(false);
  const [reportesRecientes, setReportesRecientes] = useState([]);
  const [error, setError] = useState(null);
  
  const usuario = JSON.parse(localStorage.getItem('usuario'));

  useEffect(() => {
    cargarReportesRecientes();
  }, []);

  const cargarReportesRecientes = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/reportes-recientes/${usuario.id}`);
      setReportesRecientes(response.data);
    } catch (error) {
      console.error('Error al cargar reportes recientes:', error);
      setError('Error al cargar los reportes recientes');
    }
  };

  const handleGenerarReporte = async () => {
    if (!fechaInicio || !fechaFin) {
      setError('Por favor seleccione un rango de fechas');
      return;
    }

    setGenerando(true);
    setError(null);

    try {
      const response = await axios.post('http://localhost:5000/generar-reporte', {
        fechaInicio,
        fechaFin,
        tipoReporte,
        usuario_id: usuario.id
      }, { 
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      // Crear URL del blob y descargar
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte-${tipoReporte}-${fechaInicio}-${fechaFin}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Recargar reportes recientes
      await cargarReportesRecientes();
    } catch (error) {
      console.error('Error al generar reporte:', error);
      setError('Error al generar el reporte');
    } finally {
      setGenerando(false);
    }
  };

  const handleDescargarReporte = async (reporteId) => {
    try {
      const response = await axios.get(`http://localhost:5000/descargar-reporte/${reporteId}`, {
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reporte-${reporteId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error al descargar reporte:', error);
      setError('Error al descargar el reporte');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Generación de Reportes</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Inicio
            </label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha Fin
            </label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Reporte
            </label>
            <select
              value={tipoReporte}
              onChange={(e) => setTipoReporte(e.target.value)}
              className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="general">Reporte General</option>
              <option value="aprobados">Documentos Aprobados</option>
              <option value="rechazados">Documentos Rechazados</option>
              <option value="pendientes">Documentos Pendientes</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerarReporte}
          disabled={generando}
          className="mt-6 w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 transition-colors"
        >
          {generando ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Generando...
            </div>
          ) : (
            'Generar Reporte'
          )}
        </button>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Reportes Recientes</h3>
        <div className="divide-y">
          {reportesRecientes.length === 0 ? (
            <p className="text-gray-500 text-center py-4">
              No hay reportes generados recientemente
            </p>
          ) : (
            reportesRecientes.map((reporte) => (
              <div key={reporte.id} className="py-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">
                      Reporte {reporte.tipo} - {new Date(reporte.fecha_inicio).toLocaleDateString()} a {new Date(reporte.fecha_fin).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-600">
                      Generado el {new Date(reporte.created_at).toLocaleString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDescargarReporte(reporte.id)}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                  >
                    Descargar
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Reportes;
