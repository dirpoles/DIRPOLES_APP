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
    refetch 
  } = useCitasList();

  // Estado para el modal informativo (reemplazo del eliminar)
  const [infoModalVisible, setInfoModalVisible] = React.useState(false);

  const showInfoModal = () => {
    setInfoModalVisible(true);
  };

  const renderItem = ({ item }) => (
    <CitaCard 
      item={item} 
      onEditPress={onEditPress} 
      onInfoPress={showInfoModal}
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

      {/* MODAL INFORMATIVO */}
      <CustomModal
        visible={infoModalVisible}
        onClose={() => setInfoModalVisible(false)}
        title="Información"
        message="Para eliminar o cancelar una cita, por favor acceda al sistema web desde un computador."
        type="info"
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
