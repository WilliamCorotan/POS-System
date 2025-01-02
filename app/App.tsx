import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import { UserProvider, useUser } from './src/contexts/UserContext';
import ScanClerkScreen from './src/screens/ScanClerkScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import CartScreen from './src/screens/CartScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { StoreProvider } from './src/contexts/StoreContext';

const Tab = createBottomTabNavigator();

function MainApp() {
  const { userId } = useUser();

  if (!userId) {
    return <ScanClerkScreen />;
  }

  return (
    <Tab.Navigator
      initialRouteName="Cart"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Products') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Cart') {
            iconName = focused ? 'cart' : 'cart-outline';
          } else if (route.name === 'Transactions') {
            iconName = focused ? 'receipt' : 'receipt-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Cart" component={CartScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <UserProvider>
        <StoreProvider>
            <NavigationContainer>
                <MainApp />
            </NavigationContainer>
        </StoreProvider>
      </UserProvider>
    </PaperProvider>
  );
}