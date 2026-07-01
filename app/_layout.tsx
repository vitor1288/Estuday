import '../utils/alertPolyfill';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { EstudayProvider } from '@/contexts/StudayContext'; // ✅ Corrigido para EstudayProvider (com E)
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

function AppContent() {
  const { activeTheme, colors } = useTheme();

  // 🟢 NOVO: Controla a barra de navegação do Android (some e reaparece ao arrastar de baixo pra cima)
  useEffect(() => {
    if (Platform.OS !== 'android') return;

    NavigationBar.setBackgroundColorAsync(colors.background.primary).catch(() => {});
    NavigationBar.setButtonStyleAsync(activeTheme === 'dark' ? 'light' : 'dark').catch(() => {});

    // "overlay-swipe": a barra fica oculta e some sozinha; arrastar da borda inferior a mostra temporariamente
    NavigationBar.setBehaviorAsync('overlay-swipe').catch(() => {});
    NavigationBar.setVisibilityAsync('hidden').catch(() => {});
  }, [activeTheme, colors]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={activeTheme === 'dark' ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();
  return (
    <ThemeProvider>
      <EstudayProvider> {/* ✅ Corrigido aqui também */}
        <AppContent />
      </EstudayProvider>
    </ThemeProvider>
  );
}
