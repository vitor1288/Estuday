import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success';
type ButtonSize = 'sm' | 'md' | 'lg';

interface BaseButtonProps {
  children: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  onPress: () => void;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
}

export function BaseButton({
  children,
  variant = 'primary',
  size = 'md',
  onPress,
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
}: BaseButtonProps) {
  const { colors, typography } = useTheme();

  const backgroundColors: Record<ButtonVariant, string> = {
    primary: colors.primary,
    secondary: colors.background.tertiary,
    danger: colors.danger,
    success: colors.success,
  };

  const textColors: Record<ButtonVariant, string> = {
    primary: colors.text.white,
    secondary: colors.text.secondary,
    danger: colors.text.white,
    success: colors.text.white,
  };

  const paddings: Record<ButtonSize, { paddingHorizontal: number; paddingVertical: number }> = {
    sm: { paddingHorizontal: 12, paddingVertical: 6 },
    md: { paddingHorizontal: 20, paddingVertical: 12 },
    lg: { paddingHorizontal: 28, paddingVertical: 16 },
  };

  const fontSizes: Record<ButtonSize, number> = {
    sm: 12,
    md: 16,
    lg: 18,
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.base,
        {
          backgroundColor: backgroundColors[variant],
          opacity: disabled ? 0.5 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
          ...paddings[size],
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColors[variant]} />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>{icon}</View>
          )}
          <Text style={[typography.button, { color: textColors[variant], fontSize: fontSizes[size] }]}>
            {children}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>{icon}</View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconLeft: {
    marginRight: 8,
  },
  iconRight: {
    marginLeft: 8,
  },
});