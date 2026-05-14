import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { TextInput, Button, Text, Card, SegmentedButtons, Menu, Divider } from 'react-native-paper';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Calendar, 
  ChevronRight, 
  Save, 
  Search,
  Activity
} from 'lucide-react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { COLORS } from '../../constants/config';
import { useBeneficiarioForm } from '../../hooks/useBeneficiarioForm';
import dataService from '../../services/dataService';
import beneficiarioService from '../../services/beneficiarioService';
import CustomModal from '../UI/CustomModal';

/**
 * Este componente centraliza toda la interfaz del formulario. 
 * Puede ser usado tanto para CREAR como para EDITAR beneficiarios.
 */
const BeneficiarioForm = ({ initialData = null, onSubmit = null }) => {
  const { 
    formData, 
    errors, 
    isSubmitting,
    modalVisible,
    setModalVisible,
    modalConfig,
    handleChange, 
    handleSubmit 
  } = useBeneficiarioForm(initialData);

  // Estados para datos del backend
  const [pnfs, setPnfs] = useState([]);
  const [loadingPnfs, setLoadingPnfs] = useState(false);

  // UI States
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [pnfMenuVisible, setPnfMenuVisible] = useState(false);
  const [sedeMenuVisible, setSedeMenuVisible] = useState(false);

  const SEDES = [
    { label: 'MORÁN', value: 'M' },
    { label: 'CRESPO', value: 'C' },
    { label: 'JIMÉNEZ', value: 'J' },
    { label: 'URDANETA', value: 'U' },
    { label: 'BARQUISIMETO', value: 'B' },
  ];

  // Cargar PNFs al iniciar
  useEffect(() => {
    loadPnfs();
  }, []);

  const loadPnfs = async () => {
    setLoadingPnfs(true);
    const data = await dataService.getPNFs();
    setPnfs(data);
    setLoadingPnfs(false);
  };

  // Obtener nombre del PNF seleccionado
  const getSelectedPnfName = () => {
    const pnf = pnfs.find(p => p.id_pnf == formData.id_pnf);
    return pnf ? pnf.nombre_pnf : 'Seleccionar PNF';
  };

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirmDate = (date) => {
    handleChange('fecha_nac', date);
    hideDatePicker();
  };

  const handleSave = () => {
    // Llamamos al handleSubmit del hook, pasando la función del servicio
    handleSubmit(async (data) => {
      console.log('[BeneficiarioForm] Enviando datos:', JSON.stringify(data, null, 2));
      
      let result;
      if (data.id_beneficiario) {
        result = await beneficiarioService.actualizar(data);
      } else {
        result = await beneficiarioService.registrar(data);
      }
      
      if (result.success && onSubmit) {
        onSubmit(result.data);
      }
      return result;
    });
  };

  return (
    <View style={styles.container}>
      {/* GRUPO 4: Estado (Muy importante para reactivar) */}
      <Card style={styles.card}>
        <Card.Title
          title="Estado del Registro"
          left={(props) => <Activity {...props} color={COLORS.primary} size={24} />}
          titleStyle={styles.cardTitle}
        />
        <Card.Content>
          <Text style={styles.label}>Estatus del Beneficiario</Text>
          <SegmentedButtons
            value={String(formData.estatus)}
            onValueChange={val => handleChange('estatus', parseInt(val))}
            buttons={[
              { 
                value: '1', 
                label: 'Activo',
                checkedColor: COLORS.success,
              },
              { 
                value: '0', 
                label: 'Inactivo',
                checkedColor: COLORS.danger,
              },
            ]}
            style={styles.segmentedLarge}
          />
          <Text style={[
            styles.helperText, 
            { color: formData.estatus === 1 ? COLORS.success : COLORS.danger }
          ]}>
            {formData.estatus === 1 
              ? '● ACTIVO: El beneficiario puede recibir servicios.' 
              : '● INACTIVO: El beneficiario no aparecerá en búsquedas estándar.'}
          </Text>
        </Card.Content>
      </Card>

      {/* GRUPO 1: Información Personal */}
      <Card style={styles.card}>
        <Card.Title
          title="Información Personal"
          left={(props) => <User {...props} color={COLORS.primary} size={24} />}
          titleStyle={styles.cardTitle}
        />
        <Card.Content>
          <View style={styles.cedulaRow}>
            <View style={styles.tipoCedulaContainer}>
              <Text style={styles.label}>Tipo</Text>
              <SegmentedButtons
                value={formData.tipo_cedula}
                onValueChange={val => handleChange('tipo_cedula', val)}
                buttons={[
                  { value: 'V', label: 'V' },
                  { value: 'E', label: 'E' },
                ]}
                style={styles.segmented}
              />
            </View>
            <View style={styles.cedulaInputContainer}>
              <TextInput
                label="Número de Cédula"
                value={formData.cedula}
                onChangeText={val => handleChange('cedula', val)}
                mode="outlined"
                keyboardType="numeric"
                error={!!errors.cedula}
                style={styles.input}
              />
              {errors.cedula ? <Text style={styles.errorText}>{errors.cedula}</Text> : null}
            </View>
          </View>

          <TextInput
            label="Nombres"
            value={formData.nombres}
            onChangeText={val => handleChange('nombres', val)}
            mode="outlined"
            error={!!errors.nombres}
            style={styles.input}
          />
          {errors.nombres ? <Text style={styles.errorText}>{errors.nombres}</Text> : null}

          <TextInput
            label="Apellidos"
            value={formData.apellidos}
            onChangeText={val => handleChange('apellidos', val)}
            mode="outlined"
            error={!!errors.apellidos}
            style={styles.input}
          />
          {errors.apellidos ? <Text style={styles.errorText}>{errors.apellidos}</Text> : null}

          <Text style={styles.label}>Género</Text>
          <SegmentedButtons
            value={formData.genero}
            onValueChange={val => handleChange('genero', val)}
            buttons={[
              { value: 'M', label: 'Masculino' },
              { value: 'F', label: 'Femenino' },
            ]}
            style={styles.segmentedLarge}
          />
        </Card.Content>
      </Card>

      {/* GRUPO 2: Contacto */}
      <Card style={styles.card}>
        <Card.Title
          title="Datos de Contacto"
          left={(props) => <Phone {...props} color={COLORS.primary} size={24} />}
          titleStyle={styles.cardTitle}
        />
        <Card.Content>
          <View style={styles.inputWrapper}>
            <TextInput
              label="Teléfono"
              value={formData.telefono}
              onChangeText={val => handleChange('telefono', val)}
              mode="outlined"
              keyboardType="phone-pad"
              maxLength={12} // 11 dígitos + 1 guion
              error={!!errors.telefono}
              left={<TextInput.Icon icon={() => <Phone size={20} color={errors.telefono ? COLORS.danger : COLORS.secondary} />} />}
              style={styles.input}
            />
            {errors.telefono ? <Text style={styles.errorText}>{errors.telefono}</Text> : null}
          </View>
          <TextInput
            label="Correo Electrónico"
            value={formData.correo}
            onChangeText={val => handleChange('correo', val)}
            mode="outlined"
            keyboardType="email-address"
            error={!!errors.correo}
            left={<TextInput.Icon icon={() => <Mail size={20} color={errors.correo ? COLORS.danger : COLORS.secondary} />} />}
            style={styles.input}
          />
          {errors.correo ? <Text style={styles.errorText}>{errors.correo}</Text> : null}

          <TextInput
            label="Dirección"
            value={formData.direccion}
            onChangeText={val => handleChange('direccion', val)}
            mode="outlined"
            multiline
            numberOfLines={3}
            error={!!errors.direccion}
            left={<TextInput.Icon icon={() => <MapPin size={20} color={errors.direccion ? COLORS.danger : COLORS.secondary} />} />}
            style={styles.input}
          />
          {errors.direccion ? <Text style={styles.errorText}>{errors.direccion}</Text> : null}
        </Card.Content>
      </Card>

      {/* GRUPO 3: Académico */}
      <Card style={styles.card}>
        <Card.Title
          title="Información Académica"
          left={(props) => <GraduationCap {...props} color={COLORS.primary} size={24} />}
          titleStyle={styles.cardTitle}
        />
        <Card.Content>
          <View style={styles.input}>
            <Menu
              visible={pnfMenuVisible}
              onDismiss={() => setPnfMenuVisible(false)}
              anchor={
                  <TouchableOpacity onPress={() => setPnfMenuVisible(true)}>
                  <TextInput
                    label="PNF"
                    value={getSelectedPnfName()}
                    mode="outlined"
                    editable={false}
                    pointerEvents="none"
                    error={!!errors.id_pnf}
                    left={<TextInput.Icon icon={() => <GraduationCap size={20} color={errors.id_pnf ? COLORS.danger : COLORS.secondary} />} />}
                    right={<TextInput.Icon icon={() => <ChevronRight size={20} color={COLORS.secondary} />} />}
                    style={{ backgroundColor: COLORS.surface }}
                  />
                </TouchableOpacity>
              }
              contentStyle={{ backgroundColor: COLORS.surface }}
            >
              {loadingPnfs ? (
                <ActivityIndicator size="small" color={COLORS.primary} style={{ padding: 10 }} />
              ) : (
                pnfs.map((pnf) => (
                  <Menu.Item
                    key={pnf.id_pnf}
                    onPress={() => {
                      handleChange('id_pnf', pnf.id_pnf);
                      setPnfMenuVisible(false);
                    }}
                    title={pnf.nombre_pnf}
                  />
                ))
              )}
            </Menu>
            {errors.id_pnf ? <Text style={styles.errorText}>{errors.id_pnf}</Text> : null}
          </View>

          <View style={styles.row}>
            <View style={[styles.column, { flex: 0.4 }]}>
              <Text style={styles.label}>Nro. Sección</Text>
              <TextInput
                mode="outlined"
                placeholder="Ej: 3013"
                value={formData.seccion_numero}
                onChangeText={(text) => handleChange('seccion_numero', text)}
                error={!!errors.seccion_numero}
                keyboardType="numeric"
                maxLength={4}
                style={styles.input}
              />
              {errors.seccion_numero ? <Text style={styles.errorText}>{errors.seccion_numero}</Text> : null}
            </View>

            <View style={[styles.column, { flex: 0.6 }]}>
              <Text style={styles.label}>Sede</Text>
              <Menu
                visible={sedeMenuVisible}
                onDismiss={() => setSedeMenuVisible(false)}
                anchor={
                  <TouchableOpacity 
                    onPress={() => setSedeMenuVisible(true)}
                    style={[
                      styles.selector, 
                      errors.seccion_sede && { borderColor: COLORS.danger }
                    ]}
                  >
                    <Text style={styles.selectorText}>
                      {formData.seccion_sede 
                        ? SEDES.find(s => s.value === formData.seccion_sede)?.label 
                        : 'Sede...'}
                    </Text>
                    <ChevronRight size={20} color={COLORS.textSecondary} />
                  </TouchableOpacity>
                }
              >
                {SEDES.map((sede) => (
                  <Menu.Item 
                    key={sede.value}
                    onPress={() => {
                      handleChange('seccion_sede', sede.value);
                      setSedeMenuVisible(false);
                    }} 
                    title={sede.label} 
                  />
                ))}
              </Menu>
              {errors.seccion_sede ? <Text style={styles.errorText}>{errors.seccion_sede}</Text> : null}
            </View>
          </View>

          <TouchableOpacity onPress={showDatePicker}>
            <View pointerEvents="none">
              <TextInput
                label="Fecha de Nacimiento"
                value={formData.fecha_nac.toLocaleDateString()}
                mode="outlined"
                editable={false}
                error={!!errors.fecha_nac}
                left={<TextInput.Icon icon={() => <Calendar size={20} color={errors.fecha_nac ? COLORS.danger : COLORS.secondary} />} />}
                right={<TextInput.Icon icon={() => <ChevronRight size={20} color={COLORS.secondary} />} />}
                style={styles.input}
              />
            </View>
          </TouchableOpacity>
          {errors.fecha_nac ? <Text style={styles.errorText}>{errors.fecha_nac}</Text> : null}

          <DateTimePickerModal
            isVisible={isDatePickerVisible}
            mode="date"
            onConfirm={handleConfirmDate}
            onCancel={hideDatePicker}
          />
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleSave}
        loading={isSubmitting}
        disabled={isSubmitting}
        style={styles.saveButton}
        contentStyle={styles.saveButtonContent}
        icon={() => <Save color="#FFF" size={20} />}
      >
        {isSubmitting ? 'Guardando...' : 'Guardar Beneficiario'}
      </Button>

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
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  cedulaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 8,
  },
  tipoCedulaContainer: {
    width: '45%',
    marginRight: 12,
  },
  cedulaInputContainer: {
    flex: 1,
    marginTop: 15,
  },
  input: {
    marginBottom: 12,
    backgroundColor: COLORS.surface,
  },
  inputWrapper: {
    marginBottom: 4,
  },
  errorText: {
    color: COLORS.danger,
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
    marginLeft: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  segmented: {
    height: 48, // Ajuste para que no se pise con el label
  },
  segmentedLarge: {
    marginBottom: 12,
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
    marginBottom: 8,
  },
  column: {
    paddingHorizontal: 4,
  },
  selector: {
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.textSecondary + '40', // Opacidad baja
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    backgroundColor: COLORS.surface,
    marginTop: 2,
  },
  selectorText: {
    fontSize: 14,
    color: COLORS.text,
  },
  helperText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
    fontWeight: '500',
  },
});

export default BeneficiarioForm;
