import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Card, Avatar, IconButton, Badge, Menu, Divider } from 'react-native-paper';
import { 
  MoreVertical, 
  Package, 
  Calendar, 
  Tag, 
  Edit, 
  Trash2 
} from 'lucide-react-native';
import { COLORS } from '../../constants/config';

/**
 * COMPONENTE: InsumoCard (SOLID: Componente de Presentación Única)
 * 
 * Renderiza la tarjeta visual con la información detallada de un insumo médico.
 */
const InsumoCard = ({ item, onEditPress, onDeletePress }) => {
  const [visible, setVisible] = React.useState(false);
  const openMenu = () => setVisible(true);
  const closeMenu = () => setVisible(false);

  // Iniciales para el Avatar
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'IN';
  };

  // Temas visuales según el estatus y cantidad del insumo
  const getStatusTheme = (estatus, cantidad) => {
    const qty = parseInt(cantidad, 10) || 0;
    
    if (estatus?.toLowerCase() === 'vencido') {
      return { bg: '#FDE8E8', color: '#9B1C1C', label: 'Vencido' };
    }
    if (qty <= 0 || estatus?.toLowerCase() === 'agotado') {
      return { bg: '#FEF3C7', color: '#92400E', label: 'Agotado' };
    }
    return { bg: '#DEF7EC', color: '#03543F', label: 'Disponible' };
  };

  const statusTheme = getStatusTheme(item.estatus, item.cantidad);

  return (
    <Card style={styles.card} onPress={() => onEditPress && onEditPress(item)}>
      <Card.Content style={styles.cardContent}>
        {/* Avatar representativo */}
        <View style={styles.avatarContainer}>
          <Avatar.Text 
            size={48} 
            label={getInitials(item.nombre_insumo)} 
            style={[styles.avatar, { backgroundColor: statusTheme.bg }]}
            labelStyle={{ color: statusTheme.color, fontWeight: '700' }}
          />
        </View>
        
        {/* Información central del Insumo */}
        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
            {item.nombre_insumo}
          </Text>
          
          <View style={styles.detailRow}>
            <Tag size={14} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>
              {item.tipo_insumo} • {item.presentacion}
            </Text>
          </View>
          
          <View style={styles.detailRow}>
            <Package size={14} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>
              Stock disponible: <Text style={styles.highlightText}>{item.cantidad}</Text>
            </Text>
          </View>

          {item.fecha_vencimiento && (
            <View style={styles.detailRow}>
              <Calendar 
                size={14} 
                color={item.estatus?.toLowerCase() === 'vencido' ? COLORS.danger : COLORS.textSecondary} 
              />
              <Text 
                style={[
                  styles.detailText, 
                  item.estatus?.toLowerCase() === 'vencido' && styles.vencidoText
                ]}
              >
                Vence: {item.fecha_vencimiento}
              </Text>
            </View>
          )}
        </View>

        {/* Acciones e Indicadores */}
        <View style={styles.actionContainer}>
          <Badge 
            style={[styles.badge, { backgroundColor: statusTheme.bg, color: statusTheme.color }]}
          >
            {statusTheme.label}
          </Badge>
          
          <Menu
            visible={visible}
            onDismiss={closeMenu}
            anchor={
              <IconButton
                icon={() => <MoreVertical size={20} color={COLORS.textSecondary} />}
                onPress={openMenu}
              />
            }
            contentStyle={styles.menuContent}
          >
            <Menu.Item 
              onPress={() => { onEditPress && onEditPress(item); closeMenu(); }} 
              title="Editar" 
              leadingIcon={() => <Edit size={20} color={COLORS.primary} />}
            />
            <Divider />
            <Menu.Item 
              onPress={() => { onDeletePress && onDeletePress(item); closeMenu(); }} 
              title="Desactivar" 
              titleStyle={{ color: COLORS.danger }}
              leadingIcon={() => <Trash2 size={20} color={COLORS.danger} />}
            />
          </Menu>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
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
    marginTop: 2,
  },
  detailText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  highlightText: {
    fontWeight: '700',
    color: COLORS.text,
  },
  vencidoText: {
    color: COLORS.danger,
    fontWeight: '600',
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
  menuContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginTop: 40,
  }
});

export default InsumoCard;
