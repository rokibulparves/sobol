//TodayScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useVideoPlayer } from 'expo-video';
import { supabase } from '../lib/supabase';
import { Button } from '@rneui/themed';
import VideoList from './VideoList';
import { AntDesign } from '@expo/vector-icons'; // Make sure to install @expo/vector-icons

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
  
  // Always call useVideoPlayer, but with a null/empty URL if no video data yet
  const player = useVideoPlayer(videoData?.videoUrl || '', player => {
    // Optional initial setup for player
    if (videoData?.videoUrl) {
      player.volume = 1.0;
    }
  });

  const getCurrentUserAndVideo = async (dayToLoad?: number) => {
    try {
      setLoading(true);
      
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
      
      // Determine which day's video to load
      const dayNumber = dayToLoad !== undefined ? dayToLoad : (viewingDay || progressData.current_day);
      
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
        setViewingDay(dayToLoad);
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
      setUserProgress({
        ...userProgress,
        last_completed_day: videoData.day_number,
        current_day: videoData.day_number + 1
      });
      
      // Reload to get next day's video
      setLoading(true);
      setVideoData(null);
      getCurrentUserAndVideo();
      
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
      <VideoList
        title={videoData.title}
        dayNumber={videoData.day_number}
        description={videoData.description}
        player={player}
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
});

export default TodayScreen;