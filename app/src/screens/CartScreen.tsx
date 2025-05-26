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
import { RequireAuth } from "../components/auth/RequireAuth";

export default function CartScreen() {
    const { user } = useUser();
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

    const handleCheckout = async (
        paymentMethodId: number,
        cashReceived: number,
        referenceNumber?: string
    ) => {
        if (!user) return;

        const transaction = {
            payment_method_id: paymentMethodId,
            date_of_transaction: new Date().toISOString(),
            cash_received: cashReceived,
            total_price: getTotal(),
            status: "completed",
            items: items,
            reference_number: referenceNumber,
            user_id: user.id
        };

        await createTransaction(user.id, transaction);
        await clearCart();
        setCheckoutVisible(false);
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
        if (!user) return;
        const paymentMethods = await fetchPaymentMethods(user.id);
        setPaymentMethods(paymentMethods);
    };

    useEffect(() => {
        getSettings();
    }, [user]);

    if (scanning) {
        return (
            <Scanner
                onScan={() => setScanning(false)}
                onCancel={() => setScanning(false)}
            />
        );
    }

    return (
        <RequireAuth fallbackMessage="Please sign in to manage your cart">
            <View style={styles.container}>
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
        </RequireAuth>
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
});