import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import authService from '../services/authService';

/**
 * CONTEXTO DE AUTENTICACIÓN
 * 
 * Centraliza el estado de la sesión y expone funciones para login/logout
 * a toda la aplicación.
 */

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Al iniciar la app, verificamos si hay una sesión guardada
  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    try {
      const session = await authService.checkSession();
      if (session.isAuthenticated) {
        setUser(session.user);
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error('[AuthContext] Error cargando sesión:', e);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Procesa el login usando el servicio de autenticación
   */
  const login = async (correo, password) => {
    // No usamos setIsLoading(true) aquí para evitar que AppNavigator desmonte la UI
    const result = await authService.login(correo, password);
    
    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }
    
    return result;
  };

  /**
   * Procesa el logout
   */
  const logout = async () => {
    setIsLoading(true);
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  };

  /**
   * Actualiza los datos del usuario en memoria y almacenamiento local (Memoizado estáticamente)
   */
  const updateUser = useCallback(async (updatedData) => {
    try {
      setUser(prevUser => {
        const newUser = { ...prevUser, ...updatedData };
        SecureStore.setItemAsync('user_data', JSON.stringify(newUser)).catch(err => {
          console.error('[AuthContext] Error guardando en SecureStore:', err);
        });
        return newUser;
      });
    } catch (e) {
      console.error('[AuthContext] Error actualizando datos locales:', e);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      isAuthenticated, 
      login, 
      logout,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de forma más sencilla
export const useAuth = () => useContext(AuthContext);
