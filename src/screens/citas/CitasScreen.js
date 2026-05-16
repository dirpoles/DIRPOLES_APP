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
import { ArrowLeft } from 'lucide-react-native';
import { COLORS } from '../../constants/config';
import CitaList from '../../components/Citas/CitaList';
import CitaForm from '../../components/Citas/CitaForm';
import CustomModal from '../../components/UI/CustomModal';

export default function CitasScreen({ navigation }) {
  const [view, setView] = useState('list');
  const [selectedCita, setSelectedCita] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('success');

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

  const handleFormSubmit = (result) => {
    if (result.success) {
      setModalType('success');
      setModalTitle(selectedCita ? '¡Cita Actualizada!' : '¡Cita Programada!');
      setModalMessage(result.message || 'La operación se realizó exitosamente.');
    } else {
      setModalType('error');
      setModalTitle('Error');
      setModalMessage(result.message || 'No se pudo procesar la cita.');
    }
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    if (modalType === 'success') {
      setView('list');
    }
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
            <CitaForm 
              initialData={selectedCita}
              onSubmit={handleFormSubmit}
            />
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* MODAL PERSONALIZADO */}
      <CustomModal
        visible={modalVisible}
        onClose={handleModalClose}
        title={modalTitle}
        message={modalMessage}
        type={modalType}
      />
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
  }
});
