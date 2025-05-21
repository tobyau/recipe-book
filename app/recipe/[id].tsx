import { FontAwesome } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/Colors';
import { useSavedRecipes } from '../../src/hooks/useSavedRecipes';
import { recipeService } from '../../src/services/recipeService';

export default function RecipeScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const recipe = recipeService.getRecipeById(id as string);
  const { isSaved, toggleSave } = useSavedRecipes();
  const saved = recipe ? isSaved(recipe.id) : false;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: '',
          headerShown: false,
        }}
      />
      {!recipe ? (
        <View style={styles.card}>
          <Text style={styles.errorText}>Recipe not found</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.imageWrapper}>
            <Image source={{ uri: recipe.image }} style={styles.image} />
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <FontAwesome name="arrow-left" size={18} color={Colors.text.primary} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={() => toggleSave(recipe.id)}>
              <FontAwesome name={saved ? 'bookmark' : 'bookmark-o'} size={22} color={saved ? Colors.primary : Colors.text.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.title}>{recipe.title}</Text>
            </View>
            <View style={styles.metaRow}>
              <View style={styles.metaItem}><FontAwesome name="clock-o" size={15} color={Colors.text.secondary} /><Text style={styles.metaText}>{recipe.prepTime}</Text></View>
              <View style={styles.metaItem}><FontAwesome name="users" size={15} color={Colors.primary} /><Text style={styles.metaText}>Serves {recipe.servings}</Text></View>
            </View>
            <Text style={styles.description}>{recipe.description}</Text>

            <Text style={styles.sectionTitle}>Ingredients</Text>
            <View style={styles.ingredientList}>
              {recipe.ingredients.map((ingredient) => (
                <Text key={ingredient.id} style={styles.ingredientText}>• {ingredient.name}</Text>
              ))}
            </View>

            <Text style={styles.sectionTitle}>Instructions</Text>
            <View style={styles.instructionList}>
              {recipe.instructions.map((instruction, index) => (
                <View key={index} style={styles.instructionItem}>
                  <Text style={styles.instructionNumber}>{index + 1}</Text>
                  <Text style={styles.instructionStep}>{instruction}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  imageWrapper: {
    width: '100%',
    height: 260,
    position: 'relative',
    backgroundColor: Colors.card,
  },
  image: {
    width: '100%',
    height: 260,
    resizeMode: 'cover',
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 28,
    left: 16,
    backgroundColor: Colors.card,
    borderRadius: 14,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  saveButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : 28,
    right: 16,
    backgroundColor: Colors.card,
    borderRadius: 14,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 32,
    marginTop: -32,
    marginHorizontal: 0,
    padding: 32,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text.primary,
    flex: 1,
    marginRight: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 18,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  metaText: {
    fontSize: 16,
    color: Colors.text.secondary,
    marginLeft: 4,
  },
  metaTag: {
    backgroundColor: Colors.chip.background,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 4,
    marginTop: 2,
  },
  metaTagText: {
    fontSize: 15,
    color: Colors.primary,
    fontWeight: 'bold',
    letterSpacing: 0.2,
  },
  description: {
    fontSize: 18,
    color: Colors.text.secondary,
    marginBottom: 22,
    lineHeight: 26,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 22,
    marginBottom: 12,
  },
  ingredientList: {
    marginBottom: 22,
  },
  ingredientText: {
    fontSize: 17,
    color: Colors.text.primary,
    marginBottom: 8,
    marginLeft: 2,
  },
  instructionList: {
    marginBottom: 22,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    color: Colors.text.light,
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 12,
  },
  instructionStep: {
    fontSize: 17,
    color: Colors.text.primary,
    flex: 1,
    lineHeight: 25,
  },
  errorText: {
    fontSize: 18,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
}); 