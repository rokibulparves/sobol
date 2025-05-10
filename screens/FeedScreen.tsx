import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, SafeAreaView, FlatList } from 'react-native';
import { Icon } from '@rneui/themed';

const FeedScreen = () => {
  // Mock data for trainers/doctors
  const trainers = [
    { id: '1', name: 'Andrew', image: null },
    { id: '2', name: 'Andy', image: null },
    { id: '3', name: 'Coach', image: null },
    { id: '4', name: 'Moreno', image: null },
    { id: '5', name: 'Joey', image: null },
  ];
  
  // Mock data for categories
  const categories = [
    { id: '1', name: "TODAY'S PICKS", icon: 'calendar' },
    { id: '2', name: 'SEXUAL HEALTH', icon: 'heart' },
    { id: '3', name: 'HEALTH', icon: 'medkit' },
    { id: '4', name: 'MENTAL HEALTH', icon: 'brain' },
    { id: '5', name: 'BOOKS', icon: 'book' },
    { id: '6', name: 'PERSONA', icon: 'people' },
  ];
  
  // Mock data for articles
  const articles = [
    {
      id: '1',
      category: 'SEXUAL HEALTH',
      readTime: '3 MIN READ',
      title: 'Kegels: a must for all men',
      image: null,
    },
    // Add more mock articles as needed
  ];

  // Render trainer item
  const renderTrainerItem = ({ item }) => (
    <TouchableOpacity style={styles.trainerItem}>
      <View style={[styles.trainerImageContainer, item.name === 'Coach' && styles.coachContainer]}>
        {item.name === 'Coach' ? (
          <Text style={styles.coachText}>COACH</Text>
        ) : (
          <View style={styles.trainerImage}>
            <Icon type="font-awesome" name="user" size={24} color="#888" />
          </View>
        )}
      </View>
      <Text style={styles.trainerName}>{item.name}</Text>
    </TouchableOpacity>
  );

  // Render category item
  const renderCategoryItem = ({ item }) => (
    <TouchableOpacity style={styles.categoryButton}>
      <Icon 
        type="ionicon" 
        name={item.icon} 
        size={18} 
        color={item.name === "TODAY'S PICKS" ? "#000" : "#fff"} 
      />
      <Text style={[
        styles.categoryText, 
        item.name === "TODAY'S PICKS" ? styles.primaryCategoryText : styles.whiteCategoryText
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>FEED</Text>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Trainers/Doctors Horizontal List */}
        <View style={styles.trainerSection}>
          <FlatList
            data={trainers}
            renderItem={renderTrainerItem}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>

        {/* Categories Label */}
        <Text style={styles.sectionTitle}>CATEGORIES</Text>

        {/* Categories Horizontal Scrollable Buttons */}
        <View style={styles.categoriesContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity 
                key={category.id} 
                style={[
                  styles.categoryButton,
                  { backgroundColor: category.name === "TODAY'S PICKS" ? "#f8f8f8" : "#333" }
                ]}
              >
                <Icon 
                  type="ionicon" 
                  name={category.icon} 
                  size={16} 
                  color={category.name === "TODAY'S PICKS" ? "#000" : "#fff"} 
                />
                <Text style={[
                  styles.categoryText, 
                  category.name === "TODAY'S PICKS" ? styles.darkText : styles.lightText
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Articles */}
        <View style={styles.articlesContainer}>
          {/* Single article example from screenshot */}
          <TouchableOpacity style={styles.articleCard}>
            <View style={styles.articleImageContainer}>
              {/* Replace with actual image */}
              <View style={styles.articleImagePlaceholder}>
                {/* This would be the diagram from the screenshot */}
                <View style={styles.redArrow} />
              </View>
            </View>
            <View style={styles.articleMetaContainer}>
              <Text style={styles.articleCategory}>SEXUAL HEALTH • 3 MIN READ</Text>
              <Text style={styles.articleTitle}>Kegels: a must for all men</Text>
            </View>
          </TouchableOpacity>
          
          {/* You would map through your articles here */}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  scrollView: {
    flex: 1,
  },
  trainerSection: {
    paddingVertical: 16,
  },
  trainerItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 70,
  },
  trainerImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  coachContainer: {
    backgroundColor: '#006400', // Dark green for coach
  },
  coachText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  trainerImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#d0d0d0',
  },
  trainerName: {
    marginTop: 6,
    fontSize: 12,
    textAlign: 'center',
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontWeight: 'bold',
    color: '#666',
    fontSize: 12,
  },
  categoriesContainer: {
    paddingHorizontal: 12,
    paddingBottom: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 4,
    backgroundColor: '#333', // Default dark background
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  darkText: {
    color: '#000',
  },
  lightText: {
    color: '#fff',
  },
  articlesContainer: {
    paddingHorizontal: 16,
  },
  articleCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  articleImageContainer: {
    height: 200,
    backgroundColor: '#ffebee', // Light pink background
  },
  articleImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  redArrow: {
    width: 120,
    height: 10,
    backgroundColor: 'red',
    borderRadius: 5,
    transform: [{ rotate: '20deg' }],
  },
  articleMetaContainer: {
    padding: 16,
  },
  articleCategory: {
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '500',
    marginBottom: 4,
  },
  articleTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  }
});

export default FeedScreen;