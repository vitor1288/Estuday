import React, { createContext, useContext, useEffect, useState } from 'react';
import { View, useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightColors, darkColors, ColorScheme } from '@/components/theme/colors';
import { typography } from '@/components/theme/typography';

export type ThemePreference = 'light' | 'dark' | 'system';
export type ActiveTheme = 'light' | 'dark';

interface ThemeContextType {
  preference: ThemePreference;
  activeTheme: ActiveTheme;
  colors: ColorScheme;
  typography: typeof typography;
  setTheme: (theme: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const STORAGE_KEY = '@estuday:themePreference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useColorScheme();
  const [preference, setPreference] = useState<ThemePreference>('system');

  // 🟢 NOVO: Só libera a tela depois que a preferência salva foi lida.
  // Isso evita o "flash" de tema errado (claro aparecendo antes do escuro salvo, por exemplo).
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((val) => {
        if (val === 'light' || val === 'dark' || val === 'system') setPreference(val);
      })
      .finally(() => setIsReady(true));
  }, []);

  const activeTheme: ActiveTheme =
    preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  const colors: ColorScheme = activeTheme === 'dark' ? darkColors : lightColors;

  const setTheme = async (theme: ThemePreference) => {
    setPreference(theme);
    await AsyncStorage.setItem(STORAGE_KEY, theme);
  };

  // 🟢 NOVO: Enquanto carrega, mostra apenas um fundo vazio (usando o melhor palpite
  // disponível: o tema do sistema) em vez de renderizar a tela com o tema errado.
  if (!isReady) {
    const guessColors = systemScheme === 'dark' ? darkColors : lightColors;
    return <View style={{ flex: 1, backgroundColor: guessColors.background.primary }} />;
  }

  return (
    <ThemeContext.Provider value={{ preference, activeTheme, colors, typography, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}

// 🛡️ O ESCUDO PROTETOR QUE ESTAVA FALTANDO:
export default ThemeProvider;
