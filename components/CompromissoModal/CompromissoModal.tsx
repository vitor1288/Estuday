import React, { useState, useEffect } from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Platform } from 'react-native';
import { X } from 'lucide-react-native';
import { useEstuday, Compromisso } from '@/contexts/StudayContext';
import { formatDate } from '@/utils/dateUtils';
import { DatePicker } from '@/components/DatePicker/DatePicker';
import TimePicker from '@/components/TimePicker/TimePicker';
import { NotificationSelector, MultipleNotificationConfig } from '@/components/NotificationSelector/NotificationSelector';
import { useTheme } from '@/contexts/ThemeContext';
import { lightColors } from '@/components/theme/colors';
import { CustomAlert } from '@/components/CustomAlert';

interface CompromissoModalProps {
  visible: boolean;
  compromisso?: Compromisso | null;
  initialDate?: string;
  onClose: () => void;
  onSave: () => void;
}

export function CompromissoModal({ visible, compromisso, initialDate, onClose, onSave }: CompromissoModalProps) {
  const { addCompromisso, updateCompromisso, categorias, categories, materias } = useEstuday();
  const { colors, typography } = useTheme();
  const styles = makeStyles(colors);

  const listaCategorias = categorias || (categories as any) || [];
  const listaMaterias = materias || [];

  const [titulo, setTitulo] = useState('');
  const [isTituloEditado, setIsTituloEditado] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState(formatDate(new Date()));
  const [hora, setHora] = useState('09:00');
  
  const [categoriaId, setCategoriaId] = useState('');
  const [materiaId, setMateriaId] = useState('');
  
  const [notificationConfig, setNotificationConfig] = useState<MultipleNotificationConfig>({
    notifications: [{ enabled: true, tempo: 1, unidade: 'dias' }]
  });

  const [showTimePicker, setShowTimePicker] = useState(false);

  // Estado do CustomAlert
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: '',
    message: '',
    type: 'info' as 'success' | 'error' | 'warning' | 'info' | 'confirm',
    onConfirm: undefined as (() => void) | undefined,
  });

  const showAlert = (
    title: string, 
    message: string, 
    type: 'success' | 'error' | 'warning' | 'info' | 'confirm' = 'info',
    onConfirm?: () => void
  ) => {
    setAlertConfig({ visible: true, title, message, type, onConfirm });
  };

  const closeAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    if (visible) {
      if (compromisso) {
        setTitulo(compromisso.titulo);
        setIsTituloEditado(true);
        setDescricao(compromisso.descricao || '');
        setData(compromisso.data);
        setHora(compromisso.hora);
        setCategoriaId(compromisso.categoriaId || compromisso.categoria || '');
        setMateriaId(compromisso.materiaId || compromisso.materia || '');
        if (compromisso.notificacaoConfig) {
          setNotificationConfig(compromisso.notificacaoConfig);
        }
      } else {
        setTitulo('');
        setIsTituloEditado(false);
        setDescricao('');
        setData(initialDate || formatDate(new Date()));
        setHora('09:00');
        setCategoriaId('');
        setMateriaId('');
        setNotificationConfig({ notifications: [{ enabled: true, tempo: 1, unidade: 'dias' }] });
      }
    }
  }, [visible, compromisso, initialDate]);

  useEffect(() => {
    if (!isTituloEditado) {
      const cat = listaCategorias.find((c: any) => c.id === categoriaId);
      const mat = listaMaterias.find((m: any) => m.id === materiaId);
      
      if (cat && mat) {
        setTitulo(`${cat.nome} de ${mat.nome}`);
      } else if (cat) {
        setTitulo(cat.nome);
      } else if (mat) {
        setTitulo(mat.nome);
      } else {
        setTitulo('');
      }
    }
  }, [categoriaId, materiaId, isTituloEditado, listaCategorias, listaMaterias]);

  const handleSave = async () => {
    if (!titulo.trim()) {
      showAlert('Erro', 'Por favor, insira um título para o compromisso.', 'error');
      return;
    }

    const catSelecionada = listaCategorias.find((c: any) => c.id === categoriaId);
    const matSelecionada = listaMaterias.find((m: any) => m.id === materiaId);

    const compromissoData = {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      data,
      hora,
      categoriaId: categoriaId || '',
      materiaId: materiaId || '',
      categoria: catSelecionada ? catSelecionada.nome : '', 
      materia: matSelecionada ? matSelecionada.nome : '',     
      notificacaoConfig: notificationConfig,
      concluido: compromisso?.concluido || false
    };

    try {
      if (compromisso) {
        await updateCompromisso(compromisso.id, compromissoData);
        showAlert('Sucesso', 'Compromisso atualizado com sucesso!', 'success', onClose);
      } else {
        await addCompromisso(compromissoData);
        showAlert('Sucesso', 'Compromisso criado com sucesso!', 'success', onClose);
      }
    } catch (error) {
      showAlert('Erro', 'Ocorreu um erro ao salvar o compromisso.', 'error');
    }
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={colors.text.primary} />
            </TouchableOpacity>
            
            <View style={styles.titleWrapper}>
              <Text style={[typography.h3, { color: colors.text.primary }]} numberOfLines={1}>
                {compromisso ? 'Editar Compromisso' : 'Novo Compromisso'}
              </Text>
            </View>
            
            <TouchableOpacity onPress={handleSave} style={styles.saveButtonHeader}>
              <Text style={styles.saveButtonTextHeader}>Salvar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* ... todo o conteúdo do ScrollView permanece igual ... */}
            <View style={styles.field}>
              <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 8 }]}>Título</Text>
              <TextInput
                style={styles.input}
                value={titulo}
                onChangeText={(text) => {
                  setTitulo(text);
                  if (text.trim() === '') {
                    setIsTituloEditado(false);
                  } else {
                    setIsTituloEditado(true);
                  }
                }}
                placeholder="Ex: Prova de Matemática"
                placeholderTextColor={colors.text.tertiary}
                onKeyPress={(e: any) => {
                  if (Platform.OS === 'web') {
                    if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                      e.preventDefault();
                      handleSave();
                    }
                  }
                }}
              />
            </View>

            {/* ... resto dos campos (Categoria, Matéria, Data, Hora, Notificações, Descrição) permanecem iguais ... */}

            <View style={[styles.field, { marginBottom: 40 }]}>
              <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 8 }]}>Descrição</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={descricao}
                onChangeText={setDescricao}
                placeholder="Adicione detalhes ao seu compromisso..."
                placeholderTextColor={colors.text.tertiary}
                multiline
                numberOfLines={4}
                onKeyPress={(e: any) => {
                  if (Platform.OS === 'web') {
                    if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                      e.preventDefault();
                      handleSave();
                    }
                  }
                }}
              />
            </View>
          </ScrollView>
        </View>

        {/* TimePicker Modal */}
        <Modal visible={showTimePicker} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={[styles.timePickerContainer, { backgroundColor: colors.background.primary }]}>
              <Text style={[typography.subtitle, { color: colors.text.primary, marginBottom: 20 }]}>Selecione a Hora</Text>
              <TimePicker
                initialHour={parseInt(hora.split(':')[0])}
                initialMinute={parseInt(hora.split(':')[1])}
                onTimeChange={(h, m) => setHora(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`)}
              />
              <TouchableOpacity style={[styles.timePickerButton, { backgroundColor: colors.primary }]} onPress={() => setShowTimePicker(false)}>
                <Text style={[typography.button, { color: '#FFF' }]}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </Modal>

      {/* CustomAlert */}
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={closeAlert}
        onConfirm={alertConfig.onConfirm}
      />
    </>
  );
}

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    // ... seus estilos originais (mantidos iguais)
    container: { flex: 1, backgroundColor: colors.background.secondary },
    header: { 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'center', 
      height: 64,
      paddingHorizontal: 16, 
      backgroundColor: colors.background.primary, 
      borderBottomWidth: 1, 
      borderBottomColor: colors.border.light,
      position: 'relative'
    },
    titleWrapper: {
      maxWidth: '55%',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeButton: { 
      position: 'absolute',
      left: 16,
      padding: 6,
    },
    saveButtonHeader: {
      position: 'absolute',
      right: 16,
      backgroundColor: colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    saveButtonTextHeader: {
      color: '#fff',
      fontWeight: '600',
      fontSize: 14,
    },
    content: { flex: 1, padding: 20 },
    field: { marginBottom: 20 },
    input: { borderWidth: 1, borderColor: colors.border.light, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: colors.text.primary, backgroundColor: colors.background.primary },
    textArea: { height: 100, textAlignVertical: 'top' },
    categoriaContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    categoriaButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 2, borderColor: colors.border.light, backgroundColor: colors.background.primary },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    timeButton: { borderWidth: 1, borderColor: colors.border.light, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, backgroundColor: colors.background.primary },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center' },
    timePickerContainer: { width: '80%', borderRadius: 16, padding: 20, alignItems: 'center' },
    timePickerButton: { width: '100%', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 20 },
  });
}