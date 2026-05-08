import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { TextInput, Button, Text, Card, SegmentedButtons } from 'react-native-paper';
import { User, Mail, Phone, MapPin, GraduationCap, Calendar, ChevronRight, Save } from 'lucide-react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { COLORS } from '../../constants/config';
import { useBeneficiarioForm } from '../../hooks/useBeneficiarioForm';

/**
 * Este componente centraliza toda la interfaz del formulario. 
 * Puede ser usado tanto para CREAR como para EDITAR beneficiarios.
 */
const BeneficiarioForm = ({ initialData = null, onSubmit = null }) => {
  // Usamos nuestro Custom Hook internamente
  const { formData, handleChange } = useBeneficiarioForm(initialData);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);

  const showDatePicker = () => setDatePickerVisibility(true);
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirmDate = (date) => {
    handleChange('fecha_nac', date);
    hideDatePicker();
  };

  const handleSave = () => {
    if (onSubmit) {
      onSubmit(formData);
    } else {
      console.log('Datos del formulario:', formData);
    }
  };

  return (
    <View style={styles.container}>
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
                style={styles.input}
              />
            </View>
          </View>

          <TextInput
            label="Nombres"
            value={formData.nombres}
            onChangeText={val => handleChange('nombres', val)}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Apellidos"
            value={formData.apellidos}
            onChangeText={val => handleChange('apellidos', val)}
            mode="outlined"
            style={styles.input}
          />

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
          <TextInput
            label="Teléfono"
            value={formData.telefono}
            onChangeText={val => handleChange('telefono', val)}
            mode="outlined"
            keyboardType="phone-pad"
            left={<TextInput.Icon icon={() => <Phone size={20} color={COLORS.secondary} />} />}
            style={styles.input}
          />
          <TextInput
            label="Correo Electrónico"
            value={formData.correo}
            onChangeText={val => handleChange('correo', val)}
            mode="outlined"
            keyboardType="email-address"
            left={<TextInput.Icon icon={() => <Mail size={20} color={COLORS.secondary} />} />}
            style={styles.input}
          />
          <TextInput
            label="Dirección"
            value={formData.direccion}
            onChangeText={val => handleChange('direccion', val)}
            mode="outlined"
            multiline
            numberOfLines={3}
            left={<TextInput.Icon icon={() => <MapPin size={20} color={COLORS.secondary} />} />}
            style={styles.input}
          />
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
          <TextInput
            label="PNF (ID)"
            value={formData.id_pnf}
            onChangeText={val => handleChange('id_pnf', val)}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Sección"
            value={formData.seccion}
            onChangeText={val => handleChange('seccion', val)}
            mode="outlined"
            style={styles.input}
          />

          <TouchableOpacity onPress={showDatePicker}>
            <View pointerEvents="none">
              <TextInput
                label="Fecha de Nacimiento"
                value={formData.fecha_nac.toLocaleDateString()}
                mode="outlined"
                editable={false}
                left={<TextInput.Icon icon={() => <Calendar size={20} color={COLORS.secondary} />} />}
                right={<TextInput.Icon icon={() => <ChevronRight size={20} color={COLORS.secondary} />} />}
                style={styles.input}
              />
            </View>
          </TouchableOpacity>

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
        style={styles.saveButton}
        contentStyle={styles.saveButtonContent}
        icon={() => <Save color="#FFF" size={20} />}
      >
        Guardar Beneficiario
      </Button>
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
});

export default BeneficiarioForm;
