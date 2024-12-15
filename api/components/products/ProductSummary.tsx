import { Package, PackageCheck, PackageX } from "lucide-react";
import { ProductSummaryCard } from "./ProductSummaryCard";
import { Product } from "./types";

interface ProductSummaryProps {
    products: Product[];
}

export function ProductSummary({ products }: ProductSummaryProps) {
    const totalProducts = products.length;
    const lowStockProducts = products.filter(
        (product) => product.stock <= (product.lowStockLevel || 0)
    ).length;
    const inStockProducts = totalProducts - lowStockProducts;

    return (
        <div className="grid gap-4 md:grid-cols-3">
            <ProductSummaryCard
                title="Total Products"
                value={totalProducts}
                icon={<Package className="h-4 w-4 text-muted-foreground" />}
            />
            <ProductSummaryCard
                title="In Stock Products"
                value={inStockProducts}
                icon={<PackageCheck className="h-4 w-4 text-green-500" />}
            />
            <ProductSummaryCard
                title="Low Stock Products"
                value={lowStockProducts}
                icon={<PackageX className="h-4 w-4 text-red-500" />}
            />
        </div>
    );
}