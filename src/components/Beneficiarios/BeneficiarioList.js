import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  FlatList,
  TouchableOpacity,
  TextInput as RNTextInput,
} from 'react-native';
import {
  Text,
  Card,
  Avatar,
  IconButton,
  FAB,
  Searchbar,
  Badge,
  useTheme
} from 'react-native-paper';
import { 
  Search, 
  Filter, 
  User, 
  MoreVertical, 
  UserPlus, 
  ChevronRight,
  IdCard,
  GraduationCap
} from 'lucide-react-native';
import { COLORS } from '../../constants/config';

/**
 * COMPONENTE: BeneficiarioList
 * Muestra la lista de beneficiarios con tarjetas y buscador.
 */
const BeneficiarioList = ({ onAddPress, onEditPress }) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  // Datos de prueba (Dummy Data) para ver el diseño
  const [beneficiarios] = useState([
    { id: '1', nombres: 'Roberth', apellidos: 'Matos', cedula: '25123456', pnf: 'Informática', seccion: '3013-B', estatus: 1 },
    { id: '2', nombres: 'Maria', apellidos: 'Perez', cedula: '18999888', pnf: 'Contaduría', seccion: '1101-M', estatus: 1 },
    { id: '3', nombres: 'Juan', apellidos: 'García', cedula: '30444555', pnf: 'Sistemas', seccion: '4201-C', estatus: 0 },
  ]);

  const renderItem = ({ item }) => (
    <Card style={styles.card} onPress={() => onEditPress(item)}>
      <Card.Content style={styles.cardContent}>
        <View style={styles.avatarContainer}>
          <Avatar.Text 
            size={48} 
            label={`${item.nombres[0]}${item.apellidos[0]}`} 
            style={[styles.avatar, { backgroundColor: item.estatus ? COLORS.primaryLight : COLORS.border }]}
            labelStyle={{ color: item.estatus ? COLORS.primary : COLORS.textSecondary }}
          />
        </View>
        
        <View style={styles.infoContainer}>
          <Text style={styles.name}>{item.nombres} {item.apellidos}</Text>
          <View style={styles.detailRow}>
            <IdCard size={14} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>V-{item.cedula}</Text>
          </View>
          <View style={styles.detailRow}>
            <GraduationCap size={14} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{item.pnf} • {item.seccion}</Text>
          </View>
        </View>

        <View style={styles.actionContainer}>
          <Badge 
            style={[styles.badge, { backgroundColor: item.estatus ? '#DEF7EC' : '#FDE8E8', color: item.estatus ? '#03543F' : '#9B1C1C' }]}
          >
            {item.estatus ? 'Activo' : 'Inactivo'}
          </Badge>
          <IconButton
            icon={() => <MoreVertical size={20} color={COLORS.textSecondary} />}
            onPress={() => {}}
          />
        </View>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Buscar por cédula o nombre..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
          iconColor={COLORS.primary}
        />
        <TouchableOpacity style={styles.filterBtn}>
          <Filter size={20} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={beneficiarios}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <User size={64} color={COLORS.border} />
            <Text style={styles.emptyText}>No se encontraron beneficiarios</Text>
          </View>
        }
      />

      <FAB
        icon={() => <UserPlus color="#FFF" size={24} />}
        style={styles.fab}
        onPress={onAddPress}
        label="Nuevo"
        color="#FFF"
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
  filterBtn: {
    width: 48,
    height: 48,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100, // Espacio para el FAB
  },
  card: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  avatarContainer: {
    marginRight: 12,
  },
  avatar: {
    borderRadius: 12,
  },
  infoContainer: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  actionContainer: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  badge: {
    marginBottom: 4,
    fontSize: 10,
    fontWeight: '700',
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
});

export default BeneficiarioList;
