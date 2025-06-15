import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import FirebaseService from '../services/FirebaseService';
import ApiService from '../services/ApiService';

const FavoritesScreen = ({ navigation }) => {
  const [favorites, setFavorites] = useState([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFavorites();
    
    // Favoriler ekranına her geldiğimizde listeleri güncelleyelim
    const unsubscribe = navigation.addListener('focus', () => {
      fetchFavorites();
    });

    return unsubscribe;
  }, [navigation]);

  const fetchFavorites = async () => {
    setLoading(true);
    const currentUser = FirebaseService.getCurrentUser();
    
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      const doc = await firestore()
        .collection('usersfavorites')
        .doc(currentUser.uid)
        .get();

      if (doc.exists) {
        const favoritesData = doc.data().favorites || [];
        setFavorites(favoritesData);
        // Tarif başlıklarını çek
        const recipes = await Promise.all(
          favoritesData.map(async (id) => {
            try {
              const data = await ApiService.fetchRecipeDetails(id);
              return { id, title: data.title };
            } catch {
              return { id, title: 'Başlık bulunamadı' };
            }
          })
        );
        setFavoriteRecipes(recipes);
      } else {
        setFavorites([]);
        setFavoriteRecipes([]);
      }
    } catch (error) {
      console.error('Error fetching favorites:', error);
      Alert.alert('Hata', 'Favoriler yüklenirken bir sorun oluştu');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (recipeId) => {
    try {
      const currentUser = FirebaseService.getCurrentUser();
      await FirebaseService.removeFavorite(currentUser.uid, recipeId);
      setFavorites(prevFavorites => prevFavorites.filter(fav => fav !== recipeId));
      setFavoriteRecipes(prev => prev.filter(fav => fav.id !== recipeId));
      Alert.alert('Başarılı', 'Tarif favorilerden kaldırıldı');
    } catch (error) {
      console.error('Error removing favorite:', error);
      Alert.alert('Hata', 'Favorilerden kaldırılırken bir sorun oluştu');
    }
  };

  const confirmRemove = (recipeId) => {
    Alert.alert(
      'Favorilerden Kaldır',
      `Tarif favorilerinizden kaldırılsın mı?`,
      [
        {
          text: 'İptal',
          style: 'cancel'
        },
        {
          text: 'Kaldır',
          onPress: () => removeFavorite(recipeId),
          style: 'destructive'
        }
      ]
    );
  };

  const renderFavoriteItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.favoriteItem}
        onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
      >
        <Image 
          source={{ 
            uri: `https://spoonacular.com/recipeImages/${item.id}-312x231.jpg`
          }} 
          style={styles.recipeImage} 
        />
        
        <View style={styles.favoriteInfo}>
          <Text style={styles.favoriteTitle} numberOfLines={2}>
            {item.title}
          </Text>
          
          <TouchableOpacity 
            style={styles.removeButton}
            onPress={() => confirmRemove(item.id)}
          >
            <Text style={styles.removeButtonText}>Kaldır</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Favori Tariflerim</Text>
      
      {favorites.length === 0 ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>Henüz favori tarifiniz yok</Text>
        </View>
      ) : (
        <FlatList
          data={favoriteRecipes}
          renderItem={renderFavoriteItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.favoritesList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    margin: 16,
    color: '#4CAF50',
  },
  favoritesList: {
    padding: 16,
  },
  favoriteItem: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  recipeImage: {
    width: 100,
    height: 100,
  },
  favoriteInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  favoriteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  removeButton: {
    alignSelf: 'flex-end',
    backgroundColor: '#ff5252',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default FavoritesScreen; 