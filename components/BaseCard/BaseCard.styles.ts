import { StyleSheet } from 'react-native';
import { ColorScheme } from '../theme/colors';
import { CardVariant, CardStatus, CardStyleConfig } from '../types/card.types';

const getVariantConfigs = (colors: ColorScheme): Record<CardVariant, CardStyleConfig> => ({
  compromisso: {
    backgroundColor: colors.background.primary,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowConfig: colors.shadow.medium,
    sideBarWidth: 4,
  },
  anotacao: {
    backgroundColor: colors.background.primary,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowConfig: colors.shadow.medium,
    sideBarWidth: 4,
  },
  'compromisso-modal': {
    backgroundColor: colors.background.primary,
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowConfig: colors.shadow.medium,
    sideBarWidth: 4,
  },
});

export const createCardStyles = (
  colors: ColorScheme,
  variant: CardVariant,
  status: CardStatus = 'normal',
  showShadow: boolean = true
) => {
  const config = getVariantConfigs(colors)[variant];
  const statusBackgrounds: Record<CardStatus, string> = {
    normal: colors.background.primary,
    completed: colors.background.secondary,
    expired: colors.background.expired,
  };

  const baseStyle = {
    backgroundColor: status === 'normal' ? config.backgroundColor : statusBackgrounds[status],
    padding: config.padding,
    marginBottom: config.marginBottom,
    borderRadius: config.borderRadius,
    position: 'relative' as const,
    ...(showShadow && {
      shadowColor: colors.shadow.color,
      ...config.shadowConfig,
    }),
  };

  if (status === 'completed') return { ...baseStyle, opacity: 0.7 };
  return baseStyle;
};

export const baseCardStyles = StyleSheet.create({
  sideBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  pressable: { borderRadius: 12 },
  content: { flex: 1 },
});

export const variantStyles = StyleSheet.create({
  compromissoContainer: { minHeight: 80 },
  anotacaoContainer: { minHeight: 60 },
  compromissoModalContainer: { minHeight: 80 },
  modalPressable: { borderRadius: 12 },
  modalPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
});