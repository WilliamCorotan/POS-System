import { useRefunds } from "@/hooks/use-refunds";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { RefundForm } from "@/components/refunds/RefundForm";
import { RefundFormData, Transaction } from "@/types";
import { format } from "date-fns";
import { RefreshCcw } from "lucide-react";
import { useTransactions } from "@/hooks/use-transactions";

interface TransactionListProps {
    transactions: Transaction[];
}

export default function TransactionList({ transactions }: TransactionListProps) {
    const { refreshTransactions } = useTransactions();
    const { createRefund } = useRefunds();
    const [openRefundDialog, setOpenRefundDialog] = useState(false);
    const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);

    const handleRefund = (transactionId: number) => {
        setSelectedTransactionId(transactionId);
        setOpenRefundDialog(true);
    };

    const handleRefundSubmit = async (data: RefundFormData) => {
        try {
            await createRefund(data);
            setOpenRefundDialog(false);
            refreshTransactions();
        } catch (error) {
            console.error("Error processing refund:", error);
            alert("Failed to process refund. Please try again.");
        } finally {
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Transaction List</h2>
                <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshTransactions}
                    className="flex items-center gap-2"
                >
                    <RefreshCcw className="h-4 w-4" />
                    Refresh
                </Button>
            </div>
            
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Payment Method</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.length > 0 ? (
                            transactions.map((transaction) => (
                                <TableRow key={transaction.id}>
                                    <TableCell>{transaction.id}</TableCell>
                                    <TableCell>
                                        {format(new Date(transaction.dateOfTransaction), 'MMM dd, yyyy HH:mm')}
                                    </TableCell>
                                    <TableCell>PHP {transaction.totalPrice.toFixed(2)}</TableCell>
                                    <TableCell>
                                        {transaction.paymentMethodName}
                                    </TableCell>
                                    <TableCell>
                                        {transaction.status === 'refunded' ? (
                                            <span className="text-red-500">Refunded</span>
                                        ) : transaction.status === 'partially_refunded' ? (
                                            <span className="text-amber-500">Partially Refunded</span>
                                        ) : (
                                            transaction.status
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleRefund(transaction.id)}
                                            disabled={transaction.status === 'refunded'}
                                        >
                                            Refund
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-4">
                                    No transactions found for this period
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {selectedTransactionId && (
                <RefundForm
                    open={openRefundDialog}
                    onOpenChange={setOpenRefundDialog}
                    onSubmit={handleRefundSubmit}
                    transactionId={selectedTransactionId}
                />
            )}
        </div>
    );
}