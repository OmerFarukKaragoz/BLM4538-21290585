/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar, View, ActivityIndicator } from 'react-native';

// Firebase için başlatma kodları
import '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import './src/firebase/config'; // Firebase yapılandırmasını içe aktar

// Ekranları içe aktarma
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import HomeScreen from './src/screens/HomeScreen';
import RecipesScreen from './src/screens/RecipesScreen';
import RecipeDetailScreen from './src/screens/RecipeDetailScreen';
import CanIScreen from './src/screens/CanIScreen';
import CompareScreen from './src/screens/CompareScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import UserProfileScreen from './src/screens/UserProfileScreen';
import CuisinesScreen from './src/screens/CuisinesScreen';

const Stack = createStackNavigator();

const App = () => {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  // Auth durumu değişikliklerini izleme
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(userState => {
      setUser(userState);
      if (initializing) setInitializing(false);
    });
    return subscriber; // componentWillUnmount'da aboneliği kaldır
  }, [initializing]);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar backgroundColor="#4CAF50" barStyle="light-content" />
      <Stack.Navigator 
        initialRouteName={user ? 'Home' : 'Login'}
        screenOptions={{
          headerStyle: {
            backgroundColor: '#4CAF50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ title: 'Giriş Yap', headerShown: false }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ title: 'Kayıt Ol' }}
        />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ title: 'Ana Sayfa', headerShown: false }}
        />
        <Stack.Screen 
          name="Recipes" 
          component={RecipesScreen} 
          options={{ title: 'Tarifler' }}
        />
        <Stack.Screen 
          name="RecipeDetail" 
          component={RecipeDetailScreen} 
          options={{ title: 'Tarif Detayı' }}
        />
        <Stack.Screen 
          name="CanI" 
          component={CanIScreen} 
          options={{ title: 'Bununla Ne Pişirebilirim?' }}
        />
        <Stack.Screen 
          name="Compare" 
          component={CompareScreen} 
          options={{ title: 'Tarifleri Karşılaştır' }}
        />
        <Stack.Screen 
          name="Favorites" 
          component={FavoritesScreen} 
          options={{ title: 'Favorilerim' }}
        />
        <Stack.Screen 
          name="Profile" 
          component={UserProfileScreen} 
          options={{ title: 'Profil Bilgilerim' }}
        />
        <Stack.Screen name="Cuisines" component={CuisinesScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
