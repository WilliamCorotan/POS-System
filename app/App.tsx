import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider, DefaultTheme, ActivityIndicator } from 'react-native-paper';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { UserProvider, useUser } from './src/contexts/UserContext';
import LoginScreen from './src/screens/LoginScreen';
import ProductsScreen from './src/screens/ProductsScreen';
import CartScreen from './src/screens/CartScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import RefundScreen from './src/screens/RefundScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { StoreProvider } from './src/contexts/StoreContext';
import { colors } from './src/theme';
import ScanClerkScreen from './src/screens/ScanClerkScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Custom theme for React Native Paper
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.primary,
    accent: colors.accent,
    background: colors.background,
    surface: colors.cardBackground,
    text: colors.textPrimary,
    error: colors.error,
  },
};

function TransactionsStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="TransactionsList" 
        component={TransactionsScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="RefundScreen" 
        component={RefundScreen} 
        options={{ title: 'Process Refund' }}
      />
    </Stack.Navigator>
  );
}

function MainApp() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!user) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="ScanClerk" component={ScanClerkScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>

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
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray600,
        tabBarStyle: {
          elevation: 10,
          shadowColor: colors.shadow,
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 3,
          borderTopWidth: 0,
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: colors.primary,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: colors.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Cart" 
        component={CartScreen}
        options={{
          title: 'Shopping Cart',
        }}
      />
      <Tab.Screen 
        name="Products" 
        component={ProductsScreen}
        options={{
          title: 'Products',
        }}
      />
      <Tab.Screen 
        name="Transactions" 
        component={TransactionsStack}
        options={{
          title: 'Transactions',
        }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
    </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default function App() {
  return (
    <PaperProvider theme={theme}>
      <StatusBar style="auto" />
      <UserProvider>
        <StoreProvider>
          <MainApp />
        </StoreProvider>
      </UserProvider>
    </PaperProvider>
  );
}