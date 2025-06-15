import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  FlatList
} from 'react-native';
import ApiService from '../services/ApiService';
import Recipe from '../models/Recipe';

const CompareScreen = ({ navigation }) => {
  const [query1, setQuery1] = useState('');
  const [query2, setQuery2] = useState('');
  const [recipe1, setRecipe1] = useState(null);
  const [recipe2, setRecipe2] = useState(null);
  const [loading, setLoading] = useState(false);
  const [compared, setCompared] = useState(false);
  
  // Arama sonuçları state'leri
  const [searchResults1, setSearchResults1] = useState([]);
  const [searchResults2, setSearchResults2] = useState([]);
  const [searching1, setSearching1] = useState(false);
  const [searching2, setSearching2] = useState(false);
  const [searchTimeout1, setSearchTimeout1] = useState(null);
  const [searchTimeout2, setSearchTimeout2] = useState(null);

  // Arama fonksiyonları - gecikme ile
  const performSearch1 = useCallback(async (text) => {
    if (!text.trim()) {
      setSearchResults1([]);
      return;
    }
    
    setSearching1(true);
    try {
      const recipes = await ApiService.fetchRecipes(text);
      setSearchResults1(recipes);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching1(false);
    }
  }, []);

  const performSearch2 = useCallback(async (text) => {
    if (!text.trim()) {
      setSearchResults2([]);
      return;
    }
    
    setSearching2(true);
    try {
      const recipes = await ApiService.fetchRecipes(text);
      setSearchResults2(recipes);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setSearching2(false);
    }
  }, []);

  // Tarif 1 için arama yapmak - gecikmeli
  const handleSearch1 = (text) => {
    setQuery1(text);
    
    if (searchTimeout1) {
      clearTimeout(searchTimeout1);
    }

    if (!text.trim()) {
      setSearchResults1([]);
      return;
    }
    
    // 500ms gecikme ile arama yap (typing tamamlanana kadar bekle)
    const timeoutId = setTimeout(() => {
      performSearch1(text);
    }, 500);
    
    setSearchTimeout1(timeoutId);
  };

  // Tarif 2 için arama yapmak - gecikmeli
  const handleSearch2 = (text) => {
    setQuery2(text);
    
    if (searchTimeout2) {
      clearTimeout(searchTimeout2);
    }

    if (!text.trim()) {
      setSearchResults2([]);
      return;
    }
    
    // 500ms gecikme ile arama yap (typing tamamlanana kadar bekle)
    const timeoutId = setTimeout(() => {
      performSearch2(text);
    }, 500);
    
    setSearchTimeout2(timeoutId);
  };

  // Zamanlayıcıları temizle
  useEffect(() => {
    return () => {
      if (searchTimeout1) clearTimeout(searchTimeout1);
      if (searchTimeout2) clearTimeout(searchTimeout2);
    };
  }, [searchTimeout1, searchTimeout2]);

  // Tarif 1 için seçim yapmak
  const selectRecipe1 = async (item) => {
    setQuery1(item.title);
    setSearchResults1([]);
    setLoading(true);
    
    try {
      // Seçilen tarifin detaylarını al
      const recipeDetails = await ApiService.fetchRecipeDetails(item.id);
      setRecipe1(Recipe.fromJson(recipeDetails));
    } catch (error) {
      console.error('Recipe details error:', error);
      Alert.alert('Hata', 'Tarif detayları alınırken bir sorun oluştu');
    } finally {
      setLoading(false);
    }
  };

  // Tarif 2 için seçim yapmak
  const selectRecipe2 = async (item) => {
    setQuery2(item.title);
    setSearchResults2([]);
    setLoading(true);
    
    try {
      // Seçilen tarifin detaylarını al
      const recipeDetails = await ApiService.fetchRecipeDetails(item.id);
      setRecipe2(Recipe.fromJson(recipeDetails));
    } catch (error) {
      console.error('Recipe details error:', error);
      Alert.alert('Hata', 'Tarif detayları alınırken bir sorun oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleCompare = async () => {
    if (!recipe1 || !recipe2) {
      Alert.alert('Hata', 'Lütfen her iki tarifi de seçin');
      return;
    }

    setCompared(true);
  };

  // Tarif kartını render etmek için
  const renderRecipeItem = ({ item }, selectFn) => {
    return (
      <TouchableOpacity 
        style={styles.recipeItem}
        onPress={() => selectFn(item)}
      >
        <Text style={styles.recipeTitle}>{item.title}</Text>
      </TouchableOpacity>
    );
  };

  const getNutritionValue = (recipe, nutrient) => {
    if (!recipe || !recipe.nutrition || !recipe.nutrition.nutrients) {
      return 'N/A';
    }
    
    const found = recipe.nutrition.nutrients.find(n => n.name === nutrient);
    return found ? `${found.amount} ${found.unit}` : 'N/A';
  };

  const compareNutrients = (nutrient) => {
    if (!recipe1 || !recipe2 || !recipe1.nutrition || !recipe2.nutrition) {
      return { better: null, difference: 0 };
    }
    
    const value1 = getNumericNutrientValue(recipe1, nutrient);
    const value2 = getNumericNutrientValue(recipe2, nutrient);
    
    if (value1 === null || value2 === null) {
      return { better: null, difference: 0 };
    }
    
    // Kalori, yağ, karbonhidrat için düşük olan daha iyidir
    if (nutrient === 'Calories' || nutrient === 'Fat' || nutrient === 'Carbohydrates') {
      return {
        better: value1 < value2 ? 1 : value1 > value2 ? 2 : 0,
        difference: Math.abs(value1 - value2)
      };
    } 
    // Protein için yüksek olan daha iyidir
    else if (nutrient === 'Protein') {
      return {
        better: value1 > value2 ? 1 : value1 < value2 ? 2 : 0,
        difference: Math.abs(value1 - value2)
      };
    }
    
    return { better: null, difference: 0 };
  };

  const getNumericNutrientValue = (recipe, nutrient) => {
    if (!recipe || !recipe.nutrition || !recipe.nutrition.nutrients) {
      return null;
    }
    
    const found = recipe.nutrition.nutrients.find(n => n.name === nutrient);
    return found ? found.amount : null;
  };

  const renderComparison = () => {
    const nutrients = ['Calories', 'Fat', 'Carbohydrates', 'Protein'];
    
    return (
      <View style={styles.comparisonContainer}>
        <Text style={styles.sectionTitle}>Besin Değerleri Karşılaştırması</Text>
        
        <View style={styles.comparisonHeader}>
          <Text style={styles.comparisonLabel}>Besin</Text>
          <Text style={styles.columnHeader}>{recipe1.title}</Text>
          <Text style={styles.columnHeader}>{recipe2.title}</Text>
        </View>
        
        {nutrients.map(nutrient => {
          const comparison = compareNutrients(nutrient);
          
          return (
            <View key={nutrient} style={styles.comparisonRow}>
              <Text style={styles.comparisonLabel}>{translateNutrient(nutrient)}</Text>
              
              <Text 
                style={[
                  styles.comparisonValue, 
                  comparison.better === 1 && styles.betterValue
                ]}
              >
                {getNutritionValue(recipe1, nutrient)}
              </Text>
              
              <Text 
                style={[
                  styles.comparisonValue, 
                  comparison.better === 2 && styles.betterValue
                ]}
              >
                {getNutritionValue(recipe2, nutrient)}
              </Text>
            </View>
          );
        })}
        
        <View style={styles.buttonRow}>
          <TouchableOpacity 
            style={styles.detailButton}
            onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe1.id })}
          >
            <Text style={styles.detailButtonText}>{recipe1.title} Detayı</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.detailButton}
            onPress={() => navigation.navigate('RecipeDetail', { recipeId: recipe2.id })}
          >
            <Text style={styles.detailButtonText}>{recipe2.title} Detayı</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const translateNutrient = (nutrient) => {
    const translations = {
      'Calories': 'Kalori',
      'Fat': 'Yağ',
      'Carbohydrates': 'Karbonhidrat',
      'Protein': 'Protein'
    };
    return translations[nutrient] || nutrient;
  };

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Tarifleri Karşılaştır</Text>
      <Text style={styles.subtitle}>İki farklı tarifi besin değerleri açısından karşılaştır</Text>
      
      <View style={styles.formContainer}>
        {/* İlk tarif arama kutusu ve sonuçları */}
        <Text style={styles.inputLabel}>İlk Tarif</Text>
        <TextInput
          style={styles.input}
          placeholder="Tarif adı yazın..."
          value={query1}
          onChangeText={handleSearch1}
        />
        
        {searching1 && (
          <ActivityIndicator size="small" color="#4CAF50" style={styles.searchingIndicator} />
        )}
        
        {searchResults1.length > 0 && (
          <View style={styles.resultsContainer}>
            <FlatList
              data={searchResults1}
              renderItem={(itemData) => renderRecipeItem(itemData, selectRecipe1)}
              keyExtractor={(item) => item.id.toString()}
              style={styles.resultsList}
              scrollEnabled={false}
              nestedScrollEnabled={true}
              initialNumToRender={5}
              maxToRenderPerBatch={5}
              windowSize={3}
            />
          </View>
        )}
        
        {/* İkinci tarif arama kutusu ve sonuçları */}
        <Text style={[styles.inputLabel, {marginTop: 40}]}>İkinci Tarif</Text>
        <TextInput
          style={styles.input}
          placeholder="Tarif adı yazın..."
          value={query2}
          onChangeText={handleSearch2}
        />
        
        {searching2 && (
          <ActivityIndicator size="small" color="#4CAF50" style={styles.searchingIndicator} />
        )}
        
        {searchResults2.length > 0 && (
          <View style={styles.resultsContainer}>
            <FlatList
              data={searchResults2}
              renderItem={(itemData) => renderRecipeItem(itemData, selectRecipe2)}
              keyExtractor={(item) => item.id.toString()}
              style={styles.resultsList}
              scrollEnabled={false}
              nestedScrollEnabled={true}
              initialNumToRender={5}
              maxToRenderPerBatch={5}
              windowSize={3}
            />
          </View>
        )}
        
        <TouchableOpacity 
          style={[styles.compareButton, {marginTop: 40}]}
          onPress={handleCompare}
          disabled={loading || !recipe1 || !recipe2}
        >
          <Text style={styles.compareButtonText}>
            {loading ? 'Yükleniyor...' : 'Karşılaştır'}
          </Text>
        </TouchableOpacity>
      </View>
      
      {loading && (
        <ActivityIndicator style={styles.loader} size="large" color="#4CAF50" />
      )}
      
      {compared && recipe1 && recipe2 && !loading && renderComparison()}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginHorizontal: 16,
    color: '#4CAF50',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginHorizontal: 16,
    marginBottom: 20,
  },
  formContainer: {
    padding: 16,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
  },
  searchingIndicator: {
    marginVertical: 10,
  },
  resultsContainer: {
    maxHeight: 200,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
  },
  resultsList: {
    backgroundColor: '#fff',
  },
  recipeItem: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  compareButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  compareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  },
  comparisonContainer: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#4CAF50',
  },
  comparisonHeader: {
    flexDirection: 'row',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
  },
  columnHeader: {
    flex: 1,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  comparisonRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  comparisonLabel: {
    width: '30%',
    fontSize: 16,
    color: '#666',
  },
  comparisonValue: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  betterValue: {
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  detailButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  detailButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default CompareScreen;