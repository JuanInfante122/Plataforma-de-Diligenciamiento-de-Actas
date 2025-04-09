import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Chart as ChartJS, 
  ArcElement, 
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend 
} from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Registrar componentes de Chart.js
ChartJS.register(
  ArcElement,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const PerfilJefe = () => {
  const [estadisticas, setEstadisticas] = useState(null);
  const [reportes, setReportes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroFecha, setFiltroFecha] = useState('mes');

  // Colores del diseño
  const colors = {
    primary: '#2C3E50',    // Azul oscuro
    secondary: '#E74C3C',  // Rojo
    accent: '#3498DB',     // Azul claro
    success: '#2ECC71',    // Verde
    warning: '#F1C40F',    // Amarillo
    background: '#ECF0F1', // Gris claro
  };

  useEffect(() => {
    cargarDatos();
  }, [filtroFecha]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [estadisticasRes, reportesRes] = await Promise.all([
        axios.get(`/estadisticas-generales?periodo=${filtroFecha}`),
        axios.get('/reportes-recientes')
      ]);

      setEstadisticas(estadisticasRes.data);
      setReportes(reportesRes.data);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const datosGraficoEstado = {
    labels: ['Aprobados', 'Rechazados', 'Pendientes'],
    datasets: [{
      data: [
        estadisticas?.aprobados || 0,
        estadisticas?.rechazados || 0,
        estadisticas?.pendientes || 0
      ],
      backgroundColor: [
        colors.success,
        colors.secondary,
        colors.warning
      ],
      borderColor: [
        colors.success,
        colors.secondary,
        colors.warning
      ],
      borderWidth: 1,
    }]
  };

  const datosGraficoPrograma = {
    labels: estadisticas?.porPrograma?.map(p => p.nombre) || [],
    datasets: [{
      label: 'Documentos por Programa',
      data: estadisticas?.porPrograma?.map(p => p.total) || [],
      backgroundColor: colors.accent,
      borderColor: colors.primary,
      borderWidth: 1,
    }]
  };

  const opcionesGrafico = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Estadísticas de Documentos',
      },
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Encabezado */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Panel de Control - Jefe de Centro
        </h1>
        <p className="text-gray-600">
          Gestión y seguimiento de documentación
        </p>
      </div>

      {/* Filtros */}
      <div className="mb-6">
        <select
          value={filtroFecha}
          onChange={(e) => setFiltroFecha(e.target.value)}
          className="bg-white border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="mes">Último Mes</option>
          <option value="trimestre">Último Trimestre</option>
          <option value="año">Último Año</option>
        </select>
      </div>

      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Total Documentos</h3>
          <p className="text-3xl font-bold text-blue-600">
            {estadisticas?.total || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Aprobados</h3>
          <p className="text-3xl font-bold text-green-600">
            {estadisticas?.aprobados || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Rechazados</h3>
          <p className="text-3xl font-bold text-red-600">
            {estadisticas?.rechazados || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-2">Pendientes</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {estadisticas?.pendientes || 0}
          </p>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Estado de Documentos</h3>
          <Pie data={datosGraficoEstado} options={opcionesGrafico} />
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Documentos por Programa</h3>
          <Bar data={datosGraficoPrograma} options={opcionesGrafico} />
        </div>
      </div>

      {/* Tabla de Reportes Recientes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Reportes Recientes</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Generado Por
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportes.map((reporte) => (
                <tr key={reporte.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {new Date(reporte.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {reporte.tipo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {reporte.generado_por_nombre}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => window.open(`/descargar-reporte/${reporte.id}`, '_blank')}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Descargar
                    </button>
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

export default PerfilJefe;