import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  FlatList, 
  ActivityIndicator 
} from 'react-native';
import ApiService from '../services/ApiService';

const CanIScreen = ({ navigation }) => {
  const [ingredients, setIngredients] = useState('');
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!ingredients.trim()) {
      setError('Lütfen en az bir malzeme girin');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const filters = {
        includeIngredients: ingredients.split(',').map(i => i.trim()).join(','),
        number: 10
      };
      
      const recipeData = await ApiService.fetchRecipes('', filters);
      setRecipes(recipeData);
      
      if (recipeData.length === 0) {
        setError('Bu malzemelerle yapılabilecek tarif bulunamadı');
      }
    } catch (error) {
      setError('Tarifler yüklenirken bir hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderRecipeItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.recipeItem}
        onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
      >
        <Text style={styles.recipeTitle}>{item.title}</Text>
        {item.usedIngredientCount && (
          <Text style={styles.ingredientInfo}>
            Kullanılan: {item.usedIngredientCount} | 
            Eksik: {item.missedIngredientCount}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bununla Ne Pişirebilirim?</Text>
      
      <Text style={styles.subtitle}>
        Elinizdeki malzemeleri virgülle ayırarak girin
      </Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Örn: soğan, domates, biber"
          value={ingredients}
          onChangeText={setIngredients}
          multiline
        />
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleSearch}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Aranıyor...' : 'Ara'}
          </Text>
        </TouchableOpacity>
      </View>

      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}

      {loading ? (
        <ActivityIndicator style={styles.loader} size="large" color="#4CAF50" />
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            !error && (
              <Text style={styles.emptyText}>
                Tarifler burada görünecek
              </Text>
            )
          }
          contentContainerStyle={styles.recipeList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#4CAF50',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recipeList: {
    flexGrow: 1,
  },
  recipeItem: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  ingredientInfo: {
    fontSize: 14,
    color: '#666',
  },
  loader: {
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 16,
    fontSize: 14,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default CanIScreen; 