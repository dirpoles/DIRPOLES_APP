import React from 'react';
import { StyleSheet, View, Text, Modal, TouchableOpacity } from 'react-native';
import { CheckCircle2, XCircle, Info, AlertTriangle, HelpCircle } from 'lucide-react-native';
import { COLORS } from '../../constants/config';

/**
 * MODAL PERSONALIZADO PREMIUM (SOLID)
 * 
 * Soporta tipos: 'success', 'error', 'info', 'warning', 'question'
 * Ahora soporta un botón secundario para confirmaciones.
 */
const CustomModal = ({ 
  visible, 
  title, 
  message, 
  type = 'info', 
  onClose, 
  onConfirm, // Nueva prop para confirmación
  buttonText = 'Entendido',
  confirmText = 'Aceptar',
  cancelText = 'Cancelar'
}) => {
  
  const getTheme = () => {
    switch (type) {
      case 'success':
        return { color: COLORS.accent, icon: <CheckCircle2 size={50} color={COLORS.accent} />, bg: '#EFFFF4' };
      case 'error':
        return { color: COLORS.danger, icon: <XCircle size={50} color={COLORS.danger} />, bg: '#FFF5F5' };
      case 'warning':
        return { color: COLORS.warning, icon: <AlertTriangle size={50} color={COLORS.warning} />, bg: '#FFF9EB' };
      case 'question':
        return { color: COLORS.primary, icon: <HelpCircle size={50} color={COLORS.primary} />, bg: '#F0F7FF' };
      default:
        return { color: COLORS.primary, icon: <Info size={50} color={COLORS.primary} />, bg: '#F0F7FF' };
    }
  };

  const theme = getTheme();
  const isQuestion = type === 'question' || !!onConfirm;

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={[styles.iconContainer, { backgroundColor: theme.bg }]}>
            {theme.icon}
          </View>

          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* Área de Botones */}
          <View style={isQuestion ? styles.buttonRow : styles.buttonColumn}>
            {isQuestion && (
              <TouchableOpacity 
                style={[styles.button, styles.secondaryButton]} 
                onPress={onClose}
              >
                <Text style={styles.secondaryButtonText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[
                styles.button, 
                { backgroundColor: theme.color },
                isQuestion && { flex: 1 } // Solo flex 1 si hay dos botones
              ]} 
              onPress={onConfirm || onClose}
            >
              <Text style={styles.buttonText}>{isQuestion ? confirmText : buttonText}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContainer: { width: '100%', maxWidth: 340, backgroundColor: COLORS.surface, borderRadius: 28, padding: 24, alignItems: 'center', elevation: 10 },
  iconContainer: { width: 90, height: 90, borderRadius: 45, justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  content: { alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.text, textAlign: 'center', marginBottom: 10 },
  message: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
  buttonRow: { flexDirection: 'row', width: '100%' },
  buttonColumn: { width: '100%' },
  button: { 
    paddingVertical: 14, 
    borderRadius: 16, 
    alignItems: 'center', 
    justifyContent: 'center',
    marginHorizontal: 5,
    minWidth: 100, // Asegura un ancho mínimo
  },
  secondaryButton: { backgroundColor: '#F1F5F9', borderWidth: 1, borderColor: COLORS.border, flex: 1 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  secondaryButtonText: { color: COLORS.textSecondary, fontSize: 16, fontWeight: 'bold' },
});

export default CustomModal;
