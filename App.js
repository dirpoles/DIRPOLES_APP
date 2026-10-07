import React from 'react';
import { LogBox } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// Ignorar advertencias de deprecación de dependencias nativas en Expo 57 / React Native 0.86
LogBox.ignoreLogs([
  'SafeAreaView has been deprecated',
  'InteractionManager has been deprecated',
  'Please refactor long tasks into smaller ones',
  'DateTimePicker:',
  'onChange',
  'onValueChange',
  'onDismiss',
]);

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

