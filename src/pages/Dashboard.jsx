import React from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ rol }) => {
  const navigate = useNavigate();
  
  const getWelcomeMessage = () => {
    const messages = {
      APRENDIZ: 'Bienvenido al sistema de documentación. Aquí podrás gestionar tus documentos y dar seguimiento a su estado.',
      INSTRUCTOR: 'Bienvenido instructor. Desde aquí podrás revisar y gestionar los documentos de tus aprendices.',
      JEFE: 'Bienvenido coordinador. Aquí podrás aprobar documentos y generar reportes de seguimiento.'
    };
    return messages[rol] || 'Bienvenido al sistema';
  };

  const getQuickActions = () => {
    const actions = {
      APRENDIZ: [
        { label: 'Mi Perfil', icon: '👤', action: '/perfil' },
        { label: 'Nuevo Documento', icon: '📝', action: '/formulario' },
        { label: 'Ver Historial', icon: '📅', action: '/historial' },
        { label: 'Gestionar Firma', icon: '✍️', action: '/gestion-firma' },
      ],
      INSTRUCTOR: [
        { label: 'Mi Perfil', icon: '👤', action: '/perfil' },
        { label: 'Documentos Pendientes', icon: '📋', action: '/revision' },
        { label: 'Ver Estadísticas', icon: '📊', action: '/estadisticas' },
        { label: 'Gestionar Firma', icon: '✍️', action: '/gestion-firma' },
      ],
      JEFE: [
        { label: 'Mi Perfil', icon: '👤', action: '/perfil' },
        { label: 'Aprobar Documentos', icon: '✔️', action: '/aprobacion' },
        { label: 'Generar Reportes', icon: '📈', action: '/reportes' },
        { label: 'Gestionar Firma', icon: '✍️', action: '/gestion-firma' },
      ],
    };
    return actions[rol] || [];
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Dashboard</h2>
        <p className="text-gray-600">{getWelcomeMessage()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {getQuickActions().map((action, index) => (
          <div 
            key={index}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => navigate(action.action)}
          >
            <div className="flex items-center mb-2">
              <div className="text-3xl mr-3">{action.icon}</div>
              <h3 className="text-lg font-semibold">{action.label}</h3>
            </div>
            {action.label === 'Gestionar Firma' && (
              <p className="text-sm text-gray-600">Configure su firma digital para documentos</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
