import React from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Recipe } from '../services/recipeService';

interface RecipeGridProps {
  recipes: Recipe[];
  onRecipePress: (recipe: Recipe) => void;
}

const { width } = Dimensions.get('window');
const numColumns = 2;
const tileSize = (width - 48) / numColumns; // 48 = padding (16) * 2 + gap (16)

export default function RecipeGrid({ recipes, onRecipePress }: RecipeGridProps) {
  return (
    <View style={styles.container}>
      {recipes.map((recipe) => (
        <TouchableOpacity
          key={recipe.id}
          style={styles.tile}
          onPress={() => onRecipePress(recipe)}
        >
          <Image source={{ uri: recipe.image }} style={styles.image} />
          <View style={styles.overlay}>
            <Text style={styles.title} numberOfLines={2}>
              {recipe.title}
            </Text>
            <View style={styles.metaContainer}>
              <Text style={styles.metaText}>{recipe.cuisine}</Text>
              <Text style={styles.metaText}>•</Text>
              <Text style={styles.metaText}>{recipe.difficulty}</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  tile: {
    width: tileSize,
    height: tileSize,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 8,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#fff',
    fontSize: 10,
    marginRight: 4,
  },
}); 