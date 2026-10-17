import React from 'react';
import { LogBox } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

// Ignorar advertencias de deprecación de dependencias nativas en Expo 57 / React Native 0.86
LogBox.ignoreLogs([
  'SafeAreaView has been deprecated',
  'InteractionManager has been deprecated',
  'Please refactor long tasks into smaller ones',
  "use 'requestIdleCallback' instead",
  'DateTimePicker:',
  'onChange',
  'onValueChange',
  'onDismiss',
]);

/**
 * PUNTO DE ENTRADA PRINCIPAL
 * 
 * Envolvemos la aplicación en los proveedores necesarios:
 * 1. SafeAreaProvider: Mide e inyecta los insets nativos (notch, barras de navegación del sistema, gestos).
 * 2. AuthProvider: Maneja el estado global de autenticación.
 * 3. PaperProvider: Maneja los temas y componentes de UI.
 */
export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <PaperProvider>
          <AppNavigator />
        </PaperProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

