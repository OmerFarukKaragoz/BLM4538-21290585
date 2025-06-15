import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  ScrollView,
  Switch
} from 'react-native';
import ApiService from '../services/ApiService';
import Recipe from '../models/Recipe';

const RecipesScreen = ({ navigation, route }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const cuisine = route?.params?.cuisine || null;
  
  // Filtre state'leri
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [minTime, setMinTime] = useState('');
  const [maxTime, setMaxTime] = useState('');
  const [includedIngredients, setIncludedIngredients] = useState('');
  const [selectedCuisines, setSelectedCuisines] = useState(cuisine || '');
  
  // Filtre uygulama durumu
  const [filtersApplied, setFiltersApplied] = useState(false);

  useEffect(() => {
    fetchRecipes();
  }, [cuisine]);
  
  useEffect(() => {
    if (cuisine) {
      setSelectedCuisines(cuisine);
    }
  }, [cuisine]);

  const fetchRecipes = async (query = '') => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      let filters = {};
      
      // Mutfak filtresi
      if (cuisine && !filtersApplied) {
        filters.cuisine = cuisine;
      }
      
      // Uygulanan filtreler
      if (filtersApplied) {
        // Mutfak filtreleri
        if (selectedCuisines.trim()) {
          filters.cuisine = selectedCuisines.split(',').map(c => c.trim()).join(',');
        }
        
        // Malzeme filtreleri
        if (includedIngredients.trim()) {
          filters.includeIngredients = includedIngredients.split(',').map(i => i.trim()).join(',');
        }
        
        // Süre filtreleri
        if (minTime.trim()) {
          filters.minReadyTime = parseInt(minTime.trim());
        }
        
        if (maxTime.trim()) {
          filters.maxReadyTime = parseInt(maxTime.trim());
        }
      }
      
      const recipeData = await ApiService.fetchRecipes(query, Object.keys(filters).length ? filters : null);
      setRecipes(recipeData);
    } catch (error) {
      setErrorMessage('Tarifler yüklenirken bir hata oluştu');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchRecipes(searchQuery);
  };
  
  const applyFilters = () => {
    setFiltersApplied(true);
    fetchRecipes(searchQuery);
    setFiltersVisible(false);
  };
  
  const clearFilters = () => {
    setMinTime('');
    setMaxTime('');
    setIncludedIngredients('');
    setSelectedCuisines(cuisine || '');
    setFiltersApplied(false);
    fetchRecipes(searchQuery);
  };

  const renderRecipeItem = ({ item }) => {
    return (
      <TouchableOpacity 
        style={styles.recipeCard}
        onPress={() => navigation.navigate('RecipeDetail', { recipeId: item.id })}
      >
        <Image 
          source={{ 
            uri: item.image ? `https://spoonacular.com/recipeImages/${item.id}-312x231.jpg` : 'https://via.placeholder.com/312x231'
          }} 
          style={styles.recipeImage} 
        />
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeTitle} numberOfLines={2}>{item.title}</Text>
          {item.readyInMinutes && (
            <Text style={styles.recipeTime}>{item.readyInMinutes} dakika</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderFilters = () => {
    return (
      <View style={styles.filtersContainer}>
        <View style={styles.filterHeader}>
          <Text style={styles.filterTitle}>Filtreler</Text>
          {filtersApplied && (
            <TouchableOpacity onPress={clearFilters} style={styles.clearButton}>
              <Text style={styles.clearButtonText}>Temizle</Text>
            </TouchableOpacity>
          )}
        </View>
        
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Hazırlama Süresi (dakika)</Text>
          <View style={styles.timeFilterRow}>
            <TextInput
              style={[styles.filterInput, styles.timeInput]}
              placeholder="Min"
              value={minTime}
              onChangeText={setMinTime}
              keyboardType="numeric"
            />
            <Text style={styles.timeFilterSeparator}>-</Text>
            <TextInput
              style={[styles.filterInput, styles.timeInput]}
              placeholder="Max"
              value={maxTime}
              onChangeText={setMaxTime}
              keyboardType="numeric"
            />
          </View>
        </View>
        
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>İçerdiği Malzemeler (virgülle ayırın)</Text>
          <TextInput
            style={styles.filterInput}
            placeholder="soğan, domates, peynir..."
            value={includedIngredients}
            onChangeText={setIncludedIngredients}
          />
        </View>
        
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Mutfak Türü (virgülle ayırın)</Text>
          <TextInput
            style={styles.filterInput}
            placeholder="türk, italyan, meksika..."
            value={selectedCuisines}
            onChangeText={setSelectedCuisines}
          />
        </View>
        
        <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
          <Text style={styles.applyButtonText}>Filtreleri Uygula</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Tarif ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Ara</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.filtersToggle}
        onPress={() => setFiltersVisible(!filtersVisible)}
      >
        <Text style={styles.filtersToggleText}>
          {filtersVisible ? 'Filtreleri Gizle' : 'Filtreleri Göster'}
        </Text>
        {filtersApplied && <View style={styles.filterAppliedIndicator} />}
      </TouchableOpacity>
      
      {filtersVisible && renderFilters()}

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
        </View>
      ) : errorMessage ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMessage}</Text>
        </View>
      ) : recipes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Tarif bulunamadı</Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          renderItem={renderRecipeItem}
          keyExtractor={item => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.recipeList}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  searchContainer: {
    padding: 15,
    flexDirection: 'row',
    backgroundColor: 'white',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  searchInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
  },
  searchButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginLeft: 10,
  },
  searchButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  filtersToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  filtersToggleText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    fontSize: 14,
  },
  filterAppliedIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginLeft: 8,
  },
  filtersContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    padding: 5,
  },
  clearButtonText: {
    color: '#F44336',
    fontSize: 14,
  },
  filterGroup: {
    marginBottom: 15,
  },
  filterLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  filterInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
  },
  timeFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeInput: {
    flex: 1,
  },
  timeFilterSeparator: {
    marginHorizontal: 10,
    color: '#666',
  },
  applyButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  applyButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  recipeList: {
    padding: 8,
  },
  recipeCard: {
    flex: 1,
    margin: 8,
    borderRadius: 10,
    backgroundColor: 'white',
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
  },
  recipeImage: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  recipeInfo: {
    padding: 12,
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  recipeTime: {
    fontSize: 12,
    color: '#666',
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});

export default RecipesScreen; 