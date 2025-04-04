import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, RefreshControl, TouchableOpacity } from "react-native";
import { Searchbar, Text, Portal } from "react-native-paper";
import { Image } from 'expo-image';
import { Product, Category } from "../types";
import { fetchProducts } from "../api/products";
import { fetchCategories } from "../api/categories";
import { useUser } from "../contexts/UserContext";
import { useProducts } from "../hooks/useProducts";
import { useCart } from "../hooks/useCart";
import { ProductModal } from "../components/ProductModal";
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, shadows } from "../theme";
import { Select } from "../components/ui/Select";

export default function ProductsScreen() {
    const { userId } = useUser();
    const [searchQuery, setSearchQuery] = useState("");
    const { products, setProducts } = useProducts();
    const [refreshing, setRefreshing] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const { addToCart, updateQuantity, items: cartItems } = useCart();
    const [selectedParentCategory, setSelectedParentCategory] = useState<string>("all");
    const [selectedSubcategory, setSelectedSubcategory] = useState<string>("all");
    const [categories, setCategories] = useState<Category[]>([]);

    // Organize categories into a hierarchy
    const organizeCategories = (categories: Category[]) => {
        const parentCategories = categories.filter((cat) => !cat.parentId);
        const getSubcategories = (parentId: number) =>
            categories.filter((cat) => cat.parentId === parentId);
        return { parentCategories, getSubcategories };
    };

    const { parentCategories, getSubcategories } = organizeCategories(categories);
    const subcategories = selectedParentCategory !== "all" 
        ? getSubcategories(parseInt(selectedParentCategory))
        : [];

    useEffect(() => {
        loadProducts();
        loadCategories();
    }, []);

    const loadProducts = async () => {
        try {
            if (userId === null) {
                throw new Error("No User ID.");
            }
            const productsData = await fetchProducts(userId);
            setProducts(productsData);
        } catch (error) {
            console.error("Failed to load products:", error);
        }
    };

    const loadCategories = async () => {
        try {
            if (userId === null) {
                throw new Error("No User ID.");
            }
            const categoriesData = await fetchCategories(userId);
            setCategories(categoriesData);
        } catch (error) {
            console.error("Failed to load categories:", error);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([loadProducts(), loadCategories()]);
        setRefreshing(false);
    };

    // Filter products based on search term and category selections
    const filteredProducts = products.filter((product) => {
        const matchesSearch =
            searchQuery === "" ||
            product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.code.toLowerCase().includes(searchQuery.toLowerCase());

        const category = categories.find((c) => c.id === product.categoryId);
        const matchesCategory =
            selectedParentCategory === "all" ||
            (category?.parentId
                ? category.parentId.toString() === selectedParentCategory
                : category?.id.toString() === selectedParentCategory);

        const matchesSubcategory =
            selectedSubcategory === "all" ||
            product.categoryId?.toString() === selectedSubcategory;

        return matchesSearch && matchesCategory && matchesSubcategory;
    });

    const handleAddToCart = (product: Product) => {
        try {
            if (product.stock <= 0) {
                throw new Error("Product is out of stock");
            }
            addToCart(product, 1);
        } catch (error) {
            console.error("Error adding to cart:", error);
        }
    };

    const handleRemoveFromCart = (product: Product) => {
        try {
            const cartItem = cartItems.find((item) => item.product_id === product.id);
            if (!cartItem || cartItem.quantity <= 0) {
                throw new Error("Product not in cart");
            }
            updateQuantity(cartItem.id, cartItem.quantity - 1);
        } catch (error) {
            console.error("Error removing from cart:", error);
        }
    };

    const renderProduct = ({ item }: { item: Product }) => (
        <TouchableOpacity 
            style={styles.productCard} 
            onPress={() => {
                setSelectedProduct(item);
                setModalVisible(true);
            }}
            activeOpacity={0.7}
        >
            <View style={styles.productImageContainer}>
                {item.imageUrl ? (
                    <Image
                        source={item.imageUrl}
                        style={styles.productImage}
                        contentFit="cover"
                        transition={200}
                    />
                ) : (
                    <View style={[
                        styles.productImagePlaceholder,
                        { backgroundColor: colors.gray300 }
                    ]}>
                        <Text style={styles.productInitial}>
                            {item.name.charAt(0).toUpperCase()}
                        </Text>
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
                {item.description && (
                    <Text style={styles.productDescription} numberOfLines={2}>
                        {item.description}
                    </Text>
                )}
                <View style={styles.productFooter}>
                    <View style={styles.productPriceRow}>
                        <Text style={styles.productPrice}>
                            PHP {item.sellPrice.toFixed(2)}
                        </Text>
                        <Text style={styles.productStock}>
                            Stock: {item.stock}
                        </Text>
                    </View>
                    <View style={styles.productPriceRow}>
                        <TouchableOpacity 
                            style={[
                                styles.removeButton,
                                cartItems.filter((cartItem) => cartItem.product_id === item.id).length <= 0 && styles.disabledButton
                            ]}
                            onPress={() => handleRemoveFromCart(item)}
                            disabled={cartItems.filter((cartItem) => cartItem.product_id === item.id).length <= 0}
                        >
                            <Ionicons 
                                name="remove" 
                                size={24} 
                                color={item.stock <= 0 ? colors.gray400 : colors.white} 
                            />
                        </TouchableOpacity>
                        <Text>{cartItems.find((cartItem) => cartItem.product_id === item.id)?.quantity || 0}</Text>
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
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <View style={styles.filterRow}>
                    <Searchbar
                        placeholder="Search products..."
                        onChangeText={setSearchQuery}
                        value={searchQuery}
                        style={styles.searchbar}
                    />
                </View>
                <View style={styles.filterRow}>
                    <Select
                        label="Category"
                        value={selectedParentCategory}
                        onValueChange={(value) => {
                            setSelectedParentCategory(value);
                            setSelectedSubcategory("all");
                        }}
                        items={[
                            { label: "All Categories", value: "all" },
                            ...parentCategories.map(category => ({
                                label: category.name,
                                value: category.id.toString()
                            }))
                        ]}
                        style={styles.select}
                    />
                    {subcategories.length > 0 && (
                        <Select
                            label="Subcategory"
                            value={selectedSubcategory}
                            onValueChange={setSelectedSubcategory}
                            items={[
                                { label: "All Subcategories", value: "all" },
                                ...subcategories.map(category => ({
                                    label: category.name,
                                    value: category.id.toString()
                                }))
                            ]}
                            style={styles.select}
                        />
                    )}
                </View>
            </View>
            
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

            <Portal>
                <ProductModal
                    visible={modalVisible}
                    onDismiss={() => setModalVisible(false)}
                    product={selectedProduct}
                />
            </Portal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    searchContainer: {
        backgroundColor: colors.white,
        paddingTop: spacing.md,
        ...shadows.sm,
    },
    filterRow: {
        flexDirection: 'row',
        paddingHorizontal: spacing.md,
        paddingBottom: spacing.md,
        gap: spacing.sm,
    },
    searchbar: {
        flex: 1,
        borderRadius: 12,
        elevation: 2,
    },
    select: {
        flex: 1,
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
    },
    productImagePlaceholder: {
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
        marginBottom: spacing.xs,
    },
    productDescription: {
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
        width: '40%',
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.sm,
    },
    removeButton: {
        backgroundColor: colors.primary,
        width: '40%',
        height: 36,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        ...shadows.sm,
    },
    disabledButton: {
        backgroundColor: colors.gray300,
    },
});