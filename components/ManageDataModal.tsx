import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useStuday } from '@/contexts/StudayContext';
import { X, Plus, Trash2, ArrowUp, ArrowDown, Check } from 'lucide-react-native';
import { lightColors } from '@/components/theme/colors';

interface ManageDataModalProps {
  visible: boolean;
  onClose: () => void;
}

const PALETA_CORES = ['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899'];

export function ManageDataModal({ visible, onClose }: ManageDataModalProps) {
  const { colors, typography } = useTheme();
  const styles = makeStyles(colors);
  
  // Resgatando dados e as novas funções de reordenar do contexto centralizado
  const { 
    state,
    addMateria, 
    deleteMateria, 
    addCategoria, 
    deleteCategoria,
    reordenarMaterias,   
    reordenarCategorias  
  } = useStuday();
  
  const materias = state?.materias || [];
  const categorias = state?.categorias || [];

  const [abaAtiva, setAbaAtiva] = useState<'materias' | 'categorias'>('materias');
  const [novoNomeMateria, setNovoNomeMateria] = useState('');
  const [novoNomeCategoria, setNovoNomeCategoria] = useState('');
  const [corSelecionada, setCorSelecionada] = useState(PALETA_CORES[4]); // Azul padrão

  const handleCriarMateria = () => {
    if (!novoNomeMateria.trim()) return;
    addMateria(novoNomeMateria.trim());
    setNovoNomeMateria('');
  };

  const handleCriarCategoria = () => {
    if (!novoNomeCategoria.trim()) return;
    addCategoria(novoNomeCategoria.trim(), corSelecionada);
    setNovoNomeCategoria('');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          
          {/* Cabeçalho do Modal */}
          <View style={styles.header}>
            <Text style={[typography.sectionTitle, { color: colors.text.primary }]}>Gerenciar Dados</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={22} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          {/* Abas Alternadoras (Matérias / Categorias) */}
          <View style={styles.tabContainer}>
            <TouchableOpacity 
              style={[styles.tab, abaAtiva === 'materias' && styles.tabActive]} 
              onPress={() => setAbaAtiva('materias')}
            >
              <Text style={[styles.tabText, abaAtiva === 'materias' && styles.tabTextActive]}>Matérias</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.tab, abaAtiva === 'categorias' && styles.tabActive]} 
              onPress={() => setAbaAtiva('categorias')}
            >
              <Text style={[styles.tabText, abaAtiva === 'categorias' && styles.tabTextActive]}>Categorias</Text>
            </TouchableOpacity>
          </View>

          {/* Conteúdo Dinâmico */}
          <View style={styles.content}>
            {abaAtiva === 'materias' ? (
              <>
                {/* Form Criação de Matéria */}
                <View style={styles.addForm}>
                  <TextInput
                    style={styles.input}
                    placeholder="Nova Matéria (ex: Cálculo I)"
                    placeholderTextColor={colors.text.tertiary}
                    value={novoNomeMateria}
                    onChangeText={setNovoNomeMateria}
                  />
                  <TouchableOpacity style={styles.addButton} onPress={handleCriarMateria}>
                    <Plus size={20} color="#FFF" />
                  </TouchableOpacity>
                </View>

                {/* Lista de Matérias com Setas de Ordem Ativas */}
                {/* CORRIGIDO AQUI: A FlatList é fechada com /> */}
                <FlatList
                  data={materias}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item, index }) => (
                    <View style={styles.listItem}>
                      <Text style={[styles.itemText, { color: colors.text.primary }]}>{item.nome}</Text>
                      
                      <View style={styles.actionButtonsRow}>
                        <TouchableOpacity 
                          disabled={index === 0} 
                          onPress={() => reordenarMaterias && reordenarMaterias(item.id, 'up')}
                          style={[styles.iconBtn, index === 0 && { opacity: 0.2 }]}
                        >
                          <ArrowUp size={16} color={colors.text.secondary} />
                        </TouchableOpacity>

                        <TouchableOpacity 
                          disabled={index === materias.length - 1} 
                          onPress={() => reordenarMaterias && reordenarMaterias(item.id, 'down')}
                          style={[styles.iconBtn, index === materias.length - 1 && { opacity: 0.2 }]}
                        >
                          <ArrowDown size={16} color={colors.text.secondary} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => deleteMateria(item.id)} style={styles.iconBtn}>
                          <Trash2 size={16} color={colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />
              </>
            ) : (
              <>
                {/* Form Criação de Categoria */}
                <View style={[styles.addForm, { height: 'auto', flexDirection: 'column', gap: 12, marginBottom: 15 }]}>
                  <View style={{ flexDirection: 'row', height: 44, gap: 10, width: '100%' }}>
                    <TextInput
                      style={styles.input}
                      placeholder="Nova Categoria (ex: Prova)"
                      placeholderTextColor={colors.text.tertiary}
                      value={novoNomeCategoria}
                      onChangeText={setNovoNomeCategoria}
                    />
                    <TouchableOpacity style={styles.addButton} onPress={handleCriarCategoria}>
                      <Plus size={20} color="#FFF" />
                    </TouchableOpacity>
                  </View>

                  {/* Seletor de Cores Redondas */}
                  <View style={styles.colorPaletteRow}>
                    {PALETA_CORES.map((cor) => (
                      <TouchableOpacity 
                        key={cor} 
                        style={[styles.colorDotSelect, { backgroundColor: cor }, corSelecionada === cor && styles.colorDotSelectActive]}
                        onPress={() => setCorSelecionada(cor)}
                      >
                        {corSelecionada === cor && <Check size={12} color="#FFF" strokeWidth={3} />}
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Lista de Categorias com Setas de Ordem Ativas */}
                {/* CORRIGIDO AQUI: A FlatList é fechada com /> */}
                <FlatList
                  data={categorias}
                  keyExtractor={(item) => item.id}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item, index }) => (
                    <View style={styles.listItem}>
                      <View style={[styles.colorIndicator, { backgroundColor: item.cor }]} />
                      <Text style={[styles.itemText, { color: colors.text.primary }]}>{item.nome}</Text>
                      
                      <View style={styles.actionButtonsRow}>
                        <TouchableOpacity 
                          disabled={index === 0} 
                          onPress={() => reordenarCategorias && reordenarCategorias(item.id, 'up')}
                          style={[styles.iconBtn, index === 0 && { opacity: 0.2 }]}
                        >
                          <ArrowUp size={16} color={colors.text.secondary} />
                        </TouchableOpacity>

                        <TouchableOpacity 
                          disabled={index === categorias.length - 1} 
                          onPress={() => reordenarCategorias && reordenarCategorias(item.id, 'down')}
                          style={[styles.iconBtn, index === categorias.length - 1 && { opacity: 0.2 }]}
                        >
                          <ArrowDown size={16} color={colors.text.secondary} />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={() => deleteCategoria(item.id)} style={styles.iconBtn}>
                          <Trash2 size={16} color={colors.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />
              </>
            )}
          </View>

        </View>
      </View>
    </Modal>
  );
}

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.4)', justifyContent: 'flex-end' },
    container: { backgroundColor: colors.background.primary, borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '75%', paddingBottom: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    closeButton: { padding: 4 },
    
    tabContainer: { flexDirection: 'row', backgroundColor: colors.background.tertiary, padding: 4, marginHorizontal: 20, marginTop: 15, borderRadius: 8 },
    tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 6 },
    tabActive: { backgroundColor: colors.background.primary },
    tabText: { fontSize: 14, color: colors.text.secondary, fontWeight: '500' },
    tabTextActive: { color: colors.primary, fontWeight: '600' },
    
    content: { flex: 1, paddingHorizontal: 20, marginTop: 15 },
    addForm: { flexDirection: 'row', height: 44, gap: 10, marginBottom: 15 },
    input: { flex: 1, backgroundColor: colors.background.secondary, borderRadius: 8, paddingHorizontal: 12, fontSize: 14, color: colors.text.primary, borderWidth: 1, borderColor: colors.border.light },
    addButton: { backgroundColor: colors.primary, width: 44, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    
    listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.border.light, justifyContent: 'space-between' },
    colorIndicator: { width: 12, height: 12, borderRadius: 6, marginRight: 12 },
    itemText: { flex: 1, fontSize: 15, fontWeight: '500' },
    
    actionButtonsRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    iconBtn: { padding: 8, backgroundColor: colors.background.secondary, borderRadius: 6 },
    
    colorPaletteRow: { flexDirection: 'row', gap: 8, justifyContent: 'space-between', width: '100%', paddingHorizontal: 2, paddingVertical: 4 },
    colorDotSelect: { width: 30, height: 30, borderRadius: 15, justifyContent: 'center', alignItems: 'center' },
    colorDotSelectActive: { borderWidth: 2, borderColor: '#000', transform: [{ scale: 1.1 }] }
  });
}