import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, Users, CalendarDays, Package, BarChart3, User, LogOut } from 'lucide-react-native';
import { COLORS } from '../constants/config';
import { useAuth } from '../context/AuthContext';
import { IconButton } from 'react-native-paper';

// Pantallas
import HomeScreen from '../screens/Dashboard/HomeScreen';
import BeneficiariosScreen from '../screens/beneficiarios/BeneficiariosScreen';
import CitasScreen from '../screens/citas/CitasScreen';
import InventarioScreen from '../screens/inventario/InventarioScreen';
import ReportesScreen from '../screens/reportes/ReportesScreen';

import CustomModal from '../components/UI/CustomModal';

const Tab = createBottomTabNavigator();

/**
 * NAVEGADOR POR PESTAÑAS (BOTTOM TABS)
 * 
 * Centraliza la navegación principal de la aplicación.
 */
export default function TabNavigator() {
  const { logout } = useAuth();
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);

  return (
    <>
      <Tab.Navigator
        screenOptions={({ navigation }) => ({
          headerStyle: {
            backgroundColor: COLORS.surface,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: COLORS.border,
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            color: COLORS.primary,
          },
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity 
                onPress={() => navigation.navigate('Perfil')}
                style={styles.headerButton}
              >
                <User size={22} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setShowLogoutModal(true)}
                style={styles.headerButton}
              >
                <LogOut size={22} color={COLORS.danger} />
              </TouchableOpacity>
            </View>
          ),
          tabBarActiveTintColor: COLORS.primary,
          tabBarInactiveTintColor: COLORS.textMuted,
          tabBarStyle: {
            height: 65,
            paddingBottom: 10,
            paddingTop: 10,
            backgroundColor: COLORS.surface,
            borderTopWidth: 1,
            borderTopColor: COLORS.border,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
          }
        })}
      >
        <Tab.Screen 
          name="Inicio" 
          component={HomeScreen} 
          options={{
            tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
          }}
        />
        <Tab.Screen 
          name="Beneficiarios" 
          component={BeneficiariosScreen} 
          options={{
            tabBarIcon: ({ color, size }) => <Users size={size} color={color} />,
          }}
        />
        <Tab.Screen 
          name="Citas" 
          component={CitasScreen} 
          options={{
            tabBarIcon: ({ color, size }) => <CalendarDays size={size} color={color} />,
          }}
        />
        <Tab.Screen 
          name="Inventario" 
          component={InventarioScreen} 
          options={{
            tabBarIcon: ({ color, size }) => <Package size={size} color={color} />,
          }}
        />
        <Tab.Screen 
          name="Reportes" 
          component={ReportesScreen} 
          options={{
            tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
          }}
        />
      </Tab.Navigator>

      {/* Modal de Confirmación de Cierre de Sesión */}
      <CustomModal
        visible={showLogoutModal}
        type="question"
        title="¿Cerrar Sesión?"
        message="¿Estás seguro de que deseas salir de DIRPOLES Mobile?"
        cancelText="No, quedarme"
        confirmText="Sí, salir"
        onClose={() => setShowLogoutModal(false)}
        onConfirm={() => {
          setShowLogoutModal(false);
          logout();
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    paddingRight: 10,
  },
  headerButton: {
    padding: 8,
    marginLeft: 5,
  }
});
