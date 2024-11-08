import React, { createContext, useContext, useEffect, useState } from 'react';
import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { tokenCache, getOfflineUser, saveUserToStorage, clearOfflineUser } from '../auth/clerk';

const CLERK_PUBLISHABLE_KEY = 'your_publishable_key';

type AuthContextType = {
  isAuthenticated: boolean;
  isOffline: boolean;
  user: any;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isOffline: false,
  user: null,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY} tokenCache={tokenCache}>
      <AuthProviderContent>{children}</AuthProviderContent>
    </ClerkProvider>
  );
};

const AuthProviderContent = ({ children }: { children: React.ReactNode }) => {
  const { isLoaded, isSignedIn, user, signOut: clerkSignOut } = useAuth();
  const [isOffline, setIsOffline] = useState(false);
  const [offlineUser, setOfflineUser] = useState<any>(null);

  useEffect(() => {
    if (isSignedIn && user) {
      saveUserToStorage(user);
    }
  }, [isSignedIn, user]);

  useEffect(() => {
    const checkOfflineUser = async () => {
      const storedUser = await getOfflineUser();
      if (storedUser) {
        setOfflineUser(storedUser);
      }
    };
    checkOfflineUser();
  }, []);

  const signOut = async () => {
    try {
      await clerkSignOut();
      await clearOfflineUser();
      setOfflineUser(null);
      setIsOffline(false);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    isAuthenticated: isSignedIn || !!offlineUser,
    isOffline,
    user: isSignedIn ? user : offlineUser,
    signOut,
  };

  if (!isLoaded) {
    return null;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => useContext(AuthContext);