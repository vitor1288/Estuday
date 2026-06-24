import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Calendar, X } from 'lucide-react-native';
import { Calendar as CalendarComponent } from '../Calendar/Calendar';
import { formatDateToBR } from '@/utils/dateUtils';
import { useTheme } from '@/contexts/ThemeContext';
import { lightColors } from '@/components/theme/colors';

interface DatePickerProps {
  value: string;
  onDateChange: (date: string) => void;
  placeholder?: string;
  label?: string;
}

export function DatePicker({ value, onDateChange, label }: DatePickerProps) {
  const { colors, typography } = useTheme();
  const styles = makeStyles(colors);
  const [modalVisible, setModalVisible] = useState(false);

  // Estados separados para cada caixinha
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  // Referências para pular o foco automaticamente
  const dayRef = useRef<TextInput>(null);
  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  // Sincroniza quando a data muda via Calendário ou Inicialização (YYYY-MM-DD)
  useEffect(() => {
    if (value && value.includes('-')) {
      const [y, m, d] = value.split('-');
      setDay(d);
      setMonth(m);
      setYear(y);
    } else {
      setDay('');
      setMonth('');
      setYear('');
    }
  }, [value]);

  // Envia a data formatada para o componente pai se estiver completa e válida
  const emitFormattedDate = (d: string, m: string, y: string) => {
    if (d.length === 2 && m.length === 2 && y.length === 4) {
      const isoDate = `${y}-${m}-${d}`;
      if (!isNaN(Date.parse(isoDate)) && typeof onDateChange === 'function') {
        onDateChange(isoDate);
      }
    }
  };

  const handleDayChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    setDay(cleaned);
    emitFormattedDate(cleaned, month, year);
    if (cleaned.length === 2) {
      monthRef.current?.focus();
    }
  };

  const handleMonthChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    setMonth(cleaned);
    emitFormattedDate(day, cleaned, year);
    if (cleaned.length === 2) {
      yearRef.current?.focus();
    }
  };

  const handleYearChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    setYear(cleaned);
    emitFormattedDate(day, month, cleaned);
  };

  const handleCalendarSelect = (date: string) => {
    if (typeof onDateChange === 'function') {
      onDateChange(date);
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[typography.cardTitle, { color: colors.text.primary, marginBottom: 8 }]}>{label}</Text>
      )}

      <View style={styles.inputContainer}>
        {/* Caixas Separadas para Digitação Manual */}
        <View style={styles.splitInputWrapper}>
          <TextInput
            ref={dayRef}
            style={[styles.boxInput, { color: colors.text.primary }]}
            value={day}
            onChangeText={handleDayChange}
            placeholder="DD"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="numeric"
            maxLength={2}
          />
          <Text style={{ color: colors.text.tertiary, fontSize: 18 }}>/</Text>
          <TextInput
            ref={monthRef}
            style={[styles.boxInput, { color: colors.text.primary }]}
            value={month}
            onChangeText={handleMonthChange}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace' && month === '') {
                dayRef.current?.focus();
              }
            }}
            placeholder="MM"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="numeric"
            maxLength={2}
          />
          <Text style={{ color: colors.text.tertiary, fontSize: 18 }}>/</Text>
          <TextInput
            ref={yearRef}
            style={[styles.boxInput, styles.yearBox, { color: colors.text.primary }]}
            value={year}
            onChangeText={handleYearChange}
            onKeyPress={({ nativeEvent }) => {
              if (nativeEvent.key === 'Backspace' && year === '') {
                monthRef.current?.focus();
              }
            }}
            placeholder="AAAA"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="numeric"
            maxLength={4}
          />
        </View>

        {/* Botão do Calendário na Direita */}
        <TouchableOpacity 
          onPress={() => setModalVisible(true)} 
          style={styles.calendarIcon}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Calendar size={20} color={colors.primary} />
        </TouchableOpacity>
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
    inputContainer: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      borderWidth: 1, 
      borderColor: colors.border.light, 
      borderRadius: 8, 
      backgroundColor: colors.background.primary,
      paddingHorizontal: 12,
      height: 48
    },
    splitInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    boxInput: {
      textAlign: 'center',
      fontSize: 16,
      paddingVertical: 8,
      width: 35,
    },
    yearBox: {
      width: 55,
    },
    calendarIcon: { 
      paddingLeft: 8,
      justifyContent: 'center',
      alignItems: 'center'
    },
    modalContainer: { flex: 1, backgroundColor: colors.background.secondary },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.background.primary, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    closeButton: { padding: 8, borderRadius: 8, backgroundColor: colors.background.tertiary },
  });
}