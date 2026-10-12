import React from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Text,
  FAB,
  Searchbar,
} from 'react-native-paper';
import { 
  ClipboardList, 
  CalendarPlus
} from 'lucide-react-native';
import { COLORS } from '../../constants/config';
import { useCitasList } from '../../hooks/useCitasList';
import CitaCard from './CitaCard';
import CustomModal from '../UI/CustomModal';

/**
 * COMPONENTE: CitaList
 * Contenedor principal que maneja la lista de citas, búsqueda y modal informativo.
 */
const CitaList = ({ onAddPress, onEditPress }) => {
  const { 
    citas, 
    loading, 
    error, 
    searchQuery, 
    handleSearch, 
    eliminarCita,
    refetch 
  } = useCitasList();

  // Estados para modal de confirmación y feedback
  const [citaToDelete, setCitaToDelete] = React.useState(null);
  const [confirmModalVisible, setConfirmModalVisible] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [feedbackModal, setFeedbackModal] = React.useState({ visible: false, title: '', message: '', type: 'info' });

  const handleDeletePress = (item) => {
    // REGLA DE NEGOCIO: No se pueden eliminar citas con estado 'Atendida'
    if (item.nombre_estado?.toLowerCase() === 'atendida') {
      setFeedbackModal({
        visible: true,
        title: 'Acción No Permitida',
        message: 'No es posible eliminar una cita que ya fue marcada como "Atendida", ya que forma parte del historial médico y de atención del paciente.',
        type: 'warning'
      });
      return;
    }

    setCitaToDelete(item);
    setConfirmModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!citaToDelete) return;
    setIsDeleting(true);
    try {
      const res = await eliminarCita(citaToDelete.id_cita);
      setConfirmModalVisible(false);
      if (res.success) {
        setFeedbackModal({
          visible: true,
          title: '¡Cita Eliminada!',
          message: res.message || 'La cita ha sido eliminada exitosamente del sistema.',
          type: 'success'
        });
      } else {
        setFeedbackModal({
          visible: true,
          title: 'Error al Eliminar',
          message: res.message || 'No se pudo eliminar la cita.',
          type: 'error'
        });
      }
    } catch (err) {
      setConfirmModalVisible(false);
      setFeedbackModal({
        visible: true,
        title: 'Error de Conexión',
        message: 'No se pudo conectar con el servidor para eliminar la cita.',
        type: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const renderItem = ({ item }) => (
    <CitaCard 
      item={item} 
      onEditPress={onEditPress} 
      onDeletePress={handleDeletePress}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar paciente o psicólogo..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />
      </View>

      {loading && citas.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando citas...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={refetch} style={styles.retryButton}>
            <Text style={styles.retryText}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={citas}
          keyExtractor={(item) => String(item.id_cita)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={refetch}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ClipboardList size={64} color={COLORS.border} />
              <Text style={styles.emptyText}>No hay citas programadas</Text>
            </View>
          }
        />
      )}

      <FAB
        icon={() => <CalendarPlus color="#FFF" size={24} />}
        style={styles.fab}
        onPress={onAddPress}
        label="Nueva Cita"
        color="#FFF"
      />

      {/* MODAL DE CONFIRMACIÓN DE ELIMINACIÓN */}
      <CustomModal
        visible={confirmModalVisible}
        onClose={() => setConfirmModalVisible(false)}
        onConfirm={handleConfirmDelete}
        title="Eliminar Cita"
        message={`¿Está seguro que desea eliminar la cita de "${citaToDelete?.beneficiario || 'este paciente'}" programada para el ${citaToDelete?.fecha_formateada || citaToDelete?.fecha || ''} a las ${citaToDelete?.hora_formateada || citaToDelete?.hora || ''}?`}
        type="warning"
        confirmText={isDeleting ? 'Eliminando...' : 'Eliminar'}
        cancelText="Cancelar"
      />

      {/* MODAL DE FEEDBACK / ESTADO */}
      <CustomModal
        visible={feedbackModal.visible}
        onClose={() => setFeedbackModal(prev => ({ ...prev, visible: false }))}
        title={feedbackModal.title}
        message={feedbackModal.message}
        type={feedbackModal.type}
        buttonText="Entendido"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  searchBar: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.surface,
    elevation: 2,
    borderRadius: 12,
  },
  searchInput: {
    fontSize: 14,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.primary,
    borderRadius: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textMuted,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 8,
  },
  retryText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default CitaList;
