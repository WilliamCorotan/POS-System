import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { ActivityIndicator, View } from 'react-native';

import ProductsScreen from './src/screens/ProductsScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import EditProductScreen from './src/screens/EditProductScreen';
import CartScreen from './src/screens/CartScreen';
import TransactionsScreen from './src/screens/TransactionsScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import PaymentMethodsScreen from './src/screens/PaymentMethodsScreen';
import AddPaymentMethodScreen from './src/screens/AddPaymentMethodScreen';
import EditPaymentMethodScreen from './src/screens/EditPaymentMethodScreen';
import { initializeDatabase } from './src/db';
import { seedDatabase } from './src/db/seeders';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ProductsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ProductsList" component={ProductsScreen} options={{ title: 'Products' }} />
      <Stack.Screen name="AddProduct" component={AddProductScreen} options={{ title: 'Add Product' }} />
      <Stack.Screen name="EditProduct" component={EditProductScreen} options={{ title: 'Edit Product' }} />
    </Stack.Navigator>
  );
}

function SettingsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SettingsList" component={SettingsScreen} options={{ title: 'Settings' }} />
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ title: 'Payment Methods' }} />
      <Stack.Screen name="AddPaymentMethod" component={AddPaymentMethodScreen} options={{ title: 'Add Payment Method' }} />
      <Stack.Screen name="EditPaymentMethod" component={EditPaymentMethodScreen} options={{ title: 'Edit Payment Method' }} />
    </Stack.Navigator>
  );
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const setup = async () => {
      try {
        await initializeDatabase();
        await seedDatabase();
      } catch (error) {
        console.error('Database setup error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    setup();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <PaperProvider>
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
          })}
        >
          <Tab.Screen name="Cart" component={CartScreen} />
          <Tab.Screen 
            name="Products" 
            component={ProductsStack} 
            options={{ headerShown: false }}
          />
          <Tab.Screen name="Transactions" component={TransactionsScreen} />
          <Tab.Screen 
            name="Settings" 
            component={SettingsStack}
            options={{ headerShown: false }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}