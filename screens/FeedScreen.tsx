import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@rneui/themed';

const FeedScreen = () => {
  return (
    <View style={styles.container}>
      <Text h4>This is Feed</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default FeedScreen;