import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video'; // Added useVideoPlayer
import { supabase } from '../lib/supabase';
import { Button, Card } from '@rneui/themed';

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
  
  // Always call useVideoPlayer, but with a null/empty URL if no video data yet
  // This ensures hooks are called in the same order on every render
  const player = useVideoPlayer(videoData?.videoUrl || '', player => {
    // Optional initial setup for player
    if (videoData?.videoUrl) {
      player.volume = 1.0;
    }
  });

  const getCurrentUserAndVideo = async () => {
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
      
      // Get video for current day
      const { data: video, error: videoError } = await supabase
        .from('videos')
        .select('*')
        .eq('day_number', progressData.current_day)
        .single();
        
      if (videoError || !video) {
        setError('Video not found for today');
        setLoading(false);
        return;
      }
      
      // Create video URL
      const videoUrl = supabase.storage
        .from('video-content')
        .getPublicUrl(`videos/${video.filename}`).data.publicUrl;
        
      setVideoData({ ...video, videoUrl });
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
      <Card containerStyle={styles.card}>
        <Card.Title style={styles.cardTitle}>Day {videoData.day_number}: {videoData.title}</Card.Title>
        
        {/* Updated to use VideoView with player prop */}
        <VideoView
          player={player}
          style={styles.video}
          allowsFullscreen
          allowsPictureInPicture
          nativeControls={true} // This is equivalent to useNativeControls
        />
        
        <Text style={styles.description}>{videoData.description}</Text>
        
        <View style={styles.controlsContainer}>
          <Button
            title="Play/Pause"
            onPress={() => {
              if (player.playing) {
                player.pause();
              } else {
                player.play();
              }
            }}
            buttonStyle={styles.controlButton}
          />
          
          <Button
            title="Mark as Completed"
            onPress={markVideoAsComplete}
            buttonStyle={styles.button}
          />
        </View>
        
        <View style={styles.progressContainer}>
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
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    borderRadius: 10,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  video: {
    width: '100%',
    height: 220,
    borderRadius: 5,
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    lineHeight: 22,
  },
  controlsContainer: {
    marginBottom: 15,
  },
  controlButton: {
    backgroundColor: '#6b7280',
    borderRadius: 5,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#0284c7',
    borderRadius: 5,
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
  progressContainer: {
    marginTop: 10,
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
});

export default TodayScreen;