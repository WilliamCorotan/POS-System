"use client";

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
import { toast } from "sonner";

interface DeleteUserDialogProps {
    user: {
        id: number;
        name: string;
    };
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function DeleteUserDialog({
    user,
    open,
    onOpenChange,
    onSuccess,
}: DeleteUserDialogProps) {
    const [isLoading, setIsLoading] = useState(false);

    async function onDelete() {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/users/${user.id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete user");
            }

            toast.success("User deleted successfully");
            onSuccess();
            onOpenChange(false);
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Failed to delete user");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete User</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete {user.name}? This action
                        cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onDelete}
                        disabled={isLoading}
                    >
                        {isLoading ? "Deleting..." : "Delete User"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
} 