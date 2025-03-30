import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from "react-native";
import { Searchbar, Card, Title, Paragraph, Button, Snackbar, Text } from "react-native-paper";
import { Product } from "../types";
import { fetchProducts } from "../api/products";
import { useUser } from "../contexts/UserContext";
import { useProducts } from "../hooks/useProducts";
import { useCart } from "../hooks/useCart";
import { ProductModal } from "../components/ProductModal";
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows } from "../theme";

export default function ProductsScreen() {
    const { userId } = useUser();
    const [searchQuery, setSearchQuery] = useState("");
    const { products, setProducts } = useProducts();
    const [refreshing, setRefreshing] = useState(false);
    const [snackBarVisible, setSnackBarVisible] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const { addToCart } = useCart();

    useEffect(() => {
        loadProducts();
    }, []);

    const loadProducts = async () => {
        try {
            if (userId === null) {
                throw new Error("No User ID.");
            }
            const productsData = await fetchProducts(userId);
            setProducts(productsData);
        } catch (error) {
            setErrorMessage("Failed to load products");
            setSnackBarVisible(true);
        }
    };

    const filteredProducts = products.filter(
        (product) =>
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleRefresh = async () => {
        setRefreshing(true);
        await loadProducts();
        setRefreshing(false);
    };

    const handleAddToCart = (product: Product) => {
        try {
            if (product.stock <= 0) {
                throw new Error("Product is out of stock");
            }
            addToCart(product, 1);
            setErrorMessage("Product added to cart");
            setSnackBarVisible(true);
        } catch (error) {
            if (error instanceof Error) {
                setErrorMessage(error.message);
            } else {
                setErrorMessage("Failed to add product to cart");
            }
            setSnackBarVisible(true);
        }
    };

    const handleProductPress = (product: Product) => {
        setSelectedProduct(product);
        setModalVisible(true);
    };

    const getRandomColor = (id: number) => {
        const colors = [
            '#3498db', '#2ecc71', '#e74c3c', '#f39c12', 
            '#9b59b6', '#1abc9c', '#d35400', '#34495e'
        ];
        return colors[id % colors.length];
    };

    const renderProduct = ({ item }: { item: Product }) => (
        <TouchableOpacity 
            style={styles.productCard} 
            onPress={() => handleProductPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.productImageContainer}>
                <View style={[
                    styles.productImage, 
                    { backgroundColor: getRandomColor(item.id) }
                ]}>
                    <Text style={styles.productInitial}>
                        {item.name.charAt(0).toUpperCase()}
                    </Text>
                </View>
                {item.stock <= 0 && (
                    <View style={styles.outOfStockBadge}>
                        <Text style={styles.outOfStockText}>Out of Stock</Text>
                    </View>
                )}
            </View>
            
            <View style={styles.productInfo}>
                <Text style={styles.productName} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={styles.productCode} numberOfLines={1}>
                    {item.code}
                </Text>
                <View style={styles.productFooter}>
                    <View style={styles.productPriceRow}>
                        <Text style={styles.productPrice}>
                            PHP {item.sellPrice.toFixed(2)}
                        </Text>
                        <Text style={styles.productStock}>
                            Stock: {item.stock}
                        </Text>
                    </View>
                    <TouchableOpacity 
                        style={[
                            styles.addButton,
                            item.stock <= 0 && styles.disabledButton
                        ]}
                        onPress={() => handleAddToCart(item)}
                        disabled={item.stock <= 0}
                    >
                        <Ionicons 
                            name="add" 
                            size={24} 
                            color={item.stock <= 0 ? colors.gray400 : colors.white} 
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <Searchbar
                placeholder="Search products"
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchbar}
                inputStyle={styles.searchInput}
                iconColor={colors.primary}
            />
            
            <FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id.toString()}
                numColumns={2}
                contentContainerStyle={styles.productList}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
            />

            <Snackbar
                visible={snackBarVisible}
                onDismiss={() => setSnackBarVisible(false)}
                duration={2000}
                style={styles.snackbar}
            >
                {errorMessage}
            </Snackbar>

            <ProductModal
                visible={modalVisible}
                onDismiss={() => setModalVisible(false)}
                product={selectedProduct}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    searchbar: {
        margin: spacing.md,
        borderRadius: 12,
        elevation: 2,
    },
    searchInput: {
        fontSize: typography.fontSize.base,
    },
    productList: {
        padding: spacing.sm,
    },
    productCard: {
        flex: 1,
        margin: spacing.sm,
        backgroundColor: colors.white,
        borderRadius: 12,
        overflow: 'hidden',
        ...shadows.sm,
    },
    productImageContainer: {
        position: 'relative',
        width: '100%',
        aspectRatio: 1,
    },
    productImage: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    productInitial: {
        fontSize: 40,
        fontWeight: 'bold',
        color: 'rgba(255, 255, 255, 0.8)',
    },
    outOfStockBadge: {
        position: 'absolute',
        top: 0,
        right: 0,
        backgroundColor: 'rgba(231, 76, 60, 0.8)',
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs / 2,
        borderBottomLeftRadius: 8,
    },
    outOfStockText: {
        color: colors.white,
        fontSize: typography.fontSize.xs,
        fontWeight: 'bold',
    },
    productInfo: {
        padding: spacing.md,
    },
    productName: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.medium,
        color: colors.textPrimary,
        marginBottom: spacing.xs / 2,
    },
    productCode: {
        fontSize: typography.fontSize.sm,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    productFooter: {
        marginTop: 'auto',
    },
    productPriceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    productPrice: {
        fontSize: typography.fontSize.base,
        fontFamily: typography.fontFamily.bold,
        color: colors.primary,
    },
    productStock: {
        fontSize: typography.fontSize.xs,
        color: colors.textSecondary,
    },
    addButton: {
        backgroundColor: colors.primary,
        width: '100%',
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.sm,
    },
    disabledButton: {
        backgroundColor: colors.gray300,
    },
    snackbar: {
        marginBottom: spacing.lg,
    },
});