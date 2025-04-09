import React from 'react';
import Sidebar from './Sidebar';
import NotificacionesInstructor from '../NotificacionesInstructor';

const AppLayout = ({ children, rol }) => {
  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-1 flex items-center justify-between">
              <div className="flex-1 flex items-center">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Sistema de Documentación
                </h1>
              </div>
              <div className="flex items-center space-x-4">
                {rol === 'INSTRUCTOR' && <NotificacionesInstructor />}
                {/* Otros elementos del header */}
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="flex">
        <Sidebar rol={rol} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
