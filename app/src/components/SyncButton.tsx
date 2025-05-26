import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { Button, Snackbar } from 'react-native-paper';
import { offlineService } from '../services/offlineService';
import { useUser } from '../contexts/UserContext';
import { createTransaction } from '../api/transactions';
import { createRefund } from '../api/refunds';

export const SyncButton = () => {
  const [syncing, setSyncing] = useState(false);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const { user } = useUser();

  const handleSync = async () => {
    if (!user) {
      setSnackbarMessage('User not authenticated');
      setSnackbarVisible(true);
      return;
    }

    setSyncing(true);
    try {
      const queue = await offlineService.getQueue();
      let successCount = 0;
      let errorCount = 0;

      for (const item of queue) {
        try {
          if (item.type === 'transaction') {
            await createTransaction(user.clerkId, item.data);
          } else if (item.type === 'refund') {
            await createRefund(user.clerkId, item.data);
          }
          successCount++;
        } catch (error) {
          console.error(`Error syncing item:`, error);
          errorCount++;
        }
      }

      if (successCount > 0) {
        await offlineService.clearQueue();
        setSnackbarMessage(`Successfully synced ${successCount} items${errorCount > 0 ? `, ${errorCount} failed` : ''}`);
      } else {
        setSnackbarMessage('No items to sync');
      }
    } catch (error) {
      console.error('Error during sync:', error);
      setSnackbarMessage('Error during sync');
    } finally {
      setSyncing(false);
      setSnackbarVisible(true);
    }
  };

  return (
    <>
      <Button
        mode="contained"
        onPress={handleSync}
        loading={syncing}
        disabled={syncing}
        style={styles.button}
      >
        {syncing ? 'Syncing...' : 'Sync Offline Data'}
      </Button>
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
      >
        {snackbarMessage}
      </Snackbar>
    </>
  );
};

const styles = StyleSheet.create({
  button: {
    marginVertical: 8,
  },
}); 