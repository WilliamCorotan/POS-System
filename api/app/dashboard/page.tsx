"use client";

import { useAuth } from "@clerk/nextjs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, DollarSign, TrendingUp } from "lucide-react";
import { AreaChart, BarChart } from "@tremor/react";
import { useTransactions } from "@/hooks/use-transactions";
import { useMemo } from "react";

export default function DashboardPage() {
    const { userId } = useAuth();
    const { transactions } = useTransactions();

    // Calculate monthly data for the area chart
    const monthlyData = useMemo(() => {
        const monthlyTotals: { [key: string]: number } = {};
        transactions.forEach((transaction) => {
            const date = new Date(transaction.dateOfTransaction);
            const monthYear = `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, "0")}`;
            monthlyTotals[monthYear] =
                (monthlyTotals[monthYear] || 0) + transaction.totalPrice;
        });

        return Object.entries(monthlyTotals).map(([date, total]) => ({
            date,
            "Total Sales": total,
        }));
    }, [transactions]);

    // Calculate yearly comparison data for the bar chart
    const yearlyData = useMemo(() => {
        const yearlyTotals: { [key: string]: number } = {};
        transactions.forEach((transaction) => {
            const year = new Date(transaction.dateOfTransaction).getFullYear();
            yearlyTotals[year] =
                (yearlyTotals[year] || 0) + transaction.totalPrice;
        });

        return Object.entries(yearlyTotals).map(([year, total]) => ({
            year,
            "Total Sales": total,
        }));
    }, [transactions]);

    // Calculate current month metrics
    const currentMonthMetrics = useMemo(() => {
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const monthTransactions = transactions.filter((transaction) => {
            const date = new Date(transaction.dateOfTransaction);
            return (
                date.getMonth() === currentMonth &&
                date.getFullYear() === currentYear
            );
        });

        const totalSales = monthTransactions.reduce(
            (sum, transaction) => sum + transaction.totalPrice,
            0
        );
        const totalProducts = monthTransactions.length;

        // Calculate performance (comparing to previous month)
        const lastMonthTransactions = transactions.filter((transaction) => {
            const date = new Date(transaction.dateOfTransaction);
            return (
                date.getMonth() === currentMonth - 1 &&
                date.getFullYear() === currentYear
            );
        });

        const lastMonthSales = lastMonthTransactions.reduce(
            (sum, transaction) => sum + transaction.totalPrice,
            0
        );
        const performance = lastMonthSales
            ? ((totalSales - lastMonthSales) / lastMonthSales) * 100
            : 0;

        return {
            totalSales,
            totalProducts,
            performance,
        };
    }, [transactions]);

    if (!userId) {
        return <div>Please sign in to view the dashboard</div>;
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Products Sold
                        </CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {currentMonthMetrics.totalProducts}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            This month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Sales
                        </CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            PHP{currentMonthMetrics.totalSales.toFixed(2)}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            This month
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Performance
                        </CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {currentMonthMetrics.performance.toFixed(1)}%
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Compared to last month
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Monthly Sales Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <AreaChart
                            data={monthlyData}
                            index="date"
                            categories={["Total Sales"]}
                            colors={["blue"]}
                            yAxisWidth={60}
                            showAnimation
                            className="h-72"
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Yearly Comparison</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <BarChart
                            data={yearlyData}
                            index="year"
                            categories={["Total Sales"]}
                            colors={["blue"]}
                            yAxisWidth={60}
                            showAnimation
                            className="h-72"
                        />
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
