// RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from './AppNavigator';
import PaymentScreen from '../screens/PaymentScreen';
import VideoPlayerScreen from '../screens/VideoPlayerScreen';
import ExploreScreen from '../screens/ExploreScreen';
import { Session } from '@supabase/supabase-js';

const Stack = createNativeStackNavigator();

export type RootStackParamList = {
    MainTabs: undefined;
    Payment: undefined;
    VideoPlayer: { url: string; title: string };
  };

const RootNavigator = ({ session }: { session: Session }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs">
        {() => <AppNavigator session={session} />}
      </Stack.Screen>
      <Stack.Screen name="Payment" component={PaymentScreen} />
      <Stack.Screen
        name="VideoPlayer"
        component={VideoPlayerScreen}
        options={{ headerShown: false, presentation: 'fullScreenModal' }}
        />
    </Stack.Navigator>
  );
};

export default RootNavigator;
