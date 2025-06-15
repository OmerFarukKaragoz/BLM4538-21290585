import axios from 'axios';

class ApiService {
  constructor() {
    this.apiKey = '59667d0b94dd461eb02a0110a3b87d4a';
  }

  async fetchRecipes(query = '', filters = null) {
    let filterString = '';

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        filterString += `&${key}=${value}`;
      });
    }

    const url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${this.apiKey}&query=${query}${filterString}`;

    try {
      const response = await axios.get(url);
      return response.data.results;
    } catch (error) {
      console.error('API Error:', error);
      throw new Error('Failed to load recipes');
    }
  }

  async fetchRecipeDetails(recipeId) {
    const url = `https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=true&apiKey=${this.apiKey}`;
    
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('API Error:', error);
      throw new Error('Failed to load recipe details');
    }
  }
}

export default new ApiService(); 