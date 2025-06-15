import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';

const CUISINES = [
  { name: 'Türk', image: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png', api: 'Turkish' },
  { name: 'İtalyan', image: 'https://cdn-icons-png.flaticon.com/512/3075/3075972.png', api: 'Italian' },
  { name: 'Çin', image: 'https://cdn-icons-png.flaticon.com/512/3075/3075975.png', api: 'Chinese' },
  { name: 'Fransız', image: 'https://cdn-icons-png.flaticon.com/512/3075/3075973.png', api: 'French' },
  { name: 'Hint', image: 'https://cdn-icons-png.flaticon.com/512/3075/3075974.png', api: 'Indian' },
];

const CuisinesScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mutfaklar</Text>
      <ScrollView contentContainerStyle={styles.cuisineList}>
        {CUISINES.map((cuisine, idx) => (
          <TouchableOpacity
            key={idx}
            style={styles.cuisineItem}
            onPress={() => navigation.navigate('Recipes', { cuisine: cuisine.api })}
          >
            <Image source={{ uri: cuisine.image }} style={styles.cuisineImage} />
            <Text style={styles.cuisineText}>{cuisine.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 24,
    textAlign: 'center',
  },
  cuisineList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cuisineItem: {
    width: '47%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginBottom: 18,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 1.5,
  },
  cuisineImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 10,
  },
  cuisineText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
  },
});

export default CuisinesScreen; 