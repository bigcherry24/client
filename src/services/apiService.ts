import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

export interface GroceryItem {
  name: string;
  quantity: number;
  unit: string;
  checked: boolean;
}

export interface GroceryList {
  items: GroceryItem[];
  generatedAt?: string;
  dateRange?: {
    startDate: string;
    endDate: string;
  };
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: Array<{
    name: string;
    quantity: number;
    unit: string;
  }>;
  instructions: string[];
  prepTime: number;
  servings: number;
  category: string;
  createdAt: string;
}

export interface Meal {
  id: string;
  date: string;
  mealType: string;
  recipeId: string;
  recipeName: string;
  createdAt: string;
}

class ApiService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Grocery List APIs
  async getGroceryList(): Promise<GroceryList> {
    const response = await this.api.get('/grocery-list');
    return response.data;
  }

  async generateGroceryList(startDate: string, endDate: string): Promise<GroceryList> {
    const response = await this.api.post('/grocery-list/generate', {
      startDate,
      endDate,
    });
    return response.data;
  }

  async updateGroceryList(items: GroceryItem[]): Promise<GroceryList> {
    const response = await this.api.put('/grocery-list', { items });
    return response.data;
  }

  // Recipes APIs
  async getRecipes(): Promise<Recipe[]> {
    const response = await this.api.get('/recipes');
    return response.data;
  }

  async createRecipe(recipe: Omit<Recipe, 'id' | 'createdAt'>): Promise<Recipe> {
    const response = await this.api.post('/recipes', recipe);
    return response.data;
  }

  // Meals APIs
  async getMeals(): Promise<Meal[]> {
    const response = await this.api.get('/meals');
    return response.data;
  }

  async createMeal(meal: Omit<Meal, 'id' | 'createdAt'>): Promise<Meal> {
    const response = await this.api.post('/meals', meal);
    return response.data;
  }

  async deleteMeal(id: string): Promise<void> {
    await this.api.delete(`/meals/${id}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.api.get('/health');
    return response.data;
  }
}

export const apiService = new ApiService();
