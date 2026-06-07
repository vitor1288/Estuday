import { Tabs } from 'expo-router';
import { Chrome as Home, Calendar, Clock, FileText, User } from 'lucide-react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { lightColors, darkColors } from '@/components/theme/colors';

export default function TabLayout() {
  const { activeTheme } = useTheme();
  const colors = activeTheme === 'dark' ? darkColors : lightColors;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopWidth: 1,
          borderTopColor: colors.border.light,
          paddingBottom: 8,
          paddingTop: 8,
          height: 68,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Início', tabBarIcon: ({ size, color }) => <Home size={size} color={color} /> }} />
      <Tabs.Screen name="calendar" options={{ title: 'Calendário', tabBarIcon: ({ size, color }) => <Calendar size={size} color={color} /> }} />
      <Tabs.Screen name="compromissos" options={{ title: 'Compromissos', tabBarIcon: ({ size, color }) => <Clock size={size} color={color} /> }} />
      <Tabs.Screen name="anotacoes" options={{ title: 'Anotações', tabBarIcon: ({ size, color }) => <FileText size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: 'Perfil', tabBarIcon: ({ size, color }) => <User size={size} color={color} /> }} />
    </Tabs>
  );
}