import React from 'react';
import { View, TouchableOpacity, Pressable } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { BaseCardProps } from '../types/card.types';
import { createCardStyles, baseCardStyles, variantStyles } from './BaseCard.styles';

export function BaseCard({
  variant,
  children,
  sideBarColor,
  status = 'normal',
  onPress,
  showShadow = true,
  style,
}: BaseCardProps) {
  const { colors } = useTheme();
  const cardStyle = createCardStyles(colors, variant, status, showShadow);

  const getSideBarColor = () => {
    if (sideBarColor) return sideBarColor;
    switch (variant) {
      case 'anotacao': return colors.note.primary;
      default: return colors.primary;
    }
  };

  const getVariantContainerStyle = () => {
    switch (variant) {
      case 'compromisso': return variantStyles.compromissoContainer;
      case 'anotacao': return variantStyles.anotacaoContainer;
      case 'compromisso-modal': return variantStyles.compromissoModalContainer;
      default: return {};
    }
  };

  const renderCard = () => (
    <View style={[cardStyle, getVariantContainerStyle(), style]}>
      <View style={[baseCardStyles.sideBar, { backgroundColor: getSideBarColor(), width: 4 }]} />
      <View style={baseCardStyles.content}>{children}</View>
    </View>
  );

  if (onPress) {
    if (variant === 'compromisso-modal') {
      return (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [variantStyles.modalPressable, pressed && variantStyles.modalPressed]}
        >
          {renderCard()}
        </Pressable>
      );
    }
    return (
      <TouchableOpacity onPress={onPress} style={baseCardStyles.pressable} activeOpacity={0.7}>
        {renderCard()}
      </TouchableOpacity>
    );
  }

  return renderCard();
}