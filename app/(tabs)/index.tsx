import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/Colors';
import { Recipe, recipeService } from '../../src/services/recipeService';

const RECIPES_PER_PAGE = 8;

export default function HomeScreen() {
  const router = useRouter();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = () => {
    let filtered = recipeService.getAllRecipes();
    
    if (searchQuery) {
      filtered = recipeService.searchRecipes(searchQuery);
    }
    
    if (selectedCuisine) {
      filtered = filtered.filter(recipe => recipe.cuisine === selectedCuisine);
    }
    
    setFilteredRecipes(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  };

  useEffect(() => {
    loadRecipes();
  }, [searchQuery, selectedCuisine]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE);
  const startIndex = (currentPage - 1) * RECIPES_PER_PAGE;
  const endIndex = startIndex + RECIPES_PER_PAGE;
  const currentRecipes = filteredRecipes.slice(startIndex, endIndex);

  const handleCuisineFilter = (cuisine: string | null) => {
    setSelectedCuisine(prev => prev === cuisine ? null : cuisine);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const cuisines = recipeService.getUniqueCuisines();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>Hello, Tobi! 👋</Text>
          <Text style={styles.subtitle}>What would you like to cook today?</Text>
        </View>

        {/* Search and View Controls */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search recipes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={Colors.text.secondary}
          />
          <View style={styles.viewControls}>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <FontAwesome name="list" size={20} color={viewMode === 'list' ? Colors.primary : Colors.text.secondary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
              onPress={() => setViewMode('grid')}
            >
              <FontAwesome name="th-large" size={20} color={viewMode === 'grid' ? Colors.primary : Colors.text.secondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Cuisine Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
          <TouchableOpacity
            style={[styles.filterChip, !selectedCuisine && styles.filterChipActive]}
            onPress={() => handleCuisineFilter(null)}
          >
            <Text style={[styles.filterChipText, !selectedCuisine && styles.filterChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {cuisines.map((cuisine) => (
            <TouchableOpacity
              key={cuisine}
              style={[styles.filterChip, selectedCuisine === cuisine && styles.filterChipActive]}
              onPress={() => handleCuisineFilter(cuisine)}
            >
              <Text style={[styles.filterChipText, selectedCuisine === cuisine && styles.filterChipTextActive]}>
                {cuisine}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Recipe List */}
        <View style={styles.recipeList}>
          {currentRecipes.map((recipe) => (
            <TouchableOpacity
              key={recipe.id}
              style={styles.recipeCard}
              onPress={() => router.push(`/recipe/${recipe.id}`)}
            >
              <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
              <View style={styles.recipeInfo}>
                <Text style={styles.recipeTitle}>{recipe.title}</Text>
                <Text style={styles.recipeDescription} numberOfLines={2}>
                  {recipe.description}
                </Text>
                <View style={styles.recipeMeta}>
                  <Text style={styles.recipeMetaText}>{recipe.cuisine}</Text>
                  <Text style={styles.recipeMetaText}>•</Text>
                  <Text style={styles.recipeMetaText}>{recipe.prepTime}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[styles.pageButton, currentPage === 1 && styles.pageButtonDisabled]}
              onPress={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FontAwesome name="chevron-left" size={16} color={currentPage === 1 ? Colors.button.disabled : Colors.primary} />
            </TouchableOpacity>
            
            {[...Array(totalPages)].map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.pageButton, currentPage === index + 1 && styles.pageButtonActive]}
                onPress={() => handlePageChange(index + 1)}
              >
                <Text style={[styles.pageButtonText, currentPage === index + 1 && styles.pageButtonTextActive]}>
                  {index + 1}
                </Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.pageButton, currentPage === totalPages && styles.pageButtonDisabled]}
              onPress={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FontAwesome name="chevron-right" size={16} color={currentPage === totalPages ? Colors.button.disabled : Colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginTop: 5,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    gap: 16,
  },
  searchInput: {
    flex: 1,
    padding: 12,
    backgroundColor: Colors.chip.background,
    borderRadius: 8,
    fontSize: 16,
    color: Colors.text.primary,
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
    backgroundColor: Colors.chip.background,
  },
  filterContainer: {
    marginBottom: 16,
    paddingLeft: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.chip.background,
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
  },
  filterChipText: {
    color: Colors.text.secondary,
  },
  filterChipTextActive: {
    color: Colors.text.light,
  },
  recipeList: {
    padding: 20,
  },
  recipeCard: {
    backgroundColor: Colors.background,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: Colors.shadow,
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
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  recipeInfo: {
    padding: 15,
  },
  recipeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 14,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  recipeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recipeMetaText: {
    fontSize: 12,
    color: Colors.text.secondary,
    marginRight: 4,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    gap: 8,
  },
  pageButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.chip.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageButtonActive: {
    backgroundColor: Colors.primary,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageButtonText: {
    fontSize: 16,
    color: Colors.text.secondary,
  },
  pageButtonTextActive: {
    color: Colors.text.light,
  },
}); 