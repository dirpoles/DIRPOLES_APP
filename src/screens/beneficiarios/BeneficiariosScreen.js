import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/config';
import { Users } from 'lucide-react-native';

export default function BeneficiariosScreen() {
  return (
    <View style={styles.container}>
      <Users size={64} color={COLORS.primary} strokeWidth={1.5} />
      <Text style={styles.title}>Beneficiarios</Text>
      <Text style={styles.subtitle}>Módulo en desarrollo</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  title: { fontSize: 24, fontWeight: 'bold', color: COLORS.text, marginTop: 16 },
  subtitle: { fontSize: 16, color: COLORS.textSecondary, marginTop: 8 }
});
