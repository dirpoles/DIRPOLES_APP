import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/config';
import { Package } from 'lucide-react-native';

export default function InventarioScreen() {
  return (
    <View style={styles.container}>
      <Package size={64} color={COLORS.primary} strokeWidth={1.5} />
      <Text style={styles.title}>Inventario Médico</Text>
      <Text style={styles.subtitle}>Módulo en desarrollo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginTop: 16 },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginTop: 8 }
});
