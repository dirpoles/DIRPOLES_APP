import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, Card, Avatar, IconButton, Badge, Menu, Divider } from 'react-native-paper';
import { 
    MoreVertical, 
    Calendar, 
    Clock, 
    User, 
    Edit, 
    Trash2 
} from 'lucide-react-native';
import { COLORS } from '../../constants/config';

/**
 * COMPONENTE: CitaCard
 * Molde visual para una cita individual.
 */
const CitaCard = ({ item, onEditPress, onDeletePress }) => {
    const [visible, setVisible] = React.useState(false);
    const openMenu = () => setVisible(true);
    const closeMenu = () => setVisible(false);

    // Obtener iniciales del beneficiario para el avatar
    const getInitials = (name) => {
        return name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : '??';
    };

    return (
        <Card style={styles.card}>
            <Card.Content style={styles.cardContent}>
                <View style={styles.avatarContainer}>
                    <Avatar.Text
                        size={48}
                        label={getInitials(item.beneficiario)}
                        style={[styles.avatar, { backgroundColor: item.estatus ? COLORS.primaryLight : COLORS.border }]}
                        labelStyle={{ color: item.estatus ? COLORS.primary : COLORS.textSecondary }}
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
                    <Badge
                        style={[styles.badge, { backgroundColor: item.estatus ? '#DEF7EC' : '#FDE8E8', color: item.estatus ? '#03543F' : '#9B1C1C' }]}
                    >
                        {item.estatus ? 'Programada' : 'Cancelada'}
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
                            onPress={() => { onEditPress(item); closeMenu(); }}
                            title="Editar"
                            leadingIcon={() => <Edit size={20} color={COLORS.primary} />}
                        />
                        <Divider />
                        <Menu.Item
                            onPress={() => { onDeletePress(item); closeMenu(); }}
                            title="Eliminar"
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

export default CitaCard;