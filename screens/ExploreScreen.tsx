import React from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Icon } from '@rneui/themed';

const ExploreScreen = () => {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
      {/* Header with back button */}
      <View style={{ paddingHorizontal: 20, paddingTop: 20, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity>
          <Icon type="ionicon" name="chevron-back" size={24} />
        </TouchableOpacity>
        <Text style={{ fontSize: 16, fontWeight: '500', marginLeft: 10 }}>EXPLORE</Text>
      </View>

      {/* Connect email section */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        margin: 20,
        marginTop: 15
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '500', fontSize: 15, color: '#333' }}>
            Connect your email to sync your progress and settings
          </Text>
          <TouchableOpacity 
            style={{ 
              backgroundColor: '#FF9500', 
              paddingVertical: 8, 
              paddingHorizontal: 16, 
              borderRadius: 20, 
              alignSelf: 'flex-start',
              marginTop: 10
            }}
          >
            <Text style={{ color: 'white', fontWeight: '600' }}>CONNECT</Text>
          </TouchableOpacity>
        </View>
        <View style={{ marginLeft: 10 }}>
          <Icon type="material" name="email" size={24} color="black" />
        </View>
      </View>

      {/* Profile section */}
      <View style={{ alignItems: 'center', marginVertical: 20 }}>
        <View style={{ 
          width: 80, 
          height: 80, 
          borderRadius: 40, 
          backgroundColor: '#f0f0f0',
          overflow: 'hidden',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
          {/* Instead of requiring an image directly, you'll need to handle this differently */}
          <View style={{
            width: '100%',
            height: '100%',
            backgroundColor: '#e0e0e0',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            <Icon type="font-awesome" name="user" size={40} color="#a0a0a0" />
          </View>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <Text style={{ fontWeight: '600', fontSize: 12 }}>PREMIUM SUBSCRIBER</Text>
          <Icon type="ionicon" name="star" size={16} color="gold" style={{ marginLeft: 5 }} />
        </View>
      </View>

      {/* Stats row */}
      <View style={{ 
        flexDirection: 'row', 
        justifyContent: 'space-around', 
        paddingHorizontal: 20,
        marginBottom: 20
      }}>
        {/* Exercises */}
        <View style={{ alignItems: 'center' }}>
          <Icon type="ionicon" name="checkmark-circle" size={24} color="#666" />
          <Text style={{ fontSize: 20, fontWeight: '600', marginTop: 5 }}>3</Text>
          <Text style={{ fontSize: 12, textAlign: 'center', color: '#666', maxWidth: 80 }}>Exercises completed</Text>
        </View>

        {/* Lessons */}
        <View style={{ alignItems: 'center' }}>
          <Icon type="ionicon" name="document-text" size={24} color="#666" />
          <Text style={{ fontSize: 20, fontWeight: '600', marginTop: 5 }}>0</Text>
          <Text style={{ fontSize: 12, textAlign: 'center', color: '#666', maxWidth: 80 }}>Lessons finished</Text>
        </View>

        {/* Streak */}
        <View style={{ alignItems: 'center' }}>
          <Icon type="ionicon" name="trophy" size={24} color="#666" />
          <Text style={{ fontSize: 20, fontWeight: '600', marginTop: 5 }}>2</Text>
          <Text style={{ fontSize: 12, textAlign: 'center', color: '#666', maxWidth: 80 }}>Longest streak (days)</Text>
        </View>
      </View>

      {/* Your dynamics section */}
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 15 }}>Your dynamics</Text>
        
        {/* Progress charts row */}
        <TouchableOpacity style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 15
        }}>
          <Text style={{ fontSize: 16 }}>Progress charts</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            {/* Mini chart visualization */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginRight: 10 }}>
              <View style={{ width: 5, height: 10, backgroundColor: '#4CAF50', marginRight: 2 }} />
              <View style={{ width: 5, height: 15, backgroundColor: '#4CAF50', marginRight: 2 }} />
              <View style={{ width: 5, height: 8, backgroundColor: '#4CAF50', marginRight: 2 }} />
              <View style={{ width: 5, height: 12, backgroundColor: '#4CAF50' }} />
            </View>
            <Icon type="ionicon" name="chevron-forward" size={20} color="#666" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Program settings section */}
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: '600', marginBottom: 15 }}>Program settings</Text>
        
        {/* Personalization */}
        <TouchableOpacity style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 20
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon type="ionicon" name="options" size={20} color="#666" style={{ marginRight: 15 }} />
            <Text style={{ fontSize: 16 }}>Personalization</Text>
          </View>
          <Icon type="ionicon" name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
        
        {/* Meal Plan */}
        <TouchableOpacity style={{ 
          flexDirection: 'row', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: 20
        }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Icon type="ionicon" name="restaurant" size={20} color="#666" style={{ marginRight: 15 }} />
            <Text style={{ fontSize: 16 }}>Meal Plan</Text>
          </View>
          <Icon type="ionicon" name="chevron-forward" size={20} color="#666" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

// StyleSheet version (alternative approach)
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'white',
//   },
//   header: {
//     paddingHorizontal: 20,
//     paddingTop: 20,
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   // ...add more styles as needed
// });

export default ExploreScreen;