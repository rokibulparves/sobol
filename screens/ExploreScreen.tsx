import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@rneui/themed';

const ExploreScreen = () => {
  return (
    <View style={styles.container}>
      <Text h4>This is Explore</Text>
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

export default ExploreScreen;