//AppNavigator.tsx

import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Session } from '@supabase/supabase-js';
import { Icon } from '@rneui/themed';

// Import screen components
import TodayScreen from '../screens/TodayScreen';
import ExploreScreen from '../screens/ExploreScreen';
import FeedScreen from '../screens/FeedScreen';
import Account from '../components/Account';

// Create bottom tab navigator
const Tab = createBottomTabNavigator();

// Define navigator component that receives session as prop
const AppNavigator = ({ session }: { session: Session }) => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#0284c7',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: {
          height: 60,  // Increased height
          paddingBottom: 10, // More padding at bottom
          paddingTop: 10,    // More padding at top
        },
        tabBarLabelStyle: {
          fontSize: 12,
          marginBottom: 5,  // Push labels up a bit
        },
        headerStyle: {
          height: 60,
        },
      }}
    >
      <Tab.Screen 
        name="Today" 
        component={TodayScreen} 
        options={{
          tabBarIcon: ({ color }) => (
            <Icon type="font-awesome" name="calendar" color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Explore" 
        component={ExploreScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon type="font-awesome" name="search" color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Feed" 
        component={FeedScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <Icon type="font-awesome" name="list" color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        options={{
          tabBarIcon: ({ color }) => (
            <Icon type="font-awesome" name="user" color={color} />
          ),
        }}
      >
        {() => <Account session={session} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
};

export default AppNavigator;