import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, FlatList, Image, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../src/constants/Colors';
import { Recipe, recipeService } from '../../src/services/recipeService';

// Mock user data
const mockUser = {
  name: 'Tobi',
  avatar: 'https://randomuser.me/api/portraits/lego/1.jpg',
};

export default function ProfileScreen() {
  const router = useRouter();
  const [userRecipes, setUserRecipes] = useState<Recipe[]>(recipeService.getAllRecipes().slice(0, 3));
  const [modalVisible, setModalVisible] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    description: '',
    image: '',
    cuisine: '',
    prepTime: '',
    cookTime: '',
    servings: '',
    ingredients: [{ id: Date.now(), name: '', amount: '' }],
    instructions: [''],
  });

  const handleDelete = (id: string) => {
    Alert.alert('Delete Recipe', 'Are you sure you want to delete this recipe?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => setUserRecipes(r => r.filter(rec => rec.id !== id)) },
    ]);
  };

  const handleEdit = (id: string) => {
    const recipeToEdit = userRecipes.find(r => r.id === id);
    if (!recipeToEdit) return;

    setForm({
      title: recipeToEdit.title,
      description: recipeToEdit.description,
      image: recipeToEdit.image,
      cuisine: recipeToEdit.cuisine,
      prepTime: recipeToEdit.prepTime,
      cookTime: recipeToEdit.cookTime,
      servings: recipeToEdit.servings.toString(),
      ingredients: recipeToEdit.ingredients.map(ing => ({ id: ing.id, name: ing.name, amount: ing.amount })),
      instructions: recipeToEdit.instructions,
    });
    setEditingRecipeId(id);
    setIsEditing(true);
    setModalVisible(true);
  };

  const handleAddRecipe = () => {
    setIsEditing(false);
    setEditingRecipeId(null);
    setForm({
      title: '',
      description: '',
      image: '',
      cuisine: '',
      prepTime: '',
      cookTime: '',
      servings: '',
      ingredients: [{ id: Date.now(), name: '', amount: '' }],
      instructions: [''],
    });
    setModalVisible(true);
  };

  const handleFormChange = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleIngredientChange = (idx: number, field: 'name' | 'amount', value: string) => {
    setForm(f => {
      const ingredients = [...f.ingredients];
      ingredients[idx] = { ...ingredients[idx], [field]: value };
      return { ...f, ingredients };
    });
  };

  const addIngredient = () => {
    setForm(f => ({ ...f, ingredients: [...f.ingredients, { id: Date.now(), name: '', amount: '' }] }));
  };

  const removeIngredient = (idx: number) => {
    setForm(f => ({ ...f, ingredients: f.ingredients.filter((_, i) => i !== idx) }));
  };

  const handleInstructionChange = (idx: number, value: string) => {
    setForm(f => {
      const instructions = [...f.instructions];
      instructions[idx] = value;
      return { ...f, instructions };
    });
  };

  const addInstruction = () => {
    setForm(f => ({ ...f, instructions: [...f.instructions, ''] }));
  };

  const removeInstruction = (idx: number) => {
    setForm(f => ({ ...f, instructions: f.instructions.filter((_, i) => i !== idx) }));
  };

  const handleFormSubmit = () => {
    if (!form.title || !form.description || !form.image) {
      Alert.alert('Missing Fields', 'Please fill in all required fields.');
      return;
    }

    const recipeData: Recipe = {
      id: isEditing ? editingRecipeId! : Date.now().toString(),
      title: form.title,
      description: form.description,
      image: form.image,
      cuisine: form.cuisine,
      prepTime: form.prepTime,
      cookTime: form.cookTime,
      servings: Number(form.servings) || 1,
      difficulty: 'Medium', // Default difficulty
      ingredients: form.ingredients
        .filter(i => i.name && i.amount)
        .map(i => ({ id: Number(i.id), name: i.name, amount: i.amount })),
      instructions: form.instructions.filter(i => i),
    };

    if (isEditing) {
      setUserRecipes(recipes => 
        recipes.map(recipe => 
          recipe.id === editingRecipeId ? { ...recipe, ...recipeData } : recipe
        )
      );
    } else {
      setUserRecipes(recipes => [recipeData, ...recipes]);
    }

    setModalVisible(false);
    setForm({
      title: '',
      description: '',
      image: '',
      cuisine: '',
      prepTime: '',
      cookTime: '',
      servings: '',
      ingredients: [{ id: Date.now(), name: '', amount: '' }],
      instructions: [''],
    });
    setIsEditing(false);
    setEditingRecipeId(null);
  };

  return (
    <SafeAreaView style={styles.bg} edges={['top', 'left', 'right']}>
      <View style={styles.headerCard}>
        <TouchableOpacity>
          <Image source={{ uri: mockUser.avatar }} style={styles.avatar} />
          <View style={styles.editIcon}>
            <FontAwesome name="pencil" size={14} color={Colors.primary} />
          </View>
        </TouchableOpacity>
        <Text style={styles.name}>{mockUser.name}</Text>
      </View>

      <View style={styles.sectionRow}>
        <Text style={styles.sectionTitle}>My Recipes</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleAddRecipe}>
          <FontAwesome name="plus" size={16} color={Colors.text.light} />
          <Text style={styles.addButtonText}>Add Recipe</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={userRecipes}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.recipeList}
        renderItem={({ item }) => (
          <TouchableOpacity 
            style={styles.recipeCard}
            onPress={() => router.push(`/recipe/${item.id}`)}
          >
            <Image source={{ uri: item.image }} style={styles.recipeImage} />
            <View style={styles.recipeInfo}>
              <Text style={styles.recipeTitle}>{item.title}</Text>
              <Text style={styles.recipeMeta}>{item.cuisine}</Text>
              <View style={styles.recipeActions}>
                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={(e) => {
                    e.stopPropagation();
                    handleEdit(item.id);
                  }}
                >
                  <FontAwesome name="pencil" size={16} color={Colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.actionBtn} 
                  onPress={(e) => {
                    e.stopPropagation();
                    handleDelete(item.id);
                  }}
                >
                  <FontAwesome name="trash" size={16} color={Colors.accent} />
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>No recipes yet. Add your first recipe!</Text>}
      />

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <ScrollView style={styles.modalCard}>
            <Text style={styles.modalTitle}>{isEditing ? 'Edit Recipe' : 'Add Recipe'}</Text>
            <TextInput style={styles.input} placeholder="Title" value={form.title} onChangeText={v => handleFormChange('title', v)} placeholderTextColor={Colors.text.secondary} />
            <TextInput style={styles.input} placeholder="Description" value={form.description} onChangeText={v => handleFormChange('description', v)} placeholderTextColor={Colors.text.secondary} />
            <TextInput style={styles.input} placeholder="Image URL" value={form.image} onChangeText={v => handleFormChange('image', v)} placeholderTextColor={Colors.text.secondary} />
            <TextInput style={styles.input} placeholder="Cuisine" value={form.cuisine} onChangeText={v => handleFormChange('cuisine', v)} placeholderTextColor={Colors.text.secondary} />
            <TextInput style={styles.input} placeholder="Prep Time (e.g. 10 min)" value={form.prepTime} onChangeText={v => handleFormChange('prepTime', v)} placeholderTextColor={Colors.text.secondary} />
            <TextInput style={styles.input} placeholder="Cook Time (e.g. 20 min)" value={form.cookTime} onChangeText={v => handleFormChange('cookTime', v)} placeholderTextColor={Colors.text.secondary} />
            <TextInput style={styles.input} placeholder="Servings" value={form.servings} onChangeText={v => handleFormChange('servings', v.replace(/[^0-9]/g, ''))} keyboardType="numeric" placeholderTextColor={Colors.text.secondary} />
            <Text style={styles.modalSubtitle}>Ingredients</Text>
            {form.ingredients.map((ingredient, idx) => (
              <View key={ingredient.id} style={styles.ingredientRowForm}>
                <TextInput 
                  style={[styles.input, { flex: 1, marginBottom: 0 }]} 
                  placeholder="Name" 
                  value={ingredient.name} 
                  onChangeText={v => handleIngredientChange(idx, 'name', v)} 
                  placeholderTextColor={Colors.text.secondary} 
                />
                <TextInput 
                  style={[styles.input, { flex: 1, marginBottom: 0 }]} 
                  placeholder="Amount" 
                  value={ingredient.amount} 
                  onChangeText={v => handleIngredientChange(idx, 'amount', v)} 
                  placeholderTextColor={Colors.text.secondary} 
                />
                {form.ingredients.length > 1 && (
                  <TouchableOpacity onPress={() => removeIngredient(idx)} style={styles.removeBtn}>
                    <FontAwesome name="minus-circle" size={20} color={Colors.accent} />
                  </TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity onPress={addIngredient} style={styles.addRowBtn}>
              <FontAwesome name="plus" size={16} color={Colors.primary} />
              <Text style={styles.addRowBtnText}>Add Ingredient</Text>
            </TouchableOpacity>
            <Text style={styles.modalSubtitle}>Instructions</Text>
            {form.instructions.map((step, idx) => (
              <View key={idx} style={styles.ingredientRowForm}>
                <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder={`Step ${idx + 1}`} value={step} onChangeText={v => handleInstructionChange(idx, v)} placeholderTextColor={Colors.text.secondary} />
                {form.instructions.length > 1 && (
                  <TouchableOpacity onPress={() => removeInstruction(idx)} style={styles.removeBtn}><FontAwesome name="minus-circle" size={20} color={Colors.accent} /></TouchableOpacity>
                )}
              </View>
            ))}
            <TouchableOpacity onPress={addInstruction} style={styles.addRowBtn}>
              <FontAwesome name="plus" size={16} color={Colors.primary} />
              <Text style={styles.addRowBtnText}>Add Step</Text>
            </TouchableOpacity>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleFormSubmit}>
                <Text style={styles.saveBtnText}>{isEditing ? 'Save Changes' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  headerCard: {
    backgroundColor: Colors.card,
    borderRadius: 28,
    margin: 24,
    marginBottom: 0,
    alignItems: 'center',
    padding: 24,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 8,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: Colors.primary,
  },
  editIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 16,
  },
  sectionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 32,
    marginHorizontal: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text.primary,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  addButtonText: {
    color: Colors.text.light,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  recipeList: {
    padding: 24,
    gap: 16,
  },
  recipeCard: {
    backgroundColor: Colors.card,
    borderRadius: 20,
    flexDirection: 'row',
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  recipeImage: {
    width: 120,
    height: '100%',
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    resizeMode: 'cover',
  },
  recipeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'center',
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 4,
  },
  recipeMeta: {
    fontSize: 13,
    color: Colors.text.secondary,
    marginBottom: 8,
  },
  recipeActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: Colors.chip.background,
  },
  emptyText: {
    textAlign: 'center',
    color: Colors.text.secondary,
    marginTop: 32,
    fontSize: 16,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.18)',
    width: '100%',
    height: '100%',
  },
  modalCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 0,
    paddingHorizontal: 24,
    paddingVertical: 32,
    width: '100%',
    height: '100%',
    paddingTop: 40,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.chip.background,
    borderRadius: 14,
    padding: Platform.OS === 'ios' ? 16 : 12,
    fontSize: 16,
    color: Colors.text.primary,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 16,
    marginTop: 18,
    paddingBottom: 32,
  },
  cancelBtn: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: Colors.chip.background,
  },
  cancelBtnText: {
    color: Colors.text.secondary,
    fontWeight: 'bold',
    fontSize: 15,
  },
  saveBtn: {
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 18,
    backgroundColor: Colors.primary,
  },
  saveBtnText: {
    color: Colors.text.light,
    fontWeight: 'bold',
    fontSize: 15,
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text.primary,
    marginTop: 18,
    marginBottom: 8,
  },
  ingredientRowForm: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  addRowBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
    marginBottom: 12,
    paddingVertical: 8,
    paddingRight: 16,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    marginTop: 0,
    gap: 0,
    marginLeft: 0,
    minWidth: 120,
  },
  addRowBtnText: {
    color: Colors.text.light,
    fontWeight: 'bold',
    marginLeft: 0,
    fontSize: 15,
    textAlign: 'center',
  },
  removeBtn: {
    marginLeft: 8,
    padding: 2,
  },
}); 