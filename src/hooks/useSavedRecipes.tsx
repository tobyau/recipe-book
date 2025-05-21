import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SAVED_KEY = 'saved_recipes';

interface SavedRecipesContextType {
  saved: string[];
  isSaved: (id: string) => boolean;
  toggleSave: (id: string) => void;
}

const SavedRecipesContext = createContext<SavedRecipesContextType>({
  saved: [],
  isSaved: () => false,
  toggleSave: () => {},
});

export const SavedRecipesProvider = ({ children }: { children: ReactNode }): JSX.Element => {
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    AsyncStorage.getItem(SAVED_KEY).then(data => {
      if (data) setSaved(JSON.parse(data));
    });
  }, []);

  const isSaved = (id: string) => saved.includes(id);

  const toggleSave = async (id: string) => {
    let updated;
    if (saved.includes(id)) {
      updated = saved.filter(rid => rid !== id);
    } else {
      updated = [...saved, id];
    }
    setSaved(updated);
    await AsyncStorage.setItem(SAVED_KEY, JSON.stringify(updated));
  };

  return (
    <SavedRecipesContext.Provider value={{ saved, isSaved, toggleSave }}>
      {children}
    </SavedRecipesContext.Provider>
  );
};

export const useSavedRecipes = () => useContext(SavedRecipesContext); 