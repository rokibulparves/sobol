// screens/VideoPlayerScreen.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/RootNavigator'; // adjust path

type Props = { route: RouteProp<RootStackParamList, 'VideoPlayer'> };

export default function VideoPlayerScreen({ route }: Props) {
  const { url, title } = route.params;
  const player = useVideoPlayer(url, p => { p.volume = 1; });

  return (
    <View style={styles.wrapper}>
      <VideoView
        player={player}
        style={styles.video}
        allowsFullscreen
        allowsPictureInPicture
        nativeControls
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: 'black' },
  video: { flex: 1 },
});
