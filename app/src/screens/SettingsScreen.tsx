import React from 'react';
import { View, StyleSheet } from 'react-native';
import { List, Button } from 'react-native-paper';
import { useUser } from '../contexts/UserContext';

export default function SettingsScreen() {
  const { userId, clearUserId } = useUser();

  return (
    <View style={styles.container}>
      <List.Section>
        <List.Subheader>Account</List.Subheader>
        <List.Item
          title="User ID"
          description={userId}
        />
        <Button 
          mode="contained" 
          onPress={clearUserId}
          style={styles.button}
        >
          Sign Out
        </Button>
      </List.Section>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  button: {
    margin: 16,
  },
});