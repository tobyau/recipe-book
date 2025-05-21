import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/Colors';
import { useSavedRecipes } from '../../src/hooks/useSavedRecipes';
import { recipeService } from '../../src/services/recipeService';

export default function SavedScreen() {
  const router = useRouter();
  const { saved, toggleSave } = useSavedRecipes();
  const allRecipes = recipeService.getAllRecipes();
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [filteredRecipes, setFilteredRecipes] = useState(allRecipes.filter(r => saved.includes(r.id)));
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedRecipes, setSelectedRecipes] = useState<Set<string>>(new Set());

  useEffect(() => {
    let filtered = allRecipes.filter(r => saved.includes(r.id));
    if (selectedCuisine) {
      filtered = filtered.filter(recipe => recipe.cuisine === selectedCuisine);
    }
    setFilteredRecipes(filtered);
  }, [saved, selectedCuisine]);

  const cuisines = recipeService.getUniqueCuisines();

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedRecipes(new Set());
  };

  const toggleRecipeSelection = (recipeId: string) => {
    const newSelected = new Set(selectedRecipes);
    if (newSelected.has(recipeId)) {
      newSelected.delete(recipeId);
    } else {
      newSelected.add(recipeId);
    }
    setSelectedRecipes(newSelected);
  };

  const handleUnsave = () => {
    if (selectedRecipes.size === 0) return;

    Alert.alert(
      'Unsave Recipes',
      `Are you sure you want to unsave ${selectedRecipes.size} recipe${selectedRecipes.size > 1 ? 's' : ''}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Unsave',
          style: 'destructive',
          onPress: () => {
            selectedRecipes.forEach(recipeId => {
              toggleSave(recipeId);
            });
            setSelectedRecipes(new Set());
            setIsSelectionMode(false);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Saved Recipes</Text>
        {filteredRecipes.length > 0 && (
          <TouchableOpacity onPress={toggleSelectionMode} style={styles.editButton}>
            <Text style={styles.editButtonText}>
              {isSelectionMode ? 'Cancel' : 'Edit'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {isSelectionMode && selectedRecipes.size > 0 && (
        <View style={styles.selectionBar}>
          <Text style={styles.selectionText}>
            {selectedRecipes.size} selected
          </Text>
          <TouchableOpacity onPress={handleUnsave} style={styles.unsaveButton}>
            <Ionicons name="bookmark-outline" size={20} color={Colors.primary} />
            <Text style={styles.unsaveButtonText}>Unsave</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Cuisine Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterContainer}>
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

        {filteredRecipes.length === 0 ? (
          <Text style={styles.emptyText}>You haven&apos;t saved any recipes yet.</Text>
        ) : (
          <View style={styles.recipeList}>
            {filteredRecipes.map(recipe => (
              <TouchableOpacity
                key={recipe.id}
                style={[
                  styles.recipeCard,
                  isSelectionMode && styles.recipeCardSelectable,
                  selectedRecipes.has(recipe.id) && styles.recipeCardSelected
                ]}
                onPress={() => {
                  if (isSelectionMode) {
                    toggleRecipeSelection(recipe.id);
                  } else {
                    router.push(`/recipe/${recipe.id}`);
                  }
                }}
              >
                {isSelectionMode && (
                  <View style={[
                    styles.selectionIndicator,
                    selectedRecipes.has(recipe.id) && styles.selectionIndicatorSelected
                  ]}>
                    {selectedRecipes.has(recipe.id) && (
                      <Ionicons name="checkmark" size={16} color={Colors.background} />
                    )}
                  </View>
                )}
                <Image source={{ uri: recipe.image }} style={styles.recipeImage} />
                <View style={styles.recipeInfo}>
                  <Text style={styles.recipeTitle}>{recipe.title}</Text>
                  <Text style={styles.recipeDescription} numberOfLines={2}>{recipe.description}</Text>
                  <View style={styles.recipeMeta}>
                    <Text style={styles.recipeMetaText}>{recipe.cuisine}</Text>
                    <Text style={styles.recipeMetaText}>•</Text>
                    <Text style={styles.recipeMetaText}>{recipe.prepTime}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  editButton: {
    padding: 8,
  },
  editButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  selectionBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  selectionText: {
    fontSize: 16,
    color: Colors.text.primary,
    fontWeight: '600',
  },
  unsaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  unsaveButtonText: {
    color: Colors.primary,
    marginLeft: 4,
    fontSize: 16,
    fontWeight: '600',
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
    marginRight: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterChipActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterChipText: {
    color: Colors.text.secondary,
    fontSize: 14,
  },
  filterChipTextActive: {
    color: Colors.background,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.text.secondary,
    marginTop: 40,
    fontSize: 18,
  },
  recipeList: {
    padding: 20,
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 2,
    flexDirection: 'row',
  },
  recipeCardSelectable: {
    paddingLeft: 12,
  },
  recipeCardSelected: {
    backgroundColor: Colors.background + '20',
  },
  selectionIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  selectionIndicatorSelected: {
    backgroundColor: Colors.primary,
  },
  recipeImage: {
    width: 100,
    height: 100,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
  },
  recipeInfo: {
    flex: 1,
    padding: 15,
    justifyContent: 'center',
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
}); 