import { DateRange, Transaction } from "@/types";
import { format } from "date-fns";
import { filterTransactionsByDate } from "./date-filters";
import * as XLSX from 'xlsx';

export const exportTransactions = async (transactions: Transaction[], range: DateRange) => {

    const filteredTransactions = filterTransactionsByDate(transactions, range);
    console.log('filteredTransactions:', filteredTransactions);
    const data = filteredTransactions.map((transaction) => ({
      "Transaction ID": transaction.id,
      Date: format(
        new Date(transaction.dateOfTransaction),
        "MM/dd/yyyy HH:mm:ss"
      ),
      "Total Amount": `PHP ${transaction.totalPrice.toFixed(2)}`,
      "Payment Method": transaction.paymentMethodName,
      Status: transaction.status,
      "Cash Received": transaction.cashReceived
        ? `PHP ${transaction.cashReceived.toFixed(2)}`
        : "-",
    }));

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(data);

    XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

    const fileName = `transactions_${range}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`;
    XLSX.writeFile(wb, fileName);

}