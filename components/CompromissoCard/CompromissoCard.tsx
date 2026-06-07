import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Clock, Edit3, Trash2, CheckCircle, Circle, Bell, BellOff } from 'lucide-react-native';
import { Compromisso, getNotificationText } from '@/contexts/StudayContext';
import { formatDateBR, isExpired } from '@/utils/dateUtils';
import { BaseCard } from '@/components/BaseCard/BaseCard';
import { useTheme } from '@/contexts/ThemeContext';
import { lightColors } from '@/components/theme/colors';
import { MultipleNotificationConfig } from '@/components/NotificationSelector/NotificationSelector';

interface CompromissoCardProps {
  compromisso: Compromisso;
  onEdit: () => void;
  onDelete: () => void;
  onToggleComplete: () => void;
  variant?: 'compromisso' | 'compromisso-modal';
  onPress?: () => void;
}

const getCategoriaLabel = (categoria: string) => {
  const labels: Record<string, string> = { aula: 'Aula', prova: 'Prova', trabalho: 'Trabalho', outro: 'Outro' };
  return labels[categoria] ?? 'Outro';
};

const getMultipleNotificationText = (config?: MultipleNotificationConfig): string => {
  if (!config?.notifications?.length) return 'Sem notificação';
  const enabled = config.notifications.filter(n => n.enabled);
  if (!enabled.length) return 'Sem notificação';
  if (enabled.length === 1) return getNotificationText(enabled[0]);
  return `${enabled.length} lembretes`;
};

export function CompromissoCard({
  compromisso, onEdit, onDelete, onToggleComplete, variant = 'compromisso', onPress
}: CompromissoCardProps) {
  const { colors, typography } = useTheme();
  const styles = makeStyles(colors);

  const getCategoriaColor = (categoria: string) => {
    const map: Record<string, string> = {
      aula: colors.category.aula,
      prova: colors.category.prova,
      trabalho: colors.category.trabalho,
      outro: colors.category.outro,
    };
    return map[categoria] ?? colors.text.secondary;
  };

  const categoriaColor = getCategoriaColor(compromisso.categoria);
  const isCompromissoExpired = isExpired(compromisso.data, compromisso.hora) && !compromisso.concluido;

  const getCardStatus = () => {
    if (compromisso.concluido) return 'completed';
    if (isCompromissoExpired) return 'expired';
    return 'normal';
  };

  const getNotificationConfig = (): MultipleNotificationConfig => {
    if (compromisso.multipleNotificationConfig) return compromisso.multipleNotificationConfig;
    if (compromisso.notificationConfig) {
      return { notifications: compromisso.notificationConfig.enabled ? [compromisso.notificationConfig] : [] };
    }
    return { notifications: [] };
  };

  const notificationConfig = getNotificationConfig();
  const hasNotifications = notificationConfig.notifications.length > 0;

  return (
    <BaseCard variant={variant} sideBarColor={categoriaColor} status={getCardStatus()} onPress={onPress}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onToggleComplete} style={styles.checkButton}>
          {compromisso.concluido
            ? <CheckCircle size={20} color={colors.success} />
            : <Circle size={20} color={colors.text.secondary} />}
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={[
            typography.cardTitle,
            { color: colors.text.primary },
            compromisso.concluido && { textDecorationLine: 'line-through', color: colors.text.secondary },
          ]}>
            {compromisso.titulo}
          </Text>
          <View style={styles.categoria}>
            <View style={[styles.categoriaIndicator, { backgroundColor: categoriaColor }]} />
            <Text style={[typography.small, { color: colors.text.secondary }]}>
              {getCategoriaLabel(compromisso.categoria)}
            </Text>
          </View>
        </View>

        {(variant !== 'compromisso-modal' || !onPress) && (
          <View style={styles.actions}>
            <TouchableOpacity onPress={onEdit} style={styles.actionButton}>
              <Edit3 size={16} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={onDelete} style={styles.actionButton}>
              <Trash2 size={16} color={colors.danger} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Info */}
      <View style={{ marginBottom: 8 }}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Clock size={14} color={colors.text.secondary} />
            <Text style={[typography.caption, { color: colors.text.secondary }]}>
              {formatDateBR(compromisso.data)} às {compromisso.hora}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <View style={styles.bellContainer}>
              {hasNotifications ? (
                <>
                  <Bell size={12} color={colors.primary} />
                  {notificationConfig.notifications.length > 1 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{notificationConfig.notifications.length}</Text>
                    </View>
                  )}
                </>
              ) : (
                <BellOff size={12} color={colors.text.tertiary} />
              )}
            </View>
            <Text style={[typography.small, { color: hasNotifications ? colors.text.secondary : colors.text.tertiary }]}>
              {getMultipleNotificationText(notificationConfig)}
            </Text>
          </View>
        </View>
      </View>

      {compromisso.descricao && (
        <Text style={[
          typography.caption,
          { color: colors.text.secondary, lineHeight: 18 },
          compromisso.concluido && { textDecorationLine: 'line-through' },
        ]}>
          {compromisso.descricao}
        </Text>
      )}

      {isCompromissoExpired && (
        <Text style={[typography.caption, { color: colors.danger, fontWeight: '600', marginTop: 8 }]}>
          Pendente
        </Text>
      )}
    </BaseCard>
  );
}

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    header: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
    checkButton: { marginRight: 12, marginTop: 2 },
    titleContainer: { flex: 1 },
    categoria: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    categoriaIndicator: { width: 8, height: 8, borderRadius: 4 },
    actions: { flexDirection: 'row', gap: 8 },
    actionButton: { padding: 4 },
    infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
    infoItem: { flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 },
    bellContainer: { position: 'relative', flexDirection: 'row', alignItems: 'center' },
    badge: { position: 'absolute', top: -6, right: -6, backgroundColor: colors.danger, borderRadius: 6, minWidth: 12, height: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 2 },
    badgeText: { fontSize: 8, fontWeight: '600', color: colors.text.white },
  });
}