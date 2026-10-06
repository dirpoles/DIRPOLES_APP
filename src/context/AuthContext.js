import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import authService from '../services/authService';
import { setLogoutHandler } from '../services/api';

/**
 * CONTEXTO DE AUTENTICACIÓN
 *
 * Centraliza el estado de la sesión y expone funciones para login/logout
 * a toda la aplicación.
 *
 * Al montarse, registra el handler de logout forzado en el interceptor
 * de api.js para que éste pueda cerrar la sesión cuando recibe un 401
 * con código UNAUTHENTICATED o cuando el refresh token falla.
 */

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  /**
   * Limpia el estado de sesión en memoria (sin tocar SecureStore,
   * ya lo hace el interceptor o authService.logout).
   */
  const forceLogout = useCallback(() => {
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  }, []);

  // Registrar el handler de logout forzado para el interceptor de Axios
  useEffect(() => {
    setLogoutHandler(forceLogout);
  }, [forceLogout]);

  // Al iniciar la app, verificar si hay una sesión guardada
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
   * Procesa el login usando el servicio de autenticación.
   *
   * @param {string} correo
   * @param {string} password
   * @returns {Promise<{success: boolean, user: object|null, message: string}>}
   */
  const login = async (correo, password) => {
    const result = await authService.login(correo, password);

    if (result.success) {
      setUser(result.user);
      setIsAuthenticated(true);
    }

    return result;
  };

  /**
   * Procesa el logout: notifica al backend y limpia el estado local.
   */
  const logout = async () => {
    setIsLoading(true);
    await authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setIsLoading(false);
  };

  /**
   * Actualiza los datos del usuario en memoria y almacenamiento local.
   *
   * @param {object} updatedData - Campos a mezclar con el usuario actual.
   */
  const updateUser = useCallback(async (updatedData) => {
    try {
      setUser((prevUser) => {
        const newUser = { ...prevUser, ...updatedData };
        SecureStore.setItemAsync('user_data', JSON.stringify(newUser)).catch((err) => {
          console.error('[AuthContext] Error guardando en SecureStore:', err);
        });
        return newUser;
      });
    } catch (e) {
      console.error('[AuthContext] Error actualizando datos locales:', e);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de forma más sencilla
export const useAuth = () => useContext(AuthContext);
