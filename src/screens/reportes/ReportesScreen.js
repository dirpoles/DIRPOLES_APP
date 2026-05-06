import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/config';
import { BarChart3 } from 'lucide-react-native';

export default function ReportesScreen() {
  return (
    <View style={styles.container}>
      <BarChart3 size={64} color={COLORS.primary} strokeWidth={1.5} />
      <Text style={styles.title}>Reportes Estadísticos</Text>
      <Text style={styles.subtitle}>Módulo en desarrollo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginTop: 16 },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginTop: 8 }
});
