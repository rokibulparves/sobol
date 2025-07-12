import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
  ActivityIndicator
} from 'react-native';
import { Icon } from '@rneui/themed';
import { supabase } from '../lib/supabase';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

const ExploreScreen = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const navigation = useNavigation();

  // Your server URL - make sure this matches your actual IP
  const SERVER_URL = 'http://192.168.0.105:5050';

  useEffect(() => {
    const fetchSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Session error:', error);
      }
      const currentSession = data.session;
      setSession(currentSession);

      // Check if user is already premium
      if (currentSession?.user) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_paid')
          .eq('id', currentSession.user.id)
          .single();

        if (!profileError && profile?.is_paid) {
          setIsPremium(true);
        }
      }

      setLoading(false);
    };
    fetchSession();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      const checkPaymentStatus = async () => {
        if (!session?.user) return;
  
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('is_paid')
          .eq('id', session.user.id)
          .single();
  
        if (!error && profile?.is_paid) {
          setIsPremium(true);
        }
      };
  
      checkPaymentStatus();
    }, [session])
  );

  // Test server connection
  const testConnection = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/test`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        Alert.alert('Connection Test', `Server is reachable!\n${data.message}`);
      } else {
        Alert.alert('Connection Error', `Server responded with status: ${response.status}`);
      }
    } catch (error) {
      Alert.alert('Connection Failed', `Cannot reach server: ${error.message}`);
    }
  };

  const handleSubscribe = async () => {
    if (!session?.user) {
      Alert.alert('Not Logged In', 'Please log in first.');
      return;
    }
  
    setPaymentLoading(true);
  
    try {
      console.log('Initiating payment for user:', session.user.id);
      
      const requestBody = {
        user_id: session.user.id,
        amount: 100, // BDT
      };
  
      const response = await fetch(`${SERVER_URL}/api/payment/initiate`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      const responseText = await response.text();
  
      if (!response.ok) {
        Alert.alert('Error', `Server error: ${response.status}\n${responseText}`);
        return;
      }
  
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        Alert.alert('Parse Error', `Server returned invalid JSON:\n${responseText}`);
        return;
      }
  
      if (data?.success && data?.url) {
        const canOpen = await Linking.canOpenURL(data.url);
        if (canOpen) {
          navigation.navigate('Payment', { url: data.url });
        } else {
          Alert.alert('Error', 'Cannot open payment URL');
        }
      } else {
        Alert.alert('Payment Error', data?.error || 'Payment link not available.');
      }
  
    } catch (error) {
      Alert.alert('Network Error', `Could not connect to server:\n${error.message}`);
    } finally {
      setPaymentLoading(false);
    }
  };  

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon type="ionicon" name="chevron-back" size={24} />
        </TouchableOpacity>
        <Text style={{ fontSize: 16, fontWeight: '500', marginLeft: 10 }}>EXPLORE</Text>
      </View>

      {/* Profile section */}
      <View style={{ alignItems: 'center', marginVertical: 20 }}>
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: '#f0f0f0',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Icon type="font-awesome" name="user" size={40} color="#a0a0a0" />
        </View>

        {/* Test Connection Button */}
        <TouchableOpacity
          onPress={testConnection}
          style={{
            marginTop: 10,
            backgroundColor: '#007AFF',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: 'white', fontWeight: 'bold' }}>Test Connection</Text>
        </TouchableOpacity>

        {/* Subscribe Button */}
        <TouchableOpacity
          onPress={handleSubscribe}
          disabled={paymentLoading || isPremium}
          style={{
            marginTop: 10,
            backgroundColor: isPremium ? '#10b981' : (paymentLoading ? '#ccc' : '#ff9f1c'),
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          {paymentLoading && !isPremium && (
            <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }} />
          )}
          <Text style={{ color: 'white', fontWeight: 'bold' }}>
            {isPremium
              ? 'Premium User'
              : paymentLoading
              ? 'Processing...'
              : 'Subscribe (৳100)'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stats row */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 20,
        marginBottom: 20
      }}>
        <View style={{ alignItems: 'center' }}>
          <Icon type="ionicon" name="checkmark-circle" size={24} color="#666" />
          <Text style={{ fontSize: 20, fontWeight: '600', marginTop: 5 }}>3</Text>
          <Text style={{ fontSize: 12, textAlign: 'center', color: '#666' }}>Exercises completed</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Icon type="ionicon" name="document-text" size={24} color="#666" />
          <Text style={{ fontSize: 20, fontWeight: '600', marginTop: 5 }}>0</Text>
          <Text style={{ fontSize: 12, textAlign: 'center', color: '#666' }}>Lessons finished</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Icon type="ionicon" name="trophy" size={24} color="#666" />
          <Text style={{ fontSize: 20, fontWeight: '600', marginTop: 5 }}>2</Text>
          <Text style={{ fontSize: 12, textAlign: 'center', color: '#666' }}>Longest streak</Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default ExploreScreen;