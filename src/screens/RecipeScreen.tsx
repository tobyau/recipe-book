import { Ionicons } from '@expo/vector-icons';
import { RouteProp, useRoute } from '@react-navigation/native';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';
import { recipeService } from '../services/recipeService';

type RootStackParamList = {
  Recipe: { recipeId: string };
};

type RecipeScreenRouteProp = RouteProp<RootStackParamList, 'Recipe'>;

export default function RecipeScreen() {
  const route = useRoute<RecipeScreenRouteProp>();
  const { recipeId } = route.params;
  const recipe = recipeService.getRecipeById(recipeId);

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text>Recipe not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: recipe.image }} style={styles.image} />
      
      <View style={styles.content}>
        <Text style={styles.title}>{recipe.title}</Text>
        
        <View style={styles.metaContainer}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={20} color="#666" />
            <Text style={styles.metaText}>{recipe.prepTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="flame-outline" size={20} color="#666" />
            <Text style={styles.metaText}>{recipe.cookTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={20} color="#666" />
            <Text style={styles.metaText}>{recipe.servings} servings</Text>
          </View>
        </View>

        <View style={styles.tagsContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{recipe.cuisine}</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>{recipe.difficulty}</Text>
          </View>
        </View>

        <Text style={styles.description}>{recipe.description}</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.ingredients.map((ingredient) => (
            <View key={ingredient.id} style={styles.ingredientItem}>
              <Text style={styles.ingredientAmount}>{ingredient.amount}</Text>
              <Text style={styles.ingredientName}>{ingredient.name}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {recipe.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              <Text style={styles.instructionNumber}>{index + 1}</Text>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    marginLeft: 4,
    color: '#666',
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tag: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  tagText: {
    color: '#666',
    fontSize: 12,
  },
  description: {
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  ingredientItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  ingredientAmount: {
    width: 80,
    color: '#666',
  },
  ingredientName: {
    flex: 1,
    color: '#444',
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  instructionNumber: {
    width: 24,
    height: 24,
    backgroundColor: '#007AFF',
    color: '#fff',
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    color: '#444',
    lineHeight: 24,
  },
}); 