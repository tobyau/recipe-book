import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import RecipeGrid from '../components/RecipeGrid';
import { Recipe, recipeService } from '../services/recipeService';

type RootStackParamList = {
  Home: undefined;
  Recipe: { recipeId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

type ViewMode = 'list' | 'grid';
type SortOption = 'default' | 'name' | 'difficulty' | 'prepTime';

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'Easy' | 'Medium' | 'Hard' | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [sortOption, setSortOption] = useState<SortOption>('default');

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = () => {
    let filteredRecipes = recipeService.getAllRecipes();
    
    if (searchQuery) {
      filteredRecipes = recipeService.searchRecipes(searchQuery);
    }
    
    if (selectedCuisine) {
      filteredRecipes = filteredRecipes.filter(recipe => recipe.cuisine === selectedCuisine);
    }
    
    if (selectedDifficulty) {
      filteredRecipes = filteredRecipes.filter(recipe => recipe.difficulty === selectedDifficulty);
    }

    // Sort recipes
    filteredRecipes = sortRecipes(filteredRecipes);
    
    setRecipes(filteredRecipes);
  };

  const sortRecipes = (recipes: Recipe[]): Recipe[] => {
    switch (sortOption) {
      case 'name':
        return [...recipes].sort((a, b) => a.title.localeCompare(b.title));
      case 'difficulty': {
        const difficultyOrder = { Easy: 0, Medium: 1, Hard: 2 };
        return [...recipes].sort((a, b) => 
          difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]
        );
      }
      case 'prepTime':
        return [...recipes].sort((a, b) => {
          const getMinutes = (time: string) => parseInt(time.split(' ')[0]);
          return getMinutes(a.prepTime) - getMinutes(b.prepTime);
        });
      default:
        return recipes;
    }
  };

  useEffect(() => {
    loadRecipes();
  }, [searchQuery, selectedCuisine, selectedDifficulty, sortOption]);

  const renderRecipeItem = ({ item }: { item: Recipe }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => navigation.navigate('Recipe', { recipeId: item.id })}
    >
      <Image source={{ uri: item.image }} style={styles.recipeImage} />
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle}>{item.title}</Text>
        <Text style={styles.recipeDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.recipeMeta}>
          <Text style={styles.recipeMetaText}>{item.cuisine}</Text>
          <Text style={styles.recipeMetaText}>•</Text>
          <Text style={styles.recipeMetaText}>{item.difficulty}</Text>
          <Text style={styles.recipeMetaText}>•</Text>
          <Text style={styles.recipeMetaText}>{item.prepTime}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const cuisines = recipeService.getUniqueCuisines();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search recipes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <View style={styles.viewControls}>
          <TouchableOpacity
            style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
            onPress={() => setViewMode('list')}
          >
            <Ionicons name="list" size={24} color={viewMode === 'list' ? '#007AFF' : '#666'} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
            onPress={() => setViewMode('grid')}
          >
            <Ionicons name="grid" size={24} color={viewMode === 'grid' ? '#007AFF' : '#666'} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.sortContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.sortChip, sortOption === 'default' && styles.sortChipActive]}
            onPress={() => setSortOption('default')}
          >
            <Text style={[styles.sortChipText, sortOption === 'default' && styles.sortChipTextActive]}>
              Default
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortChip, sortOption === 'name' && styles.sortChipActive]}
            onPress={() => setSortOption('name')}
          >
            <Text style={[styles.sortChipText, sortOption === 'name' && styles.sortChipTextActive]}>
              Name
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortChip, sortOption === 'difficulty' && styles.sortChipActive]}
            onPress={() => setSortOption('difficulty')}
          >
            <Text style={[styles.sortChipText, sortOption === 'difficulty' && styles.sortChipTextActive]}>
              Difficulty
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sortChip, sortOption === 'prepTime' && styles.sortChipActive]}
            onPress={() => setSortOption('prepTime')}
          >
            <Text style={[styles.sortChipText, sortOption === 'prepTime' && styles.sortChipTextActive]}>
              Prep Time
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
      
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[styles.filterChip, !selectedCuisine && styles.filterChipActive]}
            onPress={() => setSelectedCuisine(null)}
          >
            <Text style={[styles.filterChipText, !selectedCuisine && styles.filterChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {cuisines.map((cuisine) => (
            <TouchableOpacity
              key={cuisine}
              style={[styles.filterChip, selectedCuisine === cuisine && styles.filterChipActive]}
              onPress={() => setSelectedCuisine(cuisine)}
            >
              <Text style={[styles.filterChipText, selectedCuisine === cuisine && styles.filterChipTextActive]}>
                {cuisine}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.difficultyFilter}>
        {(['Easy', 'Medium', 'Hard'] as const).map((difficulty) => (
          <TouchableOpacity
            key={difficulty}
            style={[styles.difficultyChip, selectedDifficulty === difficulty && styles.difficultyChipActive]}
            onPress={() => setSelectedDifficulty(difficulty)}
          >
            <Text style={[styles.difficultyChipText, selectedDifficulty === difficulty && styles.difficultyChipTextActive]}>
              {difficulty}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {viewMode === 'list' ? (
        <FlatList
          data={recipes}
          renderItem={renderRecipeItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.recipeList}
        />
      ) : (
        <RecipeGrid
          recipes={recipes}
          onRecipePress={(recipe) => navigation.navigate('Recipe', { recipeId: recipe.id })}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    fontSize: 16,
  },
  viewControls: {
    flexDirection: 'row',
    gap: 8,
  },
  viewButton: {
    padding: 8,
    borderRadius: 8,
  },
  viewButtonActive: {
    backgroundColor: '#f0f0f0',
  },
  sortContainer: {
    marginBottom: 16,
  },
  sortChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
    marginLeft: 16,
  },
  sortChipActive: {
    backgroundColor: '#007AFF',
  },
  sortChipText: {
    color: '#666',
  },
  sortChipTextActive: {
    color: '#fff',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
    marginLeft: 16,
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
  },
  filterChipText: {
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  difficultyFilter: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  difficultyChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    marginHorizontal: 4,
  },
  difficultyChipActive: {
    backgroundColor: '#007AFF',
  },
  difficultyChipText: {
    color: '#666',
  },
  difficultyChipTextActive: {
    color: '#fff',
  },
  recipeList: {
    padding: 16,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recipeImage: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  recipeInfo: {
    padding: 16,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeMetaText: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
}); 