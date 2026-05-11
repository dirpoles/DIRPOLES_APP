import React, { useState } from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { COLORS } from '../../constants/config';
import { useAuth } from '../../context/AuthContext';
import { Calendar as CalendarIcon, Clock, ChevronRight } from 'lucide-react-native';

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
 * PANTALLA DE INICIO (DASHBOARD)
 * 
 * Contiene el calendario de citas central y un resumen rápido.
 */
export default function HomeScreen() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState('');

  // Ejemplo de fechas marcadas (citas)
  const markedDates = {
    '2026-05-10': { marked: true, dotColor: COLORS.primary },
    '2026-05-15': { marked: true, dotColor: COLORS.accent },
    '2026-05-20': { marked: true, dotColor: COLORS.danger },
    [selectedDate]: { selected: true, disableTouchEvent: true, selectedColor: COLORS.primary }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Sección de Bienvenida */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>¡Hola, {user?.nombre || 'Usuario'}!</Text>
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
          <Text style={styles.sectionTitle}>Actividad Próxima</Text>
          <TouchableOpacity>
            <Text style={styles.seeAll}>Ver todo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.appointmentCard}>
          <View style={styles.appointmentInfo}>
            <View style={[styles.timeBadge, { backgroundColor: COLORS.primaryLight }]}>
              <Clock size={14} color={COLORS.primary} />
              <Text style={styles.timeText}>09:00 AM</Text>
            </View>
            <Text style={styles.patientName}>Juan Pérez</Text>
            <Text style={styles.serviceType}>Consulta General</Text>
          </View>
          <ChevronRight size={20} color={COLORS.border} />
        </View>

        <View style={styles.appointmentCard}>
          <View style={styles.appointmentInfo}>
            <View style={[styles.timeBadge, { backgroundColor: COLORS.accent + '20' }]}>
              <Clock size={14} color={COLORS.accent} />
              <Text style={[styles.timeText, { color: COLORS.accent }]}>11:30 AM</Text>
            </View>
            <Text style={styles.patientName}>María García</Text>
            <Text style={styles.serviceType}>Odontología</Text>
          </View>
          <ChevronRight size={20} color={COLORS.border} />
        </View>

      </ScrollView>
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
    // Sombra premium
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
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
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
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
    marginLeft: 4,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  serviceType: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
});
