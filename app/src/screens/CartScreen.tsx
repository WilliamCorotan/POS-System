import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet } from "react-native";
import {
    Card,
    Title,
    Paragraph,
    Button,
    Portal,
    Dialog,
    TextInput,
} from "react-native-paper";
import { BarCodeScanner } from "expo-barcode-scanner";
import { useCart } from "../hooks/useCart";
import { usePaymentMethods } from "../hooks/usePaymentMethods";
import { useTransactions } from "../hooks/useTransactions";
import { CartItem } from "../types";
import { CartItemComponent } from "../components/CartItemComponent";
import { CheckoutDialog } from "../components/CheckoutDialog";
import { Scanner } from "../components/Scanner";
import { fetchPaymentMethods } from "../api/payment-methods";
import { useUser } from "../contexts/UserContext";
import { createTransaction } from "../api/transactions";
import { useProducts } from "../hooks/useProducts";

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

    console.log("payment", paymentMethods);

    const handleCheckout = async (
        paymentMethodId: number,
        cashReceived: number
    ) => {
        const transaction = {
            payment_method_id: paymentMethodId,
            date_of_transaction: new Date().toISOString(),
            cash_received: cashReceived,
            total_price: getTotal(),
            status: "completed",
            items: items,
        };

        console.log("data >>", transaction);

        await createTransaction(userId, transaction);
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
            // You might want to show an error message here
            alert("Product not found");
        }
    };

    const renderCartItem = ({ item }: { item: CartItem }) => (
        <CartItemComponent
            item={item}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
        />
    );

    const getSettings = async () => {
        const paymentMethods = await fetchPaymentMethods(userId);
        console.log("check>>", paymentMethods);
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
            <FlatList
                data={items}
                renderItem={renderCartItem}
                keyExtractor={(item) => item.id.toString()}
                ListFooterComponent={() => (
                    <View style={styles.footer}>
                        <Title>Total: PHP {getTotal().toFixed(2)}</Title>
                        <Button
                            mode="contained"
                            onPress={() => setCheckoutVisible(true)}
                            disabled={items.length === 0}
                        >
                            Checkout
                        </Button>
                    </View>
                )}
            />

            <View style={styles.buttonContainer}>
                <Button
                    icon="barcode-scan"
                    mode="contained"
                    onPress={() => setScanning(true)}
                    style={styles.button}
                >
                    Scan Product
                </Button>
                <Button
                    icon="keyboard"
                    mode="contained"
                    onPress={() => setManualCodeVisible(true)}
                    style={styles.button}
                >
                    Enter Code
                </Button>
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
                            label="Product Code"
                            value={manualCode}
                            onChangeText={setManualCode}
                            autoCapitalize="none"
                        />
                    </Dialog.Content>
                    <Dialog.Actions>
                        <Button onPress={() => setManualCodeVisible(false)}>
                            Cancel
                        </Button>
                        <Button onPress={handleManualCodeSubmit}>Add</Button>
                    </Dialog.Actions>
                </Dialog>
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
    },
    footer: {
        padding: 16,
        backgroundColor: "white",
        elevation: 4,
    },
    scanButton: {
        position: "absolute",
        bottom: 16,
        right: 16,
        borderRadius: 28,
    },
    buttonContainer: {
        flexDirection: "row",
        justifyContent: "space-around",
        padding: 16,
    },
    button: {
        flex: 1,
        marginHorizontal: 8,
    },
});
