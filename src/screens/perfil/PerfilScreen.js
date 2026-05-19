import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { TextInput, Button, Card, Avatar, Divider, List } from 'react-native-paper';
import { ArrowLeft, User, Mail, Phone, MapPin, Key, Save, ShieldAlert, Award } from 'lucide-react-native';
import { COLORS } from '../../constants/config';
import { usePerfil } from '../../hooks/usePerfil';
import CustomModal from '../../components/UI/CustomModal';

/**
 * PANTALLA: Perfil de Empleado (SOLID: Capa de Presentación Única)
 * 
 * Muestra la información personal del usuario logueado en la aplicación,
 * permitiendo editar sus datos y modificar su contraseña de forma segura.
 */
export default function PerfilScreen({ navigation }) {
  const {
    perfilData,
    formData,
    loading,
    errors,
    isSubmitting,
    modalVisible,
    setModalVisible,
    modalConfig,
    handleChange,
    handleSave
  } = usePerfil();

  const [passwordSectionExpanded, setPasswordSectionExpanded] = useState(false);

  // Obtener iniciales para el avatar premium
  const getInitials = () => {
    if (!perfilData) return '??';
    const n = perfilData.nombre || '';
    const a = perfilData.apellido || '';
    return (n[0] || '') + (a[0] || '');
  };

  if (loading && !perfilData) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando datos de tu perfil...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* CABECERA PREMIUM UNIFICADA */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <ArrowLeft size={24} color={COLORS.primary} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>Mi Perfil</Text>
          <Text style={styles.subtitle}>Consulta y actualiza tu información de DIRPOLES</Text>
        </View>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          showsVerticalScrollIndicator={false}
        >
          {/* SECCIÓN AVATAR SUPERIOR */}
          <View style={styles.avatarSection}>
            <Avatar.Text 
              size={90} 
              label={getInitials().toUpperCase()} 
              style={styles.avatar} 
              labelStyle={styles.avatarLabel} 
            />
            <Text style={styles.fullName}>{`${perfilData?.nombre} ${perfilData?.apellido}`}</Text>
            <View style={styles.roleBadge}>
              <Award size={14} color="#FFF" />
              <Text style={styles.roleBadgeText}>{perfilData?.tipo || 'Personal'}</Text>
            </View>
          </View>

          {/* CARD 1: INFORMACIÓN DE CONTROL (Solo Lectura) */}
          <Card style={[styles.card, styles.readonlyCard]}>
            <Card.Title 
              title="Información Institucional" 
              titleStyle={styles.cardTitle}
              left={(props) => <ShieldAlert {...props} size={22} color={COLORS.secondary} />}
            />
            <Card.Content>
              <View style={styles.readonlyRow}>
                <Text style={styles.readonlyLabel}>Cédula de Identidad</Text>
                <Text style={styles.readonlyValue}>{perfilData?.cedula_completa || 'Sin cédula'}</Text>
              </View>
              <Divider style={styles.divider} />
              <View style={styles.readonlyRow}>
                <Text style={styles.readonlyLabel}>Estado del Usuario</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusBadgeText}>{perfilData?.estatus || 'Activo'}</Text>
                </View>
              </View>
            </Card.Content>
          </Card>

          {/* CARD 2: DATOS EDITABLES */}
          <Card style={styles.card}>
            <Card.Title 
              title="Información Personal" 
              titleStyle={styles.cardTitle}
              left={(props) => <User {...props} size={22} color={COLORS.primary} />}
            />
            <Card.Content style={styles.formContent}>
              {/* Campo: Nombre */}
              <TextInput
                label="Nombre"
                value={formData.nombre}
                onChangeText={val => handleChange('nombre', val)}
                mode="outlined"
                error={!!errors.nombre}
                style={styles.input}
                left={<TextInput.Icon icon={() => <User size={20} color={errors.nombre ? COLORS.danger : COLORS.secondary} />} />}
              />
              {errors.nombre ? <Text style={styles.errorText}>{errors.nombre}</Text> : null}

              {/* Campo: Apellido */}
              <TextInput
                label="Apellido"
                value={formData.apellido}
                onChangeText={val => handleChange('apellido', val)}
                mode="outlined"
                error={!!errors.apellido}
                style={styles.input}
                left={<TextInput.Icon icon={() => <User size={20} color={errors.apellido ? COLORS.danger : COLORS.secondary} />} />}
              />
              {errors.apellido ? <Text style={styles.errorText}>{errors.apellido}</Text> : null}

              {/* Campo: Correo */}
              <TextInput
                label="Correo Electrónico"
                value={formData.correo}
                onChangeText={val => handleChange('correo', val)}
                mode="outlined"
                keyboardType="email-address"
                autoCapitalize="none"
                error={!!errors.correo}
                style={styles.input}
                left={<TextInput.Icon icon={() => <Mail size={20} color={errors.correo ? COLORS.danger : COLORS.secondary} />} />}
              />
              {errors.correo ? <Text style={styles.errorText}>{errors.correo}</Text> : null}

              {/* Campo: Teléfono */}
              <TextInput
                label="Teléfono Móvil"
                value={formData.telefono}
                onChangeText={val => handleChange('telefono', val)}
                mode="outlined"
                keyboardType="phone-pad"
                error={!!errors.telefono}
                style={styles.input}
                left={<TextInput.Icon icon={() => <Phone size={20} color={errors.telefono ? COLORS.danger : COLORS.secondary} />} />}
              />
              {errors.telefono ? <Text style={styles.errorText}>{errors.telefono}</Text> : null}

              {/* Campo: Dirección */}
              <TextInput
                label="Dirección de Habitación"
                value={formData.direccion}
                onChangeText={val => handleChange('direccion', val)}
                mode="outlined"
                multiline
                numberOfLines={3}
                error={!!errors.direccion}
                style={styles.input}
                left={<TextInput.Icon icon={() => <MapPin size={20} color={errors.direccion ? COLORS.danger : COLORS.secondary} />} />}
              />
              {errors.direccion ? <Text style={styles.errorText}>{errors.direccion}</Text> : null}
            </Card.Content>
          </Card>

          {/* CARD 3: CAMBIO DE CONTRASEÑA (Acordeón Colapsable Premium) */}
          <Card style={styles.card}>
            <List.Accordion
              title="Seguridad / Cambiar Contraseña"
              titleStyle={[styles.cardTitle, { marginLeft: -8 }]}
              expanded={passwordSectionExpanded}
              onPress={() => setPasswordSectionExpanded(!passwordSectionExpanded)}
              left={(props) => <Key {...props} size={22} color={passwordSectionExpanded ? COLORS.primary : COLORS.secondary} />}
              style={styles.accordionHeader}
            >
              <View style={styles.accordionContent}>
                <Text style={styles.securityHint}>
                  💡 Complete estos campos únicamente si desea establecer una nueva contraseña de acceso.
                </Text>

                {/* Campo: Clave Actual */}
                <TextInput
                  label="Contraseña Actual"
                  value={formData.clave_actual}
                  onChangeText={val => handleChange('clave_actual', val)}
                  mode="outlined"
                  secureTextEntry
                  error={!!errors.clave_actual}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock" color={errors.clave_actual ? COLORS.danger : COLORS.secondary} />}
                />
                {errors.clave_actual ? <Text style={styles.errorText}>{errors.clave_actual}</Text> : null}

                {/* Campo: Nueva Clave */}
                <TextInput
                  label="Nueva Contraseña"
                  value={formData.nueva_clave}
                  onChangeText={val => handleChange('nueva_clave', val)}
                  mode="outlined"
                  secureTextEntry
                  error={!!errors.nueva_clave}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock" color={errors.nueva_clave ? COLORS.danger : COLORS.secondary} />}
                />
                {errors.nueva_clave ? <Text style={styles.errorText}>{errors.nueva_clave}</Text> : null}

                {/* Campo: Confirmar Clave */}
                <TextInput
                  label="Confirmar Nueva Contraseña"
                  value={formData.confirmar_clave}
                  onChangeText={val => handleChange('confirmar_clave', val)}
                  mode="outlined"
                  secureTextEntry
                  error={!!errors.confirmar_clave}
                  style={styles.input}
                  left={<TextInput.Icon icon="lock" color={errors.confirmar_clave ? COLORS.danger : COLORS.secondary} />}
                />
                {errors.confirmar_clave ? <Text style={styles.errorText}>{errors.confirmar_clave}</Text> : null}
              </View>
            </List.Accordion>
          </Card>

          {/* Botón Guardar Cambios */}
          <Button
            mode="contained"
            onPress={handleSave}
            loading={isSubmitting}
            disabled={isSubmitting}
            style={styles.saveButton}
            contentStyle={styles.saveButtonContent}
            icon={() => <Save color="#FFF" size={20} />}
          >
            {isSubmitting ? 'Guardando Cambios...' : 'Guardar Cambios'}
          </Button>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* MODAL INFORMATIVO GENERAL */}
      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
        buttonText="Entendido"
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 15 : 20,
    paddingBottom: 10,
    gap: 12,
    backgroundColor: COLORS.background,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  scrollContent: {
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    backgroundColor: COLORS.primaryLight,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  avatarLabel: {
    color: COLORS.primary,
    fontWeight: '800',
    fontSize: 32,
  },
  fullName: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: 12,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginTop: 6,
    gap: 6,
  },
  roleBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '700',
  },
  card: {
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  readonlyCard: {
    backgroundColor: COLORS.surface,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },
  readonlyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  readonlyLabel: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  readonlyValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '700',
  },
  statusBadge: {
    backgroundColor: '#DEF7EC',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusBadgeText: {
    color: '#03543F',
    fontSize: 12,
    fontWeight: '700',
  },
  divider: {
    backgroundColor: COLORS.border,
    marginVertical: 4,
  },
  formContent: {
    paddingTop: 8,
    gap: 4,
  },
  input: {
    marginBottom: 12,
    backgroundColor: COLORS.surface,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
  accordionHeader: {
    backgroundColor: COLORS.surface,
    paddingVertical: 4,
  },
  accordionContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  securityHint: {
    fontSize: 12,
    color: COLORS.textSecondary,
    lineHeight: 18,
    marginBottom: 16,
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  saveButton: {
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    marginTop: 10,
    elevation: 4,
  },
  saveButtonContent: {
    paddingVertical: 12,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});
