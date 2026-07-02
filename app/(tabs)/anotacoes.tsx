import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Modal, Platform } from 'react-native'; // Removido o Alert nativo
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText } from 'lucide-react-native';
import { useEstuday, AnotacaoCalendario } from '@/contexts/StudayContext';
import { AnotacaoCard } from '@/components/AnotacaoCard/AnotacaoCard';
import { useTheme } from '@/contexts/ThemeContext';
import { lightColors } from '@/components/theme/colors';
import { BaseButton } from '@/components/BaseButton/BaseButton';
import { CustomAlert } from '@/components/CustomAlert'; // 1. IMPORTADO O CUSTOM ALERT

export default function AnotacoesScreen() {
  const { state, deleteAnotacao, updateAnotacao } = useEstuday();
  const { colors, typography } = useTheme();
  const styles = makeStyles(colors);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingAnotacao, setEditingAnotacao] = useState<AnotacaoCalendario | null>(null);
  const [editText, setEditText] = useState('');

  // 2. ESTADO PARA CONTROLAR A ANOTAÇÃO SELECIONADA PARA EXCLUSÃO
  const [anotacaoParaExcluir, setAnotacaoParaExcluir] = useState<AnotacaoCalendario | null>(null);

  const sortedAnotacoes = useMemo(() =>
    [...state.anotacoes].sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()),
    [state.anotacoes]
  );

  const handleEditAnotacao = (anotacao: AnotacaoCalendario) => {
    setEditingAnotacao(anotacao);
    setEditText(anotacao.texto);
    setEditModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (editingAnotacao && editText.trim()) {
      await updateAnotacao(editingAnotacao.id, editText.trim());
      setEditModalVisible(false);
      setEditingAnotacao(null);
      setEditText('');
    }
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    setEditingAnotacao(null);
    setEditText('');
  };

  // 3. APENAS ABRE O MODAL SALVANDO A ANOTAÇÃO NO ESTADO
  const handleDeleteAnotacao = (anotacao: AnotacaoCalendario) => {
    setAnotacaoParaExcluir(anotacao);
  };

  // 4. FUNÇÃO QUE VALIDA E EXECUTA A EXCLUSÃO DE FATO
  const handleConfirmDelete = () => {
    if (anotacaoParaExcluir) {
      deleteAnotacao(anotacaoParaExcluir.id);
      setAnotacaoParaExcluir(null);
    }
  };

  const formatDateExtended = (dateString: string) =>
    new Date(dateString + 'T00:00:00').toLocaleDateString('pt-BR', {
      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric'
    });

  // Limitador de texto para o preview dentro do alerta
  const previewText = anotacaoParaExcluir?.texto 
    ? (anotacaoParaExcluir.texto.length > 40 ? anotacaoParaExcluir.texto.substring(0, 40) + '...' : anotacaoParaExcluir.texto)
    : '';

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <FileText size={24} color={colors.success} />
          <Text style={[typography.screenTitle, { color: colors.text.primary }]}>Anotações</Text>
        </View>
        <View style={styles.headerStats}>
          <Text style={[typography.small, { color: colors.success }]}>
            {state.anotacoes.length} {state.anotacoes.length === 1 ? 'anotação' : 'anotações'}
          </Text>
        </View>
      </View>

      {/* Conteúdo */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {sortedAnotacoes.length > 0 ? (
          sortedAnotacoes.map((anotacao) => (
            <AnotacaoCard
              key={anotacao.id}
              anotacao={anotacao}
              onEdit={() => handleEditAnotacao(anotacao)}
              onDelete={() => handleDeleteAnotacao(anotacao)}
              showDate={true}
            />
          ))
        ) : (
          <View style={styles.emptyState}>
            <FileText size={64} color={colors.border.medium} />
            <Text style={[typography.body, { color: colors.text.secondary, textAlign: 'center' }]}>
              Nenhuma anotação encontrada
            </Text>
            <Text style={[typography.caption, { color: colors.text.tertiary, textAlign: 'center' }]}>
              Adicione anotações através do calendário
            </Text>
            <View style={styles.emptyInstructions}>
              <Text style={[typography.caption, { color: colors.success, fontWeight: '600', marginBottom: 8 }]}>
                Como adicionar anotações:
              </Text>
              <Text style={[typography.small, { color: colors.success, lineHeight: 18 }]}>
                • Vá para a tela do calendário{'\n'}
                • Toque em qualquer dia{'\n'}
                • Use a seção "Anotações" para escrever suas observações
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Modal de Edição */}
      <Modal visible={editModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleCancelEdit}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <BaseButton variant="secondary" size="sm" onPress={handleCancelEdit}>
              Cancelar
            </BaseButton>
            <Text style={[typography.cardTitle, { color: colors.text.primary }]}>Editar Anotação</Text>
            <BaseButton variant="success" size="sm" onPress={handleSaveEdit}>
              Salvar
            </BaseButton>
          </View>
          <View style={styles.modalContent}>
            <Text style={[typography.caption, { color: colors.success, fontWeight: '600', marginBottom: 16, textTransform: 'capitalize' }]}>
              {editingAnotacao && formatDateExtended(editingAnotacao.data)}
            </Text>
            <TextInput
              style={styles.modalTextInput}
              value={editText}
              onChangeText={setEditText}
              placeholder="Digite sua anotação..."
              placeholderTextColor={colors.text.tertiary}
              multiline
              textAlignVertical="top"
              autoFocus
              onKeyPress={(e: any) => {
                if (Platform.OS === 'web') {
                  if (e.nativeEvent.key === 'Enter' && !e.nativeEvent.shiftKey) {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                }
              }}
            />
          </View>
        </SafeAreaView>
      </Modal>

      {/* 5. 🟢 NOVO: Confirmação antes de excluir uma anotação */}
      <CustomAlert
        visible={!!anotacaoParaExcluir}
        title="Excluir Anotação"
        message={`Tem certeza que deseja excluir "${previewText}"? Essa ação não pode ser desfeita.`}
        type="confirm"
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleConfirmDelete}
        onClose={() => setAnotacaoParaExcluir(null)}
      />
    </SafeAreaView>
  );
}

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.secondary },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.background.primary, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    headerContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    headerStats: { backgroundColor: colors.background.success, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
    content: { flex: 1, padding: 20 },
    emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60, gap: 16 },
    emptyInstructions: { marginTop: 20, padding: 16, backgroundColor: colors.background.success, borderRadius: 12, maxWidth: 280 },
    modalContainer: { flex: 1, backgroundColor: colors.background.secondary },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.background.primary, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    modalContent: { flex: 1, padding: 20 },
    modalTextInput: { flex: 1, backgroundColor: colors.background.primary, borderRadius: 12, padding: 16, fontSize: 16, color: colors.text.primary, borderWidth: 1, borderColor: colors.border.light },
  });
}