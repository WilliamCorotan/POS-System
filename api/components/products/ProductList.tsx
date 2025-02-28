import { useProducts } from "@/hooks/use-products";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ProductForm } from "./ProductForm";
import { useState } from "react";
import { Pencil, Trash2, AlertTriangle } from "lucide-react";
import { Product, ProductFormData } from "@/types";
import { ProductSummary } from "./ProductSummary";
import { format } from "date-fns";
import { useCategories } from "@/hooks/use-categories";

export default function ProductList() {
    const { products, loading, error, createProduct, refreshProducts } =
        useProducts();
    const { categories } = useCategories();
    const [openDialog, setOpenDialog] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [mode, setMode] = useState<"create" | "edit">("create");

    const handleCreate = () => {
        setMode("create");
        setEditingProduct(null);
        setOpenDialog(true);
    };

    const handleEdit = (product: Product) => {
        setMode("edit");
        setEditingProduct(product);
        setOpenDialog(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm("Are you sure you want to delete this product?")) {
            try {
                const response = await fetch(`/api/products/${id}`, {
                    method: "DELETE",
                });
                if (!response.ok) throw new Error("Failed to delete product");
                refreshProducts();
            } catch (error) {
                console.error("Error deleting product:", error);
            }
        }
    };

    const handleSubmit = async (data: ProductFormData) => {
        try {
            const processedData = {
                ...data,
                description: data.description || undefined,
                image: data.image || undefined,
                expirationDate: data.expirationDate || undefined,
                unitMeasurementsId: data.unitMeasurementsId ?? 0,
                categoryId: data.categoryId,
                clerkId: data.clerkId || "",
                buyPrice: parseFloat(data.buyPrice.toString()),
                sellPrice: parseFloat(data.sellPrice.toString()),
                stock: parseInt(data.stock.toString()),
                lowStockLevel: data.lowStockLevel
                    ? parseInt(data.lowStockLevel.toString())
                    : undefined,
            };

            if (mode === "create") {
                await createProduct(processedData);
            } else if (editingProduct) {
                const response = await fetch(
                    `/api/products/${editingProduct.id}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(processedData),
                    }
                );
                if (!response.ok) throw new Error("Failed to update product");
                await refreshProducts();
            }
            setOpenDialog(false);
        } catch (error) {
            console.error("Error saving product:", error);
        }
    };

    const isExpired = (product: Product) => {
        if (!product.expirationDate) return false;
        const expirationDate = new Date(product.expirationDate);
        return expirationDate < new Date();
    };

    const getCategoryName = (categoryId?: number) => {
        if (!categoryId) return "Uncategorized";
        const category = categories.find(c => c.id === categoryId);
        return category ? category.name : "Uncategorized";
    };

    if (loading) {
        return <div>Loading products...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="space-y-4">
            <ProductSummary products={products} />
            <div className="flex justify-end">
                <Button onClick={handleCreate}>Add Product</Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Code</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Buy Price</TableHead>
                            <TableHead>Sell Price</TableHead>
                            <TableHead>Expiration Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id}>
                                <TableCell>{product.code}</TableCell>
                                <TableCell>{product.name}</TableCell>
                                <TableCell>{getCategoryName(product.categoryId)}</TableCell>
                                <TableCell>{product.stock}</TableCell>
                                <TableCell>
                                    PHP{product.buyPrice.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    PHP{product.sellPrice.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    {product.expirationDate ? (
                                        <span className={isExpired(product) ? "text-red-500" : ""}>
                                            {format(new Date(product.expirationDate), 'MMM dd, yyyy')}
                                        </span>
                                    ) : (
                                        <span className="text-muted-foreground">N/A</span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {isExpired(product) ? (
                                        <span className="text-red-500 flex items-center gap-1">
                                            <AlertTriangle className="h-4 w-4" />
                                            Expired
                                        </span>
                                    ) : product.stock <=
                                      (product.lowStockLevel || 0) ? (
                                        <span className="text-amber-500">
                                            Low Stock
                                        </span>
                                    ) : (
                                        <span className="text-green-500">
                                            In Stock
                                        </span>
                                    )}
                                </TableCell>
                                <TableCell>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => handleEdit(product)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                                handleDelete(product.id)
                                            }
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <ProductForm
                open={openDialog}
                onOpenChange={setOpenDialog}
                onSubmit={handleSubmit}
                initialData={editingProduct}
                mode={mode}
            />
        </div>
    );
}