import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Animated, Easing } from 'react-native';
import { Text } from 'react-native-paper';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { colors, typography, spacing } from '../theme';
import { Button } from './ui/Button';
import { Ionicons } from '@expo/vector-icons';

interface ScannerProps {
  onScan: () => void;
  onCancel: () => void;
}

export function Scanner({ onScan, onCancel }: ScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const { products } = useProducts();
  const { addToCart } = useCart();
  const [lastScan, setLastScan] = useState<number>(0);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [scanSuccess, setScanSuccess] = useState<boolean | null>(null);
  const SCAN_DELAY = 2000; // 2 seconds delay between scans
  
  // Animation for scan line
  const scanLineAnimation = new Animated.Value(0);
  
  useEffect(() => {
    const getBarCodeScannerPermissions = async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getBarCodeScannerPermissions();
    
    // Start the scan line animation
    Animated.loop(
      Animated.timing(scanLineAnimation, {
        toValue: 1,
        duration: 2000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    const now = Date.now();
    if (now - lastScan < SCAN_DELAY) {
      return;
    }
    setLastScan(now);
    setScanResult(data);

    const product = products.find(p => p.code === data);
    if (product) {
      setScanSuccess(true);
      
      // Add a small delay to show success state before closing
      setTimeout(() => {
        try {
          addToCart(product, 1);
          onScan();
        } catch (error) {
          setScanSuccess(false);
        }
      }, 800);
    } else {
      setScanSuccess(false);
      
      // Reset after showing error
      setTimeout(() => {
        setScanResult(null);
        setScanSuccess(null);
      }, 2000);
    }
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-off-outline" size={60} color={colors.error} />
        <Text style={styles.permissionText}>No access to camera</Text>
        <Button 
          title="Grant Permission"
          variant="primary"
          onPress={() => BarCodeScanner.requestPermissionsAsync()}
          style={styles.permissionButton}
        />
      </View>
    );
  }

  const translateY = scanLineAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 300], // Adjust based on your scanner frame height
  });

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Scan Product Barcode</Text>
      </View>
      
      <View style={styles.scannerContainer}>
        <BarCodeScanner
          onBarCodeScanned={scanResult ? undefined : handleBarCodeScanned}
          style={StyleSheet.absoluteFillObject}
        />
        
        {/* Scanner frame overlay */}
        <View style={styles.scannerOverlay}>
          <View style={styles.scannerFrame}>
            {/* Scan line animation */}
            {!scanResult && (
              <Animated.View 
                style={[
                  styles.scanLine,
                  { transform: [{ translateY }] }
                ]}
              />
            )}
            
            {/* Corner markers */}
            <View style={[styles.cornerMarker, styles.topLeftMarker]} />
            <View style={[styles.cornerMarker, styles.topRightMarker]} />
            <View style={[styles.cornerMarker, styles.bottomLeftMarker]} />
            <View style={[styles.cornerMarker, styles.bottomRightMarker]} />
            
            {/* Scan result indicator */}
            {scanResult && (
              <View style={[
                styles.resultIndicator,
                scanSuccess === true ? styles.successIndicator : 
                scanSuccess === false ? styles.errorIndicator : null
              ]}>
                {scanSuccess === true && (
                  <Ionicons name="checkmark-circle" size={60} color={colors.white} />
                )}
                {scanSuccess === false && (
                  <Ionicons name="close-circle" size={60} color={colors.white} />
                )}
                <Text style={styles.resultText}>
                  {scanSuccess === true ? 'Product found!' : 
                   scanSuccess === false ? 'Product not found' : ''}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.instructionText}>
          Position the barcode within the frame to scan
        </Text>
        <Button 
          title="Cancel"
          variant="outline"
          onPress={onCancel}
          style={styles.cancelButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.black,
  },
  header: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  headerText: {
    color: colors.white,
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
  },
  scannerContainer: {
    flex: 1,
    position: 'relative',
  },
  scannerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scannerFrame: {
    width: 280,
    height: 280,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  scanLine: {
    height: 2,
    width: '100%',
    backgroundColor: colors.primary,
  },
  cornerMarker: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: colors.white,
  },
  topLeftMarker: {
    top: 0,
    left: 0,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  topRightMarker: {
    top: 0,
    right: 0,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  bottomLeftMarker: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  bottomRightMarker: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  resultIndicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  successIndicator: {
    backgroundColor: 'rgba(46, 204, 113, 0.7)',
  },
  errorIndicator: {
    backgroundColor: 'rgba(231, 76, 60, 0.7)',
  },
  resultText: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    marginTop: spacing.sm,
  },
  footer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  instructionText: {
    color: colors.white,
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  cancelButton: {
    width: '100%',
    borderColor: colors.white,
  },
  permissionText: {
    color: colors.white,
    fontSize: typography.fontSize.lg,
    textAlign: 'center',
    marginVertical: spacing.lg,
  },
  permissionButton: {
    marginTop: spacing.md,
  },
});