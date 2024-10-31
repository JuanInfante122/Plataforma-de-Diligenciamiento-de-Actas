// src/context/AppContext.jsx
import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    regional: '', centroFormacion: '', programaFormacion: '', modalidadFormacion: '',
    nombreCompleto: '', tipoDocumento: '', noIdentificacion: '', telefono: '', emailPersonal: '',
    emailInstitucional: '', alternativaEtapa: '', firmaAprendizURL: '', firmaJefeURL: '', firmaInstructorURL: ''
  });

  return (
    <AppContext.Provider value={{ formData, setFormData }}>
      {children}
    </AppContext.Provider>
  );
};
