import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const NotificacionesInstructor = () => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const usuario = JSON.parse(localStorage.getItem('usuario'));
  const navigate = useNavigate();

  useEffect(() => {
    cargarNotificaciones();
    // Configurar intervalo para actualizar notificaciones
    const interval = setInterval(cargarNotificaciones, 30000); // Cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Cerrar dropdown al hacer clic fuera
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const cargarNotificaciones = async () => {
    if (!usuario?.id) return;

    try {
      setLoading(true);
      const response = await axios.get(API_ENDPOINTS.notificaciones(usuario.id));
      console.log('Notificaciones recibidas:', response.data); // Debug

      if (Array.isArray(response.data)) {
        setNotificaciones(response.data);
      } else {
        console.error('Formato de notificaciones inesperado:', response.data);
        setError('Error en el formato de notificaciones');
      }
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
      setError('Error al cargar notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const marcarComoLeida = async (notificacionId) => {
    try {
      const response = await axios.post(API_ENDPOINTS.marcarNotificacionLeida, {
        notificacion_id: notificacionId,
        usuario_id: usuario.id
      });
      
      if (response.status === 200) {
        setNotificaciones(prevNotificaciones =>
          prevNotificaciones.map(notif =>
            notif.id === notificacionId
              ? { ...notif, leida: true }
              : notif
          )
        );
      } else {
        console.error('Error al marcar notificación como leída:', response);
      }
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error);
    }
  };

  const getNotificacionesNoLeidas = () => {
    return notificaciones.filter(n => !n.leida).length;
  };

  const formatearFecha = (fecha) => {
    const ahora = new Date();
    const fechaNotif = new Date(fecha);
    const diferencia = ahora - fechaNotif;
    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);

    if (minutos < 60) {
      return `Hace ${minutos} minutos`;
    } else if (horas < 24) {
      return `Hace ${horas} horas`;
    } else {
      return `Hace ${dias} días`;
    }
  };

  const cerrarSesion = () => {
    // Limpiar todo el localStorage en lugar de solo el usuario
    localStorage.clear();
    
    // Forzar recarga de la aplicación para reiniciar todos los estados
    window.location.href = '/';
  };

  return (
    <div className="flex items-center space-x-4">
      {/* Campana de notificaciones */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => {
            setShowDropdown(!showDropdown);
            setShowUserMenu(false);
          }}
          className="relative p-2 text-gray-600 hover:text-gray-800 focus:outline-none"
        >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {getNotificacionesNoLeidas() > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
            {getNotificacionesNoLeidas()}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50">
          <div className="p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-700">
              Notificaciones
            </h3>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              </div>
            ) : error ? (
              <div className="p-4 text-red-500 text-center">{error}</div>
            ) : notificaciones.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No hay notificaciones
              </div>
            ) : (
              notificaciones.map((notificacion) => (
                <div
                  key={notificacion.id}
                  className={`p-4 border-b hover:bg-gray-50 transition-colors ${
                    !notificacion.leida ? 'bg-blue-50' : ''
                  }`}
                >
                  <Link
                    to={`/revision?documento=${notificacion.documento_id}`}
                    onClick={() => {
                      marcarComoLeida(notificacion.id);
                      setShowDropdown(false);
                    }}
                    className="block"
                  >
                    <div className="flex items-start">
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">
                          {notificacion.titulo}
                        </p>
                        <p className="text-sm text-gray-600">
                          {notificacion.mensaje}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {formatearFecha(notificacion.created_at)}
                        </p>
                      </div>
                      {!notificacion.leida && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>

          {notificaciones.length > 0 && (
            <div className="p-4 border-t">
              <button
                onClick={() => {
                  const noLeidas = notificaciones.filter(n => !n.leida);
                  if (noLeidas.length > 0) {
                    Promise.all(noLeidas.map(n => marcarComoLeida(n.id)))
                      .then(() => console.log('Todas las notificaciones marcadas como leídas'))
                      .catch(err => console.error('Error al marcar notificaciones:', err));
                  }
                }}
                className="text-sm text-blue-600 hover:text-blue-800"
                disabled={getNotificacionesNoLeidas() === 0}
              >
                Marcar todas como leídas
              </button>
            </div>
          )}
        </div>
      )}
      </div>

      {/* Menú de usuario */}
      <div className="relative" ref={userMenuRef}>
        <button
          onClick={() => {
            setShowUserMenu(!showUserMenu);
            setShowDropdown(false);
          }}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 focus:outline-none"
        >
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">
              {usuario?.nombres?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <span className="hidden md:block">{usuario?.nombres || 'Usuario'}</span>
        </button>

        {showUserMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-50">
            <div className="py-1">
              <Link
                to="/perfil"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => setShowUserMenu(false)}
              >
                Mi Perfil
              </Link>
              <button
                onClick={cerrarSesion}
                className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificacionesInstructor;
