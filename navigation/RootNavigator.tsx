// RootNavigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AppNavigator from './AppNavigator';
import PaymentScreen from '../screens/PaymentScreen';
import { Session } from '@supabase/supabase-js';

const Stack = createNativeStackNavigator();

const RootNavigator = ({ session }: { session: Session }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs">
        {() => <AppNavigator session={session} />}
      </Stack.Screen>
      <Stack.Screen name="Payment" component={PaymentScreen} />
    </Stack.Navigator>
  );
};

export default RootNavigator;
