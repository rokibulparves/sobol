import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Button } from '@rneui/themed';
import { AntDesign } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Video meta pulled from Supabase */
  video: { title: string; description: string; videoUrl: string };
  /** Navigation to full‑screen player */
  navigation: NativeStackNavigationProp<RootStackParamList, 'VideoPlayer'>;
  /** Handler that marks the current day complete and loads the next one */
  onMarkComplete: () => void;
}

const VideoDetailModal: React.FC<Props> = ({
  visible,
  onClose,
  video,
  navigation,
  onMarkComplete,
}) => (
  <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
    <View style={styles.container}>
      {/* dismiss */}
      <TouchableOpacity style={styles.close} onPress={onClose}>
        <AntDesign name="close" size={26} color="#555" />
      </TouchableOpacity>

      {/* title & body */}
      <View style={{ flex: 1 }}>
        <Text style={styles.title}>{video.title}</Text>
        <Text style={styles.description}>{video.description}</Text>
      </View>

      {/* actions */}
      <View>
        {/* ✅ mark complete → loads next‑day video */}
        <Button
          title="Mark as Complete"
          onPress={() => {
            onMarkComplete(); // updates progress + fetches next day
            onClose();        // hide the sheet
          }}
          buttonStyle={styles.completeBtn}
        />

        {/* ▶︎ play */}
        <Button
          title="Play Video"
          onPress={() => {
            onClose();
            navigation.navigate('VideoPlayer', {
              url: video.videoUrl,
              title: video.title,
            });
          }}
          buttonStyle={styles.playBtn}
        />
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  close: { alignSelf: 'flex-end' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 10 },
  description: { fontSize: 16, lineHeight: 22 },
  completeBtn: {
    backgroundColor: '#10b981', // teal‑ish
    borderRadius: 6,
    marginBottom: 12,
  },
  playBtn: { backgroundColor: '#0284c7', borderRadius: 6 },
});

export default VideoDetailModal;
