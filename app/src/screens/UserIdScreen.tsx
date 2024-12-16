import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useUser } from '../contexts/UserContext';

export default function UserIdScreen() {
  const [inputUserId, setInputUserId] = useState('');
  const { setUserId } = useUser();

  const handleSubmit = async () => {
    if (inputUserId.trim()) {
      await setUserId(inputUserId.trim());
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter User ID</Text>
      <TextInput
        label="User ID"
        value={inputUserId}
        onChangeText={setInputUserId}
        style={styles.input}
        autoCapitalize="none"
      />
      <Button 
        mode="contained" 
        onPress={handleSubmit}
        disabled={!inputUserId.trim()}
        style={styles.button}
      >
        Continue
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});