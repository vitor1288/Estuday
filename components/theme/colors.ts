import { TextStyle } from 'react-native';

const lightColors = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F97316',
  danger: '#EF4444',
  text: {
    primary: '#1E293B',
    secondary: '#64748B',
    tertiary: '#94A3B8',
    white: '#FFFFFF',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    tertiary: '#F1F5F9',
    success: '#F0FDF4',
    warning: '#FFF7ED',
    danger: '#FFF1F1',
    expired: '#FFF1F1',
  },
  border: {
    light: '#E2E8F0',
    medium: '#CBD5E1',
    dark: '#94A3B8',
  },
  category: {
    aula: '#3B82F6',
    prova: '#EF4444',
    trabalho: '#F97316',
    outro: '#8B5CF6',
  },
  note: {
    primary: '#10B981',
    background: '#F8FAFC',
    border: '#E2E8F0',
  },
  shadow: {
    color: '#000',
    light: {
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    } as Partial<TextStyle>,
    medium: {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    } as Partial<TextStyle>,
  },
};

const darkColors = {
  primary: '#60A5FA',
  success: '#34D399',
  warning: '#FB923C',
  danger: '#f87171',
  text: {
    primary: '#F1F5F9',
    secondary: '#94A3B8',
    tertiary: '#64748B',
    white: '#FFFFFF',
  },
  background: {
    primary: '#1E293B',
    secondary: '#0F172A',
    tertiary: '#1E293B',
    success: '#052e16',
    warning: '#1c1008',
    danger: '#1f0a0a',
    expired: '#531818',
  },
  border: {
    light: '#334155',
    medium: '#475569',
    dark: '#64748B',
  },
  category: {
    aula: '#60A5FA',
    prova: '#F87171',
    trabalho: '#FB923C',
    outro: '#A78BFA',
  },
  note: {
    primary: '#34D399',
    background: '#0F172A',
    border: '#334155',
  },
  shadow: {
    color: '#000',
    light: {
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.3,
      shadowRadius: 2,
      elevation: 1,
    } as Partial<TextStyle>,
    medium: {
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.4,
      shadowRadius: 4,
      elevation: 3,
    } as Partial<TextStyle>,
  },
};

export type ColorScheme = typeof lightColors;

export { lightColors, darkColors };

// Exporta 'colors' apontando para o tema claro por padrão (compatibilidade com imports existentes)
export const colors = lightColors;
