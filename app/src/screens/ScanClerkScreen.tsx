import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Text, TextInput } from 'react-native-paper';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useUser } from '../contexts/UserContext';
import { colors, typography, spacing } from '../theme';
import { Button } from '../components/ui/Button';
import { Ionicons } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Login: { clerkId: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function ScanClerkScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(true);
  const { setUserId } = useUser();
  const [manualEntry, setManualEntry] = useState(false);
  const [userId, setUserIdInput] = useState('');
  const navigation = useNavigation<NavigationProp>();

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const handleBarCodeScanned = ({ data } : any) => {
    setScanning(false);
    navigation.navigate('Login', { clerkId: data });
  };

  const handleManualSubmit = () => {
    if (userId.trim()) {
      navigation.navigate('Login', { clerkId: userId.trim() });
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-outline" size={60} color={colors.error} />
        <Text style={styles.errorText}>No access to camera</Text>
        <Button
          title="Grant Permission"
          variant="primary"
          onPress={() => BarCodeScanner.requestPermissionsAsync()}
          style={styles.button}
        />
      </View>
    );
  }

  if (manualEntry) {
    return (
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Enter User ID</Text>
          <Text style={styles.subtitle}>
            Enter your user ID from the web dashboard
          </Text>
          
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="User ID"
              value={userId}
              onChangeText={setUserIdInput}
              autoCapitalize="none"
            />
          </View>
          
          <View style={styles.buttonContainer}>
            <Button
              title="Back to Scanner"
              variant="outline"
              onPress={() => setManualEntry(false)}
              style={styles.button}
            />
            <Button
              title="Continue"
              variant="primary"
              onPress={handleManualSubmit}
              disabled={!userId.trim()}
              style={styles.button}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan QR Code</Text>
        <Text style={styles.subtitle}>
          Scan the QR code from your web dashboard to connect
        </Text>
      </View>
      
      <View style={styles.scannerContainer}>
        {scanning ? (
          <>
            <View style={styles.scannerOverlay}>
              <View style={styles.scannerCorner1} />
              <View style={styles.scannerCorner2} />
              <View style={styles.scannerCorner3} />
              <View style={styles.scannerCorner4} />
            </View>
            <BarCodeScanner
              onBarCodeScanned={scanning ? handleBarCodeScanned : undefined}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.scanAnimation}>
              <LottieView
                source={require('../../assets/animations/scanner.json')}
                autoPlay
                loop
                style={styles.lottie}
              />
            </View>
          </>
        ) : (
          <View style={styles.successContainer}>
            <LottieView
              source={require('../../assets/animations/success.json')}
              autoPlay
              loop={false}
              style={styles.successAnimation}
            />
            <Text style={styles.successText}>Successfully connected!</Text>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {scanning ? (
          <Button
            title="Enter ID Manually"
            variant="outline"
            onPress={() => setManualEntry(true)}
            style={styles.button}
          />
        ) : (
          <Button
            title="Scan Again"
            variant="primary"
            onPress={() => setScanning(true)}
            style={styles.button}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  scannerContainer: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 16,
    position: 'relative',
    marginBottom: spacing.xl,
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 2,
  },
  scannerCorner1: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.white,
  },
  scannerCorner2: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.white,
  },
  scannerCorner3: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: colors.white,
  },
  scannerCorner4: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: colors.white,
  },
  scanAnimation: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  lottie: {
    width: 300,
    height: 300,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.primary + '10',
  },
  successAnimation: {
    width: 150,
    height: 150,
  },
  successText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.success,
    marginTop: spacing.md,
  },
  footer: {
    marginTop: spacing.lg,
  },
  button: {
    marginVertical: spacing.sm,
  },
  loadingText: {
    fontSize: typography.fontSize.lg,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  errorText: {
    fontSize: typography.fontSize.lg,
    color: colors.error,
    textAlign: 'center',
    marginVertical: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.xl,
    alignItems: 'center',
  },
  inputContainer: {
    width: '100%',
    marginVertical: spacing.lg,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.base,
  },
  buttonContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});