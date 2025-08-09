//TodayScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Modal } from 'react-native';
import { useVideoPlayer } from 'expo-video';
import { supabase } from '../lib/supabase';
import { Button } from '@rneui/themed';
import VideoList from './VideoList';
import VideoCard from './VideoCard';
import VideoDetailModal from './VideoDetailModal';
import PremiumOnlyModal from './PremiumOnlyModal';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/RootNavigator'; 
import { AntDesign } from '@expo/vector-icons'; // Make sure to install @expo/vector-icons
import { useFocusEffect } from '@react-navigation/native';

interface VideoData {
  id: number;
  day_number: number;
  title: string;
  description: string;
  filename: string;
  videoUrl?: string;
}

interface UserProgress {
  current_day: number;
  last_completed_day: number;
}

const TodayScreen = () => {
  const [loading, setLoading] = useState(true);
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewingDay, setViewingDay] = useState<number | null>(null); // Track which day the user is viewing
  const [detailVisible, setDetailVisible] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [needsPremium, setNeedsPremium] = useState(false); // New state to track premium requirement
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Always call useVideoPlayer, but with a null/empty URL if no video data yet
  const player = useVideoPlayer(videoData?.videoUrl || '', player => {
    // Optional initial setup for player
    if (videoData?.videoUrl) {
      player.volume = 1.0;
    }
  });

  // Refresh data when screen comes into focus (after purchasing premium)
  useFocusEffect(
    React.useCallback(() => {
      if (needsPremium || showPremiumModal) {
        // Reset premium states and reload
        setNeedsPremium(false);
        setShowPremiumModal(false);
        getCurrentUserAndVideo();
      }
    }, [needsPremium, showPremiumModal])
  );

  const getCurrentUserAndVideo = async (dayToLoad?: number) => {
    try {
      setLoading(true);
      setError(null);
      setNeedsPremium(false);
      setShowPremiumModal(false);
  
      // Get current authenticated user
      const { data: { user } } = await supabase.auth.getUser();
  
      if (!user) {
        setError('User not found');
        setLoading(false);
        return;
      }
  
      // Try to get user progress
      let { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('current_day, last_completed_day')
        .eq('user_id', user.id)
        .single();
  
      // If no progress record exists yet, create one
      if (progressError || !progressData) {
        const { data: newProgressData, error: newProgressError } = await supabase
          .from('user_progress')
          .insert([
            { user_id: user.id, current_day: 1, last_completed_day: 0 }
          ])
          .select()
          .single();
  
        if (newProgressError) {
          setError('Could not initialize user progress');
          setLoading(false);
          return;
        }
  
        progressData = newProgressData;
      }
  
      setUserProgress(progressData);
  
      // Set current viewing day if not already set
      if (viewingDay === null) {
        setViewingDay(progressData.current_day);
      }
  
      // Check if user is paid
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_paid')
        .eq('id', user.id)
        .single();
  
      const isPaid = !profileError && profile?.is_paid;
  
      // Determine which day's video to load
      const dayNumber = dayToLoad !== undefined ? dayToLoad : (viewingDay || progressData.current_day);
  
      // Restrict free users to only first 3 videos
      if (!isPaid && dayNumber > 3) {
        setLoading(false);
        setNeedsPremium(true);
        setShowPremiumModal(true);
        // Update viewing day to show correct day number in UI
        if (dayToLoad !== undefined) {
          setViewingDay(dayNumber);
        }
        return;
      }
  
      // Get video for specified day
      const { data: video, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('day_number', dayNumber)
        .single();
  
      if (videoError || !video) {
        setError(`Video not found for day ${dayNumber}`);
        setLoading(false);
        return;
      }
  
      // Create video URL
      const videoUrl = supabase.storage
        .from('video-content')
        .getPublicUrl(`videos/${video.filename}`).data.publicUrl;
  
      setVideoData({ ...video, videoUrl });
  
      // Update viewing day
      if (dayToLoad !== undefined) {
        setViewingDay(dayNumber);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };  

  useEffect(() => {
    getCurrentUserAndVideo();
  }, []);
  
    // Navigate to previous day video
    const goToPreviousDay = () => {
      if (!viewingDay || viewingDay <= 1) return;
      setLoading(true);
      getCurrentUserAndVideo(viewingDay - 1);
    };
  
    // Navigate to next day video
    const goToNextDay = () => {
      if (!viewingDay || !userProgress || viewingDay >= userProgress.current_day) return;
      setLoading(true);
      getCurrentUserAndVideo(viewingDay + 1);
    };
  
    // Navigate back to current day
    const goToCurrentDay = () => {
      if (!userProgress) return;
      setLoading(true);
      getCurrentUserAndVideo(userProgress.current_day);
    };

    const markVideoAsComplete = async () => {
      if (!videoData || !userProgress) return;
    
      try {
        const { data: { user } } = await supabase.auth.getUser();
    
        if (!user) return;
    
        const { error } = await supabase
          .from('user_progress')
          .update({
            last_completed_day: videoData.day_number,
            current_day: videoData.day_number + 1,
            last_watched_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
    
        if (error) throw error;
    
        // Update local state
        const updatedDay = videoData.day_number + 1;
    
        setUserProgress({
          ...userProgress,
          last_completed_day: videoData.day_number,
          current_day: updatedDay
        });
    
        setViewingDay(updatedDay); // 🔄 important to reflect change in UI
    
        // Load the next day's video directly
        setLoading(true);
        setVideoData(null);
        getCurrentUserAndVideo(updatedDay);
    
      } catch (err) {
        console.error('Error marking video as complete:', err);
      }
    };    
  
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
        <Text style={styles.loadingText}>Loading today's training...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          title="Try Again" 
          onPress={() => {
            setError(null);
            setLoading(true);
            getCurrentUserAndVideo();
          }}
          buttonStyle={styles.button}
        />
      </View>
    );
  }

  // Show premium modal if user needs premium (don't show "No video available")
  if (needsPremium) {
    return (
      <ScrollView style={styles.container}>
        {/* Day navigation controls - still show these even when premium is needed */}
        <View style={styles.dayNavigationContainer}>
          <TouchableOpacity 
            onPress={goToPreviousDay} 
            disabled={!viewingDay || viewingDay <= 1}
            style={[styles.navButton, (!viewingDay || viewingDay <= 1) && styles.disabledButton]}
          >
            <AntDesign name="left" size={20} color={(!viewingDay || viewingDay <= 1) ? "#cccccc" : "#0284c7"} />
          </TouchableOpacity>
          
          <Text style={styles.dayIndicator}>
            Day {viewingDay || 1}
            {(userProgress && viewingDay !== userProgress.current_day) && (
              <TouchableOpacity onPress={goToCurrentDay}>
                <Text style={styles.currentDayLink}> (Go to current day)</Text>
              </TouchableOpacity>
            )}
          </Text>
          
          <TouchableOpacity 
            onPress={goToNextDay} 
            disabled={!viewingDay || !userProgress || viewingDay >= userProgress.current_day}
            style={[styles.navButton, (!viewingDay || !userProgress || viewingDay >= userProgress.current_day) && styles.disabledButton]}
          >
            <AntDesign name="right" size={20} color={(!viewingDay || !userProgress || viewingDay >= userProgress.current_day) ? "#cccccc" : "#0284c7"} />
          </TouchableOpacity>
        </View>

        {/* Premium required message */}
        <View style={styles.premiumRequiredContainer}>
          <Text style={styles.premiumTitle}>Premium Content</Text>
          <Text style={styles.premiumMessage}>
            This video is available for premium users only. Upgrade to continue your journey!
          </Text>
          <Button
            title="Buy Premium"
            onPress={() => {
              navigation.navigate('MainTabs', { screen: 'Explore' });
            }}
            buttonStyle={styles.premiumButton}
          />
        </View>

        <PremiumOnlyModal
          visible={showPremiumModal}
          onClose={() => setShowPremiumModal(false)}
          onUpgrade={() => {
            setShowPremiumModal(false);
            navigation.navigate('MainTabs', { screen: 'Explore' });
          }}
        />
      </ScrollView>
    );
  }
  
  if (!videoData || !videoData.videoUrl) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No video available for today.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Day navigation controls */}
      <View style={styles.dayNavigationContainer}>
        <TouchableOpacity 
          onPress={goToPreviousDay} 
          disabled={!viewingDay || viewingDay <= 1}
          style={[styles.navButton, (!viewingDay || viewingDay <= 1) && styles.disabledButton]}
        >
          <AntDesign name="left" size={20} color={(!viewingDay || viewingDay <= 1) ? "#cccccc" : "#0284c7"} />
        </TouchableOpacity>
        
        <Text style={styles.dayIndicator}>
          Day {viewingDay || 1}/{userProgress?.current_day || 1}
          {(userProgress && viewingDay !== userProgress.current_day) && (
            <TouchableOpacity onPress={goToCurrentDay}>
              <Text style={styles.currentDayLink}> (Go to current day)</Text>
            </TouchableOpacity>
          )}
        </Text>
        
        <TouchableOpacity 
          onPress={goToNextDay} 
          disabled={!viewingDay || !userProgress || viewingDay >= userProgress.current_day}
          style={[styles.navButton, (!viewingDay || !userProgress || viewingDay >= userProgress.current_day) && styles.disabledButton]}
        >
          <AntDesign name="right" size={20} color={(!viewingDay || !userProgress || viewingDay >= userProgress.current_day) ? "#cccccc" : "#0284c7"} />
        </TouchableOpacity>
      </View>
      
      {/* Video section extracted to VideoList component */}
      {/* <VideoList
        title={videoData.title}
        dayNumber={videoData.day_number}
        description={videoData.description}
        player={player}
      /> */}
      {/* Card with just the title */}
      <VideoCard
        dayNumber={videoData.day_number}
        title={videoData.title}
        onPress={() => setDetailVisible(true)}
      />

      {/* Detail modal */}
      <VideoDetailModal
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        video={videoData}
        navigation={navigation}   // ← comes from useNavigation or props
        onMarkComplete={markVideoAsComplete}
      />

      {/* Progress section remains in TodayScreen */}
      <View style={styles.progressSection}>
        <Text style={styles.progressText}>
          Progress: Day {userProgress?.last_completed_day || 0} of 60 Completed
        </Text>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${((userProgress?.last_completed_day || 0) / 60) * 100}%` }
            ]} 
          />
        </View>
      </View>

      <PremiumOnlyModal
        visible={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={() => {
          setShowPremiumModal(false);
          navigation.navigate('MainTabs', { screen: 'Explore' });
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  button: {
    backgroundColor: '#0284c7',
    borderRadius: 5,
    marginBottom: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: 'red',
  },
  progressSection: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 10,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  progressText: {
    fontSize: 14,
    marginBottom: 5,
    textAlign: 'center',
  },
  progressBarContainer: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#0284c7',
  },
  dayNavigationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginTop: 10,
    marginBottom: 5,
    borderRadius: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dayIndicator: {
    fontSize: 16,
    fontWeight: '500',
    paddingHorizontal: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f9ff',
  },
  disabledButton: {
    backgroundColor: '#f5f5f5',
  },
  currentDayLink: {
    color: '#0284c7',
    fontSize: 14,
    marginLeft: 5,
    textDecorationLine: 'underline',
  },
  // Premium required container styles
  premiumRequiredContainer: {
    backgroundColor: 'white',
    margin: 10,
    padding: 24,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1e293b',
    textAlign: 'center',
  },
  premiumMessage: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  premiumButton: {
    backgroundColor: '#f59e0b',
    borderRadius: 8,
    paddingHorizontal: 32,
    paddingVertical: 12,
  },
  // Modal styles (keeping the duplicate modal for backward compatibility)
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 24,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 24,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#111827',
  },
  modalText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#374151',
  },
  premiumBtn: {
    backgroundColor: '#f59e0b',
    width: 180,
    borderRadius: 6,
    marginBottom: 10,
  },
  closeBtn: {
    width: 180,
    borderRadius: 6,
  },
});

export default TodayScreen;