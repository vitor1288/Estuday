import React, { useState } from 'react';
import { View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from '@/components/Calendar/Calendar';
import { DayModal } from '@/components/DayModal/DayModal';
import { useTheme } from '@/contexts/ThemeContext';

export default function CalendarScreen() {
  const { colors } = useTheme();

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handleDayPress = (date: string) => { setSelectedDate(date); setModalVisible(true); };
  const handleCloseModal = () => { setModalVisible(false); setSelectedDate(null); };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background.secondary }}>
      <View style={{ flex: 1 }}>
        <Calendar onDayPress={handleDayPress} />
      </View>
      {selectedDate && (
        <DayModal visible={modalVisible} date={selectedDate} onClose={handleCloseModal} />
      )}
    </SafeAreaView>
  );
}