import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import { updatePaymentMethod } from '../database';
import { PaymentMethod } from '../types';

export default function EditPaymentMethodScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const paymentMethod = route.params?.paymentMethod as PaymentMethod;
  const [name, setName] = useState(paymentMethod.name);

  const handleSubmit = async () => {
    if (name.trim()) {
      await updatePaymentMethod(paymentMethod.id, name.trim());
      navigation.goBack();
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        label="Payment Method Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <View style={styles.buttonContainer}>
        <Button mode="contained" onPress={handleSubmit} style={styles.button}>
          Save
        </Button>
        <Button mode="outlined" onPress={() => navigation.goBack()} style={styles.button}>
          Cancel
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
});