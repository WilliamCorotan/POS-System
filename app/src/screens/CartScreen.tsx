import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import { Text, Portal, Dialog, TextInput } from "react-native-paper";
import { BarCodeScanner } from "expo-barcode-scanner";
import { useCart } from "../hooks/useCart";
import { usePaymentMethods } from "../hooks/usePaymentMethods";
import { useTransactions } from "../hooks/useTransactions";
import { CartItem } from "../types";
import { CheckoutDialog } from "../components/CheckoutDialog";
import { Scanner } from "../components/Scanner";
import { fetchPaymentMethods } from "../api/payment-methods";
import { useUser } from "../contexts/UserContext";
import { createTransaction } from "../api/transactions";
import { useProducts } from "../hooks/useProducts";
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows } from "../theme";
import { Button } from "../components/ui/Button";
import { savePendingTransaction, getPendingTransactions, removePendingTransaction, PendingTransaction } from "../utils/offlineTransactions";
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LAST_SYNC_KEY = 'last_sync_timestamp';

export default function CartScreen() {
    const { userId } = useUser();
    const {
        items,
        updateQuantity,
        removeItem,
        getTotal,
        clearCart,
        addToCart,
    } = useCart();
    const { paymentMethods, setPaymentMethods } = usePaymentMethods();
    const { addTransaction } = useTransactions();
    const { products } = useProducts();
    const [scanning, setScanning] = useState(false);
    const [checkoutVisible, setCheckoutVisible] = useState(false);
    const [manualCodeVisible, setManualCodeVisible] = useState(false);
    const [manualCode, setManualCode] = useState("");
    const [isOnline, setIsOnline] = useState(true);
    const [pendingTransactions, setPendingTransactions] = useState<PendingTransaction[]>([]);
    const [syncing, setSyncing] = useState(false);
    const [lastSyncTime, setLastSyncTime] = useState<number | null>(null);

    useEffect(() => {
        const unsubscribe = NetInfo.addEventListener(state => {
            setIsOnline(state.isConnected ?? false);
        });

        loadPendingTransactions();
        loadLastSyncTime();

        return () => {
            unsubscribe();
        };
    }, []);

    const loadLastSyncTime = async () => {
        try {
            const timestamp = await AsyncStorage.getItem(LAST_SYNC_KEY);
            setLastSyncTime(timestamp ? parseInt(timestamp) : null);
        } catch (error) {
            console.error('Error loading last sync time:', error);
        }
    };

    const updateLastSyncTime = async () => {
        try {
            const timestamp = Date.now();
            await AsyncStorage.setItem(LAST_SYNC_KEY, timestamp.toString());
            setLastSyncTime(timestamp);
        } catch (error) {
            console.error('Error updating last sync time:', error);
        }
    };

    const loadPendingTransactions = async () => {
        const pending = await getPendingTransactions();
        setPendingTransactions(pending);
    };

    const handleCheckout = async (
        paymentMethodId: number,
        cashReceived: number,
        referenceNumber?: string
    ) => {
        if (!userId) {
            alert("User ID is required");
            return;
        }

        const transaction = {
            payment_method_id: paymentMethodId,
            date_of_transaction: new Date().toISOString(),
            cash_received: cashReceived,
            total_price: getTotal(),
            status: "completed",
            items: items,
            reference_number: referenceNumber
        };

        try {
            if (isOnline) {
                await createTransaction(userId, transaction);
            } else {
                await savePendingTransaction(transaction);
                await loadPendingTransactions();
            }
            clearCart();
            setCheckoutVisible(false);
            alert("Transaction completed successfully!");
        } catch (error) {
            console.error("Error during checkout:", error);
            alert("Error during checkout. Please try again.");
        }
    };

    const handleSync = async () => {
        if (!userId) {
            alert("User ID is required");
            return;
        }

        if (!isOnline) {
            alert("No internet connection. Please try again when online.");
            return;
        }

        setSyncing(true);
        try {
            for (const pendingTx of pendingTransactions) {
                try {
                    await createTransaction(userId, pendingTx);
                    await removePendingTransaction(pendingTx.localId);
                } catch (error) {
                    console.error(`Error syncing transaction ${pendingTx.localId}:`, error);
                }
            }
            await loadPendingTransactions();
            await updateLastSyncTime();
            alert("Sync completed successfully!");
        } catch (error) {
            console.error("Error during sync:", error);
            alert("Error during sync. Please try again.");
        } finally {
            setSyncing(false);
        }
    };

    const formatLastSyncTime = () => {
        if (!lastSyncTime) return 'Never';
        const date = new Date(lastSyncTime);
        return date.toLocaleString();
    };

    const handleManualCodeSubmit = () => {
        const product = products.find((p) => p.code === manualCode);
        if (product) {
            addToCart(product, 1);
            setManualCode("");
            setManualCodeVisible(false);
        } else {
            alert("Product not found");
        }
    };

    const renderCartItem = ({ item }: { item: CartItem }) => (
        <View style={styles.cartItem}>
            <View style={styles.cartItemContent}>
                <Text style={styles.cartItemName}>{item.name}</Text>
                <Text style={styles.cartItemPrice}>PHP {item.price.toFixed(2)}</Text>
                
                <View style={styles.quantityContainer}>
                    <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                    >
                        <Ionicons 
                            name="remove" 
                            size={16} 
                            color={item.quantity <= 1 ? colors.gray400 : colors.primary} 
                        />
                    </TouchableOpacity>
                    
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    
                    <TouchableOpacity 
                        style={styles.quantityButton}
                        onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                        <Ionicons name="add" size={16} color={colors.primary} />
                    </TouchableOpacity>
                </View>
            </View>
            
            <View style={styles.cartItemActions}>
                <Text style={styles.subtotalText}>
                    PHP {(item.price * item.quantity).toFixed(2)}
                </Text>
                
                <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => removeItem(item.id)}
                >
                    <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
            </View>
        </View>
    );

    const getSettings = async () => {
        if (!userId) return;
        const paymentMethods = await fetchPaymentMethods(userId);
        setPaymentMethods(paymentMethods);
    };

    useEffect(() => {
        getSettings();
    }, []);

    if (scanning) {
        return (
            <Scanner
                onScan={() => setScanning(false)}
                onCancel={() => setScanning(false)}
            />
        );
    }

    return (
        <View style={styles.container}>
            {!isOnline && (
                <View style={styles.offlineBanner}>
                    <Ionicons name="cloud-offline-outline" size={20} color={colors.white} />
                    <Text style={styles.offlineText}>You are offline</Text>
                </View>
            )}

            {pendingTransactions.length > 0 && (
                <View style={styles.syncBanner}>
                    <View style={styles.syncInfo}>
                        <Text style={styles.syncText}>
                            {pendingTransactions.length} pending transaction{pendingTransactions.length > 1 ? 's' : ''}
                        </Text>
                        <Text style={styles.lastSyncText}>
                            Last sync: {formatLastSyncTime()}
                        </Text>
                    </View>
                    <Button
                        title={syncing ? "Syncing..." : "Sync Now"}
                        variant="primary"
                        size="small"
                        onPress={handleSync}
                        disabled={syncing || !isOnline}
                    />
                </View>
            )}

            {items.length > 0 ? (
                <>
                    <FlatList
                        data={items}
                        renderItem={renderCartItem}
                        keyExtractor={(item) => item.id.toString()}
                        contentContainerStyle={styles.cartList}
                        ListFooterComponent={() => (
                            <View style={styles.footer}>
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalLabel}>Total:</Text>
                                    <Text style={styles.totalAmount}>
                                        PHP {getTotal().toFixed(2)}
                                    </Text>
                                </View>
                                
                                <Button
                                    title="Checkout"
                                    variant="primary"
                                    size="large"
                                    fullWidth
                                    onPress={() => setCheckoutVisible(true)}
                                    style={styles.checkoutButton}
                                />
                            </View>
                        )}
                    />
                </>
            ) : (
                <View style={styles.emptyCart}>
                    <Ionicons name="cart-outline" size={80} color={colors.gray400} />
                    <Text style={styles.emptyCartText}>Your cart is empty</Text>
                    <Text style={styles.emptyCartSubtext}>
                        Scan or search for products to add them to your cart
                    </Text>
                </View>
            )}

            <View style={styles.buttonContainer}>
                <Button
                    title="Scan Product"
                    variant="primary"
                    icon={<Ionicons name="barcode-outline" size={20} color={colors.white} />}
                    onPress={() => setScanning(true)}
                    style={styles.scanButton}
                />
                <Button
                    title="Enter Code"
                    variant="outline"
                    icon={<Ionicons name="keypad-outline" size={20} color={colors.primary} />}
                    onPress={() => setManualCodeVisible(true)}
                    style={styles.codeButton}
                />
            </View>

            <CheckoutDialog
                visible={checkoutVisible}
                onDismiss={() => setCheckoutVisible(false)}
                onCheckout={handleCheckout}
                total={getTotal()}
                paymentMethods={paymentMethods}
            />

            <Portal>
                <Dialog
                    visible={manualCodeVisible}
                    onDismiss={() => setManualCodeVisible(false)}
                >
                    <Dialog.Title>Enter Product Code</Dialog.Title>
                    <Dialog.Content>
                        <TextInput
                            value={manualCode}
                            onChangeText={setManualCode}
                            mode="outlined"
                            label="Product Code"
                            autoCapitalize="none"
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button
                            title="Cancel"
                            variant="outline"
                            onPress={() => setManualCodeVisible(false)}
                        />
                        <Button
                            title="Add to Cart"
                            variant="primary"
                            onPress={handleManualCodeSubmit}
                        />
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    cartList: {
        padding: spacing.md,
        paddingBottom: 120, // Extra padding at bottom for footer
    },
    cartItem: {
        backgroundColor: colors.white,
        borderRadius: 12,
        marginBottom: spacing.md,
        padding: spacing.md,
        ...shadows.sm,
    },
    cartItemContent: {
        marginBottom: spacing.sm,
    },
    cartItemName: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.medium,
        color: colors.textPrimary,
        marginBottom: spacing.xs / 2,
    },
    cartItemPrice: {
        fontSize: typography.fontSize.base,
        color: colors.primary,
        marginBottom: spacing.sm,
    },
    quantityContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantityButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.gray100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    quantityText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        marginHorizontal: spacing.md,
        minWidth: 24,
        textAlign: 'center',
    },
    cartItemActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.gray200,
    },
    subtotalText: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.bold,
        color: colors.textPrimary,
    },
    removeButton: {
        padding: spacing.xs,
    },
    footer: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: spacing.md,
        marginTop: spacing.md,
        ...shadows.md,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
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
    checkoutButton: {
        marginTop: spacing.sm,
    },
    buttonContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        padding: spacing.md,
        backgroundColor: colors.white,
        borderTopWidth: 1,
        borderTopColor: colors.gray200,
        ...shadows.lg,
    },
    scanButton: {
        flex: 1,
        marginRight: spacing.xs,
    },
    codeButton: {
        flex: 1,
        marginLeft: spacing.xs,
    },
    emptyCart: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    emptyCartText: {
        fontSize: typography.fontSize.xl,
        fontFamily: typography.fontFamily.medium,
        color: colors.textPrimary,
        marginTop: spacing.lg,
        marginBottom: spacing.sm,
    },
    emptyCartSubtext: {
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    offlineBanner: {
        backgroundColor: colors.error,
        padding: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: spacing.xs,
    },
    offlineText: {
        color: colors.white,
        fontFamily: typography.fontFamily.medium,
    },
    syncBanner: {
        backgroundColor: colors.warning,
        padding: spacing.sm,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    syncInfo: {
        flex: 1,
    },
    syncText: {
        color: colors.textPrimary,
        fontFamily: typography.fontFamily.medium,
    },
    lastSyncText: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginTop: spacing.xs / 2,
    },
});