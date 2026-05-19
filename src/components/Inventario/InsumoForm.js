import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { TextInput, Button, Text, Card, Menu, Divider } from 'react-native-paper';
import { 
  FileText, 
  Tag, 
  Layers, 
  Calendar, 
  ChevronRight, 
  Save 
} from 'lucide-react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { COLORS } from '../../constants/config';
import { useInsumoForm } from '../../hooks/useInsumoForm';
import inventarioService from '../../services/inventarioService';
import CustomModal from '../UI/CustomModal';

/**
 * COMPONENTE: InsumoForm (SOLID: Capa de Presentación Única)
 * 
 * Interfaz visual del formulario para registrar y editar insumos médicos.
 * Delega la persistencia de datos al callback onSubmit.
 */
const InsumoForm = ({ initialData = null, onSubmit = null }) => {
  const { 
    formData,
    presentaciones,
    loadingPresentaciones,
    errors,
    isSubmitting,
    modalVisible,
    setModalVisible,
    modalConfig,
    handleChange,
    handleSubmit,
    isEditMode
  } = useInsumoForm(initialData);

  // Estados de control para los menús de selección y fecha
  const [tipoMenuVisible, setTipoMenuVisible] = useState(false);
  const [presMenuVisible, setPresMenuVisible] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const TIPOS = ['Medicamento', 'Material', 'Quirúrgico'];

  const getSelectedPresName = () => {
    const pres = presentaciones.find(p => p.id_presentacion == formData.id_presentacion);
    return pres ? pres.nombre_presentacion : 'Seleccione una presentación';
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirmDate = (date) => {
    handleChange('fecha_vencimiento', date);
    hideDatePicker();
  };

  const handleSave = () => {
    handleSubmit(async (payload) => {
      let result;
      if (isEditMode) {
        result = await inventarioService.actualizar(payload);
      } else {
        result = await inventarioService.registrar(payload);
      }
      
      if (result.success && onSubmit) {
        onSubmit(result);
      }
      return result;
    });
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`; // DD/MM/YYYY
    }
    return dateStr;
  };

  return (
    <View style={styles.container}>
      {/* CARD: INFORMACIÓN BLOQUEADA (Solo en Modo Edición) */}
      {isEditMode && (
        <Card style={[styles.card, styles.disabledCard]}>
          <Card.Title
            title="Detalles de Control (Lectura)"
            left={(props) => <Layers {...props} color={COLORS.textMuted} size={24} />}
            titleStyle={[styles.cardTitle, { color: COLORS.textMuted }]}
          />
          <Card.Content style={styles.disabledContent}>
            <View style={styles.row}>
              <View style={[styles.column, { flex: 0.5, paddingRight: 6 }]}>
                <TextInput
                  label="Stock Actual"
                  value={String(formData.cantidad ?? 0)}
                  mode="outlined"
                  editable={false}
                  left={<TextInput.Icon icon={() => <Layers size={20} color={COLORS.textMuted} />} />}
                  right={<TextInput.Icon icon="lock" color={COLORS.textMuted} size={18} />}
                  style={[styles.input, styles.disabledInput]}
                />
              </View>
              <View style={[styles.column, { flex: 0.5, paddingLeft: 6 }]}>
                <TextInput
                  label="Fecha de Registro"
                  value={formatDate(formData.fecha_creacion)}
                  mode="outlined"
                  editable={false}
                  left={<TextInput.Icon icon={() => <Calendar size={20} color={COLORS.textMuted} />} />}
                  right={<TextInput.Icon icon="lock" color={COLORS.textMuted} size={18} />}
                  style={[styles.input, styles.disabledInput]}
                />
              </View>
            </View>
            <Text style={styles.disabledHelperText}>
              🔒 La cantidad y la fecha de registro son controladas por el sistema central y no pueden alterarse desde el móvil.
            </Text>
          </Card.Content>
        </Card>
      )}

      {/* CARD PRINCIPAL: DATOS EDITABLES */}
      <Card style={styles.card}>
        <Card.Title
          title={isEditMode ? "Editar Insumo Médico" : "Datos del Insumo"}
          left={(props) => <Layers {...props} color={COLORS.primary} size={24} />}
          titleStyle={styles.cardTitle}
        />
        <Card.Content>
          {/* Campo: Nombre del Insumo */}
          <TextInput
            label="Nombre del Insumo"
            value={formData.nombre_insumo}
            onChangeText={val => handleChange('nombre_insumo', val)}
            mode="outlined"
            placeholder="Ej: Acetaminofén 500mg"
            error={!!errors.nombre_insumo}
            style={styles.input}
            left={<TextInput.Icon icon={() => <Layers size={20} color={errors.nombre_insumo ? COLORS.danger : COLORS.secondary} />} />}
          />
          {errors.nombre_insumo ? <Text style={styles.errorText}>{errors.nombre_insumo}</Text> : null}

          {/* Campo: Tipo de Insumo (Dropdown) */}
          <View style={styles.input}>
            <Menu
              visible={tipoMenuVisible}
              onDismiss={() => setTipoMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setTipoMenuVisible(true)}>
                  <TextInput
                    label="Tipo de Insumo"
                    value={formData.tipo_insumo || 'Seleccione un tipo'}
                    mode="outlined"
                    editable={false}
                    pointerEvents="none"
                    error={!!errors.tipo_insumo}
                    left={<TextInput.Icon icon={() => <Tag size={20} color={errors.tipo_insumo ? COLORS.danger : COLORS.secondary} />} />}
                    right={<TextInput.Icon icon={() => <ChevronRight size={20} color={COLORS.secondary} />} />}
                    style={{ backgroundColor: COLORS.surface }}
                  />
                </TouchableOpacity>
              }
              contentStyle={{ backgroundColor: COLORS.surface }}
            >
              {TIPOS.map((tipo) => (
                <Menu.Item
                  key={tipo}
                  onPress={() => {
                    handleChange('tipo_insumo', tipo);
                    setTipoMenuVisible(false);
                  }}
                  title={tipo}
                />
              ))}
            </Menu>
            {errors.tipo_insumo ? <Text style={styles.errorText}>{errors.tipo_insumo}</Text> : null}
          </View>

          {/* Campo: Presentación (Dropdown Dinámico) */}
          <View style={styles.input}>
            <Menu
              visible={presMenuVisible}
              onDismiss={() => setPresMenuVisible(false)}
              anchor={
                <TouchableOpacity onPress={() => setPresMenuVisible(true)}>
                  <TextInput
                    label="Presentación"
                    value={getSelectedPresName()}
                    mode="outlined"
                    editable={false}
                    pointerEvents="none"
                    error={!!errors.id_presentacion}
                    left={<TextInput.Icon icon={() => <Layers size={20} color={errors.id_presentacion ? COLORS.danger : COLORS.secondary} />} />}
                    right={<TextInput.Icon icon={() => <ChevronRight size={20} color={COLORS.secondary} />} />}
                    style={{ backgroundColor: COLORS.surface }}
                  />
                </TouchableOpacity>
              }
              contentStyle={{ backgroundColor: COLORS.surface }}
            >
              {loadingPresentaciones ? (
                <ActivityIndicator size="small" color={COLORS.primary} style={{ padding: 10 }} />
              ) : (
                presentaciones.map((pres) => (
                  <Menu.Item
                    key={pres.id_presentacion}
                    onPress={() => {
                      handleChange('id_presentacion', pres.id_presentacion);
                      setPresMenuVisible(false);
                    }}
                    title={pres.nombre_presentacion}
                  />
                ))
              )}
            </Menu>
            {errors.id_presentacion ? <Text style={styles.errorText}>{errors.id_presentacion}</Text> : null}
          </View>

          {/* Campo: Fecha de Vencimiento */}
          <TouchableOpacity onPress={showDatePicker}>
            <View pointerEvents="none">
              <TextInput
                label="Fecha de Vencimiento"
                value={formData.fecha_vencimiento.toLocaleDateString()}
                mode="outlined"
                editable={false}
                error={!!errors.fecha_vencimiento}
                left={<TextInput.Icon icon={() => <Calendar size={20} color={errors.fecha_vencimiento ? COLORS.danger : COLORS.secondary} />} />}
                right={<TextInput.Icon icon={() => <ChevronRight size={20} color={COLORS.secondary} />} />}
                style={styles.input}
              />
            </View>
          </TouchableOpacity>
          {errors.fecha_vencimiento ? <Text style={styles.errorText}>{errors.fecha_vencimiento}</Text> : null}

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            minimumDate={isEditMode ? undefined : new Date()} // Solo exigir a futuro en registros nuevos
            onConfirm={handleConfirmDate}
            onCancel={hideDatePicker}
          />

          {/* Campo: Descripción */}
          <TextInput
            label="Descripción del Insumo"
            value={formData.descripcion}
            onChangeText={val => handleChange('descripcion', val)}
            mode="outlined"
            multiline
            numberOfLines={3}
            error={!!errors.descripcion}
            style={styles.input}
            left={<TextInput.Icon icon={() => <FileText size={20} color={errors.descripcion ? COLORS.danger : COLORS.secondary} />} />}
          />
          {errors.descripcion ? <Text style={styles.errorText}>{errors.descripcion}</Text> : null}
        </Card.Content>
      </Card>

      {/* Botón de Enviar */}
      <Button
        mode="contained"
        onPress={handleSave}
        loading={isSubmitting}
        disabled={isSubmitting}
        style={styles.saveButton}
        contentStyle={styles.saveButtonContent}
        icon={() => <Save color="#FFF" size={20} />}
      >
        {isSubmitting ? 'Guardando...' : (isEditMode ? 'Actualizar Insumo' : 'Registrar Insumo')}
      </Button>

      {/* Modal General de Feedback */}
      <CustomModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        title={modalConfig.title}
        message={modalConfig.message}
        type={modalConfig.type}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 20,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    elevation: 3,
  },
  disabledCard: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  input: {
    marginBottom: 12,
    backgroundColor: COLORS.surface,
  },
  disabledInput: {
    backgroundColor: COLORS.background,
    opacity: 0.8,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
  saveButton: {
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    marginTop: 10,
    elevation: 4,
  },
  saveButtonContent: {
    paddingVertical: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  column: {
    justifyContent: 'center',
  },
  disabledContent: {
    paddingBottom: 10,
  },
  disabledHelperText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontStyle: 'italic',
    marginTop: 6,
    lineHeight: 16,
  },
});

export default InsumoForm;
