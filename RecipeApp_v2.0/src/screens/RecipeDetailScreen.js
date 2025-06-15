import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Image, 
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput
} from 'react-native';
import ApiService from '../services/ApiService';
import FirebaseService from '../services/FirebaseService';
import Recipe from '../models/Recipe';
import AntDesign from 'react-native-vector-icons/AntDesign';

const RecipeDetailScreen = ({ route, navigation }) => {
  const { recipeId } = route.params;
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [rating, setRating] = useState(5);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchRecipeDetails();
    fetchComments();
    checkFavorite();
  }, []);

  const fetchRecipeDetails = async () => {
    try {
      const recipeData = await ApiService.fetchRecipeDetails(recipeId);
      setRecipe(Recipe.fromJson(recipeData));
      setError('');
    } catch (error) {
      setError('Tarif detayları yüklenirken bir hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const commentsData = await FirebaseService.getComments(recipeId.toString());
      setComments(commentsData);
    } catch (error) {
      console.error('Comments error:', error);
    }
  };

  const checkFavorite = async () => {
    const currentUser = FirebaseService.getCurrentUser();
    if (!currentUser) return;
    const fav = await FirebaseService.isFavorite(currentUser.uid, recipeId.toString());
    setIsFavorite(fav);
  };

  const handleFavorite = async () => {
    const currentUser = FirebaseService.getCurrentUser();
    if (!currentUser) {
      Alert.alert('Uyarı', 'Favorilere eklemek için giriş yapmalısınız');
      return;
    }
    if (isFavorite) {
      await FirebaseService.removeFavorite(currentUser.uid, recipeId.toString());
      setIsFavorite(false);
      Alert.alert('Favoriler', 'Tarif favorilerden çıkarıldı');
    } else {
      await FirebaseService.addFavorite(currentUser.uid, recipeId.toString());
      setIsFavorite(true);
      Alert.alert('Favoriler', 'Tarif favorilere eklendi');
    }
  };

  const handleAddComment = async () => {
    const currentUser = FirebaseService.getCurrentUser();
    
    if (!currentUser) {
      Alert.alert('Uyarı', 'Yorum yapmak için giriş yapmalısınız');
      return;
    }
    
    if (!newComment.trim()) {
      Alert.alert('Uyarı', 'Lütfen bir yorum yazın');
      return;
    }

    try {
      await FirebaseService.addComment(
        recipeId.toString(),
        currentUser.uid,
        rating,
        newComment
      );
      
      Alert.alert('Başarılı', 'Yorumunuz eklendi');
      setNewComment('');
      fetchComments(); // Yorumları yenile
    } catch (error) {
      Alert.alert('Hata', 'Yorum eklenirken bir hata oluştu');
      console.error(error);
    }
  };

  const renderStars = (count) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity 
          key={i} 
          onPress={() => setRating(i)}
          style={styles.starButton}
        >
          <Text style={i <= rating ? styles.starFilled : styles.starEmpty}>★</Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image 
        source={{ 
          uri: recipe.image 
            ? `https://spoonacular.com/recipeImages/${recipe.id}-636x393.jpg` 
            : 'https://via.placeholder.com/636x393'
        }} 
        style={styles.recipeImage} 
      />
      
      <View style={styles.content}>
        <Text style={styles.title}>{recipe.title}</Text>
        
        {recipe.readyInMinutes && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hazırlama Süresi:</Text>
            <Text style={styles.infoValue}>{recipe.readyInMinutes} dakika</Text>
          </View>
        )}
        
        {recipe.cuisines && recipe.cuisines.length > 0 && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mutfak:</Text>
            <Text style={styles.infoValue}>{recipe.cuisines.join(', ')}</Text>
          </View>
        )}
        
        <Text style={styles.sectionTitle}>Malzemeler</Text>
        <View style={styles.ingredientList}>
          {recipe.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientItem}>
              <View style={styles.bulletPoint} />
              <Text style={styles.ingredientText}>{ingredient}</Text>
            </View>
          ))}
        </View>
        
        <Text style={styles.sectionTitle}>Tarif</Text>
        <Text style={styles.instructions}>{recipe.instructions}</Text>
        
        <Text style={styles.sectionTitle}>Yorumlar</Text>
        
        <View style={styles.favoriteButtonContainer}>
          <TouchableOpacity 
            style={[styles.favoriteButton, isFavorite ? styles.favoriteButtonRemove : styles.favoriteButtonAdd]} 
            onPress={handleFavorite}
          >
            <Text style={styles.favoriteButtonText}>
              {isFavorite ? 'Favorilerden Çıkar' : 'Favorilere Ekle'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.commentForm}>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingLabel}>Puanınız:</Text>
            <View style={styles.starsContainer}>
              {renderStars(rating)}
            </View>
          </View>
          
          <TextInput
            style={styles.commentInput}
            placeholder="Yorum yazın..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          
          <TouchableOpacity 
            style={styles.commentButton}
            onPress={handleAddComment}
          >
            <Text style={styles.commentButtonText}>Yorum Ekle</Text>
          </TouchableOpacity>
        </View>
        
        {comments.length > 0 ? (
          <View style={styles.commentsList}>
            {comments.map((comment, index) => (
              <View key={index} style={styles.commentItem}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUser}>{comment.username}</Text>
                  <View style={styles.commentRating}>
                    {[...Array(5)].map((_, i) => (
                      <Text key={i} style={i < comment.rating ? styles.starFilled : styles.starEmpty}>
                        ★
                      </Text>
                    ))}
                  </View>
                </View>
                <Text style={styles.commentText}>{comment.comment}</Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={styles.noComments}>Henüz yorum yapılmamış</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  recipeImage: {
    width: '100%',
    height: 240,
    resizeMode: 'cover',
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginRight: 8,
  },
  infoValue: {
    fontSize: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 24,
    marginBottom: 12,
    color: '#4CAF50',
  },
  ingredientList: {
    marginBottom: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  ingredientText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  instructions: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  commentForm: {
    marginTop: 8,
    marginBottom: 24,
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  ratingLabel: {
    fontSize: 16,
    marginRight: 8,
  },
  starsContainer: {
    flexDirection: 'row',
  },
  starButton: {
    padding: 4,
  },
  starFilled: {
    fontSize: 24,
    color: '#FFCC00',
  },
  starEmpty: {
    fontSize: 24,
    color: '#DDDDDD',
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  commentButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  commentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commentsList: {
    marginTop: 8,
  },
  commentItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  commentUser: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  commentRating: {
    flexDirection: 'row',
  },
  commentText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
  },
  noComments: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 12,
  },
  favoriteButtonContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  favoriteButton: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  favoriteButtonAdd: {
    backgroundColor: '#4CAF50',
  },
  favoriteButtonRemove: {
    backgroundColor: '#e74c3c',
  },
  favoriteButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default RecipeDetailScreen; 