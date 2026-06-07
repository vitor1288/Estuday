import React, { useState, useRef, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { lightColors } from '@/components/theme/colors';

interface TimePickerProps {
  initialHour?: number;
  initialMinute?: number;
  onTimeChange: (hour: number, minute: number) => void;
  style?: any;
}

const ITEM_HEIGHT = 50;

const TimePicker: React.FC<TimePickerProps> = ({
  initialHour = 23,
  initialMinute = 59,
  onTimeChange,
  style,
}) => {
  const { colors, typography } = useTheme();
  const styles = makeStyles(colors);

  const [selectedHour, setSelectedHour] = useState(initialHour);
  const [selectedMinute, setSelectedMinute] = useState(initialMinute);
  const hourScrollRef = useRef<ScrollView>(null);
  const minuteScrollRef = useRef<ScrollView>(null);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const scrollToSelectedItem = (scrollRef: React.RefObject<ScrollView>, selectedIndex: number) => {
    scrollRef.current?.scrollTo({ y: selectedIndex * ITEM_HEIGHT, animated: true });
  };

  useEffect(() => {
    setTimeout(() => {
      scrollToSelectedItem(hourScrollRef, selectedHour);
      scrollToSelectedItem(minuteScrollRef, selectedMinute);
    }, 100);
  }, []);

  const handleHourScroll = (event: any) => {
    const index = Math.max(0, Math.min(Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT), hours.length - 1));
    if (index !== selectedHour) { setSelectedHour(index); onTimeChange(index, selectedMinute); }
  };

  const handleMinuteScroll = (event: any) => {
    const index = Math.max(0, Math.min(Math.round(event.nativeEvent.contentOffset.y / ITEM_HEIGHT), minutes.length - 1));
    if (index !== selectedMinute) { setSelectedMinute(index); onTimeChange(selectedHour, index); }
  };

  const renderPickerItem = (value: number, isSelected: boolean, onPress: () => void) => (
    <TouchableOpacity
      key={value}
      style={[styles.pickerItem, isSelected && styles.selectedPickerItem]}
      onPress={onPress}
    >
      <Text style={[typography.body, { color: isSelected ? colors.primary : colors.text.secondary, fontWeight: isSelected ? '600' : '400' }]}>
        {value.toString().padStart(2, '0')}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, style]}>
      <Text style={[typography.cardTitle, { color: colors.text.primary, textAlign: 'center', marginBottom: 20 }]}>
        Selecione o horário
      </Text>

      <View style={styles.pickerContainer}>
        {/* Horas */}
        <View style={styles.column}>
          <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 10 }]}>Horas</Text>
          <View style={styles.pickerWrapper}>
            <ScrollView
              ref={hourScrollRef}
              style={styles.picker}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              onMomentumScrollEnd={handleHourScroll}
              onScrollEndDrag={handleHourScroll}
            >
              {hours.map((hour) => renderPickerItem(hour, hour === selectedHour, () => {
                setSelectedHour(hour);
                onTimeChange(hour, selectedMinute);
                scrollToSelectedItem(hourScrollRef, hour);
              }))}
            </ScrollView>
            <View style={styles.selectionIndicator} />
          </View>
        </View>

        <Text style={[typography.sectionTitle, { color: colors.text.primary, marginHorizontal: 20, marginTop: 30 }]}>:</Text>

        {/* Minutos */}
        <View style={styles.column}>
          <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 10 }]}>Minutos</Text>
          <View style={styles.pickerWrapper}>
            <ScrollView
              ref={minuteScrollRef}
              style={styles.picker}
              showsVerticalScrollIndicator={false}
              snapToInterval={ITEM_HEIGHT}
              decelerationRate="fast"
              onMomentumScrollEnd={handleMinuteScroll}
              onScrollEndDrag={handleMinuteScroll}
            >
              {minutes.map((minute) => renderPickerItem(minute, minute === selectedMinute, () => {
                setSelectedMinute(minute);
                onTimeChange(selectedHour, minute);
                scrollToSelectedItem(minuteScrollRef, minute);
              }))}
            </ScrollView>
            <View style={styles.selectionIndicator} />
          </View>
        </View>
      </View>

      {/* Display */}
      <View style={styles.selectedTimeContainer}>
        <Text style={[typography.caption, { color: colors.text.secondary, marginBottom: 5 }]}>
          Horário selecionado:
        </Text>
        <Text style={[typography.screenTitle, { color: colors.primary }]}>
          {selectedHour.toString().padStart(2, '0')}:{selectedMinute.toString().padStart(2, '0')}
        </Text>
      </View>
    </View>
  );
};

function makeStyles(colors: typeof lightColors) {
  return StyleSheet.create({
    container: { backgroundColor: colors.background.primary, borderRadius: 12, padding: 20, margin: 10, shadowColor: colors.shadow.color, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
    pickerContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
    column: { alignItems: 'center' },
    pickerWrapper: { position: 'relative', height: 150, width: 80, overflow: 'hidden', borderRadius: 8, backgroundColor: colors.background.tertiary },
    picker: { flex: 1 },
    pickerItem: { height: ITEM_HEIGHT, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 15 },
    selectedPickerItem: { backgroundColor: colors.background.tertiary },
    selectionIndicator: { position: 'absolute', top: ITEM_HEIGHT, left: 0, right: 0, height: ITEM_HEIGHT, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.primary, backgroundColor: colors.primary + '0D', pointerEvents: 'none' },
    selectedTimeContainer: { alignItems: 'center', padding: 15, backgroundColor: colors.background.tertiary, borderRadius: 8 },
  });
}

export default TimePicker;