import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView, 
  Image,
  StatusBar
} from 'react-native';
import FirebaseService from '../services/FirebaseService';

const HomeScreen = ({ navigation }) => {
  const handleLogout = async () => {
    await FirebaseService.logoutUser();
    navigation.replace('Login');
  };

  const CUISINES = [
    { name: 'Türk', image: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png', api: 'Turkish' },
    { name: 'İtalyan', image: 'https://cdn-icons-png.flaticon.com/512/3075/3075972.png', api: 'Italian' },
    { name: 'Çin', image: 'https://cdn-icons-png.flaticon.com/512/3075/3075975.png', api: 'Chinese' },
    { name: 'Fransız', image: 'https://cdn-icons-png.flaticon.com/512/3075/3075973.png', api: 'French' },
    { name: 'Hint', image: 'https://cdn-icons-png.flaticon.com/512/3075/3075974.png', api: 'Indian' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tarif Uygulaması</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Çıkış</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Kategoriler</Text>
        
        <View style={styles.menuGrid}>
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Recipes')}
          >
            <View style={styles.menuIcon}>
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2917/2917633.png' }} 
                style={styles.icon} 
              />
            </View>
            <Text style={styles.menuText}>Tarifler</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('CanI')}
          >
            <View style={styles.menuIcon}>
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1147/1147835.png' }} 
                style={styles.icon} 
              />
            </View>
            <Text style={styles.menuText}>Bununla Pişirebilir miyim?</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Compare')}
          >
            <View style={styles.menuIcon}>
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3373/3373082.png' }} 
                style={styles.icon} 
              />
            </View>
            <Text style={styles.menuText}>Karşılaştır</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Favorites')}
          >
            <View style={styles.menuIcon}>
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2107/2107845.png' }} 
                style={styles.icon} 
              />
            </View>
            <Text style={styles.menuText}>Favorilerim</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.menuIcon}>
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/1077/1077114.png' }} 
                style={styles.icon} 
              />
            </View>
            <Text style={styles.menuText}>Profilim</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Cuisines')}
          >
            <View style={styles.menuIcon}>
              <Image 
                source={{ uri: 'https://cdn-icons-png.flaticon.com/512/3075/3075977.png' }} 
                style={styles.icon} 
              />
            </View>
            <Text style={styles.menuText}>Mutfaklar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  menuIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#e9f5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    width: 35,
    height: 35,
  },
  menuText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: '#333',
  },
});

export default HomeScreen; 