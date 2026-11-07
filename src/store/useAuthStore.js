import { create } from 'zustand';
import { persist } from 'zustand/middleware'; // Importamos el middleware

export const useAuthStore = create(
  // Envolvemos todo nuestro estado en la función persist
  persist(
    (set) => ({
      user: null,         
      isAuthenticated: false, 
      token: null,        

      login: (userData, token) => {
        set({ 
          user: userData, 
          isAuthenticated: true, 
          token: token 
        });
      },

      register: (userData, token) => {
        set({ 
          user: userData, 
          isAuthenticated: true, 
          token: token 
        });
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          token: null 
        });
      }
    }),
    {
      name: 'sape-auth-storage', // El nombre de la clave en el localStorage
    }
  )
);