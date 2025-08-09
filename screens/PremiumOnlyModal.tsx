// components/PremiumOnlyModal.tsx (or inline inside TodayScreen.tsx)
import React from 'react';
import { Modal, View, Text, StyleSheet } from 'react-native';
import { Button } from '@rneui/themed';

interface Props {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const PremiumOnlyModal: React.FC<Props> = ({ visible, onClose, onUpgrade }) => (
  <Modal visible={visible} animationType="fade" transparent>
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <Text style={styles.title}>Premium Content</Text>
        <Text style={styles.message}>
          This video is available for premium users only.
        </Text>

        <Button
          title="Buy Premium"
          onPress={onUpgrade}
          buttonStyle={styles.premiumBtn}
        />
        <Button
          title="Close"
          onPress={onClose}
          buttonStyle={styles.closeBtn}
          type="outline"
        />
      </View>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 30,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 10,
    color: '#1e293b',
  },
  message: {
    fontSize: 16,
    color: '#334155',
    textAlign: 'center',
    marginBottom: 20,
  },
  premiumBtn: {
    backgroundColor: '#f59e0b',
    width: 180,
    borderRadius: 6,
    marginBottom: 10,
  },
  closeBtn: {
    borderColor: '#ccc',
    width: 180,
    borderRadius: 6,
  },
});

export default PremiumOnlyModal;
