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
  Package,
  Plus
} from 'lucide-react-native';
import { COLORS } from '../../constants/config';
import { useInventarioList } from '../../hooks/useInventarioList';
import InsumoCard from './InsumoCard';
import CustomModal from '../UI/CustomModal';

/**
 * COMPONENTE: InventarioList (SOLID: Orquestador de Lista e Interacciones)
 * 
 * Encapsula la visualización de la lista de insumos médicos con búsqueda reactiva,
 * manejo de estados asíncronos y diálogos de advertencia informativos con diseño premium.
 */
const InventarioList = ({ onAddPress, onEditPress }) => {
  const { 
    insumos, 
    loading, 
    error, 
    searchQuery, 
    handleSearch, 
    refetch 
  } = useInventarioList();
  
  // Modal de advertencia informativa (Acción no permitida)
  const [infoModalVisible, setInfoModalVisible] = React.useState(false);
  const [infoModalConfig, setInfoModalConfig] = React.useState({ title: '', message: '', type: 'info' });

  const showDeleteWarning = (item) => {
    setInfoModalConfig({
      title: 'Acción No Permitida',
      message: `La desactivación o eliminación del insumo "${item.nombre_insumo}" no está permitida desde la aplicación móvil. Por motivos de auditoría, debe realizar esta acción a través del panel de la aplicación web de DIRPOLES.`,
      type: 'info'
    });
    setInfoModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <InsumoCard 
      item={item} 
      onEditPress={onEditPress} 
      onDeletePress={showDeleteWarning}
    />
  );

  return (
    <View style={styles.container}>
      {/* Barra de Búsqueda */}
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar por nombre, tipo o estatus..."
          onChangeText={handleSearch}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />
      </View>

      {/* Manejo de estados de carga y error */}
      {loading && insumos.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando inventario médico...</Text>
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
          data={insumos}
          keyExtractor={(item) => String(item.id_insumo || item.id)}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={loading}
          onRefresh={refetch}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Package size={64} color={COLORS.border} strokeWidth={1.2} />
              <Text style={styles.emptyText}>No se encontraron insumos médicos</Text>
            </View>
          }
        />
      )}

      {/* FAB para añadir insumos */}
      {onAddPress && (
        <FAB
          icon={() => <Plus color="#FFF" size={24} />}
          style={styles.fab}
          onPress={onAddPress}
          label="Nuevo Insumo"
          color="#FFF"
        />
      )}

      {/* MODAL DE ADVERTENCIA: ACCIÓN NO PERMITIDA DESDE MÓVIL */}
      <CustomModal
        visible={infoModalVisible}
        onClose={() => setInfoModalVisible(false)}
        title={infoModalConfig.title}
        message={infoModalConfig.message}
        type={infoModalConfig.type}
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

export default InventarioList;
