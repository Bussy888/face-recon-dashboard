import { create } from 'zustand';
import { auth } from '../firebase';
import { obtenerEmpleadoPorCorreo } from '../services/empleadoService';

export const useUserStore = create((set) => ({
  user: null,
  isLoading: true,

  setUser: (userData) => {
    set({ user: userData });
    localStorage.setItem('userData', JSON.stringify(userData));
  },

  clearUser: () => {
    set({ user: null, isLoading: false });
    localStorage.removeItem('userData');
  }, 
  fetchUserData: async (email) => {
    try {
      const userData = await obtenerEmpleadoPorCorreo(email); // uso del servicio
      set({ user: userData });
      localStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
    }
  },

  initializeUser: () => {
    set({ isLoading: true });
    const storedUser = localStorage.getItem('userData');
    if (storedUser) {
      set({ user: JSON.parse(storedUser) });
    }

    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        if (!storedUser) {
          try {
            const userData = await obtenerEmpleadoPorCorreo(firebaseUser.email);
            set({ user: userData });
            localStorage.setItem('userData', JSON.stringify(userData));
          } catch (error) {
            console.error('Error al obtener usuario:', error);
            set({ user: null });
            localStorage.removeItem('userData');
          }
        }
      } else {
        set({ user: null });
        localStorage.removeItem('userData');
      }
      set({ isLoading: false });
    });

    return unsubscribe;
  },
}));
