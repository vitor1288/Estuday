import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CheckCircle, Circle, Calendar as CalendarIcon, Clock, Bell, BellOff, Trash2 } from 'lucide-react-native';
import { Compromisso, useEstuday } from '@/contexts/StudayContext';
import { isExpired } from '@/utils/dateUtils';
import { BaseCard } from '@/components/BaseCard/BaseCard';
import { useTheme } from '@/contexts/ThemeContext';
import { lightColors } from '@/components/theme/colors';

interface CompromissoCardProps {
  compromisso: Compromisso;
  onEdit: () => void;
  onDelete?: () => void; 
  onToggleComplete: () => void;
  variant?: 'compromisso' | 'compromisso-modal';
  onPress?: () => void;
}

export function CompromissoCard({ 
  compromisso, 
  onEdit, 
  onDelete,
  onToggleComplete,
  variant = 'compromisso'
}: CompromissoCardProps) {
  const { colors, typography } = useTheme();
  const { categorias, categories, materias } = useEstuday(); 
  const styles = makeStyles(colors);

  // Busca a categoria correta pelo ID
  const listaCategorias = categorias || (categories as any) || [];
  const categoriaObj = listaCategorias.find((c: any) => c.id === compromisso.categoriaId || c.id === compromisso.categoria);
  const corCard = categoriaObj ? categoriaObj.cor : colors.primary;
  const nomeCategoria = categoriaObj ? categoriaObj.nome : 'Outro';

  // Busca a matéria pelo ID
  const getMateriaNome = (id: string) => materias?.find((m: any) => m.id === id)?.nome || '';

  // 🔔 Função para calcular o texto de notificações do compromisso
  const activeNotificationsCount = (compromisso.notificacaoConfig?.notifications || []).filter(n => n.enabled).length;
  const hasActiveNotifications = activeNotificationsCount > 0;

  const getNotificationLabel = () => {
    if (!hasActiveNotifications) {
      return 'Sem notificação';
    }
    if (activeNotificationsCount === 1) {
      return `1 lembrete`;
    }
    return `${activeNotificationsCount} lembretes`;
  };

  const formatarData = (dataStr: string) => {
    if (!dataStr) return '';
    const partes = dataStr.split('-');
    if (partes.length !== 3) return dataStr;
    const [y, m, d] = partes;
    return `${d}/${m}/${y}`;
  };

  const atrasado = !compromisso.concluido && isExpired(compromisso.data, compromisso.hora);

  let statusCard: 'normal' | 'completed' | 'expired' = 'normal';
  if (compromisso.concluido) statusCard = 'completed';
  else if (atrasado) statusCard = 'expired';

  return (
    <BaseCard
      variant={variant}
      status={statusCard}
      sideBarColor={corCard}
      onPress={undefined} 
      showShadow={true}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        
        {/* Bolinha interativa isolada para concluir */}
        <TouchableOpacity 
          onPress={onToggleComplete}
          style={{ marginRight: 12, paddingVertical: 8, paddingHorizontal: 4 }}
          activeOpacity={0.7}
        >
          {compromisso.concluido ? (
            <CheckCircle size={22} color={colors.success} />
          ) : (
            <Circle size={22} color={atrasado ? colors.danger : colors.text.tertiary} />
          )}
        </TouchableOpacity>

        {/* Corpo do card que abre a edição */}
        <TouchableOpacity 
          style={{ flex: 1 }}
          activeOpacity={0.8}
          onPress={onEdit}
        >
          <View style={styles.cardHeader}>
            <View style={styles.titleColumn}>
              <Text style={[typography.cardTitle, styles.cardTitle, compromisso.concluido && styles.textConcluido]}>
                {compromisso.titulo}
              </Text>
              {compromisso.materiaId ? (
                <Text style={[typography.small, styles.materiaText]}>
                  📚 {getMateriaNome(compromisso.materiaId)}
                </Text>
              ) : null}
            </View>
            <View style={[styles.badge, { backgroundColor: corCard + '15' }]}>
              <Text style={[styles.badgeText, { color: corCard }]}>
                {nomeCategoria}
              </Text>
            </View>
          </View>

          {compromisso.descricao ? (
            <Text style={[typography.body, styles.descricaoText]} numberOfLines={2}>
              {compromisso.descricao}
            </Text>
          ) : null}

          <View style={styles.cardFooter}>
            {/* Data */}
            <View style={styles.infoRow}>
              <CalendarIcon size={14} color={colors.text.secondary} />
              <Text style={[typography.caption, styles.infoText]}>
                {formatarData(compromisso.data)}
              </Text>
            </View>

            {/* Hora */}
            {compromisso.hora ? (
              <View style={styles.infoRow}>
                <Clock size={14} color={colors.text.secondary} />
                <Text style={[typography.caption, styles.infoText]}>
                  {compromisso.hora}
                </Text>
              </View>
            ) : null}

            {/* 🔔 Bloco de Notificações Adicionado */}
            <View style={styles.infoRow}>
              {/* Ícone condicional com risco e cor terciária se inativo, ou sino azul se ativo */}
              {hasActiveNotifications ? (
                <Bell size={13} color={colors.primary} />
              ) : (
                <BellOff size={13} color={colors.text.tertiary} />
              )}
              {/* Texto condicional azul se ativo, ou terciário se inativo */}
              <Text style={[typography.caption, styles.infoText, { color: hasActiveNotifications ? colors.primary : colors.text.tertiary }]}>
                {getNotificationLabel()}
              </Text>
            </View>

            {/* Alerta de Atrasado */}
            {atrasado && (
              <View style={styles.atrasadoBadge}>
                <Text style={styles.atrasadoBadgeText}>ATRASADO</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>

        {/* Lixeira: exclui o compromisso, fora da área que abre a edição (igual à tela de Compromissos) */}
        {onDelete ? (
          <TouchableOpacity
            onPress={onDelete}
            style={{ marginLeft: 8, padding: 8, alignSelf: 'flex-start' }}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Trash2 size={18} color={colors.danger} />
          </TouchableOpacity>
        ) : null}

      </View>
    </BaseCard>
  );
}

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
    titleColumn: { flex: 1, marginRight: 10 },
    cardTitle: { color: colors.text.primary },
    textConcluido: { textDecorationLine: 'line-through', opacity: 0.5, color: colors.text.secondary },
    materiaText: { color: colors.primary, marginTop: 4, fontWeight: '500' },
    descricaoText: { color: colors.text.secondary, fontSize: 14, marginBottom: 12, lineHeight: 18 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
    badgeText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
    cardFooter: { flexDirection: 'row', alignItems: 'center', gap: 14, flexWrap: 'wrap' },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
    infoText: { color: colors.text.secondary },
    atrasadoBadge: { backgroundColor: colors.danger, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    atrasadoBadgeText: { color: '#FFF', fontSize: 9, fontWeight: '800' }
  });
} 