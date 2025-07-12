import React, { useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { View, Text, BackHandler } from 'react-native';

const PaymentScreen = ({ route, navigation }) => {
    const { url, onReturn } = route.params;
  
    useEffect(() => {
      const handleBack = () => {
        if (onReturn) onReturn(); // 🧠 Call refetch when returning
        return false;
      };
  
      const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBack);
      return () => backHandler.remove();
    }, []);
  
    return <WebView source={{ uri: url }} />;
  };
  

export default PaymentScreen;
