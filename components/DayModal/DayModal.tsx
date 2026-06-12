import React, { useState, useEffect } from 'react';
import { Modal, View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { X, Plus, Edit3, Trash2, Calendar } from 'lucide-react-native';
import { useEstuday, Compromisso, AnotacaoCalendario } from '@/contexts/StudayContext';
import { formatDateBR } from '@/utils/dateUtils';
import { useRouter } from 'expo-router';
import { CompromissoCard } from '@/components/CompromissoCard/CompromissoCard';
import { useTheme } from '@/contexts/ThemeContext';
import { lightColors } from '@/components/theme/colors';
import { BaseButton } from '@/components/BaseButton/BaseButton';

interface DayModalProps {
  visible: boolean;
  date: string;
  onClose: () => void;
}

export function DayModal({ visible, date, onClose }: DayModalProps) {
  const router = useRouter();
  const { getAnotacoesPorData, getCompromissosPorData, addAnotacao, updateAnotacao, deleteAnotacao } = useEstuday();
  const { colors, typography } = useTheme();
  const styles = makeStyles(colors);

  const [anotacoes, setAnotacoes] = useState<AnotacaoCalendario[]>([]);
  const [compromissos, setCompromissos] = useState<Compromisso[]>([]);
  const [novaAnotacao, setNovaAnotacao] = useState('');
  const [editandoAnotacao, setEditandoAnotacao] = useState<string | null>(null);
  const [textoEdicao, setTextoEdicao] = useState('');

  useEffect(() => {
    if (visible && date) {
      setAnotacoes(getAnotacoesPorData(date));
      setCompromissos(getCompromissosPorData(date).filter(c => !c.concluido));
    }
  }, [visible, date]);

  const handleAddAnotacao = async () => {
    if (novaAnotacao.trim()) {
      await addAnotacao({ data: date, texto: novaAnotacao.trim() });
      setNovaAnotacao('');
      setAnotacoes(getAnotacoesPorData(date));
    }
  };

  const handleSaveEdit = async () => {
    if (editandoAnotacao && textoEdicao.trim()) {
      const anotacao = anotacoes.find(a => a.id === editandoAnotacao);
      if (anotacao) {
        await updateAnotacao({ ...anotacao, texto: textoEdicao.trim() });
        setEditandoAnotacao(null);
        setTextoEdicao('');
        setAnotacoes(getAnotacoesPorData(date));
      }
    }
  };

  const handleDeleteAnotacao = (anotacao: AnotacaoCalendario) => {
    Alert.alert('Confirmar exclusão', 'Tem certeza que deseja excluir esta anotação?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => { await deleteAnotacao(anotacao.id); setAnotacoes(getAnotacoesPorData(date)); },
      },
    ]);
  };

  const handleCompromissoPress = () => { onClose(); router.push('/compromissos'); };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Calendar size={24} color={colors.primary} />
            <Text style={[typography.sectionTitle, { color: colors.text.primary }]}>
              {formatDateBR(date)}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Compromissos */}
          {compromissos.length > 0 && (
            <View style={styles.section}>
              <Text style={[typography.cardTitle, { color: colors.text.primary, marginBottom: 12 }]}>
                Compromissos
              </Text>
              {compromissos.map((compromisso) => (
                <CompromissoCard
                  key={compromisso.id}
                  compromisso={compromisso}
                  onEdit={handleCompromissoPress}
                  onDelete={handleCompromissoPress}
                  onToggleComplete={handleCompromissoPress}
                  variant="compromisso-modal"
                  onPress={handleCompromissoPress}
                />
              ))}
            </View>
          )}

          {/* Anotações */}
          <View style={styles.section}>
            <Text style={[typography.cardTitle, { color: colors.text.primary, marginBottom: 12 }]}>
              Anotações
            </Text>

            <View style={styles.addAnotacaoContainer}>
              <TextInput
                style={styles.addAnotacaoInput}
                placeholder="Adicionar anotação..."
                value={novaAnotacao}
                onChangeText={setNovaAnotacao}
                multiline
                placeholderTextColor={colors.text.tertiary}
              />
              <TouchableOpacity
                onPress={handleAddAnotacao}
                style={[styles.addButton, !novaAnotacao.trim() && styles.addButtonDisabled]}
                disabled={!novaAnotacao.trim()}
              >
                <Plus size={20} color={novaAnotacao.trim() ? colors.text.white : colors.text.tertiary} />
              </TouchableOpacity>
            </View>

            {anotacoes.map((anotacao) => (
              <View key={anotacao.id} style={styles.anotacaoItem}>
                {editandoAnotacao === anotacao.id ? (
                  <View style={{ gap: 12 }}>
                    <TextInput
                      style={styles.editInput}
                      value={textoEdicao}
                      onChangeText={setTextoEdicao}
                      multiline
                      autoFocus
                      placeholderTextColor={colors.text.tertiary}
                    />
                    <View style={styles.editActions}>
                      <BaseButton variant="success" size="sm" onPress={handleSaveEdit}>Salvar</BaseButton>
                      <BaseButton variant="secondary" size="sm" onPress={() => { setEditandoAnotacao(null); setTextoEdicao(''); }}>Cancelar</BaseButton>
                    </View>
                  </View>
                ) : (
                  <View style={styles.anotacaoContent}>
                    <Text style={[typography.body, { flex: 1, color: colors.text.primary, lineHeight: 20 }]}>
                      {anotacao.texto}
                    </Text>
                    <View style={styles.anotacaoActions}>
                      <TouchableOpacity onPress={() => { setEditandoAnotacao(anotacao.id); setTextoEdicao(anotacao.texto); }} style={{ padding: 4 }}>
                        <Edit3 size={16} color={colors.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity onPress={() => handleDeleteAnotacao(anotacao)} style={{ padding: 4 }}>
                        <Trash2 size={16} color={colors.danger} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            ))}

            {anotacoes.length === 0 && (
              <Text style={[typography.body, { color: colors.text.secondary, textAlign: 'center', fontStyle: 'italic', padding: 20 }]}>
                Nenhuma anotação para este dia
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.primary },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    headerContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    closeButton: { padding: 8, borderRadius: 8, backgroundColor: colors.background.tertiary },
    content: { flex: 1, padding: 20 },
    section: { marginBottom: 24 },
    addAnotacaoContainer: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 16, gap: 8 },
    addAnotacaoInput: { flex: 1, borderWidth: 1, borderColor: colors.border.light, borderRadius: 8, padding: 12, fontSize: 16, maxHeight: 100, color: colors.text.primary, backgroundColor: colors.background.primary },
    addButton: { backgroundColor: colors.primary, padding: 12, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    addButtonDisabled: { backgroundColor: colors.border.light },
    anotacaoItem: { backgroundColor: colors.background.secondary, padding: 16, borderRadius: 12, marginBottom: 8 },
    anotacaoContent: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    anotacaoActions: { flexDirection: 'row', gap: 8, marginLeft: 12 },
    editInput: { borderWidth: 1, borderColor: colors.border.light, borderRadius: 8, padding: 12, fontSize: 16, maxHeight: 100, color: colors.text.primary, backgroundColor: colors.background.primary },
    editActions: { flexDirection: 'row', gap: 8 },
  });
}