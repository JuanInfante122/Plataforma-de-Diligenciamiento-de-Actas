import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Sidebar = ({ rol }) => {
  const location = useLocation();
  const colors = {
    primary: '#2C3E50',
    accent: '#3498DB',
    background: '#ECF0F1',
    text: '#2C3E50'
  };

  const getMenuItems = () => {
    const items = {
      APRENDIZ: [
        { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
        { to: '/perfil', icon: '👤', label: 'Mi Perfil' },
        { to: '/formulario', icon: '📝', label: 'Nuevo Documento' },
        { to: '/historial', icon: '📅', label: 'Historial' },
        { to: '/vista-previa', icon: '👁️', label: 'Vista Previa' }
      ],
      INSTRUCTOR: [
        { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
        { to: '/aprendices', icon: '👥', label: 'Aprendices Asignados' },
        { to: '/revision', icon: '📋', label: 'Revisar Documentos' },
        { to: '/estadisticas', icon: '📊', label: 'Estadísticas' },
        { to: '/gestion-firma', icon: '✍️', label: 'Gestionar Firma' },
        { to: '/perfil', icon: '👤', label: 'Mi Perfil' }
      ],
      JEFE: [
        { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
        { to: '/aprobacion', icon: '✔️', label: 'Aprobar Documentos' },
        { to: '/reportes', icon: '📈', label: 'Reportes' },
        { to: '/estadisticas', icon: '📊', label: 'Estadísticas' },
        { to: '/gestion-firma', icon: '✍️', label: 'Gestionar Firma' },
        { to: '/perfil', icon: '👤', label: 'Mi Perfil' }
      ]
    };
    
    return items[rol] || [];
  };

  return (
    <nav 
      className="w-64 min-h-screen p-4 space-y-2"
      style={{ backgroundColor: colors.background }}
    >
      <div className="mb-4">
        <h2 className="text-lg font-semibold" style={{ color: colors.primary }}>
          Menú Principal
        </h2>
        <div className="text-sm" style={{ color: colors.primary }}>
          {rol || 'Usuario'}
        </div>
      </div>
      
      {getMenuItems().map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          className={({ isActive }) => `
            flex items-center space-x-2 p-3 rounded-md transition-colors duration-200 
            ${isActive 
              ? 'bg-white shadow-md' 
              : 'hover:bg-white hover:shadow-sm'
            }`
          }
          style={{ color: colors.text }}
        >
          <span className="text-xl">{item.icon}</span>
          <span>{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default Sidebar;
