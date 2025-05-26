import React, { useState, useEffect, } from "react";
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from "react-native";
import { Text, Portal } from "react-native-paper";
import { Transaction } from "../types";
import { fetchTransactions } from "../api/transactions";
import { useUser } from "../contexts/UserContext";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { StatusBadge } from "../components/ui/StatusBadge";
import { TransactionModal } from "../components/TransactionModal";
import { colors, spacing, typography, shadows } from "../theme";
import { SyncButton } from "../components/SyncButton";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RequireAuth } from "../components/auth/RequireAuth";

type RootStackParamList = {
    RefundScreen: { transactionId: number };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function TransactionsScreen() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const { user } = useUser();
    const navigation = useNavigation<NavigationProp>();


    useEffect(() => {
        if (user) {
            loadTransactions();
        }
    }, [user]);

    const loadTransactions = async () => {
        if (!user) return;
        try {
            const transactionsData = await fetchTransactions(user.clerkId);
            setTransactions(transactionsData);
        } catch (error) {
            console.error("Error loading transactions:", error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadTransactions();
        setRefreshing(false);
    };

    const handleRefund = (transactionId: number) => {
        navigation.navigate('RefundScreen', { transactionId });
    };

    const handleTransactionPress = (transaction: Transaction) => {
        setSelectedTransaction(transaction);
        setModalVisible(true);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderTransaction = ({ item }: { item: Transaction }) => (
        <TouchableOpacity 
            style={styles.cardContainer}
            onPress={() => handleTransactionPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.idContainer}>
                        <Ionicons name="receipt-outline" size={20} color={colors.primary} />
                        <Text style={styles.idText}>#{item.id}</Text>
                    </View>
                    <StatusBadge status={item.status} />
                </View>
                
                <View style={styles.cardContent}>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={16} color={colors.gray600} />
                        <Text style={styles.infoText}>
                            {formatDate(item.dateOfTransaction)}
                        </Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <Ionicons name="card-outline" size={16} color={colors.gray600} />
                        <Text style={styles.infoText}>
                            {item.paymentMethodName || "Cash"}
                        </Text>
                    </View>
                    
                    {item.paymentMethodName?.toLowerCase() === 'gcash' && item.referenceNumber && (
                        <View style={styles.infoRow}>
                            <Ionicons name="document-text-outline" size={16} color={colors.gray600} />
                            <Text style={styles.infoText}>
                                Ref: {item.referenceNumber}
                            </Text>
                        </View>
                    )}
                    
                    <View style={styles.totalContainer}>
                        <Text style={styles.totalLabel}>Total:</Text>
                        <Text style={styles.totalAmount}>
                            PHP {(Number(item.totalPrice) - Number(item.totalRefund)).toFixed(2)}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <RequireAuth fallbackMessage="Please sign in to view transactions">
            <View style={styles.container}>
                <SyncButton />
                <FlatList
                    data={transactions}
                    renderItem={renderTransaction}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={handleRefresh}
                            tintColor={colors.primary}
                            colors={[colors.primary]}
                        />
                    }
                />

                <Portal>
                <TransactionModal
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    transaction={selectedTransaction}
                    onRefund={handleRefund}
                />
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
    listContent: {
        padding: spacing.screen.padding,
    },
    cardContainer: {
        marginBottom: spacing.md,
    },
    card: {
        backgroundColor: colors.cardBackground,
        borderRadius: 12,
        ...shadows.md,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: colors.gray200,
    },
    idContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    idText: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.medium,
        marginLeft: spacing.xs,
        color: colors.textPrimary,
    },
    cardContent: {
        padding: spacing.md,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    infoText: {
        marginLeft: spacing.sm,
        fontSize: typography.fontSize.base,
        color: colors.textSecondary,
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.gray200,
    },
    totalLabel: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.textPrimary,
    },
    totalAmount: {
        fontSize: typography.fontSize.lg,
        fontFamily: typography.fontFamily.bold,
        color: colors.primary,
    },
});