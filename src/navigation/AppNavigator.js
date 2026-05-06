import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../constants/config';

// Pantallas
import LoginScreen from '../screens/auth/LoginScreen';
import TabNavigator from './TabNavigator';

const Stack = createStackNavigator();

/**
 * NAVEGADOR PRINCIPAL (SOLID: Control de Flujo)
 */
export default function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();

  // Pantalla de carga mientras se verifica la sesión
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // Flujo de Aplicación (Dashboard con Tabs)
          <Stack.Screen name="Main" component={TabNavigator} />
        ) : (
          // Flujo de Autenticación
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
