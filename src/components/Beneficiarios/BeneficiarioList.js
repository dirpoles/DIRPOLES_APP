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
  Searchbar,
  Portal,
  Dialog,
  Button
} from 'react-native-paper';
import { 
  User,
  UserPlus, 
  AlertTriangle
} from 'lucide-react-native';
import { COLORS } from '../../constants/config';
import { useBeneficiariosList } from '../../hooks/useBeneficiariosList';
import beneficiarioService from '../../services/beneficiarioService';
import BeneficiarioCard from './BeneficiarioCard';

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
      if (result.success) {
        hideDeleteDialog();
        refetch();
      } else {
        alert(result.message || 'No se pudo desactivar el beneficiario');
      }
    } catch (error) {
      alert('Error de conexión al desactivar');
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

      {/* DIALOGO DE CONFIRMACIÓN DE ELIMINACIÓN */}
      <Portal>
        <Dialog visible={deleteDialogVisible} onDismiss={hideDeleteDialog} style={styles.dialog}>
          <Dialog.Title style={styles.dialogTitle}>
            <View style={styles.titleRow}>
              <AlertTriangle color={COLORS.danger} size={24} />
              <Text style={styles.titleText}>Confirmar Desactivación</Text>
            </View>
          </Dialog.Title>
          <Dialog.Content>
            <Text style={styles.dialogContent}>
              ¿Está seguro que desea desactivar a <Text style={{fontWeight: '700'}}>{itemToDelete?.nombre_completo || itemToDelete?.nombres}</Text>?
            </Text>
            <Text style={styles.dialogSubContent}>
              El registro permanecerá en el sistema pero figurará como "Inactivo".
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={hideDeleteDialog} labelStyle={{color: COLORS.textSecondary}}>Cancelar</Button>
            <Button 
              onPress={confirmDelete} 
              loading={isDeleting}
              disabled={isDeleting}
              mode="contained"
              style={{backgroundColor: COLORS.danger}}
            >
              Desactivar
            </Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
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
  dialog: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
  },
  dialogTitle: {
    paddingBottom: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  titleText: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  dialogContent: {
    fontSize: 16,
    color: COLORS.text,
    lineHeight: 22,
    marginTop: 10,
  },
  dialogSubContent: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 12,
    fontStyle: 'italic',
  }
});

export default BeneficiarioList;
