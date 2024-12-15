import { useState } from "react";
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

interface PaymentMethodFormData {
    name: string;
}

interface PaymentMethodFormProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSubmit: (data: PaymentMethodFormData) => void;
    initialData?: PaymentMethodFormData | null;
    mode: "create" | "edit";
}

export function PaymentMethodForm({
    open,
    onOpenChange,
    onSubmit,
    initialData,
    mode,
}: PaymentMethodFormProps) {
    const [formData, setFormData] = useState<PaymentMethodFormData>(
        initialData || { name: "" }
    );

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
                            {mode === "create"
                                ? "Add Payment Method"
                                : "Edit Payment Method"}
                        </DialogTitle>
                        <DialogDescription>
                            Enter the name for the payment method.
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
