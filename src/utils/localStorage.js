export const storageUtils = {
  setUsuario: (usuario) => {
    try {
      localStorage.setItem('usuario', JSON.stringify(usuario));
    } catch (error) {
      console.error('Error al guardar usuario en localStorage:', error);
    }
  },

  getUsuario: () => {
    try {
      const usuarioGuardado = localStorage.getItem('usuario');
      return usuarioGuardado ? JSON.parse(usuarioGuardado) : null;
    } catch (error) {
      console.error('Error al obtener usuario del localStorage:', error);
      return null;
    }
  },

  clearUsuario: () => {
    try {
      localStorage.removeItem('usuario');
    } catch (error) {
      console.error('Error al eliminar usuario del localStorage:', error);
    }
  }
};