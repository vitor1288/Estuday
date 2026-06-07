import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, TextInput, Image, Modal, SafeAreaView as RNSafeAreaView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User, BookOpen, Info, Trash2, ChartBar as BarChart3,
  Camera, Edit3, Check, X, Settings, ChevronRight, Sun, Moon, Smartphone,
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { useEstuday } from '@/contexts/StudayContext';
import { useTheme, ThemePreference } from '@/contexts/ThemeContext';
import { lightColors, darkColors } from '@/components/theme/colors';

export default function ProfileScreen() {
  const { state, dispatch, updateProfile } = useEstuday();
  const { preference, activeTheme, setTheme } = useTheme();
  const colors = activeTheme === 'dark' ? darkColors : lightColors;

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(state.userProfile.nome);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [themeModalVisible, setThemeModalVisible] = useState(false);

  // ─── Limpar dados ────────────────────────────────────────────────────────────
  const handleClearData = () => {
    Alert.alert(
      'Limpar todos os dados',
      'Esta ação irá remover todos os seus compromissos, anotações e dados do perfil. Não pode ser desfeita.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Limpar', style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove([
                '@estuday:compromissos', '@estuday:anotacoes', '@estuday:userProfile',
              ]);
              const defaultProfile = { nome: 'Estudante', fotoUri: undefined, isCustomized: false };
              dispatch({ type: 'LOAD_DATA', payload: { compromissos: [], anotacoes: [], userProfile: defaultProfile } });
              setTempName(defaultProfile.nome);
              setIsEditingName(false);
              Alert.alert('Sucesso', 'Todos os dados foram removidos.');
            } catch {
              Alert.alert('Erro', 'Erro ao limpar os dados. Tente novamente.');
            }
          },
        },
      ]
    );
  };

  // ─── Foto ─────────────────────────────────────────────────────────────────
  const handleImagePicker = () => {
    Alert.alert('Escolher foto', 'Selecione uma opção', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Câmera', onPress: () => openImagePicker('camera') },
      { text: 'Galeria', onPress: () => openImagePicker('library') },
      ...(state.userProfile.fotoUri
        ? [{ text: 'Remover foto', style: 'destructive' as const, onPress: removeProfileImage }]
        : []),
    ]);
  };

  const openImagePicker = async (source: 'camera' | 'library') => {
    try {
      let result;
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Erro', 'Permissão de câmera necessária!'); return; }
        result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') { Alert.alert('Erro', 'Permissão de galeria necessária!'); return; }
        result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      }
      if (!result.canceled && result.assets[0]) {
        await updateProfile({ ...state.userProfile, fotoUri: result.assets[0].uri, isCustomized: true });
        Alert.alert('Sucesso', 'Foto de perfil atualizada!');
      }
    } catch {
      Alert.alert('Erro', 'Erro ao selecionar imagem. Tente novamente.');
    }
  };

  const removeProfileImage = async () => {
    const isNameCustomized = state.userProfile.nome.trim() !== 'Estudante';
    await updateProfile({ ...state.userProfile, fotoUri: undefined, isCustomized: isNameCustomized });
    Alert.alert('Sucesso', 'Foto removida!');
  };

  // ─── Nome ─────────────────────────────────────────────────────────────────
  const handleSaveName = async () => {
    if (!tempName.trim()) { Alert.alert('Erro', 'O nome não pode estar vazio.'); return; }
    const isNameCustomized = tempName.trim() !== 'Estudante';
    await updateProfile({ ...state.userProfile, nome: tempName.trim(), isCustomized: isNameCustomized || !!state.userProfile.fotoUri });
    setIsEditingName(false);
    Alert.alert('Sucesso', 'Nome atualizado!');
  };

  const handleCancelEdit = () => { setTempName(state.userProfile.nome); setIsEditingName(false); };

  // ─── Tema ─────────────────────────────────────────────────────────────────
  const themeOptions: { key: ThemePreference; label: string; icon: React.ReactNode }[] = [
    { key: 'light', label: 'Claro', icon: <Sun size={20} color={colors.primary} /> },
    { key: 'dark', label: 'Escuro', icon: <Moon size={20} color={colors.primary} /> },
    { key: 'system', label: 'Sistema', icon: <Smartphone size={20} color={colors.primary} /> },
  ];

  const currentThemeLabel = themeOptions.find(t => t.key === preference)?.label ?? 'Sistema';

  // ─── Stats ─────────────────────────────────────────────────────────────────
  const stats = {
    totalCompromissos: state.compromissos.length,
    compromissosConcluidos: state.compromissos.filter(c => c.concluido).length,
    totalAnotacoes: state.anotacoes.length,
    taxaConclusao: state.compromissos.length > 0
      ? Math.round((state.compromissos.filter(c => c.concluido).length / state.compromissos.length) * 100)
      : 0,
  };

  const s = makeStyles(colors);

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View style={s.profileSection}>
            <TouchableOpacity style={s.avatarContainer} onPress={handleImagePicker}>
              {state.userProfile.fotoUri
                ? <Image source={{ uri: state.userProfile.fotoUri }} style={s.avatar} />
                : <View style={s.avatarPlaceholder}><User size={40} color={colors.primary} /></View>}
              <View style={s.cameraIcon}><Camera size={16} color="#fff" /></View>
            </TouchableOpacity>

            <View style={s.profileInfo}>
              {isEditingName ? (
                <View style={s.editNameContainer}>
                  <TextInput
                    style={s.nameInput} value={tempName} onChangeText={setTempName}
                    placeholder="Digite seu nome" maxLength={30} autoFocus
                    placeholderTextColor={colors.text.tertiary}
                  />
                  <View style={s.editButtons}>
                    <TouchableOpacity style={s.saveButton} onPress={handleSaveName}><Check size={16} color="#fff" /></TouchableOpacity>
                    <TouchableOpacity style={s.cancelButton} onPress={handleCancelEdit}><X size={16} color="#fff" /></TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={s.nameContainer}>
                  <Text style={s.profileName}>{state.userProfile.nome}</Text>
                  <TouchableOpacity style={s.editNameButton} onPress={() => setIsEditingName(true)}>
                    <Edit3 size={16} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>
              )}
              <Text style={s.profileSubtitle}>Usuário do Estuday</Text>
            </View>
          </View>
        </View>

        {/* ── Estatísticas ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Estatísticas</Text>
          <View style={s.statsGrid}>
            {[
              { icon: <BookOpen size={24} color={colors.primary} />, value: stats.totalCompromissos, label: 'Total de Compromissos' },
              { icon: <BarChart3 size={24} color={colors.success} />, value: stats.compromissosConcluidos, label: 'Concluídos' },
              { icon: <Settings size={24} color={colors.warning} />, value: stats.totalAnotacoes, label: 'Anotações' },
              { icon: <BarChart3 size={24} color="#8B5CF6" />, value: `${stats.taxaConclusao}%`, label: 'Taxa de Conclusão' },
            ].map((item, i) => (
              <View key={i} style={s.statCard}>
                {item.icon}
                <Text style={s.statNumber}>{item.value}</Text>
                <Text style={s.statLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── Configurações ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Configurações</Text>

          {/* Botão que abre o modal de configurações */}
          <TouchableOpacity style={s.settingsCard} onPress={() => setSettingsVisible(true)}>
            <View style={s.settingsRow}>
              <Settings size={20} color={colors.primary} />
              <Text style={s.settingsLabel}>Configurações</Text>
            </View>
            <ChevronRight size={18} color={colors.text.tertiary} />
          </TouchableOpacity>

          {/* Limpar dados */}
          <TouchableOpacity style={s.dangerCard} onPress={handleClearData}>
            <Trash2 size={20} color={colors.danger} />
            <View style={{ flex: 1 }}>
              <Text style={s.dangerTitle}>Limpar todos os dados</Text>
              <Text style={s.dangerText}>Remove todos os compromissos e anotações. Não pode ser desfeito.</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── Sobre ── */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Sobre o Estuday</Text>
          <View style={s.infoCard}>
            <Info size={20} color={colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={s.infoTitle}>Versão do App</Text>
              <Text style={s.infoText}>1.0.0</Text>
            </View>
          </View>
          <View style={s.infoCard}>
            <BookOpen size={20} color={colors.success} />
            <View style={{ flex: 1 }}>
              <Text style={s.infoTitle}>Sobre o Estuday</Text>
              <Text style={s.infoText}>
                O Estuday é seu companheiro de estudos, ajudando você a organizar compromissos,
                fazer anotações e manter o foco nos seus objetivos acadêmicos.
              </Text>
            </View>
          </View>
        </View>

        <View style={s.footer}>
          <Text style={s.footerText}>Desenvolvido especialmente para estudantes</Text>
        </View>
      </ScrollView>

      {/* ── Modal: Configurações ── */}
      <Modal visible={settingsVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setSettingsVisible(false)}>
        <RNSafeAreaView style={[s.modalContainer, { backgroundColor: colors.background.secondary }]}>
          <View style={[s.modalHeader, { backgroundColor: colors.background.primary, borderBottomColor: colors.border.light }]}>
            <TouchableOpacity onPress={() => setSettingsVisible(false)} style={{ padding: 4 }}>
              <X size={24} color={colors.text.secondary} />
            </TouchableOpacity>
            <Text style={[s.modalTitle, { color: colors.text.primary }]}>Configurações</Text>
            <View style={{ width: 32 }} />
          </View>

          <ScrollView style={{ flex: 1, padding: 20 }}>
            {/* Opção: Tema */}
            <TouchableOpacity
              style={[s.settingsOptionCard, { backgroundColor: colors.background.primary, borderColor: colors.border.light }]}
              onPress={() => setThemeModalVisible(true)}
            >
              <View style={s.settingsRow}>
                <Sun size={20} color={colors.primary} />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[s.settingsOptionTitle, { color: colors.text.primary }]}>Tema</Text>
                  <Text style={[s.settingsOptionSub, { color: colors.text.secondary }]}>{currentThemeLabel}</Text>
                </View>
              </View>
              <ChevronRight size={18} color={colors.text.tertiary} />
            </TouchableOpacity>
          </ScrollView>
        </RNSafeAreaView>
      </Modal>

      {/* ── Modal: Escolha de Tema ── */}
      <Modal visible={themeModalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setThemeModalVisible(false)}>
        <RNSafeAreaView style={[s.modalContainer, { backgroundColor: colors.background.secondary }]}>
          <View style={[s.modalHeader, { backgroundColor: colors.background.primary, borderBottomColor: colors.border.light }]}>
            <TouchableOpacity onPress={() => setThemeModalVisible(false)} style={{ padding: 4 }}>
              <X size={24} color={colors.text.secondary} />
            </TouchableOpacity>
            <Text style={[s.modalTitle, { color: colors.text.primary }]}>Tema</Text>
            <View style={{ width: 32 }} />
          </View>

          <View style={{ padding: 20, gap: 12 }}>
            {themeOptions.map((option) => {
              const selected = preference === option.key;
              return (
                <TouchableOpacity
                  key={option.key}
                  style={[
                    s.themeOption,
                    { backgroundColor: colors.background.primary, borderColor: selected ? colors.primary : colors.border.light },
                  ]}
                  onPress={async () => { await setTheme(option.key); setThemeModalVisible(false); }}
                >
                  <View style={s.settingsRow}>
                    {option.icon}
                    <Text style={[s.themeOptionLabel, { color: colors.text.primary, marginLeft: 12 }]}>{option.label}</Text>
                  </View>
                  {selected && <Check size={18} color={colors.primary} />}
                </TouchableOpacity>
              );
            })}
            <Text style={[s.themeHint, { color: colors.text.tertiary }]}>
              "Sistema" usa automaticamente o tema do seu celular.
            </Text>
          </View>
        </RNSafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.secondary },
    header: { backgroundColor: colors.background.primary, paddingHorizontal: 20, paddingVertical: 24, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    profileSection: { flexDirection: 'row', alignItems: 'center', gap: 16 },
    avatarContainer: { position: 'relative' },
    avatar: { width: 80, height: 80, borderRadius: 40 },
    avatarPlaceholder: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.background.tertiary, alignItems: 'center', justifyContent: 'center' },
    cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primary, padding: 6, borderRadius: 15, borderWidth: 2, borderColor: colors.background.primary },
    profileInfo: { flex: 1 },
    nameContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    profileName: { fontSize: 24, fontWeight: 'bold', color: colors.text.primary },
    editNameButton: { padding: 4 },
    editNameContainer: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
    nameInput: { flex: 1, fontSize: 24, fontWeight: 'bold', color: colors.text.primary, borderBottomWidth: 2, borderBottomColor: colors.primary, paddingVertical: 4 },
    editButtons: { flexDirection: 'row', gap: 4 },
    saveButton: { backgroundColor: colors.success, padding: 6, borderRadius: 6 },
    cancelButton: { backgroundColor: colors.danger, padding: 6, borderRadius: 6 },
    profileSubtitle: { fontSize: 16, color: colors.text.secondary },
    section: { paddingHorizontal: 20, paddingVertical: 24 },
    sectionTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text.primary, marginBottom: 16 },
    statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    statCard: { flex: 1, minWidth: '45%', backgroundColor: colors.background.primary, padding: 20, borderRadius: 12, alignItems: 'center', gap: 8 },
    statNumber: { fontSize: 24, fontWeight: 'bold', color: colors.text.primary },
    statLabel: { fontSize: 14, color: colors.text.secondary, textAlign: 'center', fontWeight: '500' },
    settingsCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.background.primary, padding: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: colors.border.light },
    settingsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
    settingsLabel: { fontSize: 16, fontWeight: '600', color: colors.text.primary },
    dangerCard: { flexDirection: 'row', backgroundColor: colors.background.danger, padding: 16, borderRadius: 12, alignItems: 'flex-start', gap: 12, borderWidth: 1, borderColor: colors.danger + '40' },
    dangerTitle: { fontSize: 16, fontWeight: '600', color: colors.danger, marginBottom: 4 },
    dangerText: { fontSize: 14, color: colors.text.secondary, lineHeight: 20 },
    infoCard: { flexDirection: 'row', backgroundColor: colors.background.primary, padding: 16, borderRadius: 12, marginBottom: 12, alignItems: 'flex-start', gap: 12 },
    infoTitle: { fontSize: 16, fontWeight: '600', color: colors.text.primary, marginBottom: 4 },
    infoText: { fontSize: 14, color: colors.text.secondary, lineHeight: 20 },
    footer: { alignItems: 'center', paddingVertical: 32 },
    footerText: { fontSize: 14, color: colors.text.tertiary, textAlign: 'center' },
    modalContainer: { flex: 1 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1 },
    modalTitle: { fontSize: 18, fontWeight: '600' },
    settingsOptionCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 4 },
    settingsOptionTitle: { fontSize: 16, fontWeight: '600' },
    settingsOptionSub: { fontSize: 13, marginTop: 2 },
    themeOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, borderWidth: 2 },
    themeOptionLabel: { fontSize: 16, fontWeight: '500' },
    themeHint: { fontSize: 13, textAlign: 'center', marginTop: 8 },
  });
}