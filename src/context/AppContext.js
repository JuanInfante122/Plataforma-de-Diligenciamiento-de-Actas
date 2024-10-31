// src/context/AppContext.jsx
import React, { createContext, useState } from 'react';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    regional: '', 
    centroFormacion: '', 
    programaFormacion: '', 
    modalidadFormacion: '', 
    nombreAprendiz: '', 
    tipoDocumento: '', 
    noIdentificacion: '', 
    firmaAprendizURL: '', 
    firmaJefeURL: '', 
    firmaInstructorURL: ''
  });

  return (
    <AppContext.Provider value={{ formData, setFormData }}>
      {children}
    </AppContext.Provider>
  );
};
