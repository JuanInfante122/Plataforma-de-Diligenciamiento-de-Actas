// src/App.js
import React, { useState } from 'react';
import FormularioDocumentacion from './components/FormularioDocumentacion';
import ValidacionDocumento from './components/ValidacionDocumento';
import VistaPreviaDocumento from './components/VistaPreviaDocumento';
import { AppProvider } from './context/AppContext';

const App = () => {
  const [accesoPermitido, setAccesoPermitido] = useState(false);
  const [rol, setRol] = useState('');
  const [aprendizID, setAprendizID] = useState(null); // Nuevo estado para aprendizID

  // Manejador de validación exitosa que captura rol y aprendizID
  const handleValidacionExitosa = (rolUsuario, idAprendiz) => {
    console.log("Rol recibido en handleValidacionExitosa:", rolUsuario); // Verificar rol recibido
    console.log("AprendizID recibido en handleValidacionExitosa:", idAprendiz); // Verificar aprendizID recibido
    setAccesoPermitido(true);
    setRol(rolUsuario);
    setAprendizID(idAprendiz); // Guardar aprendizID al validar
  };

  return (
    <AppProvider>
      <div className="flex flex-col items-center min-h-screen bg-gray-100 p-4 space-y-8">
        {/* Mostrar el rol del usuario en la parte superior cuando esté validado */}
        {accesoPermitido && (
          <div className="text-xl font-semibold text-gray-700 mb-4">
            Rol actual: {rol || 'Rol no recibido'}
          </div>
        )}

        {accesoPermitido ? (
          <div className="flex w-full max-w-5xl space-x-8">
            {/* Formulario de llenado para el Aprendiz */}
            {rol === 'Aprendiz' && (
              <div className="w-1/2">
                <FormularioDocumentacion rol={rol} aprendizID={aprendizID} />
              </div>
            )}

            {/* Vista previa del documento, visible para todos los roles */}
            <div className="w-1/2">
              <VistaPreviaDocumento aprendizID={aprendizID} />
            </div>
          </div>
        ) : (
          // Componente de validación de documento si no se ha otorgado acceso
          <ValidacionDocumento onValidacionExitosa={handleValidacionExitosa} />
        )}
      </div>
    </AppProvider>
  );
};

export default App;
