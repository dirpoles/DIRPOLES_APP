import React from 'react';
import { StyleSheet, View, ScrollView, KeyboardAvoidingView, Platform, SafeAreaView } from 'react-native';
import { Text } from 'react-native-paper';
import { COLORS } from '../../constants/config';
import BeneficiarioForm from '../../components/Beneficiarios/BeneficiarioForm';

/**
 * Esta pantalla actúa como un contenedor para el componente del formulario.
 */
export default function BeneficiariosScreen() {

  const handleFormSubmit = (data) => {
    console.log('Enviando datos del Beneficiario:', data);
    // Aquí irá la lógica para llamar al servicio más adelante
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headerSection}>
            <Text style={styles.title}>Beneficiarios</Text>
            <Text style={styles.subtitle}>Gestión y registro de Beneficiarios</Text>
          </View>

          {/* Llamamos al componente reutilizable */}
          <BeneficiarioForm onSubmit={handleFormSubmit} />

          <View style={{ height: 20 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
  },
  headerSection: {
    marginBottom: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
});
