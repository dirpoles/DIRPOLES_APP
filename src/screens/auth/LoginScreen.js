import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Alert,
  Dimensions,
  Image,
} from 'react-native';
import { TextInput, Button, IconButton, useTheme, ActivityIndicator } from 'react-native-paper';
import { Mail, Lock, LogIn, Eye, EyeOff, ShieldCheck } from 'lucide-react-native';
import { useLoginForm } from '../../hooks/useLoginForm';
import { COLORS } from '../../constants/config';
import CustomModal from '../../components/UI/CustomModal';

const { width, height } = Dimensions.get('window');

/**
 * PANTALLA DE INICIO DE SESIÓN
 * 
 * Implementa una interfaz elegante y moderna con React Native Paper.
 * Maneja el comportamiento del teclado mediante KeyboardAvoidingView.
 */
export default function LoginScreen() {
  const {
    formData,
    errors,
    isSubmitting,
    showPassword,
    setShowPassword,
    modalVisible,
    setModalVisible,
    modalConfig,
    handleChange,
    handleSubmit
  } = useLoginForm();

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Cabecera / Branding */}
          <View style={styles.headerContainer}>
            <View style={styles.logoCircle}>
              <ShieldCheck color={COLORS.primary} size={48} strokeWidth={2.5} />
            </View>
            <Text style={styles.title}>DIRPOLES 4</Text>
            <Text style={styles.subtitle}>Sistema de Gestión Administrativa</Text>
          </View>

          {/* Formulario */}
          <View style={styles.formContainer}>
            <Text style={styles.welcomeText}>¡Bienvenido de nuevo!</Text>
            <Text style={styles.instructionText}>Ingresa tus credenciales para continuar</Text>

            {/* Input Correo */}
            <View style={styles.inputWrapper}>
              <TextInput
                label="Correo Electrónico"
                value={formData.correo}
                onChangeText={(val) => handleChange('correo', val)}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!errors.correo}
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                style={styles.input}
                placeholder="ejemplo@correo.com"
                left={<TextInput.Icon icon={() => <Mail size={20} color={errors.correo ? COLORS.danger : COLORS.secondary} />} />}
              />
              {errors.correo ? <Text style={styles.errorText}>{errors.correo}</Text> : null}
            </View>

            {/* Input Contraseña */}
            <View style={styles.inputWrapper}>
              <TextInput
                label="Contraseña"
                value={formData.password}
                onChangeText={(val) => handleChange('password', val)}
                mode="outlined"
                secureTextEntry={!showPassword}
                error={!!errors.password}
                outlineColor={COLORS.border}
                activeOutlineColor={COLORS.primary}
                style={styles.input}
                placeholder="••••••••"
                left={<TextInput.Icon icon={() => <Lock size={20} color={errors.password ? COLORS.danger : COLORS.secondary} />} />}
                right={
                  <TextInput.Icon
                    icon={() => (
                      showPassword ?
                        <EyeOff size={20} color={COLORS.secondary} /> :
                        <Eye size={20} color={COLORS.secondary} />
                    )}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            {/* Olvidé mi contraseña */}
            <View style={styles.forgotContainer}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </View>

            {/* Botón de Acción */}
            <Button
              mode="contained"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={isSubmitting}
              style={styles.loginButton}
              contentStyle={styles.loginButtonContent}
              labelStyle={styles.loginButtonLabel}
            >
              {isSubmitting ? 'Iniciando sesión...' : 'Entrar'}
            </Button>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Dirección de Políticas Estudiantiles - UPTAEB.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Modal Personalizado */}
      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'center',
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 40,
    marginTop: 20,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    // Sombra premium
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.primary,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.secondary,
    fontWeight: '500',
    marginTop: 4,
  },
  formContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    // Sombra suave
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  welcomeText: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 24,
  },
  inputWrapper: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: COLORS.surface,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
    fontWeight: '500',
  },
  forgotContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
  },
  loginButton: {
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  loginButtonContent: {
    paddingVertical: 8,
  },
  loginButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
});
