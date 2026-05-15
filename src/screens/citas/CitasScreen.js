import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
  ScrollView 
} from 'react-native';
import { Button } from 'react-native-paper'; // IMPORTADO
import { ArrowLeft } from 'lucide-react-native';
import { COLORS } from '../../constants/config';
import CitaList from '../../components/Citas/CitaList';

export default function CitasScreen({ navigation }) {
  const [view, setView] = useState('list');
  const [selectedCita, setSelectedCita] = useState(null);

  const handleAddPress = () => {
    setSelectedCita(null);
    setView('form');
  };

  const handleEditPress = (cita) => {
    setSelectedCita(cita);
    setView('form');
  };

  const handleBackPress = () => {
    setView('list');
    setSelectedCita(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER CALCADO DE BENEFICIARIOS */}
      <View style={styles.header}>
        {view === 'form' ? (
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>
                {selectedCita ? 'Editar' : 'Nueva'} Cita
              </Text>
              <Text style={styles.subtitle}>Complete los datos de la cita médica</Text>
            </View>
          </View>
        ) : (
          <View style={styles.headerSection}>
            <Text style={styles.title}>Módulo de Citas</Text>
            <Text style={styles.subtitle}>Gestión, consulta y control de citas psicológicas</Text>
          </View>
        )}
      </View>

      {view === 'list' ? (
        <CitaList
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
            <View style={styles.placeholderForm}>
                <Text style={styles.placeholderText}>El formulario de citas se cargará aquí</Text>
                <Button 
                  mode="contained" 
                  onPress={handleBackPress} 
                  style={{marginTop: 20, backgroundColor: COLORS.primary}}
                >
                    Volver a la lista
                </Button>
            </View>
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
  scrollContent: {
    padding: 20,
  },
  placeholderForm: {
    flex: 1,
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 50
  },
  placeholderText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center'
  }
});
