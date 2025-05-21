import recipesData from '../../data/recipes.json';

export interface Ingredient {
  id: number;
  name: string;
  amount: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  image: string;
  prepTime: string;
  cookTime: string;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cuisine: string;
  ingredients: Ingredient[];
  instructions: string[];
}

class RecipeService {
  private recipes: Recipe[] = recipesData.recipes as Recipe[];

  getAllRecipes(): Recipe[] {
    return this.recipes;
  }

  getRecipeById(id: string): Recipe | undefined {
    return this.recipes.find(recipe => recipe.id === id);
  }

  getRecipesByCuisine(cuisine: string): Recipe[] {
    return this.recipes.filter(recipe => recipe.cuisine === cuisine);
  }

  getRecipesByDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): Recipe[] {
    return this.recipes.filter(recipe => recipe.difficulty === difficulty);
  }

  searchRecipes(query: string): Recipe[] {
    const lowerQuery = query.toLowerCase();
    return this.recipes.filter(recipe => 
      recipe.title.toLowerCase().includes(lowerQuery) ||
      recipe.description.toLowerCase().includes(lowerQuery) ||
      recipe.ingredients.some(ingredient => 
        ingredient.name.toLowerCase().includes(lowerQuery)
      )
    );
  }

  getUniqueCuisines(): string[] {
    return [...new Set(this.recipes.map(recipe => recipe.cuisine))];
  }
}

export const recipeService = new RecipeService(); 