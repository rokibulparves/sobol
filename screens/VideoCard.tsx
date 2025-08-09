// components/VideoCard.tsx
import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { Card } from '@rneui/themed';

interface Props {
  dayNumber: number;
  title: string;
  onPress: () => void;
}

const VideoCard: React.FC<Props> = ({ dayNumber, title, onPress }) => (
  <Card containerStyle={styles.card}>
    <TouchableOpacity onPress={onPress} style={styles.touchable}>
      <Text style={styles.title}>Day {dayNumber}: {title}</Text>
    </TouchableOpacity>
  </Card>
);

const styles = StyleSheet.create({
  card: { borderRadius: 10, marginBottom: 15 },
  touchable: { paddingVertical: 20 },
  title: { fontSize: 18, fontWeight: '600', textAlign: 'center' },
});

export default VideoCard;
