import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Calendar, X } from 'lucide-react-native';
import { Calendar as CalendarComponent } from '../Calendar/Calendar';
import { applyDateMask, isValidDate, formatDateToBR, formatDateFromBR } from '@/utils/dateUtils';
import { useTheme } from '@/contexts/ThemeContext';
import { lightColors } from '@/components/theme/colors';

interface DatePickerProps {
  value: string;
  onDateChange: (date: string) => void;
  placeholder?: string;
  label?: string;
}

export function DatePicker({ value, onDateChange, placeholder = 'dd/mm/yyyy', label }: DatePickerProps) {
  const { colors, typography } = useTheme();
  const styles = makeStyles(colors);
  const [modalVisible, setModalVisible] = useState(false);
  const [inputValue, setInputValue] = useState(value ? formatDateToBR(value) : '');

  const handleInputChange = (text: string) => {
    const maskedText = applyDateMask(text);
    setInputValue(maskedText);
    if (maskedText.length === 10 && isValidDate(maskedText)) {
      onDateChange(formatDateFromBR(maskedText));
    }
  };

  const handleCalendarSelect = (date: string) => {
    onDateChange(date);
    setInputValue(formatDateToBR(date));
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[typography.cardTitle, { color: colors.text.primary, marginBottom: 8 }]}>{label}</Text>
      )}

      <View style={styles.inputContainer}>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.calendarIcon}>
          <Calendar size={20} color={colors.text.secondary} />
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={inputValue}
          onChangeText={handleInputChange}
          placeholder={placeholder}
          placeholderTextColor={colors.text.tertiary}
          keyboardType="numeric"
          maxLength={10}
        />
      </View>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={[typography.sectionTitle, { color: colors.text.primary }]}>Selecionar Data</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
              <X size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>
          <CalendarComponent onDayPress={handleCalendarSelect} />
        </View>
      </Modal>
    </View>
  );
}

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    container: { marginBottom: 16 },
    inputContainer: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border.light, borderRadius: 8, backgroundColor: colors.background.primary },
    calendarIcon: { padding: 12, borderRightWidth: 1, borderRightColor: colors.border.light },
    input: { flex: 1, paddingVertical: 12, paddingHorizontal: 12, fontSize: 16, color: colors.text.primary },
    modalContainer: { flex: 1, backgroundColor: colors.background.secondary },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.background.primary, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    closeButton: { padding: 8, borderRadius: 8, backgroundColor: colors.background.tertiary },
  });
}