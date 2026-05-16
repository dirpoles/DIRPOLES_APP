import React, { useState, useMemo } from 'react';
import { StyleSheet, View, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  HelperText, 
  Card, 
  Divider,
  Portal,
  Modal,
  List,
  IconButton,
  Searchbar
} from 'react-native-paper';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Lock
} from 'lucide-react-native';
import DateTimePickerModal from "react-native-modal-datetime-picker";
import { COLORS } from '../../constants/config';
import { useCitaForm } from '../../hooks/useCitaForm';

/**
 * COMPONENTE: CitaForm
 * Formulario para crear y editar citas psicológicas.
 * En modo edición, beneficiario y psicólogo están bloqueados.
 */
const CitaForm = ({ initialData = null, onSubmit = null }) => {
  const {
    formData,
    beneficiarios,
    psicologos,
    estadosCita,
    horarioPsicologo,
    loadingSchedule,
    loading,
    loadingOptions,
    errors,
    isEditMode,
    handleChange,
    handleSubmit
  } = useCitaForm(initialData, onSubmit);

  // Estados para selectores y pickers
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [isTimePickerVisible, setTimePickerVisibility] = useState(false);
  const [beneficiarioModalVisible, setBeneficiarioModalVisible] = useState(false);
  const [psicologoModalVisible, setPsicologoModalVisible] = useState(false);
  const [estatusModalVisible, setEstatusModalVisible] = useState(false);
  
  // Estados para los buscadores
  const [searchBen, setSearchBen] = useState('');
  const [searchPsi, setSearchPsi] = useState('');

  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });

  // Filtrado de listas OPTIMIZADO
  const filteredBeneficiarios = useMemo(() => {
    if (!searchBen) return beneficiarios;
    const q = searchBen.toLowerCase();
    return beneficiarios.filter(b => 
      b.nombre_completo.toLowerCase().includes(q) ||
      b.cedula_completa.toLowerCase().includes(q)
    );
  }, [beneficiarios, searchBen]);

  const filteredPsicologos = useMemo(() => {
    if (!searchPsi) return psicologos;
    const q = searchPsi.toLowerCase();
    return psicologos.filter(p => 
      p.nombre_completo.toLowerCase().includes(q) ||
      p.cedula_completa.toLowerCase().includes(q)
    );
  }, [psicologos, searchPsi]);

  // Manejadores de Fecha y Hora
  const handleConfirmDate = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    handleChange('fecha', formattedDate);
    setDatePickerVisibility(false);
  };

  const handleConfirmTime = (date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    handleChange('hora', `${hours}:${minutes}`);
    setTimePickerVisibility(false);
  };

  const handleFormSubmit = async () => {
    setStatusMessage({ type: '', text: '' });
    const result = await handleSubmit();
    
    if (result) {
      if (result.success) {
        setStatusMessage({ type: 'success', text: result.message });
      } else {
        setStatusMessage({ type: 'error', text: result.message });
      }
    }
  };

  const getSelectedBeneficiarioName = () => {
    if (isEditMode && initialData?.beneficiario) return initialData.beneficiario;
    const ben = beneficiarios.find(b => b.id_beneficiario === formData.id_beneficiario);
    return ben ? ben.nombre_completo : 'Seleccione un paciente';
  };

  const getSelectedPsicologoName = () => {
    if (isEditMode && initialData?.empleado) return initialData.empleado;
    const psi = psicologos.find(p => p.id_empleado === formData.id_empleado);
    return psi ? psi.nombre_completo : 'Seleccione un psicólogo';
  };

  const getSelectedEstatusName = () => {
    const estado = estadosCita.find(e => e.id_estado == formData.estatus);
    return estado ? estado.nombre : 'Seleccione un estado';
  };

  if (loadingOptions) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={COLORS.primary} size="large" />
        <Text style={{marginTop: 10}}>Cargando opciones...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* MENSAJES DE ESTADO */}
      {statusMessage.text !== '' && (
        <Card style={[styles.statusCard, { backgroundColor: statusMessage.type === 'success' ? '#DEF7EC' : '#FDE8E8' }]}>
          <View style={styles.statusRow}>
            {statusMessage.type === 'success' 
              ? <CheckCircle2 color="#03543F" size={20} /> 
              : <AlertCircle color="#9B1C1C" size={20} />
            }
            <Text style={[styles.statusText, { color: statusMessage.type === 'success' ? '#03543F' : '#9B1C1C' }]}>
              {statusMessage.text}
            </Text>
          </View>
        </Card>
      )}

      {/* SECCIÓN DE PACIENTE */}
      <Text style={styles.sectionTitle}>Información del Paciente</Text>
      <Card 
        style={[styles.inputCard, isEditMode && styles.lockedCard]} 
        onPress={isEditMode ? null : () => setBeneficiarioModalVisible(true)}
      >
        <List.Item
          title="Paciente"
          description={getSelectedBeneficiarioName()}
          left={props => <List.Icon {...props} icon={() => <User color={isEditMode ? COLORS.textMuted : COLORS.primary} size={24} />} />}
          right={props => isEditMode 
            ? <Lock color={COLORS.textMuted} size={18} style={{alignSelf: 'center', marginRight: 8}} />
            : <ChevronRight {...props} color={COLORS.textMuted} size={20} />
          }
        />
      </Card>
      <HelperText type="error" visible={!!errors.id_beneficiario}>
        {errors.id_beneficiario}
      </HelperText>

      {/* SECCIÓN DE PSICÓLOGO */}
      <Text style={styles.sectionTitle}>Especialista</Text>
      <Card 
        style={[styles.inputCard, isEditMode && styles.lockedCard]} 
        onPress={isEditMode ? null : () => setPsicologoModalVisible(true)}
      >
        <List.Item
          title="Psicólogo"
          description={getSelectedPsicologoName()}
          left={props => <List.Icon {...props} icon={() => <Stethoscope color={isEditMode ? COLORS.textMuted : COLORS.primary} size={24} />} />}
          right={props => isEditMode 
            ? <Lock color={COLORS.textMuted} size={18} style={{alignSelf: 'center', marginRight: 8}} />
            : <ChevronRight {...props} color={COLORS.textMuted} size={20} />
          }
        />
      </Card>
      {isEditMode && (
        <HelperText type="info" visible={true} style={{color: COLORS.textMuted}}>
          El paciente y el especialista no se pueden modificar.
        </HelperText>
      )}
      <HelperText type="error" visible={!!errors.id_empleado}>
        {errors.id_empleado}
      </HelperText>

      {/* DISPONIBILIDAD DEL PSICÓLOGO */}
      {formData.id_empleado ? (
        <View style={styles.scheduleContainer}>
          {loadingSchedule ? (
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={{color: COLORS.textSecondary, fontSize: 13}}>Cargando disponibilidad...</Text>
            </View>
          ) : horarioPsicologo && horarioPsicologo.length > 0 ? (
            <Card style={styles.scheduleCard}>
              <Text style={styles.scheduleTitle}>Horario Disponible</Text>
              {horarioPsicologo.map((h, index) => (
                <View key={index} style={styles.scheduleRow}>
                  <Text style={styles.scheduleDay}>{h.dia_semana}</Text>
                  <Text style={styles.scheduleHours}>{h.hora_inicio.substring(0,5)} - {h.hora_fin.substring(0,5)}</Text>
                </View>
              ))}
            </Card>
          ) : (
            <Card style={[styles.scheduleCard, {backgroundColor: '#FEF3C7', borderColor: '#F59E0B'}]}>
              <Text style={{color: '#D97706', fontSize: 13, textAlign: 'center'}}>
                Este especialista no tiene horario asignado.
              </Text>
            </Card>
          )}
        </View>
      ) : null}

      {/* SECCIÓN DE FECHA Y HORA */}
      <Text style={styles.sectionTitle}>Programación</Text>
      <View style={styles.row}>
        <View style={{flex: 1}}>
          <Card style={styles.inputCard} onPress={() => setDatePickerVisibility(true)}>
            <List.Item
              title="Fecha"
              description={formData.fecha || 'YYYY-MM-DD'}
              left={props => <List.Icon {...props} icon={() => <Calendar color={COLORS.primary} size={24} />} />}
            />
          </Card>
          <HelperText type="error" visible={!!errors.fecha}>
            {errors.fecha}
          </HelperText>
        </View>

        <View style={{flex: 1, marginLeft: 10}}>
          <Card style={styles.inputCard} onPress={() => setTimePickerVisibility(true)}>
            <List.Item
              title="Hora"
              description={formData.hora || 'HH:MM'}
              left={props => <List.Icon {...props} icon={() => <Clock color={COLORS.primary} size={24} />} />}
            />
          </Card>
          <HelperText type="error" visible={!!errors.hora}>
            {errors.hora}
          </HelperText>
        </View>
      </View>

      {/* SECCIÓN DE ESTATUS (solo en modo edición) */}
      {isEditMode && (
        <>
          <Text style={styles.sectionTitle}>Estado de la Cita</Text>
          <Card style={styles.inputCard} onPress={() => setEstatusModalVisible(true)}>
            <List.Item
              title="Estatus"
              description={getSelectedEstatusName()}
              left={props => <List.Icon {...props} icon="clipboard-check-outline" />}
              right={props => <ChevronRight {...props} color={COLORS.textMuted} size={20} />}
            />
          </Card>
        </>
      )}

      <Button
        mode="contained"
        onPress={handleFormSubmit}
        loading={loading}
        disabled={loading}
        style={styles.submitButton}
        labelStyle={styles.submitButtonLabel}
      >
        {isEditMode ? 'Actualizar Cita' : 'Programar Cita'}
      </Button>

      {/* MODALES Y PICKERS */}
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="date"
        onConfirm={handleConfirmDate}
        onCancel={() => setDatePickerVisibility(false)}
      />

      <DateTimePickerModal
        isVisible={isTimePickerVisible}
        mode="time"
        onConfirm={handleConfirmTime}
        onCancel={() => setTimePickerVisibility(false)}
      />

      {/* MODAL SELECCIÓN BENEFICIARIO */}
      <Portal>
        <Modal 
          visible={beneficiarioModalVisible} 
          onDismiss={() => setBeneficiarioModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <View style={{flex: 1}}>
              <Text style={styles.modalTitle}>Seleccionar Paciente</Text>
              <Searchbar
                placeholder="Buscar por nombre o cédula..."
                onChangeText={setSearchBen}
                value={searchBen}
                style={styles.searchBar}
                inputStyle={{fontSize: 14}}
              />
            </View>
            <IconButton icon="close" onPress={() => setBeneficiarioModalVisible(false)} />
          </View>
          <Divider />
          <FlatList
            data={filteredBeneficiarios}
            keyExtractor={(item) => item.id_beneficiario.toString()}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={false}
            style={{ maxHeight: 400 }}
            ListEmptyComponent={<Text style={styles.noResults}>No se encontraron resultados</Text>}
            renderItem={({ item }) => (
              <List.Item
                title={item.nombre_completo}
                description={item.cedula_completa}
                onPress={() => {
                  handleChange('id_beneficiario', item.id_beneficiario);
                  setBeneficiarioModalVisible(false);
                  setSearchBen('');
                }}
                left={props => <List.Icon {...props} icon="account" />}
                style={formData.id_beneficiario === item.id_beneficiario ? styles.selectedItem : null}
              />
            )}
          />
        </Modal>

        {/* MODAL SELECCIÓN PSICÓLOGO */}
        <Modal 
          visible={psicologoModalVisible} 
          onDismiss={() => setPsicologoModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <View style={{flex: 1}}>
              <Text style={styles.modalTitle}>Seleccionar Psicólogo</Text>
              <Searchbar
                placeholder="Buscar por nombre o cédula..."
                onChangeText={setSearchPsi}
                value={searchPsi}
                style={styles.searchBar}
                inputStyle={{fontSize: 14}}
              />
            </View>
            <IconButton icon="close" onPress={() => setPsicologoModalVisible(false)} />
          </View>
          <Divider />
          <FlatList
            data={filteredPsicologos}
            keyExtractor={(item) => item.id_empleado.toString()}
            keyboardShouldPersistTaps="handled"
            removeClippedSubviews={false}
            style={{ maxHeight: 400 }}
            ListEmptyComponent={<Text style={styles.noResults}>No se encontraron resultados</Text>}
            renderItem={({ item }) => (
              <List.Item
                title={item.nombre_completo}
                description={item.cargo || "Psicólogo"}
                onPress={() => {
                  handleChange('id_empleado', item.id_empleado);
                  setPsicologoModalVisible(false);
                  setSearchPsi('');
                }}
                left={props => <List.Icon {...props} icon="doctor" />}
                style={formData.id_empleado === item.id_empleado ? styles.selectedItem : null}
              />
            )}
          />
        </Modal>

        {/* MODAL SELECCIÓN ESTATUS */}
        <Modal 
          visible={estatusModalVisible} 
          onDismiss={() => setEstatusModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <View style={styles.modalHeader}>
            <View style={{flex: 1}}>
              <Text style={styles.modalTitle}>Seleccionar Estado</Text>
            </View>
            <IconButton icon="close" onPress={() => setEstatusModalVisible(false)} />
          </View>
          <Divider />
          <ScrollView style={{ maxHeight: 350 }}>
            {estadosCita.map((estado) => (
              <List.Item
                key={estado.id_estado}
                title={estado.nombre}
                onPress={() => {
                  handleChange('estatus', estado.id_estado);
                  setEstatusModalVisible(false);
                }}
                left={props => <List.Icon {...props} icon="checkbox-marked-circle-outline" />}
                style={formData.estatus == estado.id_estado ? styles.selectedItem : null}
              />
            ))}
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  inputCard: {
    marginBottom: 4,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    elevation: 2,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  lockedCard: {
    opacity: 0.6,
    backgroundColor: '#F3F4F6',
  },
  row: {
    flexDirection: 'row',
  },
  submitButton: {
    marginTop: 20,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },
  submitButtonLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  statusCard: {
    marginBottom: 20,
    padding: 12,
    borderRadius: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  scheduleContainer: {
    marginBottom: 16,
    marginTop: -4,
  },
  scheduleCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  scheduleTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  scheduleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  scheduleDay: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  scheduleHours: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 0,
    margin: 20,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
  },
  searchBar: {
    elevation: 0,
    backgroundColor: COLORS.background,
    borderRadius: 8,
    height: 45,
  },
  noResults: {
    textAlign: 'center',
    padding: 20,
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  selectedItem: {
    backgroundColor: COLORS.primaryLight,
  },
});

export default CitaForm;
