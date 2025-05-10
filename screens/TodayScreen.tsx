import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Text, Card, Button, Divider } from '@rneui/themed';
import { Icon } from '@rneui/themed';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TOTAL_DAYS = 60;

const TodayScreen = () => {
  const [currentDay, setCurrentDay] = useState(1);
  const [maxUnlockedDay, setMaxUnlockedDay] = useState(1);
  const navigation = useNavigation();

  // Sample content data - in a real app, this would come from an API or database
  const dailyContent = [
    {
      day: 1,
      title: "Introduction to Pelvic Floor Exercises",
      type: "Video",
      duration: "5:30",
      description: "Learn the basics of pelvic floor exercises to build your foundation."
    },
    {
      day: 2,
      title: "Core Strength Fundamentals",
      type: "Article",
      duration: "8 min read",
      description: "Understanding how core strength impacts sexual performance."
    },
    {
      day: 3,
      title: "Breathing Techniques",
      type: "Video",
      duration: "7:15",
      description: "Master breathing techniques that enhance endurance and control."
    },
    {
      day: 4,
      title: "Hip Mobility Exercises",
      type: "Video",
      duration: "10:20",
      description: "Improve flexibility and range of motion for better performance."
    },
    // Additional days would follow the same pattern
  ];

  // Fill remaining days with placeholder content
  for (let i = dailyContent.length + 1; i <= TOTAL_DAYS; i++) {
    dailyContent.push({
      day: i,
      title: `Day ${i} Training`,
      type: i % 2 === 0 ? "Article" : "Video",
      duration: i % 2 === 0 ? "5 min read" : "8:30",
      description: `Day ${i} training content will focus on building strength and endurance.`
    });
  }

  // Load the user's progress from AsyncStorage on component mount
  useEffect(() => {
    const loadProgress = async () => {
      try {
        const storedProgress = await AsyncStorage.getItem('maxUnlockedDay');
        if (storedProgress !== null) {
          const progress = parseInt(storedProgress, 10);
          setMaxUnlockedDay(progress);
          
          // If user already has progress, show them their latest unlocked day
          setCurrentDay(progress);
        }
      } catch (error) {
        console.error('Failed to load progress:', error);
      }
    };

    loadProgress();
  }, []);

  // Save progress whenever maxUnlockedDay changes
  useEffect(() => {
    const saveProgress = async () => {
      try {
        await AsyncStorage.setItem('maxUnlockedDay', maxUnlockedDay.toString());
      } catch (error) {
        console.error('Failed to save progress:', error);
      }
    };

    saveProgress();
  }, [maxUnlockedDay]);

  // Simulate completing the current day's content
  const completeDay = () => {
    if (currentDay === maxUnlockedDay && maxUnlockedDay < TOTAL_DAYS) {
      setMaxUnlockedDay(prevMax => prevMax + 1);
    }
  };

  // Navigate to previous day
  const goToPreviousDay = () => {
    if (currentDay > 1) {
      setCurrentDay(prevDay => prevDay - 1);
    }
  };

  // Navigate to next day
  const goToNextDay = () => {
    if (currentDay < maxUnlockedDay) {
      setCurrentDay(prevDay => prevDay + 1);
    }
  };

  // Get content for the current day
  const getDayContent = () => {
    return dailyContent.find(content => content.day === currentDay) || dailyContent[0];
  };

  const currentContent = getDayContent();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.todayText}>Today</Text>
        <View style={styles.progressBar}>
          <Text style={styles.progressText}>
            Last Longer{' '}
            <Text style={styles.dayCounter}>
              {'< Day '}{currentDay}{' of '}{TOTAL_DAYS}{' >'}
            </Text>
          </Text>
        </View>
      </View>

      <ScrollView style={styles.contentContainer}>
        <View style={styles.navigationControls}>
          <TouchableOpacity 
            style={[styles.navButton, currentDay === 1 && styles.disabledButton]} 
            onPress={goToPreviousDay}
            disabled={currentDay === 1}
          >
            <Icon name="chevron-left" type="font-awesome" size={20} color={currentDay === 1 ? "#cccccc" : "#000"} />
          </TouchableOpacity>
          
          <Text style={styles.dayTitle}>Day {currentDay}</Text>
          
          <TouchableOpacity 
            style={[styles.navButton, currentDay >= maxUnlockedDay && styles.disabledButton]} 
            onPress={goToNextDay}
            disabled={currentDay >= maxUnlockedDay}
          >
            <Icon name="chevron-right" type="font-awesome" size={20} color={currentDay >= maxUnlockedDay ? "#cccccc" : "#000"} />
          </TouchableOpacity>
        </View>

        <Card containerStyle={styles.contentCard}>
          <View style={styles.contentHeader}>
            <Icon 
              name={currentContent.type === "Video" ? "play-circle" : "file-text"} 
              type="font-awesome" 
              size={20} 
              color="#0284c7" 
            />
            <Text style={styles.contentType}>{currentContent.type} • {currentContent.duration}</Text>
          </View>
          <Text style={styles.contentTitle}>{currentContent.title}</Text>
          <Divider style={styles.divider} />
          <Text style={styles.contentDescription}>{currentContent.description}</Text>
        </Card>

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsHeader}>Daily Tips</Text>
          <Card containerStyle={styles.tipsCard}>
            <Text style={styles.tipText}>Maintain proper hydration throughout your training routine.</Text>
          </Card>
          
          <Card containerStyle={styles.tipsCard}>
            <Text style={styles.tipText}>Focus on quality of exercises rather than quantity.</Text>
          </Card>
        </View>

        {currentDay === maxUnlockedDay && maxUnlockedDay < TOTAL_DAYS && (
          <Button
            title="Mark Complete & Unlock Next Day"
            containerStyle={styles.completeButtonContainer}
            buttonStyle={styles.completeButton}
            onPress={completeDay}
          />
        )}

        {currentDay === TOTAL_DAYS && maxUnlockedDay === TOTAL_DAYS && (
          <View style={styles.programCompleteContainer}>
            <Text style={styles.programCompleteText}>
              Congratulations! You've completed the 60-day program.
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  todayText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  progressBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
  },
  dayCounter: {
    fontWeight: 'normal',
    color: '#666',
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  navigationControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#fff',
  },
  disabledButton: {
    borderColor: '#f0f0f0',
    backgroundColor: '#f8f8f8',
  },
  dayTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  contentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  contentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contentType: {
    fontSize: 14,
    color: '#0284c7',
    marginLeft: 8,
  },
  contentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  divider: {
    marginVertical: 12,
  },
  contentDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  tipsContainer: {
    marginBottom: 24,
  },
  tipsHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    marginLeft: 4,
  },
  tipsCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  tipText: {
    fontSize: 14,
    color: '#555',
  },
  completeButtonContainer: {
    marginBottom: 24,
  },
  completeButton: {
    backgroundColor: '#0284c7',
    borderRadius: 8,
    padding: 12,
  },
  programCompleteContainer: {
    padding: 16,
    backgroundColor: '#e0f7fa',
    borderRadius: 12,
    marginBottom: 24,
    alignItems: 'center',
  },
  programCompleteText: {
    fontSize: 16,
    color: '#00838f',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default TodayScreen;