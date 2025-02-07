import React, { useState, useEffect } from "react";
import { View, FlatList, StyleSheet, RefreshControl } from "react-native";
import {
    Searchbar,
    Card,
    Title,
    Paragraph,
    Button,
    Snackbar,
} from "react-native-paper";
import { Product } from "../types";
import { fetchProducts } from "../api/products";
import { useUser } from "../contexts/UserContext";
import { useProducts } from "../hooks/useProducts";
import { useCart } from "../hooks/useCart";
import { ProductModal } from "../components/ProductModal";

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

    const handleAddToCart = (code: string) => {
        const product = products.find((p) => p.code === code);
        if (product) {
            try {
                if (product.stock <= 0) {
                    throw new Error("Product is out of stock");
                }
                addToCart(product, 1);
                setErrorMessage("Product added to cart successfully");
                setSnackBarVisible(true);
            } catch (error) {
                if (error instanceof Error) {
                    setErrorMessage(error.message);
                } else {
                    setErrorMessage("Failed to add product to cart");
                }
                setSnackBarVisible(true);
            }
        } else {
            setErrorMessage("Product not found");
            setSnackBarVisible(true);
        }
    };

    const handleProductPress = (product: Product) => {
        setSelectedProduct(product);
        setModalVisible(true);
    };

    const renderProduct = ({ item }: { item: Product }) => (
        <Card style={styles.card} onPress={() => handleProductPress(item)}>
            <Card.Content>
                <Title>{item.name}</Title>
                <Paragraph>Code: {item.code}</Paragraph>
                <Paragraph>Price: PHP{item.sell_price}</Paragraph>
                <Paragraph style={item.stock <= 0 ? styles.outOfStock : undefined}>
                    Stock: {item.stock}
                </Paragraph>
                <Button 
                    onPress={() => handleAddToCart(item.code)}
                    disabled={item.stock <= 0}
                >
                    {item.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                </Button>
            </Card.Content>
        </Card>
    );

    return (
        <View style={styles.container}>
            <Searchbar
                placeholder="Search products"
                onChangeText={setSearchQuery}
                value={searchQuery}
                style={styles.searchbar}
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
                        tintColor="#007bff"
                        title="Refreshing..."
                        titleColor="#007bff"
                    />
                }
            />

            <Snackbar
                visible={snackBarVisible}
                onDismiss={() => setSnackBarVisible(false)}
                duration={3000}
                action={{
                    label: "Dismiss",
                    onPress: () => setSnackBarVisible(false),
                }}
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
        backgroundColor: "#f5f5f5",
    },
    searchbar: {
        margin: 16,
    },
    productList: {
        padding: 8,
    },
    card: {
        flex: 1,
        margin: 8,
    },
    outOfStock: {
        color: 'red',
        fontWeight: 'bold',
    },
});