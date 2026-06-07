import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Camera, User, Check } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { UserProfile } from '@/contexts/StudayContext';
import { useTheme } from '@/contexts/ThemeContext';
import { lightColors } from '@/components/theme/colors';

interface ProfileEditModalProps {
  visible: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  onSave: (profile: UserProfile) => Promise<void>;
}

export default function ProfileEditModal({ visible, onClose, userProfile, onSave }: ProfileEditModalProps) {
  const { colors, typography } = useTheme();
  const styles = makeStyles(colors);

  const [nome, setNome] = useState(userProfile.nome);
  const [fotoUri, setFotoUri] = useState(userProfile.fotoUri);
  const [loading, setLoading] = useState(false);

  const handleImagePicker = () => {
    Alert.alert('Escolher foto', 'Selecione uma opção', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Câmera', onPress: () => openImagePicker('camera') },
      { text: 'Galeria', onPress: () => openImagePicker('library') },
      ...(fotoUri ? [{ text: 'Remover foto', style: 'destructive' as const, onPress: () => setFotoUri(undefined) }] : []),
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
      if (!result.canceled && result.assets[0]) setFotoUri(result.assets[0].uri);
    } catch {
      Alert.alert('Erro', 'Erro ao selecionar imagem. Tente novamente.');
    }
  };

  const handleSave = async () => {
    if (!nome.trim()) { Alert.alert('Erro', 'O nome não pode estar vazio.'); return; }
    try {
      setLoading(true);
      const isNameCustomized = nome.trim() !== 'Estudante';
      await onSave({ nome: nome.trim(), fotoUri, isCustomized: isNameCustomized || !!fotoUri });
      onClose();
    } catch {
      Alert.alert('Erro', 'Erro ao salvar perfil. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => { setNome(userProfile.nome); setFotoUri(userProfile.fotoUri); onClose(); };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}><X size={24} color={colors.text.secondary} /></TouchableOpacity>
          <Text style={[typography.cardTitle, { color: colors.text.primary }]}>Editar Perfil</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading} style={{ opacity: loading ? 0.5 : 1 }}>
            <Check size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          {/* Foto */}
          <View style={styles.photoSection}>
            <TouchableOpacity style={styles.avatarContainer} onPress={handleImagePicker}>
              {fotoUri
                ? <Image source={{ uri: fotoUri }} style={styles.avatar} />
                : <View style={styles.avatarPlaceholder}><User size={40} color={colors.text.tertiary} /></View>}
              <View style={styles.cameraIcon}><Camera size={16} color="#fff" /></View>
            </TouchableOpacity>
            <Text style={[typography.caption, { color: colors.text.secondary }]}>Toque para alterar foto</Text>
          </View>

          {/* Nome */}
          <View style={{ marginBottom: 24 }}>
            <Text style={[typography.cardTitle, { color: colors.text.primary, marginBottom: 8 }]}>Nome</Text>
            <TextInput
              style={styles.input}
              value={nome}
              onChangeText={setNome}
              placeholder="Digite seu nome"
              placeholderTextColor={colors.text.tertiary}
              maxLength={30}
              autoCapitalize="words"
            />
            <Text style={[typography.small, { color: colors.text.secondary, marginTop: 4, textAlign: 'right' }]}>
              {nome.length}/30 caracteres
            </Text>
          </View>

          {/* Preview */}
          <View>
            <Text style={[typography.cardTitle, { color: colors.text.primary, marginBottom: 12 }]}>
              Prévia da saudação:
            </Text>
            <View style={styles.previewCard}>
              <Text style={[typography.sectionTitle, { color: colors.text.primary, textAlign: 'center' }]}>
                {getGreetingPreview(nome.trim() || 'Estudante', (nome.trim() !== 'Estudante' && nome.trim() !== '') || !!fotoUri)}
              </Text>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function getGreetingPreview(nome: string, isCustomized: boolean = true): string {
  const hour = new Date().getHours();
  if (!isCustomized) {
    if (hour >= 5 && hour < 12) return 'Bom dia, seja bem vindo!';
    if (hour >= 12 && hour < 18) return 'Boa tarde, seja bem vindo!';
    return 'Boa noite, seja bem vindo!';
  }
  if (hour >= 5 && hour < 12) return `Bom dia, ${nome}!`;
  if (hour >= 12 && hour < 18) return `Boa tarde, ${nome}!`;
  return `Boa noite, ${nome}!`;
}

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background.secondary },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.background.primary, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    content: { flex: 1, padding: 20 },
    photoSection: { alignItems: 'center', marginBottom: 32 },
    avatarContainer: { position: 'relative', marginBottom: 12 },
    avatar: { width: 100, height: 100, borderRadius: 50 },
    avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.background.tertiary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.border.medium, borderStyle: 'dashed' },
    cameraIcon: { position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.primary, padding: 8, borderRadius: 20, borderWidth: 3, borderColor: colors.background.primary },
    input: { backgroundColor: colors.background.primary, borderWidth: 1, borderColor: colors.border.light, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: colors.text.primary },
    previewCard: { backgroundColor: colors.background.primary, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: colors.border.light },
  });
}