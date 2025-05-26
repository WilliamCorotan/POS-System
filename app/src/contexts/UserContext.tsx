import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type User = {
  id: string;
  name: string;
  email: string;
  clerkId: string;
  username?: string; 
  role?: 'admin' | 'cashier' | 'manager'; 
};

type UserContextType = {
  user: User | null;
  setUser: (user: User) => Promise<void>;
  clearUser: () => Promise<void>;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('user');
      if (savedUser) {
        setUserState(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error loading user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setUser = async (newUser: User) => {
    try {
      const userWithDerivedFields = {
        ...newUser,
        username: newUser.username || newUser.email.split('@')[0],
        role: newUser.role || 'cashier',
        userId: newUser.clerkId,
      };
      
      await AsyncStorage.setItem('user', JSON.stringify(userWithDerivedFields));
      setUserState(userWithDerivedFields);
    } catch (error) {
      console.error('Error saving user:', error);
    }
  };

  const clearUser = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setUserState(null);
    } catch (error) {
      console.error('Error clearing user:', error);
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser, clearUser, isLoading }}>
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