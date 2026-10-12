import React from 'react';
import { 
  StyleSheet, 
  View, 
  FlatList, 
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { 
  Text, 
  FAB, 
  Searchbar
} from 'react-native-paper';
import { 
  User,
  UserPlus
} from 'lucide-react-native';
import { COLORS } from '../../constants/config';
import { useBeneficiariosList } from '../../hooks/useBeneficiariosList';
import beneficiarioService from '../../services/beneficiarioService';
import BeneficiarioCard from './BeneficiarioCard';
import CustomModal from '../UI/CustomModal';

/**
 * COMPONENTE: BeneficiarioList
 * Pantalla principal del módulo que gestiona la lista, búsqueda y borrado lógico.
 */
const BeneficiarioList = ({ onAddPress, onEditPress }) => {
  const { 
    beneficiarios, 
    loading, 
    error, 
    searchQuery, 
    handleSearch, 
    refetch 
  } = useBeneficiariosList();

  // Estados para el diálogo de confirmación de eliminación
  const [deleteDialogVisible, setDeleteDialogVisible] = React.useState(false);
  const [itemToDelete, setItemToDelete] = React.useState(null);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [feedbackModal, setFeedbackModal] = React.useState({ visible: false, title: '', message: '', type: 'info' });

  const showDeleteDialog = (item) => {
    setItemToDelete(item);
    setDeleteDialogVisible(true);
  };

  const hideDeleteDialog = () => {
    setDeleteDialogVisible(false);
    setItemToDelete(null);
    setIsDeleting(false);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    setIsDeleting(true);
    try {
      const result = await beneficiarioService.desactivar(itemToDelete.id_beneficiario);
      hideDeleteDialog();
      if (result.success) {
        setFeedbackModal({
          visible: true,
          title: '¡Operación Exitosa!',
          message: result.message || 'Beneficiario desactivado correctamente.',
          type: 'success'
        });
        refetch();
      } else {
        setFeedbackModal({
          visible: true,
          title: 'Error',
          message: result.message || 'No se pudo desactivar el beneficiario.',
          type: 'error'
        });
      }
    } catch (error) {
      hideDeleteDialog();
      setFeedbackModal({
        visible: true,
        title: 'Error de Conexión',
        message: 'No se pudo conectar con el servidor para desactivar.',
        type: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const renderItem = ({ item }) => (
    <BeneficiarioCard 
      item={item} 
      onEditPress={onEditPress} 
      onDeletePress={showDeleteDialog}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar por cédula o nombre..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />
      </View>

      {loading && beneficiarios.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando beneficiarios...</Text>
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
          data={beneficiarios}
          keyExtractor={(item) => String(item.id_beneficiario || item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={refetch}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <User size={64} color={COLORS.border} />
              <Text style={styles.emptyText}>No se encontraron beneficiarios</Text>
            </View>
          }
        />
      )}

      <FAB
        icon={() => <UserPlus color="#FFF" size={24} />}
        style={styles.fab}
        onPress={onAddPress}
        label="Nuevo"
        color="#FFF"
      />

      {/* MODAL DE CONFIRMACIÓN DE DESACTIVACIÓN */}
      <CustomModal
        visible={deleteDialogVisible}
        onClose={hideDeleteDialog}
        onConfirm={confirmDelete}
        title="Confirmar Desactivación"
        message={`¿Está seguro que desea desactivar a "${itemToDelete?.nombre_completo || itemToDelete?.nombres || 'este beneficiario'}"?\n\nEl registro permanecerá en el sistema pero figurará como "Inactivo".`}
        type="warning"
        confirmText={isDeleting ? 'Desactivando...' : 'Desactivar'}
        cancelText="Cancelar"
      />

      {/* MODAL DE FEEDBACK / RESULTADO */}
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

export default BeneficiarioList;
