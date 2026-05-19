import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { COLORS } from '../../constants/config';
import InventarioList from '../../components/Inventario/InventarioList';
import InsumoForm from '../../components/Inventario/InsumoForm';
import CustomModal from '../../components/UI/CustomModal';

/**
 * PANTALLA PRINCIPAL: Módulo de Inventario Médico (SOLID: Capa de Presentación)
 * 
 * Orquesta la interfaz principal del inventario médico. Permite listar todos los
 * insumos, buscar en tiempo real, desactivar, registrar nuevos y editar existentes.
 */
export default function InventarioScreen() {
  const [view, setView] = useState('list'); // 'list' o 'form'
  const [selectedInsumo, setSelectedInsumo] = useState(null);
  const [infoModalVisible, setInfoModalVisible] = useState(false);
  const [infoModalConfig, setInfoModalConfig] = useState({ title: '', message: '' });

  const handleAddPress = () => {
    setSelectedInsumo(null);
    setView('form');
  };

  const handleEditPress = (insumo) => {
    setSelectedInsumo(insumo);
    setView('form');
  };

  const handleBackPress = () => {
    setView('list');
    setSelectedInsumo(null);
  };

  const handleFormSubmit = (result) => {
    // Si la operación (registro o edición) fue exitosa, regresamos a la lista de insumos
    if (result.success) {
      setTimeout(() => {
        setView('list');
        setSelectedInsumo(null);
      }, 2000); // 2 segundos para apreciar el modal de éxito de InsumoForm
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER COHERENTE Y DINÁMICO */}
      <View style={styles.header}>
        {view === 'form' ? (
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
              <ArrowLeft size={24} color={COLORS.primary} />
            </TouchableOpacity>
            <View>
              <Text style={styles.title}>{selectedInsumo ? 'Editar Insumo' : 'Nuevo Insumo'}</Text>
              <Text style={styles.subtitle}>
                {selectedInsumo 
                  ? 'Modifique los campos permitidos del insumo' 
                  : 'Complete los datos del insumo médico'}
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.headerSection}>
            <Text style={styles.title}>Módulo de Inventario</Text>
            <Text style={styles.subtitle}>Consulta y control de insumos médicos de DIRPOLES</Text>
          </View>
        )}
      </View>

      {/* Cuerpo principal condicionado por el estado 'view' */}
      {view === 'list' ? (
        <InventarioList
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
            <InsumoForm initialData={selectedInsumo} onSubmit={handleFormSubmit} />
            <View style={{ height: 40 }} />
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {/* MODAL INFORMATIVO AUXILIAR */}
      <CustomModal
        visible={infoModalVisible}
        onClose={() => setInfoModalVisible(false)}
        title={infoModalConfig.title}
        message={infoModalConfig.message}
        type="info"
        buttonText="Entendido"
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
  },
});
