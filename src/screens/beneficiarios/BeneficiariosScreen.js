import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  TouchableOpacity,
  Animated
} from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { ArrowLeft, UserPlus } from 'lucide-react-native';
import { COLORS } from '../../constants/config';
import BeneficiarioForm from '../../components/Beneficiarios/BeneficiarioForm';
import BeneficiarioList from '../../components/Beneficiarios/BeneficiarioList';

/**
 * PANTALLA PRINCIPAL DE BENEFICIARIOS
 * Gestiona el estado entre la lista de consulta y el formulario.
 */
export default function BeneficiariosScreen() {
  const [view, setView] = useState('list'); // 'list' o 'form'
  const [selectedBeneficiario, setSelectedBeneficiario] = useState(null);

  const handleAddPress = () => {
    setSelectedBeneficiario(null);
    setView('form');
  };

  const handleEditPress = (beneficiario) => {
    setSelectedBeneficiario(beneficiario);
    setView('form');
  };

  const handleBackPress = () => {
    setView('list');
    setSelectedBeneficiario(null);
  };

  const handleFormSubmit = (data) => {
    // Después de un registro exitoso, volvemos a la lista
    // (Esto se dispara desde el onSubmit del componente BeneficiarioForm)
    setTimeout(() => {
      setView('list');
    }, 2000); // Esperamos a que el usuario vea el modal de éxito
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER DINÁMICO */}
      <View style={styles.header}>
        {view === 'form' ? (
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>
                {selectedBeneficiario ? 'Editar' : 'Nuevo'} Beneficiario
              </Text>
              <Text style={styles.subtitle}>Complete los datos del formulario</Text>
            </View>
          </View>
        ) : (
          <View style={styles.headerSection}>
            <Text style={styles.title}>Módulo de Beneficiarios</Text>
            <Text style={styles.subtitle}>Gestión, consulta y registro de beneficiarios</Text>
          </View>
        )}
      </View>

      {view === 'list' ? (
        <BeneficiarioList
          onAddPress={handleAddPress}
          onEditPress={handleEditPress}
        />
      ) : (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <BeneficiarioForm
              initialData={selectedBeneficiario}
              onSubmit={handleFormSubmit}
            />
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
    backgroundColor: COLORS.background,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  scrollContent: {
    padding: 20,
  },
  headerSection: {
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
