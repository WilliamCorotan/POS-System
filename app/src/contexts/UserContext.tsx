import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type UserContextType = {
  userId: string | null;
  setUserId: (id: string) => Promise<void>;
  clearUserId: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserIdState] = useState<string | null>(null);

  useEffect(() => {
    loadUserId();
  }, []);

  const loadUserId = async () => {
    try {
      const savedUserId = await AsyncStorage.getItem('userId');
      if (savedUserId) {
        setUserIdState(savedUserId);
      }
    } catch (error) {
      console.error('Error loading user ID:', error);
    }
  };

  const setUserId = async (id: string) => {
    try {
      await AsyncStorage.setItem('userId', id);
      setUserIdState(id);
    } catch (error) {
      console.error('Error saving user ID:', error);
    }
  };

  const clearUserId = async () => {
    try {
      await AsyncStorage.removeItem('userId');
      setUserIdState(null);
    } catch (error) {
      console.error('Error clearing user ID:', error);
    }
  };

  return (
    <UserContext.Provider value={{ userId, setUserId, clearUserId }}>
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};