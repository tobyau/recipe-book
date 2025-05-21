import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Keyboard, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/Colors';
import { Recipe, recipeService } from '../../src/services/recipeService';

export default function DiscoverScreen() {
  const [input, setInput] = useState('');
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [suggestedRecipe, setSuggestedRecipe] = useState<Recipe | null>(null);
  const [missingIngredients, setMissingIngredients] = useState<string[]>([]);
  const [noMatch, setNoMatch] = useState(false);
  const router = useRouter();

  const handleAddIngredient = () => {
    const trimmed = input.trim();
    if (trimmed && !ingredients.includes(trimmed.toLowerCase())) {
      setIngredients([...ingredients, trimmed.toLowerCase()]);
    }
    setInput('');
    Keyboard.dismiss();
  };

  const handleRemoveIngredient = (name: string) => {
    setIngredients(ingredients.filter(i => i !== name));
  };

  const findBestRecipe = () => {
    const allRecipes = recipeService.getAllRecipes();
    if (ingredients.length === 0) {
      setSuggestedRecipe(null);
      setMissingIngredients([]);
      setNoMatch(false);
      return;
    }
    // Score recipes by number of matching ingredients
    let bestScore = 0;
    let bestRecipes: Recipe[] = [];
    allRecipes.forEach(recipe => {
      const recipeIngredientNames = recipe.ingredients.map(i => i.name.toLowerCase());
      const matchCount = ingredients.filter(ing => recipeIngredientNames.includes(ing)).length;
      if (matchCount > bestScore) {
        bestScore = matchCount;
        bestRecipes = [recipe];
      } else if (matchCount === bestScore && matchCount > 0) {
        bestRecipes.push(recipe);
      }
    });
    if (bestScore === 0) {
      setSuggestedRecipe(null);
      setMissingIngredients([]);
      setNoMatch(true);
      return;
    }
    // Pick a random recipe from the best matches
    const chosen = bestRecipes[Math.floor(Math.random() * bestRecipes.length)];
    // Find missing ingredients
    const missing = chosen.ingredients
      .map(i => i.name)
      .filter(name => !ingredients.includes(name.toLowerCase()));
    setSuggestedRecipe(chosen);
    setMissingIngredients(missing);
    setNoMatch(false);
  };

  const handleRandomize = () => {
    findBestRecipe();
  };

  return (
    <SafeAreaView style={styles.bg}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Discover Recipes</Text>
        <Text style={styles.subtitle}>Enter ingredients you have at home:</Text>
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="e.g. chicken, tomato, rice"
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleAddIngredient}
            placeholderTextColor={Colors.text.secondary}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAddIngredient}>
            <FontAwesome name="plus" size={18} color={Colors.text.light} />
          </TouchableOpacity>
        </View>
        <View style={styles.chipRow}>
          {ingredients.map(ing => (
            <View key={ing} style={styles.chip}>
              <Text style={styles.chipText}>{ing}</Text>
              <TouchableOpacity onPress={() => handleRemoveIngredient(ing)}>
                <FontAwesome name="close" size={14} color={Colors.accent} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.randomizeBtn} onPress={handleRandomize}>
          <FontAwesome name="random" size={18} color={Colors.text.light} />
          <Text style={styles.randomizeBtnText}>Randomize</Text>
        </TouchableOpacity>
        {noMatch && (
          <Text style={styles.noMatchText}>No recipes found with those ingredients. Try adding or removing some!</Text>
        )}
        {suggestedRecipe && (
          <TouchableOpacity style={styles.recipeCard} onPress={() => router.push(`/recipe/${suggestedRecipe.id}`)}>
            <Text style={styles.recipeTitle}>{suggestedRecipe.title}</Text>
            <Text style={styles.recipeCuisine}>{suggestedRecipe.cuisine}</Text>
            <Text style={styles.recipeDescription} numberOfLines={2}>{suggestedRecipe.description}</Text>
            <Text style={styles.sectionTitle}>Ingredients:</Text>
            {suggestedRecipe.ingredients.map(ing => (
              <Text
                key={ing.id}
                style={missingIngredients.includes(ing.name) ? styles.missingIngredient : styles.ingredient}
              >
                • {ing.name} {ing.amount && <Text style={styles.ingredientAmount}>({ing.amount})</Text>}
                {missingIngredients.includes(ing.name) ? ' (missing)' : ''}
              </Text>
            ))}
            {missingIngredients.length > 0 && (
              <Text style={styles.missingNote}>You are missing: {missingIngredients.join(', ')}</Text>
            )}
            <TouchableOpacity style={styles.randomizeBtnSmall} onPress={handleRandomize}>
              <FontAwesome name="random" size={16} color={Colors.text.light} />
              <Text style={styles.randomizeBtnTextSmall}>Randomize Again</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    padding: 24,
    alignItems: 'stretch',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  input: {
    flex: 1,
    backgroundColor: Colors.chip.background,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    color: Colors.text.primary,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  addBtn: {
    marginLeft: 8,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.chip.background,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    color: Colors.text.primary,
    marginRight: 6,
    fontSize: 15,
  },
  randomizeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 10,
    alignSelf: 'center',
    marginBottom: 18,
    gap: 8,
  },
  randomizeBtnText: {
    color: Colors.text.light,
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  noMatchText: {
    color: Colors.accent,
    textAlign: 'center',
    marginTop: 18,
    fontSize: 16,
    fontWeight: 'bold',
  },
  recipeCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 20,
    marginTop: 10,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
  },
  recipeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 2,
  },
  recipeCuisine: {
    fontSize: 14,
    color: Colors.primary,
    marginBottom: 6,
  },
  recipeDescription: {
    fontSize: 15,
    color: Colors.text.secondary,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 10,
    marginBottom: 6,
  },
  ingredient: {
    fontSize: 15,
    color: Colors.text.primary,
    marginBottom: 2,
    marginLeft: 2,
  },
  ingredientAmount: {
    color: Colors.text.secondary,
    fontSize: 14,
  },
  missingIngredient: {
    fontSize: 15,
    color: Colors.accent,
    marginBottom: 2,
    marginLeft: 2,
    fontStyle: 'italic',
  },
  missingNote: {
    color: Colors.accent,
    marginTop: 8,
    fontSize: 15,
    fontWeight: 'bold',
  },
  randomizeBtnSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignSelf: 'flex-end',
    marginTop: 14,
    gap: 6,
  },
  randomizeBtnTextSmall: {
    color: Colors.text.light,
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 15,
  },
}); 