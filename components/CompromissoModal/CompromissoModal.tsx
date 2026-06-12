import React, { useState, useEffect } from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { X, Save } from 'lucide-react-native';
import { useEstuday, Compromisso } from '@/contexts/StudayContext';
import { formatDate } from '@/utils/dateUtils';
import { DatePicker } from '@/components/DatePicker/DatePicker';
import TimePicker from '@/components/TimePicker/TimePicker';
import { NotificationSelector, MultipleNotificationConfig } from '@/components/NotificationSelector/NotificationSelector';
import { useTheme } from '@/contexts/ThemeContext';
import { lightColors } from '@/components/theme/colors';

interface CompromissoModalProps {
  visible: boolean;
  compromisso?: Compromisso | null;
  onClose: () => void;
  onSave: () => void;
}

export function CompromissoModal({ visible, compromisso, onClose, onSave }: CompromissoModalProps) {
  const { addCompromisso, updateCompromisso } = useEstuday();
  const { colors, typography } = useTheme();
  const styles = makeStyles(colors);

  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(formatDate(new Date()));
  const [hora, setHora] = useState('09:00');
  const [categoria, setCategoria] = useState<'aula' | 'prova' | 'trabalho' | 'outro'>('aula');
  const [notificationConfig, setNotificationConfig] = useState<MultipleNotificationConfig>({
    notifications: [{ enabled: true, tempo: 1, unidade: 'dias' }]
  });
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (compromisso) {
      setTitulo(compromisso.titulo);
      setDescricao(compromisso.descricao || '');
      setData(compromisso.data);
      setHora(compromisso.hora);
      setCategoria(compromisso.categoria);
      if (compromisso.multipleNotificationConfig) {
        setNotificationConfig(compromisso.multipleNotificationConfig);
      } else if (compromisso.notificationConfig?.enabled) {
        setNotificationConfig({ notifications: [compromisso.notificationConfig] });
      } else {
        setNotificationConfig({ notifications: [] });
      }
    } else {
      resetForm();
    }
  }, [compromisso, visible]);

  const resetForm = () => {
    setTitulo('');
    setDescricao('');
    setData(formatDate(new Date()));
    setHora('09:00');
    setCategoria('aula');
    setNotificationConfig({ notifications: [{ enabled: true, tempo: 1, unidade: 'dias' }] });
    setShowTimePicker(false);
  };

  const handleSave = async () => {
    if (!titulo.trim()) { Alert.alert('Erro', 'O título é obrigatório.'); return; }
    if (!data) { Alert.alert('Erro', 'A data é obrigatória.'); return; }

    try {
      const compromissoData = {
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        data,
        hora,
        categoria,
        concluido: compromisso?.concluido || false,
        multipleNotificationConfig: notificationConfig,
        notificationConfig: notificationConfig.notifications[0] || { enabled: false, tempo: 1, unidade: 'dias' as const },
      };

      if (compromisso) {
        await updateCompromisso({ ...compromissoData, id: compromisso.id });
      } else {
        await addCompromisso(compromissoData);
      }

      onSave();
      onClose();
      resetForm();
    } catch {
      Alert.alert('Erro', 'Não foi possível salvar o compromisso. Tente novamente.');
    }
  };

  const handleTimeChange = (hour: number, minute: number) => {
    setHora(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
  };

  const categorias: { value: 'aula' | 'prova' | 'trabalho' | 'outro'; label: string; color: string }[] = [
    { value: 'aula', label: 'Aula', color: colors.category.aula },
    { value: 'prova', label: 'Prova', color: colors.category.prova },
    { value: 'trabalho', label: 'Trabalho', color: colors.category.trabalho },
    { value: 'outro', label: 'Outro', color: colors.category.outro },
  ];

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={{ padding: 4 }}>
            <X size={24} color={colors.text.secondary} />
          </TouchableOpacity>
          <Text style={[typography.cardTitle, { color: colors.text.primary }]}>
            {compromisso ? 'Editar Compromisso' : 'Novo Compromisso'}
          </Text>
          <TouchableOpacity onPress={handleSave} style={{ padding: 4 }}>
            <Save size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Título */}
          <View style={styles.field}>
            <Text style={[typography.cardTitle, { color: colors.text.primary, marginBottom: 8 }]}>Título *</Text>
            <TextInput
              style={styles.input}
              value={titulo}
              onChangeText={setTitulo}
              placeholder="Nome do compromisso"
              placeholderTextColor={colors.text.tertiary}
            />
          </View>

          {/* Categoria */}
          <View style={styles.field}>
            <Text style={[typography.cardTitle, { color: colors.text.primary, marginBottom: 8 }]}>Categoria</Text>
            <View style={styles.categoriaContainer}>
              {categorias.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[styles.categoriaButton, categoria === cat.value && { backgroundColor: cat.color, borderColor: cat.color }]}
                  onPress={() => setCategoria(cat.value)}
                >
                  <Text style={[typography.caption, { color: categoria === cat.value ? colors.text.white : colors.text.secondary, fontWeight: '600' }]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Data */}
          <DatePicker value={data} onDateChange={setData} label="Data *" />

          {/* Hora */}
          <View style={styles.field}>
            <Text style={[typography.cardTitle, { color: colors.text.primary, marginBottom: 8 }]}>Hora</Text>
            <TouchableOpacity style={styles.timeButton} onPress={() => setShowTimePicker(!showTimePicker)}>
              <Text style={[typography.body, { color: colors.text.primary, fontWeight: '500' }]}>{hora}</Text>
            </TouchableOpacity>
            {showTimePicker && (
              <TimePicker
                initialHour={parseInt(hora.split(':')[0])}
                initialMinute={parseInt(hora.split(':')[1])}
                onTimeChange={handleTimeChange}
              />
            )}
          </View>

          {/* Notificação */}
          <NotificationSelector value={notificationConfig} onValueChange={setNotificationConfig} label="Lembretes" />

          {/* Descrição */}
          <View style={styles.field}>
            <Text style={[typography.cardTitle, { color: colors.text.primary, marginBottom: 8 }]}>
              Descrição (opcional)
            </Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Adicione detalhes..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.secondary },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.background.primary, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    content: { flex: 1, padding: 20 },
    field: { marginBottom: 20 },
    input: { borderWidth: 1, borderColor: colors.border.light, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: colors.text.primary, backgroundColor: colors.background.primary },
    textArea: { height: 100, textAlignVertical: 'top' },
    categoriaContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    categoriaButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 2, borderColor: colors.border.light, backgroundColor: colors.background.primary },
    timeButton: { borderWidth: 1, borderColor: colors.border.light, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.background.primary },
  });
}