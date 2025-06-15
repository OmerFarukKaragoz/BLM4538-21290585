class Recipe {
  constructor(id, title, image, readyInMinutes, cuisines, ingredients, instructions, nutrition) {
    this.id = id;
    this.title = title;
    this.image = image;
    this.readyInMinutes = readyInMinutes;
    this.cuisines = cuisines;
    this.ingredients = ingredients;
    this.instructions = instructions;
    this.nutrition = nutrition;
  }

  static fromJson(json) {
    return new Recipe(
      json.id || 0,
      json.title || "Unknown",
      json.image || "",
      json.readyInMinutes,
      json.cuisines || [],
      (json.extendedIngredients || [])
        .map(ingredient => ingredient.original?.toString() || ""),
      json.instructions || "No instructions available.",
      json.nutrition || {}
    );
  }
}

export default Recipe; 