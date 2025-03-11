import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, RefreshControl } from "react-native";
import { Card, Title, Paragraph, Button } from "react-native-paper";
import { Transaction } from "../types";
import { fetchTransactions } from "../api/transactions";
import { useUser } from "../contexts/UserContext";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from '@expo/vector-icons';
import { StatusBadge } from "../components/ui/StatusBadge";
import { colors, spacing, typography, shadows } from "../theme";

export default function TransactionsScreen() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const { userId } = useUser();
    const navigation = useNavigation();

    useEffect(() => {
        loadTransactions();
    }, []);

    const loadTransactions = async () => {
        try {
            const transactionsData = await fetchTransactions(userId);
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
        <View style={styles.cardContainer}>
            <View style={styles.card}>
                <View style={styles.cardHeader}>
                    <View style={styles.idContainer}>
                        <Ionicons name="receipt-outline" size={20} color={colors.primary} />
                        <Title style={styles.idText}>#{item.id}</Title>
                    </View>
                    <StatusBadge status={item.status} />
                </View>
                
                <View style={styles.cardContent}>
                    <View style={styles.infoRow}>
                        <Ionicons name="calendar-outline" size={16} color={colors.gray600} />
                        <Paragraph style={styles.infoText}>
                            {formatDate(item.dateOfTransaction)}
                        </Paragraph>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <Ionicons name="card-outline" size={16} color={colors.gray600} />
                        <Paragraph style={styles.infoText}>
                            {item.paymentMethodName || "Cash"}
                        </Paragraph>
                    </View>
                    
                    {/* Show reference number for GCash transactions */}
                    {item.paymentMethodName?.toLowerCase() === 'gcash' && item.referenceNumber && (
                        <View style={styles.infoRow}>
                            <Ionicons name="document-text-outline" size={16} color={colors.gray600} />
                            <Paragraph style={styles.infoText}>
                                Ref: {item.referenceNumber}
                            </Paragraph>
                        </View>
                    )}
                    
                    <View style={styles.totalContainer}>
                        <Paragraph style={styles.totalLabel}>Total:</Paragraph>
                        <Paragraph style={styles.totalAmount}>
                            PHP {Number(item.totalPrice).toFixed(2)}
                        </Paragraph>
                    </View>
                </View>
                
                {(item.status === "completed" || item.status === "partially_refunded") && (
                    <View style={styles.cardActions}>
                        <Button
                            mode="contained"
                            onPress={() => handleRefund(item.id)}
                            style={styles.refundButton}
                            icon="cash-refund"
                        >
                            Refund
                        </Button>
                    </View>
                )}
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
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
        </View>
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
    cardActions: {
        padding: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.gray200,
    },
    refundButton: {
        backgroundColor: colors.error,
    },
});