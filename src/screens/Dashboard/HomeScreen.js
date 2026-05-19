import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl
} from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { COLORS } from '../../constants/config';
import { useAuth } from '../../context/AuthContext';
import { useCitasList } from '../../hooks/useCitasList';
import { useNavigation } from '@react-navigation/native';
import { Clock, ChevronRight, ClipboardList } from 'lucide-react-native';
import CustomModal from '../../components/UI/CustomModal';

// Configuración de idioma para el calendario (Español)
LocaleConfig.locales['es'] = {
  monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
  monthNamesShort: ['Ene.', 'Feb.', 'Mar.', 'Abr.', 'May.', 'Jun.', 'Jul.', 'Ago.', 'Sep.', 'Oct.', 'Nov.', 'Dic.'],
  dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
  today: 'Hoy'
};
LocaleConfig.defaultLocale = 'es';

/**
 * PANTALLA DE INICIO (DASHBOARD) - SOLID & SRP
 * 
 * Contiene el calendario dinámico de citas sincronizado con la base de datos
 * y un resumen rápido filtrado reactivamente por el día seleccionado.
 */
export default function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  
  // Utilizar el hook ya existente del módulo de citas para mantener consistencia y SRP
  const { citas, loading, error, refetch } = useCitasList();

  // Helper para obtener hoy en formato YYYY-MM-DD (local)
  const getTodayDateString = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const [selectedDate, setSelectedDate] = useState(getTodayDateString());
  const [selectedCitaDetails, setSelectedCitaDetails] = useState(null);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);

  // Paleta de colores para los estados de la cita (Consistente con CitaCard)
  const getStatusDotColor = (nombre_estado) => {
    switch (nombre_estado?.toLowerCase()) {
      case 'pendiente':
        return COLORS.warning;
      case 'confirmada':
        return COLORS.info;
      case 'atendida':
        return COLORS.accent;
      case 'cancelada':
        return COLORS.danger;
      case 'no asistió':
        return '#8B5CF6'; // Violeta
      default:
        return COLORS.secondary;
    }
  };

  const getStatusBgColor = (nombre_estado) => {
    switch (nombre_estado?.toLowerCase()) {
      case 'pendiente':
        return '#FEF3C7'; // Amarillo claro
      case 'confirmada':
        return '#DBEAFE'; // Azul claro
      case 'atendida':
        return '#DEF7EC'; // Verde claro
      case 'cancelada':
        return '#FDE8E8'; // Rojo claro
      case 'no asistió':
        return '#F3E8FF'; // Violeta claro
      default:
        return COLORS.border;
    }
  };

  // Construir marcado de fechas en tiempo real basado en citas en BD
  const markedDates = {};
  citas.forEach(cita => {
    if (cita.fecha) {
      markedDates[cita.fecha] = {
        marked: true,
        dotColor: getStatusDotColor(cita.nombre_estado)
      };
    }
  });

  // Resaltar día seleccionado
  markedDates[selectedDate] = {
    ...markedDates[selectedDate],
    selected: true,
    selectedColor: COLORS.primary
  };

  // Filtrar citas del día seleccionado
  const selectedCitas = citas.filter(cita => cita.fecha === selectedDate);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
    }
    return dateStr;
  };

  const handleCitaPress = (cita) => {
    setSelectedCitaDetails(cita);
    setDetailsModalVisible(true);
  };

  const handleSeeAll = () => {
    // Navegar directamente a la pestaña Citas
    navigation.navigate('Citas');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={refetch} 
            colors={[COLORS.primary]} 
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Sección de Bienvenida */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>¡Hola, {user?.nombre + ' ' + user?.apellido || 'Usuario'}!</Text>
          <Text style={styles.roleText}>{user?.tipo_empleado || 'Personal'}</Text>
          <Text style={styles.subtitle}>Panel de Control - Citas Psicológicas</Text>
        </View>

        {/* Calendario Central */}
        <View style={styles.calendarCard}>
          <Calendar
            onDayPress={day => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: '#ffffff',
              calendarBackground: '#ffffff',
              textSectionTitleColor: COLORS.secondary,
              selectedDayBackgroundColor: COLORS.primary,
              selectedDayTextColor: '#ffffff',
              todayTextColor: COLORS.primary,
              dayTextColor: COLORS.text,
              textDisabledColor: COLORS.textMuted,
              dotColor: COLORS.primary,
              selectedDotColor: '#ffffff',
              arrowColor: COLORS.primary,
              monthTextColor: COLORS.primary,
              indicatorColor: COLORS.primary,
              textDayFontWeight: '500',
              textMonthFontWeight: 'bold',
              textDayHeaderFontWeight: '600',
              textDayFontSize: 14,
              textMonthFontSize: 16,
              textDayHeaderFontSize: 12
            }}
          />
        </View>

        {/* Resumen de Citas del Día */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Citas para el {formatDate(selectedDate)}</Text>
          <TouchableOpacity onPress={handleSeeAll}>
            <Text style={styles.seeAll}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        {/* Mostrar Loader si está cargando por primera vez */}
        {loading && citas.length === 0 ? (
          <View style={styles.centerLoader}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Sincronizando agenda...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>No se pudieron cargar las citas.</Text>
          </View>
        ) : selectedCitas.length === 0 ? (
          <View style={styles.emptyAppointmentsCard}>
            <ClipboardList size={40} color={COLORS.textMuted} strokeWidth={1.5} />
            <Text style={styles.emptyAppointmentsText}>
              No hay citas programadas para esta fecha.
            </Text>
          </View>
        ) : (
          selectedCitas.map(cita => (
            <TouchableOpacity 
              key={cita.id_cita} 
              activeOpacity={0.7} 
              onPress={() => handleCitaPress(cita)}
              style={styles.appointmentCard}
            >
              <View style={styles.appointmentInfo}>
                <View style={[styles.timeBadge, { backgroundColor: getStatusBgColor(cita.nombre_estado) }]}>
                  <Clock size={14} color={getStatusDotColor(cita.nombre_estado)} />
                  <Text style={[styles.timeText, { color: getStatusDotColor(cita.nombre_estado) }]}>
                    {cita.hora_formateada}
                  </Text>
                </View>
                <Text style={styles.patientName}>{cita.beneficiario}</Text>
                <Text style={styles.serviceType}>Psic. {cita.empleado}</Text>
              </View>
              <View style={styles.rightActionContainer}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusBgColor(cita.nombre_estado) }]}>
                  <Text style={[styles.statusBadgeText, { color: getStatusDotColor(cita.nombre_estado) }]}>
                    {cita.nombre_estado}
                  </Text>
                </View>
                <ChevronRight size={20} color={COLORS.border} />
              </View>
            </TouchableOpacity>
          ))
        )}

      </ScrollView>

      {/* MODAL DE DETALLES DE CITA */}
      <CustomModal
        visible={detailsModalVisible}
        onClose={() => setDetailsModalVisible(false)}
        title="Detalles de la Cita"
        message={selectedCitaDetails ? 
          `👤 Paciente:\n${selectedCitaDetails.beneficiario}\n\n🧠 Especialista:\nPsic. ${selectedCitaDetails.empleado}\n\n📅 Fecha:\n${selectedCitaDetails.fecha_formateada}\n\n⏰ Hora:\n${selectedCitaDetails.hora_formateada}\n\n🏷️ Estado:\n${selectedCitaDetails.nombre_estado || 'Sin estado'}` 
          : ''
        }
        type="info"
        buttonText="Cerrar"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 10,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '800',
    color: COLORS.primary,
  },
  roleText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  calendarCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 10,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    flex: 1,
    paddingRight: 10,
  },
  seeAll: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  appointmentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
  },
  appointmentInfo: {
    flex: 1,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
  },
  timeText: {
    fontSize: 11,
    fontWeight: '700',
    marginLeft: 4,
  },
  patientName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
  },
  serviceType: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  rightActionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  emptyAppointmentsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    gap: 8,
  },
  emptyAppointmentsText: {
    fontSize: 14,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
  centerLoader: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    backgroundColor: '#FFF5F5',
    borderColor: COLORS.danger,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 13,
    fontWeight: '500',
  },
});
