import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Modal, Portal, Text } from 'react-native-paper';
import { Image } from 'expo-image';
import { Product } from '../types';
import { colors, typography, spacing, shadows } from '../theme';
import { Button } from './ui/Button';
import { Ionicons } from '@expo/vector-icons';

interface ProductModalProps {
  visible: boolean;
  onDismiss: () => void;
  product: Product | null;
}

export function ProductModal({ visible, onDismiss, product }: ProductModalProps) {
  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock <= (product.lowStockLevel || 0);
  
  const getStockStatusColor = () => {
    if (isOutOfStock) return colors.error;
    if (isLowStock) return colors.warning;
    return colors.success;
  };

  const getStockStatusText = () => {
    if (isOutOfStock) return 'Out of Stock';
    if (isLowStock) return 'Low Stock';
    return 'In Stock';
  };

  const getRandomColor = (id: number) => {
    const colors = [
      '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
      '#9b59b6', '#1abc9c', '#d35400', '#34495e'
    ];
    return colors[id % colors.length];
  };

  return (
    <Portal>
      <Modal 
        visible={visible} 
        onDismiss={onDismiss} 
        contentContainerStyle={styles.container}
      >
        <ScrollView style={styles.scrollView} bounces={false}>
          <View style={styles.header}>
            {product.imageUrl ? (
              <Image
                source={product.imageUrl}
                style={styles.productImage}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={[
                styles.productImagePlaceholder,
                { backgroundColor: getRandomColor(product.id) }
              ]}>
                <Text style={styles.productInitial}>
                  {product.name.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <Button
              title=""
              variant="ghost"
              icon={<Ionicons name="close" size={24} color={colors.white} />}
              onPress={onDismiss}
              style={styles.closeButton}
            />
          </View>
          
          <View style={styles.content}>
            <Text style={styles.productName}>{product.name}</Text>
            
            <View style={styles.codeContainer}>
              <Ionicons name="barcode-outline" size={20} color={colors.gray600} />
              <Text style={styles.codeText}>{product.code}</Text>
            </View>
            
            <View style={styles.priceContainer}>
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Buy Price</Text>
                <Text style={styles.buyPrice}>PHP {product.buyPrice.toFixed(2)}</Text>
              </View>
              
              <View style={styles.priceItem}>
                <Text style={styles.priceLabel}>Sell Price</Text>
                <Text style={styles.sellPrice}>PHP {product.sellPrice.toFixed(2)}</Text>
              </View>
            </View>
            
            <View style={styles.stockContainer}>
              <View style={styles.stockInfo}>
                <Text style={styles.stockLabel}>Current Stock</Text>
                <Text style={styles.stockValue}>{product.stock}</Text>
              </View>
              
              <View style={[styles.stockStatus, { backgroundColor: getStockStatusColor() + '20' }]}>
                <Ionicons 
                  name={isOutOfStock ? "alert-circle" : "checkmark-circle"} 
                  size={16} 
                  color={getStockStatusColor()} 
                />
                <Text style={[styles.stockStatusText, { color: getStockStatusColor() }]}>
                  {getStockStatusText()}
                </Text>
              </View>
            </View>
            
            {product.lowStockLevel !== undefined && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Low Stock Alert</Text>
                <Text style={styles.infoValue}>{product.lowStockLevel}</Text>
              </View>
            )}
            
            {product.expirationDate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Expiration Date</Text>
                <Text style={styles.infoValue}>
                  {new Date(product.expirationDate).toLocaleDateString()}
                </Text>
              </View>
            )}
            
            {product.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionLabel}>Description</Text>
                <Text style={styles.descriptionText}>{product.description}</Text>
              </View>
            )}
          </View>
        </ScrollView>
        
        <View style={styles.footer}>
          <Button
            title="Close"
            variant="outline"
            onPress={onDismiss}
            fullWidth
          />
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    margin: spacing.md,
    maxHeight: '80%',
    ...shadows.lg,
  },
  scrollView: {
    flexGrow: 0,
  },
  header: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productInitial: {
    fontSize: 60,
    fontWeight: 'bold',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  closeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
  content: {
    padding: spacing.lg,
  },
  productName: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  codeText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginLeft: spacing.xs,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
    backgroundColor: colors.gray100,
    borderRadius: 8,
    padding: spacing.md,
  },
  priceItem: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  buyPrice: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  sellPrice: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  stockContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  stockInfo: {
    alignItems: 'flex-start',
  },
  stockLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  stockValue: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
  },
  stockStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  stockStatusText: {
    fontSize: typography.fontSize.sm,
    fontFamily: typography.fontFamily.medium,
    marginLeft: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  infoLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  descriptionContainer: {
    marginTop: spacing.lg,
  },
  descriptionLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  descriptionText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
  },
  footer: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
  },
});