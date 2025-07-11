//VideoList.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VideoView } from 'expo-video';
import { Button, Card } from '@rneui/themed';

interface VideoListProps {
  title: string;
  dayNumber: number;
  description: string;
  player: any;
  onMarkComplete: () => void;
}

const VideoList: React.FC<VideoListProps> = ({
  title,
  dayNumber,
  description,
  player,
  onMarkComplete
}) => {
  return (
    <Card containerStyle={styles.card}>
      <Card.Title style={styles.cardTitle}>Day {dayNumber}: {title}</Card.Title>
      
      <VideoView
        player={player}
        style={styles.video}
        allowsFullscreen
        allowsPictureInPicture
        nativeControls={true}
      />
      
      <Text style={styles.description}>{description}</Text>
      
      <View style={styles.controlsContainer}>
        <Button
          title="Play/Pause"
          onPress={() => {
            if (player.playing) {
              player.pause();
            } else {
              player.play();
            }
          }}
          buttonStyle={styles.controlButton}
        />
        
        <Button
          title="Mark as Completed"
          onPress={onMarkComplete}
          buttonStyle={styles.completeButton}
        />
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  video: {
    width: '100%',
    height: 220,
    borderRadius: 5,
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  controlsContainer: {
    marginBottom: 15,
  },
  controlButton: {
    backgroundColor: '#6b7280',
    borderRadius: 5,
    marginBottom: 10,
  },
  completeButton: {
    backgroundColor: '#0284c7',
    borderRadius: 5,
  },
});

export default VideoList;