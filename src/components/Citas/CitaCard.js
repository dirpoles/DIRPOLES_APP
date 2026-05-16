import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text, Card, Avatar, IconButton, Menu, Divider } from 'react-native-paper';
import { 
    MoreVertical, 
    Calendar, 
    Clock, 
    User, 
    Edit, 
    Info 
} from 'lucide-react-native';
import { COLORS } from '../../constants/config';

/**
 * COMPONENTE: CitaCard
 * Molde visual para una cita individual.
 * - Click en el card abre editar.
 * - Badge dinámico según nombre_estado.
 * - Botón eliminar reemplazado por informativo.
 */
const CitaCard = ({ item, onEditPress, onInfoPress }) => {
    const [visible, setVisible] = React.useState(false);
    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    // Obtener iniciales del beneficiario para el avatar
    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
    };

    // Colores dinámicos según el estado de la cita
    const getStatusTheme = (nombre_estado) => {
        switch (nombre_estado?.toLowerCase()) {
            case 'pendiente':
                return { bg: '#FEF3C7', color: '#92400E' };
            case 'confirmada':
                return { bg: '#DBEAFE', color: '#1E40AF' };
            case 'atendida':
                return { bg: '#DEF7EC', color: '#03543F' };
            case 'cancelada':
                return { bg: '#FDE8E8', color: '#9B1C1C' };
            case 'no asistió':
                return { bg: '#F3E8FF', color: '#6B21A8' };
            default:
                return { bg: COLORS.border, color: COLORS.textSecondary };
        }
    };

    const statusTheme = getStatusTheme(item.nombre_estado);

    return (
        <TouchableOpacity activeOpacity={0.7} onPress={() => onEditPress(item)}>
            <Card style={styles.card}>
                <Card.Content style={styles.cardContent}>
                    <View style={styles.avatarContainer}>
                        <Avatar.Text
                            size={48}
                            label={getInitials(item.beneficiario)}
                            style={[styles.avatar, { backgroundColor: statusTheme.bg }]}
                            labelStyle={{ color: statusTheme.color }}
                        />
                    </View>

                    <View style={styles.infoContainer}>
                        <Text style={styles.name}>{item.beneficiario}</Text>
                        
                        <View style={styles.detailRow}>
                            <User size={14} color={COLORS.textSecondary} />
                            <Text style={styles.detailText}>Psic. {item.empleado}</Text>
                        </View>

                        <View style={styles.detailRow}>
                            <Calendar size={14} color={COLORS.primary} />
                            <Text style={styles.detailText}>{item.fecha_formateada}</Text>
                            <Clock size={14} color={COLORS.primary} style={{ marginLeft: 8 }} />
                            <Text style={styles.detailText}>{item.hora_formateada}</Text>
                        </View>
                    </View>

                    <View style={styles.actionContainer}>
                        <View style={[styles.badge, { backgroundColor: statusTheme.bg }]}>
                            <Text style={[styles.badgeText, { color: statusTheme.color }]}>
                                {item.nombre_estado || 'Sin estado'}
                            </Text>
                        </View>

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
                                onPress={() => { onEditPress(item); closeMenu(); }}
                                title="Editar"
                                leadingIcon={() => <Edit size={20} color={COLORS.primary} />}
                            />
                            <Divider />
                            <Menu.Item
                                onPress={() => { onInfoPress(item); closeMenu(); }}
                                title="Información"
                                titleStyle={{ color: COLORS.textSecondary }}
                                leadingIcon={() => <Info size={20} color={COLORS.textSecondary} />}
                            />
                        </Menu>
                    </View>
                </Card.Content>
            </Card>
        </TouchableOpacity>
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
    actionContainer: {
        alignItems: 'flex-end',
        justifyContent: 'space-between',
    },
    badge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 4,
    },
    badgeText: {
        fontSize: 11,
        fontWeight: '700',
    },
    menuContent: {
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        marginTop: 40,
    }
});

export default CitaCard;