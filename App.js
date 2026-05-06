import React from 'react';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

/**
 * PUNTO DE ENTRADA PRINCIPAL
 * 
 * Envolvemos la aplicación en los proveedores necesarios:
 * 1. AuthProvider: Maneja el estado global de autenticación.
 * 2. PaperProvider: Maneja los temas y componentes de UI.
 */
export default function App() {
  return (
    <AuthProvider>
      <PaperProvider>
        <AppNavigator />
      </PaperProvider>
    </AuthProvider>
  );
}
