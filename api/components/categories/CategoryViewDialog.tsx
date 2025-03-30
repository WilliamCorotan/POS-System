import { Category } from "@/types";
import { ViewDialog, ViewField } from "@/components/ui/view-dialog";

interface CategoryViewDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    category: Category;
}

export function CategoryViewDialog({
    open,
    onOpenChange,
    category,
}: CategoryViewDialogProps) {
    return (
        <ViewDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Category Details"
            description={`Details for ${category.name}`}
        >
            <div className="grid gap-4">
                <ViewField label="Name" value={category.name} />
                <ViewField label="Description" value={category.description} />
            </div>
        </ViewDialog>
    );
}
