import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Modal, Portal, Text } from 'react-native-paper';
import { Transaction } from '../types';
import { colors, typography, spacing, shadows } from '../theme';
import { Button } from './ui/Button';
import { StatusBadge } from './ui/StatusBadge';
import { Ionicons } from '@expo/vector-icons';

interface TransactionModalProps {
  visible: boolean;
  onDismiss: () => void;
  transaction: Transaction | null;
  onRefund?: (transactionId: number) => void;
}

export function TransactionModal({ 
  visible, 
  onDismiss, 
  transaction,
  onRefund 
}: TransactionModalProps) {
  if (!transaction) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const items = transaction.items ? JSON.parse(transaction.items) : [];

  return (
    <Portal>
      <Modal 
        visible={visible} 
        onDismiss={onDismiss} 
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <View style={styles.headerContent}>
              <View style={styles.idContainer}>
                <Ionicons name="receipt-outline" size={24} color={colors.primary} />
                <Text style={styles.transactionId}>#{transaction.id}</Text>
              </View>
              <StatusBadge status={transaction.status} size="medium" />
            </View>
            <Button
              title=""
              variant="ghost"
              icon={<Ionicons name="close" size={24} color={colors.textPrimary} />}
              onPress={onDismiss}
              style={styles.closeButton}
            />
          </View>

          <ScrollView 
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Transaction Details</Text>
              <View style={styles.detailsCard}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Date</Text>
                  <Text style={styles.detailValue}>
                    {formatDate(transaction.dateOfTransaction)}
                  </Text>
                </View>
                
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Payment Method</Text>
                  <Text style={styles.detailValue}>
                    {transaction.paymentMethodName || "Cash"}
                  </Text>
                </View>

                {transaction.paymentMethodName?.toLowerCase() === 'gcash' && 
                 transaction.referenceNumber && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Reference Number</Text>
                    <Text style={styles.detailValue}>{transaction.referenceNumber}</Text>
                  </View>
                )}

                {transaction.cashReceived && (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Cash Received</Text>
                      <Text style={styles.detailValue}>
                        PHP {transaction.cashReceived.toFixed(2)}
                      </Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Change</Text>
                      <Text style={styles.detailValue}>
                        PHP {(transaction.cashReceived - (transaction.totalPrice || 0)).toFixed(2)}
                      </Text>
                    </View>
                  </>
                )}

                {transaction.totalPrice > 0 && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Total Price</Text>
                    <Text style={styles.detailValue}>
                      PHP {transaction.totalPrice.toFixed(2) - transaction.totalRefund.toFixed(2)}
                    </Text>
                  </View>
                )}

                {transaction.refundReasons && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Refund Reasons</Text>
                    <Text style={[styles.detailValue, styles.reasonText]}>
                      {transaction.refundReasons}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {items.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Items</Text>
                <View style={styles.itemsCard}>
                  {items.map((item: any, index: number) => (
                    <View 
                      key={`${item.id}-${index}`} 
                      style={[
                        styles.itemRow,
                        index < items.length - 1 && styles.itemBorder
                      ]}
                    >
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>{item.productName}</Text>
                        <Text style={styles.itemPrice}>
                          PHP {item.productSellPrice.toFixed(2)} × {item.quantity}
                        </Text>
                      </View>
                      <Text style={styles.itemTotal}>
                        PHP {(item.productSellPrice * item.quantity).toFixed(2)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={styles.totalSection}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>
                PHP {(transaction.totalPrice || 0).toFixed(2)}
              </Text>
            </View>

            {transaction.totalRefund > 0 && (
              <View style={[styles.totalSection, styles.refundSection]}>
                <Text style={styles.totalLabel}>Total Refund</Text>
                <Text style={[styles.totalAmount, styles.refundAmount]}>
                  PHP {transaction.totalRefund.toFixed(2)}
                </Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            {(transaction.status === "completed" || 
              transaction.status === "partially_refunded") && (
              <Button
                title="Process Refund"
                variant="outline"
                icon={<Ionicons name="refresh-outline" size={20} color={colors.error} />}
                onPress={() => {
                  onDismiss();
                  onRefund?.(transaction.id);
                }}
                style={styles.refundButton}
                textStyle={{ color: colors.error }}
              />
            )}
            <Button
              title="Close"
              variant="primary"
              onPress={onDismiss}
              style={styles.closeCtaButton}
            />
          </View>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    margin: spacing.md,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: 16,
    maxHeight: '90%',
    ...shadows.lg,
  },
  header: {
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
    flexGrow: 1,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  transactionId: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.textPrimary,
    marginLeft: spacing.sm,
  },
  content: {
    flexGrow: 0,
  },
  section: {
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  detailsCard: {
    backgroundColor: colors.gray50,
    borderRadius: 12,
    padding: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  detailLabel: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    flex: 1,
  },
  detailValue: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    flex: 2,
    textAlign: 'right',
  },
  reasonText: {
    color: colors.error,
  },
  itemsCard: {
    backgroundColor: colors.gray50,
    borderRadius: 12,
    padding: spacing.md,
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  itemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gray200,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
    marginBottom: spacing.xs / 2,
  },
  itemPrice: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  itemTotal: {
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
    marginLeft: spacing.md,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.primary + '10',
  },
  refundSection: {
    backgroundColor: colors.error + '10',
  },
  totalLabel: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.medium,
    color: colors.textPrimary,
  },
  totalAmount: {
    fontSize: typography.fontSize.xl,
    fontFamily: typography.fontFamily.bold,
    color: colors.primary,
  },
  refundAmount: {
    color: colors.error,
  },
  footer: {
    flexDirection: 'row',
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    gap: spacing.sm,
  },
  refundButton: {
    borderColor: colors.error,
  },
  closeCtaButton: {
    flex: 1,
    borderColor: colors.error,
  },
  closeButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
  },
});