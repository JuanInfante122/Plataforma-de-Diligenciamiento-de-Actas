// src/App.js
import React from 'react';
import FormularioDocumentacion from './components/FormularioDocumentacion';
import VistaPreviaDocumento from './components/VistaPreviaDocumento';
import { AppProvider } from './context/AppContext';

const App = () => {
  return (
    <AppProvider>
      <div className="flex h-screen">
        <FormularioDocumentacion />
        <VistaPreviaDocumento />
      </div>
    </AppProvider>
  );
};

export default App;
