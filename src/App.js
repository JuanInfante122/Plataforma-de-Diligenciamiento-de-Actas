import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ValidacionDocumento from './components/ValidacionDocumento';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import AprendicesAsignados from './pages/instructor/AprendicesAsignados';
import FormularioDocumentacion from './components/FormularioDocumentacion';
import VistaPreviaDocumento from './components/VistaPreviaDocumento';

// Páginas específicas por rol
import RevisionDocumentos from './pages/instructor/RevisionDocumentos';
import GestionFirma from './pages/instructor/GestionFirma';
import AprobacionDocumentos from './pages/jefe/AprobacionDocumentos';
import Estadisticas from './pages/instructor/Estadisticas';
import Reportes from './pages/jefe/Reportes';
import PerfilJefe from './pages/jefe/PerfilJefe';
import Historial from './pages/aprendiz/Historial';
import PerfilAprendiz from './pages/aprendiz/PerfilAprendiz';
import PerfilInstructor from './pages/instructor/PerfilInstructor';

const App = () => {
  const [accesoPermitido, setAccesoPermitido] = useState(false);
  const [rol, setRol] = useState('');
  const [aprendizID, setAprendizID] = useState(null);

  const handleValidacionExitosa = (rolUsuario, idAprendiz) => {
    console.log('Rol recibido:', rolUsuario); // Para debugging
    setAccesoPermitido(true);
    setRol(rolUsuario);
    setAprendizID(idAprendiz);
  };

  if (!accesoPermitido) {
    return <ValidacionDocumento onValidacionExitosa={handleValidacionExitosa} />;
  }

  // Definir rutas según el rol
  const getRutas = () => {
    const rutasComunes = [
      <Route key="dashboard" path="/dashboard" element={<Dashboard rol={rol} />} />
    ];

    switch (rol) {
      case 'INSTRUCTOR':
        return [
          ...rutasComunes,
          <Route 
            key="aprendices" 
            path="/aprendices" 
            element={<AprendicesAsignados />} 
          />,
          <Route 
            key="revision" 
            path="/revision" 
            element={<RevisionDocumentos />} 
          />,
          <Route 
            key="gestion-firma" 
            path="/gestion-firma" 
            element={<GestionFirma />} 
          />,
          <Route 
            key="perfil" 
            path="/perfil" 
            element={<PerfilInstructor />} 
          />,
          <Route 
            key="estadisticas" 
            path="/estadisticas" 
            element={<Estadisticas />} 
          />
        ];
      case 'JEFE':
        return [
          ...rutasComunes,
          <Route 
            key="aprobacion" 
            path="/aprobacion" 
            element={<AprobacionDocumentos />} 
          />,
          <Route 
            key="reportes" 
            path="/reportes" 
            element={<Reportes />} 
          />,
          <Route 
            key="perfil" 
            path="/perfil" 
            element={<PerfilJefe />} 
          />,
          <Route 
            key="estadisticas" 
            path="/estadisticas" 
            element={<Estadisticas />} 
          />,
          <Route 
            key="gestion-firma" 
            path="/gestion-firma" 
            element={<GestionFirma />} 
          />
        ];
      case 'APRENDIZ':
        return [
          ...rutasComunes,
          <Route 
            key="perfil" 
            path="/perfil" 
            element={<PerfilAprendiz aprendizID={aprendizID} />} 
          />,
          <Route 
            key="formulario" 
            path="/formulario" 
            element={<FormularioDocumentacion rol={rol} aprendizID={aprendizID} />} 
          />,
          <Route 
            key="historial" 
            path="/historial" 
            element={<Historial aprendizID={aprendizID} />} 
          />
        ];
      default:
        return rutasComunes;
    }
  };

  return (
    <AppProvider>
      <Router>
        <AppLayout rol={rol}>
          <Routes>
            {getRutas()}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AppLayout>
      </Router>
    </AppProvider>
  );
};

export default App;
