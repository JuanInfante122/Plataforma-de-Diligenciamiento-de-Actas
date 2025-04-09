import React from 'react';
import { Link } from 'react-router-dom';

const Header = ({ rol }) => {
  const colors = {
    primary: '#2C3E50',
    accent: '#3498DB',
    white: '#FFFFFF'
  };

  return (
    <header 
      className="w-full py-4 px-6 flex items-center justify-between shadow-md"
      style={{ backgroundColor: colors.primary }}
    >
      <div className="flex items-center">
        <img src="/logo.png" alt="Logo" className="h-8 w-auto" />
        <h1 className="ml-4 text-xl font-bold" style={{ color: colors.white }}>
          Sistema de Documentación
        </h1>
      </div>
      
      <div className="flex items-center space-x-4">
        <span className="text-white">
          Rol: {rol}
        </span>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-md text-sm font-medium"
          style={{ backgroundColor: colors.accent, color: colors.white }}
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
};

export default Header;