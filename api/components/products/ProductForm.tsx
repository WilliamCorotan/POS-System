import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Product, ProductFormData } from "./types";

interface ProductFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: ProductFormData) => void;
    initialData?: Product | null;
    mode: "create" | "edit";
}

const defaultFormData: ProductFormData = {
    name: "",
    code: "",
    description: "",
    buyPrice: "",
    sellPrice: "",
    stock: "",
    lowStockLevel: "",
};

export function ProductForm({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    mode,
}: ProductFormProps) {
    const [formData, setFormData] = useState<ProductFormData>(defaultFormData);

    useEffect(() => {
        if (initialData) {
            setFormData({
                name: initialData.name,
                code: initialData.code,
                description: initialData.description || "",
                buyPrice: initialData.buyPrice,
                sellPrice: initialData.sellPrice,
                stock: initialData.stock,
                lowStockLevel: initialData.lowStockLevel || "",
            });
        } else {
            setFormData(defaultFormData);
        }
    }, [initialData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>
                            {mode === "create" ? "Add Product" : "Edit Product"}
                        </DialogTitle>
                        <DialogDescription>
                            Fill in the product details below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        name: e.target.value,
                                    })
                                }
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="code" className="text-right">
                                Code
                            </Label>
                            <Input
                                id="code"
                                value={formData.code}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        code: e.target.value,
                                    })
                                }
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Input
                                id="description"
                                value={formData.description}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        description: e.target.value,
                                    })
                                }
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="buyPrice" className="text-right">
                                Buy Price
                            </Label>
                            <Input
                                id="buyPrice"
                                type="number"
                                step="0.01"
                                value={formData.buyPrice}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        buyPrice: e.target.value,
                                    })
                                }
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="sellPrice" className="text-right">
                                Sell Price
                            </Label>
                            <Input
                                id="sellPrice"
                                type="number"
                                step="0.01"
                                value={formData.sellPrice}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        sellPrice: e.target.value,
                                    })
                                }
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="stock" className="text-right">
                                Stock
                            </Label>
                            <Input
                                id="stock"
                                type="number"
                                value={formData.stock}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        stock: e.target.value,
                                    })
                                }
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label
                                htmlFor="lowStockLevel"
                                className="text-right"
                            >
                                Low Stock Level
                            </Label>
                            <Input
                                id="lowStockLevel"
                                type="number"
                                value={formData.lowStockLevel}
                                onChange={(e) =>
                                    setFormData({
                                        ...formData,
                                        lowStockLevel: e.target.value,
                                    })
                                }
                                className="col-span-3"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit">
                            {mode === "create" ? "Create" : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
