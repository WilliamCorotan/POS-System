"use client";

import { useAuth } from "@clerk/nextjs";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { UnitMeasurementForm } from "@/components/settings/UnitMeasurementForm";
import { PaymentMethodForm } from "@/components/settings/PaymentMethodForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePaymentMethods } from "@/hooks/use-payments";
import { PaymentMethod } from "@/types";
import { Pencil, Trash2 } from "lucide-react";

export default function SettingsPage() {
    const { userId } = useAuth();
    const [activeTab, setActiveTab] = useState("unit-measurements");
    const [openUnitMeasurementDialog, setOpenUnitMeasurementDialog] =
        useState(false);
    const [openPaymentMethodDialog, setOpenPaymentMethodDialog] =
        useState(false);
    const [editingPaymentMethod, setEditingPaymentMethod] =
        useState<PaymentMethod | null>(null);
    const { paymentMethods, refreshPaymentMethods } = usePaymentMethods();

    const handleEditPaymentMethod = (method: any) => {
        console.log("ss", method);
        setEditingPaymentMethod(method);
        setOpenPaymentMethodDialog(true);
    };

    const handleDeletePaymentMethod = async (id: number) => {
        if (confirm("Are you sure you want to delete this payment method?")) {
            try {
                const response = await fetch(
                    `/api/settings/payment-methods/${id}`,
                    {
                        method: "DELETE",
                    }
                );
                if (!response.ok)
                    throw new Error("Failed to delete payment method");
                refreshPaymentMethods();
            } catch (error) {
                console.error("Error deleting payment method:", error);
            }
        }
    };

    if (!userId) {
        return <div>Please sign in to view settings</div>;
    }

    console.log(paymentMethods);
    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Settings</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="unit-measurements">
                        Unit Measurements
                    </TabsTrigger>
                    <TabsTrigger value="payment-methods">
                        Payment Methods
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="unit-measurements" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">
                            Unit Measurements
                        </h2>
                        <Button
                            onClick={() => setOpenUnitMeasurementDialog(true)}
                        >
                            Add Unit Measurement
                        </Button>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {/* Unit measurements will be mapped here */}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="payment-methods" className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold">
                            Payment Methods
                        </h2>
                        <Button
                            onClick={() => {
                                setEditingPaymentMethod(null);
                                setOpenPaymentMethodDialog(true);
                            }}
                        >
                            Add Payment Method
                        </Button>
                    </div>

                    <div className="rounded-md border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead className="w-[100px]">
                                        Actions
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paymentMethods.map((method) => (
                                    <TableRow key={method.id}>
                                        <TableCell>{method.name}</TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleEditPaymentMethod(
                                                            method
                                                        )
                                                    }
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() =>
                                                        handleDeletePaymentMethod(
                                                            method.id
                                                        )
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
                </TabsContent>
            </Tabs>

            <UnitMeasurementForm
                open={openUnitMeasurementDialog}
                onOpenChange={setOpenUnitMeasurementDialog}
                onSubmit={async (data) => {
                    try {
                        const response = await fetch(
                            "/api/settings/unit-measurements",
                            {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(data),
                            }
                        );
                        if (!response.ok)
                            throw new Error(
                                "Failed to create unit measurement"
                            );
                        setOpenUnitMeasurementDialog(false);
                        // Refresh the list
                    } catch (error) {
                        console.error(
                            "Error creating unit measurement:",
                            error
                        );
                    }
                }}
                mode="create"
            />

            <PaymentMethodForm
                open={openPaymentMethodDialog}
                onOpenChange={setOpenPaymentMethodDialog}
                onSubmit={async (data) => {
                    try {
                        const url = editingPaymentMethod
                            ? `/api/settings/payment-methods/${editingPaymentMethod.id}`
                            : "/api/settings/payment-methods";
                        const method = editingPaymentMethod ? "PUT" : "POST";

                        const response = await fetch(url, {
                            method,
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify(data),
                        });
                        if (!response.ok)
                            throw new Error(
                                `Failed to ${
                                    editingPaymentMethod ? "update" : "create"
                                } payment method`
                            );
                        setOpenPaymentMethodDialog(false);
                        setEditingPaymentMethod(null);
                        refreshPaymentMethods();
                    } catch (error) {
                        console.error("Error saving payment method:", error);
                    }
                }}
                mode={editingPaymentMethod ? "edit" : "create"}
                initialData={editingPaymentMethod}
            />
        </div>
    );
}
