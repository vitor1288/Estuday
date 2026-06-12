import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, ScrollView, SafeAreaView } from 'react-native';
import { Bell, BellOff, Check, X, Plus, Minus } from 'lucide-react-native';
import { NotificationConfig, NOTIFICATION_OPTIONS, getNotificationText } from '@/contexts/StudayContext';
import { useTheme } from '@/contexts/ThemeContext';
import { lightColors } from '@/components/theme/colors';

export interface MultipleNotificationConfig {
  notifications: NotificationConfig[];
}

interface NotificationSelectorProps {
  value?: MultipleNotificationConfig;
  onValueChange: (config: MultipleNotificationConfig) => void;
  label?: string;
}

const DEFAULT_CONFIG: MultipleNotificationConfig = {
  notifications: [{ enabled: true, tempo: 1, unidade: 'dias' }]
};

const getMultipleNotificationText = (config: MultipleNotificationConfig): string => {
  const enabled = (config?.notifications || []).filter(n => n.enabled);
  if (!enabled.length) return 'Sem notificação';
  if (enabled.length === 1) return getNotificationText(enabled[0]);
  return `${enabled.length} lembretes configurados`;
};

export function NotificationSelector({ value = DEFAULT_CONFIG, onValueChange, label = 'Notificação' }: NotificationSelectorProps) {
  const { colors, typography } = useTheme();
  const styles = makeStyles(colors);
  const safeValue = value?.notifications ? value : DEFAULT_CONFIG;
  const [modalVisible, setModalVisible] = useState(false);
  const [tempSelection, setTempSelection] = useState<MultipleNotificationConfig>(safeValue);

  useEffect(() => { setTempSelection(safeValue); }, [value]);

  const handleOpenModal = () => { setTempSelection(safeValue); setModalVisible(true); };
  const handleSave = () => { onValueChange(tempSelection); setModalVisible(false); };
  const handleCancel = () => { setTempSelection(safeValue); setModalVisible(false); };

  const handleOptionPress = (option: typeof NOTIFICATION_OPTIONS[0]) => {
    if (!option.enabled) { setTempSelection({ notifications: [] }); return; }
    const current = tempSelection.notifications || [];
    const existingIndex = current.findIndex(n => n.tempo === option.tempo && n.unidade === option.unidade);
    if (existingIndex >= 0) {
      setTempSelection({ notifications: current.filter((_, i) => i !== existingIndex) });
    } else {
      setTempSelection({ notifications: [...current, { enabled: option.enabled, tempo: option.tempo, unidade: option.unidade }] });
    }
  };

  const isOptionSelected = (option: typeof NOTIFICATION_OPTIONS[0]) => {
    const current = tempSelection.notifications || [];
    if (!option.enabled) return current.length === 0;
    return current.some(n => n.tempo === option.tempo && n.unidade === option.unidade && n.enabled);
  };

  const hasNotifications = (safeValue.notifications || []).length > 0;

  return (
    <>
      <View style={styles.container}>
        <Text style={[typography.cardTitle, { color: colors.text.primary, marginBottom: 8 }]}>{label}</Text>
        <TouchableOpacity style={styles.selector} onPress={handleOpenModal}>
          <View style={styles.selectorContent}>
            {hasNotifications ? (
              <View style={styles.bellContainer}>
                <Bell size={20} color={colors.primary} />
                {safeValue.notifications.length > 1 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{safeValue.notifications.length}</Text>
                  </View>
                )}
              </View>
            ) : (
              <BellOff size={20} color={colors.text.tertiary} />
            )}
            <Text style={[typography.body, { flex: 1, color: hasNotifications ? colors.text.primary : colors.text.tertiary }]}>
              {getMultipleNotificationText(safeValue)}
            </Text>
          </View>
        </TouchableOpacity>

        {hasNotifications && (
          <View style={{ marginTop: 8, gap: 4 }}>
            {safeValue.notifications.map((notification, index) => (
              <View key={index} style={styles.selectedItem}>
                <Bell size={12} color={colors.primary} />
                <Text style={[typography.small, { color: colors.text.secondary }]}>
                  {getNotificationText(notification)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleCancel}>
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={handleCancel} style={{ padding: 4 }}>
              <X size={24} color={colors.text.secondary} />
            </TouchableOpacity>
            <Text style={[typography.cardTitle, { color: colors.text.primary }]}>Configurar Notificações</Text>
            <TouchableOpacity onPress={handleSave} style={{ padding: 4 }}>
              <Check size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={[typography.sectionTitle, { color: colors.text.primary, textAlign: 'center', marginBottom: 8 }]}>
              Quando você deseja ser lembrado?
            </Text>
            <Text style={[typography.caption, { color: colors.text.secondary, textAlign: 'center', marginBottom: 20 }]}>
              Você pode selecionar múltiplos horários
            </Text>

            <View style={{ gap: 8, marginBottom: 24 }}>
              {NOTIFICATION_OPTIONS.map((option, index) => {
                const selected = isOptionSelected(option);
                return (
                  <TouchableOpacity
                    key={index}
                    style={[styles.optionItem, selected && { backgroundColor: colors.primary, borderColor: colors.primary }]}
                    onPress={() => handleOptionPress(option)}
                  >
                    <View style={styles.optionContent}>
                      <View style={[styles.optionIcon, selected && { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
                        {option.enabled
                          ? <Bell size={20} color={selected ? colors.text.white : colors.primary} />
                          : <BellOff size={20} color={selected ? colors.text.white : colors.text.tertiary} />}
                      </View>
                      <Text style={[typography.body, { color: selected ? colors.text.white : option.enabled ? colors.text.primary : colors.text.tertiary }]}>
                        {option.label}
                      </Text>
                    </View>
                    {selected && option.enabled ? <Minus size={20} color={colors.text.white} />
                      : selected && !option.enabled ? <Check size={20} color={colors.text.white} />
                      : option.enabled ? <Plus size={20} color={colors.text.secondary} />
                      : null}
                  </TouchableOpacity>
                );
              })}
            </View>

            {(tempSelection.notifications || []).length > 0 && (
              <View style={styles.summaryBox}>
                <Text style={[typography.caption, { color: colors.success, fontWeight: '600', marginBottom: 8 }]}>
                  📅 Resumo dos lembretes:
                </Text>
                {tempSelection.notifications.map((n, i) => (
                  <Text key={i} style={[typography.caption, { color: colors.success }]}>
                    • {getNotificationText(n)}
                  </Text>
                ))}
              </View>
            )}

            <View style={styles.infoBox}>
              <Text style={[typography.caption, { color: colors.primary, fontWeight: '600', marginBottom: 4 }]}>💡 Dica</Text>
              <Text style={[typography.caption, { color: colors.primary, lineHeight: 20, marginBottom: 8 }]}>
                Você pode configurar múltiplos lembretes para o mesmo compromisso.
              </Text>
              <Text style={[typography.caption, { color: colors.primary, lineHeight: 20 }]}>
                As notificações funcionam apenas no app mobile.
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    container: { marginBottom: 20 },
    selector: { borderWidth: 1, borderColor: colors.border.light, borderRadius: 8, backgroundColor: colors.background.primary },
    selectorContent: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10 },
    bellContainer: { position: 'relative' },
    badge: { position: 'absolute', top: -6, right: -6, backgroundColor: colors.danger, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 },
    badgeText: { fontSize: 10, fontWeight: '600', color: colors.text.white },
    selectedItem: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 8, paddingVertical: 4 },
    modalContainer: { flex: 1, backgroundColor: colors.background.secondary },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: colors.background.primary, borderBottomWidth: 1, borderBottomColor: colors.border.light },
    modalContent: { flex: 1, padding: 20 },
    optionItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: colors.background.primary, borderRadius: 12, borderWidth: 2, borderColor: 'transparent' },
    optionContent: { flexDirection: 'row', alignItems: 'center', flex: 1, gap: 12 },
    optionIcon: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.background.tertiary, alignItems: 'center', justifyContent: 'center' },
    summaryBox: { backgroundColor: colors.background.success, padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: colors.success, marginBottom: 16 },
    infoBox: { backgroundColor: colors.background.tertiary, padding: 16, borderRadius: 12, borderLeftWidth: 4, borderLeftColor: colors.primary },
  });
}