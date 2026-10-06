import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import dashboardService from "../services/dashboardService";
import transactionService from "../services/transactionService";
import Card from "../components/ui/Card";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import AnalyticsHeader from "../components/analytics/AnalyticsHeader";
import AnalyticsKpiCards from "../components/analytics/AnalyticsKpiCards";
import FinancialTrendChart from "../components/analytics/FinancialTrendChart";
import AnalyticsActivity from "../components/analytics/AnalyticsActivity";
import AnalyticsComparison from "../components/analytics/AnalyticsComparison";
import AnalyticsBreakdown from "../components/analytics/AnalyticsBreakdown";

const PERIODS = {
    "7D": {
        label: "7D",
        days: 7,
    },
    "30D": {
        label: "30D",
        months: 1,
        days: 30,
    },
    "3M": {
        label: "3M",
        months: 3,
    },
    "6M": {
        label: "6M",
        months: 6,
    },
    "1Y": {
        label: "1Y",
        months: 12,
    },
};
const currencyFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
});
const numberFormatter = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
});
const formatCurrency = (value = 0) => {
    return currencyFormatter.format(Number(value) || 0);
};
const formatNumber = (value = 0) => {
    return numberFormatter.format(Number(value) || 0);
};
const formatDateForApi = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
const getMonthKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    return `${year}-${month}`;
};
const getMonthLabel = (monthKey) => {
    const [year, month] = monthKey.split("-").map(Number);
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString("en-IN", {
        month: "short",
        year: "numeric",
    });
};
const getPeriodDates = (periodKey) => {
    const config = PERIODS[periodKey];
    const currentEnd = new Date();
    currentEnd.setHours(0, 0, 0, 0);
    let currentStart;
    if (config.days) {
        // Exactly 30 calendar days, including today.
        currentStart = new Date(currentEnd);
        currentStart.setDate(currentStart.getDate() - (config.days - 1));
    } else {
        // Calendar periods:
        // 3M -> current month + previous 2 months
        // 6M -> current month + previous 5 months
        // 1Y -> current month + previous 11 months
        currentStart = new Date(
            currentEnd.getFullYear(),
            currentEnd.getMonth() - (config.months - 1),
            1
        );
    }
    const previousEnd = new Date(currentStart);
    previousEnd.setDate(previousEnd.getDate() - 1);
    let previousStart;
    if (config.days) {
        // Previous period is the 30 days immediately
        // before the current 30-day period.
        previousStart = new Date(previousEnd);
        previousStart.setDate(
            previousStart.getDate() - (config.days - 1)
        );
    } else {
        // Previous calendar period has the same number
        // of months as the current period.
        previousStart = new Date(
            previousEnd.getFullYear(),
            previousEnd.getMonth() - (config.months - 1),
            1
        );
    }
    return {
        currentStart,
        currentEnd,
        previousStart,
        previousEnd,
    };
};
const calculateChange = (current, previous) => {
    const currentValue = Number(current) || 0;
    const previousValue = Number(previous) || 0;
    if (previousValue === 0) {
        return null;
    }
    return (
        ((currentValue - previousValue) /
            Math.abs(previousValue)) *
        100
    );
};
const calculateProfitMargin = (income, profit) => {
    const totalIncome = Number(income) || 0;
    const totalProfit = Number(profit) || 0;
    if (totalIncome === 0) {
        return 0;
    }
    return (totalProfit / totalIncome) * 100;
};
const getComparisonColor = (change, inverse = false) => {
    if (change === null || change === undefined) {
        return "text-slate-400";
    }
    const positive = change >= 0;
    if (inverse) {
        return positive
            ? "text-red-400"
            : "text-emerald-400";
    }
    return positive
        ? "text-emerald-400"
        : "text-red-400";
};
const getComparisonIcon = (change) => {
    if (change === null || change === undefined) {
        return null;
    }
    return change >= 0 ? TrendingUp : TrendingDown;
};
const buildMonthlyData = (
    monthlySummary = [],
    startDate,
    endDate
) => {
    const summaryMap = new Map();
    monthlySummary.forEach((item) => {
        if (!item?.period) {
            return;
        }
        summaryMap.set(item.period, {
            income: Number(item.income) || 0,
            expense: Number(item.expense) || 0,
        });
    });
    const months = [];
    const cursor = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        1
    );
    const lastMonth = new Date(
        endDate.getFullYear(),
        endDate.getMonth(),
        1
    );
    while (cursor <= lastMonth) {
        const period = getMonthKey(cursor);
        const values = summaryMap.get(period) || {
            income: 0,
            expense: 0,
        };
        const profit = values.income - values.expense;
        months.push({
            period,
            label: getMonthLabel(period),
            income: values.income,
            expense: values.expense,
            profit,
            margin: calculateProfitMargin(
                values.income,
                profit
            ),
        });
        cursor.setMonth(cursor.getMonth() + 1);
    }
    return months;
};
const fetchAllTransactions = async (startDate, endDate) => {
    const transactions = [];
    let page = 1;
    let totalPages = 1;
    do {
        const data = await transactionService.getTransactions({
            page,
            limit: 100,
            startDate: formatDateForApi(startDate),
            endDate: formatDateForApi(endDate),
            sortBy: "transactionDate",
            order: "asc",
        });
        transactions.push(...(data?.transactions || []));
        totalPages = Number(data?.pagination?.totalPages) || 1;
        page += 1;
    } while (page <= totalPages);
    return transactions;
};
const getTransactionCategoryType = (transaction, categoryTypeMap = new Map()) => {
    if (typeof transaction?.categoryId === "object") {
        return transaction.categoryId?.type || null;
    }
    const categoryId = String(transaction?.categoryId || "");
    return categoryTypeMap.get(categoryId) || null;
};
const getTransactionPaymentMethod = (transaction) => {
    const value = transaction?.paymentMethod;
    if (!value) {
        return "other";
    }
    const labels = {
        cash: "Cash",
        upi: "UPI",
        bank: "Bank transfer",
        card: "Card",
        other: "Other",
    };
    return labels[value] || value;
};
const getDayKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};
const getDayLabel = (date) => {
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
    });
};
const buildDailyData = (transactions = [], startDate, endDate, categoryTypeMap = new Map()) => {
    if (!startDate || !endDate) {
        return [];
    }
    const dayMap = new Map();
    transactions.forEach((transaction) => {
        const date = new Date(transaction?.transactionDate);
        if (Number.isNaN(date.getTime())) {
            return;
        }
        const key = getDayKey(date);
        const current = dayMap.get(key) || {
            income: 0,
            expense: 0,
        };
        const amount = Number(transaction?.amount) || 0;
        const type = getTransactionCategoryType(transaction, categoryTypeMap);
        if (type === "income") {
            current.income += amount;
        } else if (type === "expense") {
            current.expense += amount;
        }
        dayMap.set(key, current);
    });
    const days = [];
    const cursor = new Date(startDate);
    cursor.setHours(0, 0, 0, 0);
    const lastDay = new Date(endDate);
    lastDay.setHours(0, 0, 0, 0);
    while (cursor <= lastDay) {
        const key = getDayKey(cursor);
        const values = dayMap.get(key) || {
            income: 0,
            expense: 0,
        };
        const profit = values.income - values.expense;
        days.push({
            period: key,
            label: getDayLabel(cursor),
            income: values.income,
            expense: values.expense,
            profit,
            margin: calculateProfitMargin(values.income, profit),
        });
        cursor.setDate(cursor.getDate() + 1);
    }
    return days;
};
const Analytics = () => {
    const [selectedPeriod, setSelectedPeriod] =
        useState("30D");
    const [analytics, setAnalytics] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [previousAnalytics, setPreviousAnalytics] =
        useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const requestIdRef = useRef(0);
    const fetchAnalytics = useCallback(async () => {
        const requestId = ++requestIdRef.current;
        setLoading(true);
        setError("");
        try {
            const {
                currentStart,
                currentEnd,
                previousStart,
                previousEnd,
            } = getPeriodDates(selectedPeriod);
            const currentParams = {
                startDate: formatDateForApi(currentStart),
                endDate: formatDateForApi(currentEnd),
            };
            const previousParams = {
                startDate: formatDateForApi(previousStart),
                endDate: formatDateForApi(previousEnd),
            };
            const [
                currentData,
                previousData,
                currentTransactions,
            ] = await Promise.all([
                dashboardService.getFinancialAnalytics(
                    currentParams
                ),
                dashboardService.getFinancialAnalytics(
                    previousParams
                ),
                fetchAllTransactions(currentStart, currentEnd),
            ]);
            // Ignore responses from older requests.
            if (requestId !== requestIdRef.current) {
                return;
            }
            setAnalytics({
                ...currentData,
                _periodStart: currentStart,
                _periodEnd: currentEnd,
            });
            setPreviousAnalytics(previousData);
            setTransactions(currentTransactions);
        } catch (requestError) {
            if (requestId !== requestIdRef.current) {
                return;
            }
            console.error(
                "Failed to fetch analytics:",
                requestError
            );
            setError(
                "Unable to load analytics right now. Please try again."
            );
        } finally {
            if (requestId === requestIdRef.current) {
                setLoading(false);
            }
        }
    }, [selectedPeriod]);
    useEffect(() => {
        fetchAnalytics();
        return () => {
            requestIdRef.current += 1;
        };
    }, [fetchAnalytics]);
    const summary = analytics?.summary || {};
    const previousSummary =
        previousAnalytics?.summary || {};
    const totalIncome =
        Number(summary.totalIncome) || 0;
    const totalExpense =
        Number(summary.totalExpense) || 0;
    const balance =
        Number(summary.balance) ||
        totalIncome - totalExpense;
    const previousIncome =
        Number(previousSummary.totalIncome) || 0;
    const previousExpense =
        Number(previousSummary.totalExpense) || 0;
    const previousBalance =
        Number(previousSummary.balance) ||
        previousIncome - previousExpense;
    const incomeChange = calculateChange(
        totalIncome,
        previousIncome
    );
    const expenseChange = calculateChange(
        totalExpense,
        previousExpense
    );
    const profitChange = calculateChange(
        balance,
        previousBalance
    );
    const currentMargin = calculateProfitMargin(
        totalIncome,
        balance
    );
    const previousMargin = calculateProfitMargin(
        previousIncome,
        previousBalance
    );
    const marginChange =
        previousIncome === 0
            ? null
            : currentMargin - previousMargin;
    const monthlyData = useMemo(() => {
        if (!analytics) {
            return [];
        }
        return buildMonthlyData(
            analytics.monthlySummary || [],
            analytics._periodStart,
            analytics._periodEnd
        );
    }, [analytics]);
    const categoryTypeMap = useMemo(() => {
        const map = new Map();
        (analytics?.categorySummary || []).forEach((category) => {
            if (category?.categoryId && category?.type) {
                map.set(String(category.categoryId), category.type);
            }
        });
        return map;
    }, [analytics]);
    const dailyData = useMemo(() => {
        if (!analytics || (selectedPeriod !== "7D" && selectedPeriod !== "30D")) {
            return [];
        }
        return buildDailyData(
            transactions,
            analytics._periodStart,
            analytics._periodEnd,
            categoryTypeMap
        );
    }, [analytics, selectedPeriod, transactions, categoryTypeMap]);
    const chartData =
        selectedPeriod === "7D" || selectedPeriod === "30D"
            ? dailyData
            : monthlyData;
    const chartGranularityLabel =
        selectedPeriod === "7D" || selectedPeriod === "30D"
            ? "Daily trend"
            : "Monthly trend";
    const marginData =
        selectedPeriod === "7D" || selectedPeriod === "30D"
            ? dailyData
            : monthlyData;
    const activityMetrics = useMemo(() => {
        const amounts = transactions
            .map((transaction) => Number(transaction?.amount) || 0)
            .filter((amount) => amount > 0);
        const totalAmount = amounts.reduce(
            (sum, amount) => sum + amount,
            0
        );
        const paymentMap = new Map();
        transactions.forEach((transaction) => {
            const label = getTransactionPaymentMethod(transaction);
            const current = paymentMap.get(label) || {
                name: label,
                count: 0,
                amount: 0,
            };
            current.count += 1;
            current.amount += Number(transaction?.amount) || 0;
            paymentMap.set(label, current);
        });
        const paymentMethods = Array.from(paymentMap.values())
            .sort((a, b) => b.amount - a.amount);
        const largestTransaction = transactions.reduce(
            (largest, transaction) => {
                const amount = Number(transaction?.amount) || 0;
                return amount > (largest?.amount || 0)
                    ? { ...transaction, amount }
                    : largest;
            },
            null
        );
        return {
            count: transactions.length,
            average: transactions.length
                ? totalAmount / transactions.length
                : 0,
            largestAmount: Number(largestTransaction?.amount) || 0,
            largestType: getTransactionCategoryType(largestTransaction, categoryTypeMap),
            paymentMethods,
        };
    }, [transactions, categoryTypeMap]);
    const expenseBreakdown = useMemo(() => {
        const categories =
            analytics?.categorySummary || [];
        return categories
            .filter(
                (category) =>
                    category.type === "expense"
            )
            .map((category) => ({
                ...category,
                total: Number(category.total) || 0,
            }))
            .filter((category) => category.total > 0)
            .sort((a, b) => b.total - a.total);
    }, [analytics]);
    const incomeBreakdown = useMemo(() => {
        const categories =
            analytics?.categorySummary || [];
        return categories
            .filter(
                (category) =>
                    category.type === "income"
            )
            .map((category) => ({
                ...category,
                total: Number(category.total) || 0,
            }))
            .filter((category) => category.total > 0)
            .sort((a, b) => b.total - a.total);
    }, [analytics]);
    const totalExpenseBreakdown =
        expenseBreakdown.reduce(
            (sum, category) => sum + category.total,
            0
        );
    const totalIncomeBreakdown =
        incomeBreakdown.reduce(
            (sum, category) => sum + category.total,
            0
        );
    const comparisonItems = [
        {
            label: "Revenue",
            current: totalIncome,
            previous: previousIncome,
        },
        {
            label: "Expenses",
            current: totalExpense,
            previous: previousExpense,
        },
        {
            label: "Profit",
            current: balance,
            previous: previousBalance,
        },
    ];
    const maxComparisonValue = Math.max(
        1,
        ...comparisonItems.flatMap((item) => [
            Math.abs(item.current),
            Math.abs(item.previous),
        ])
    );
    const getBarWidth = (value) => {
        return Math.min(
            100,
            (Math.abs(value) / maxComparisonValue) * 100
        );
    };
    const marginDomain = useMemo(() => {
        const values = marginData.map(
            (item) => Number(item.margin) || 0
        );
        if (values.length === 0) {
            return [0, 100];
        }
        const minimum = Math.min(0, ...values);
        const maximum = Math.max(100, ...values);
        const range = maximum - minimum;
        const padding = Math.max(range * 0.1, 5);
        return [
            Math.floor(minimum - padding),
            Math.ceil(maximum + padding),
        ];
    }, [marginData]);
    const periodConfig = PERIODS[selectedPeriod];
    const isInitialLoading = loading && !analytics;
    if (isInitialLoading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <LoadingSpinner />
            </div>
        );
    }
    if (!analytics && error) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Card className="w-full max-w-md">
                    <div className="text-center">
                        <h2 className="text-lg font-semibold text-white">
                            Analytics unavailable
                        </h2>
                        <p className="mt-2 text-sm text-slate-400">
                            {error}
                        </p>
                        <button
                            type="button"
                            onClick={fetchAnalytics}
                            className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
                        >
                            Retry
                        </button>
                    </div>
                </Card>
            </div>
        );
    }
    return (
        <div className="space-y-6">
            {/* Page header and period selector */}
            <AnalyticsHeader
                selectedPeriod={selectedPeriod}
                setSelectedPeriod={setSelectedPeriod}
                periods={Object.keys(PERIODS)}
            />
            {/* Error while retaining previous data */}
            {error && (
                <div className="flex items-center justify-between gap-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
                    <p className="text-sm text-red-400">
                        {error}
                    </p>
                    <button
                        type="button"
                        onClick={fetchAnalytics}
                        className="shrink-0 rounded-md border border-red-500/30 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/10"
                    >
                        Retry
                    </button>
                </div>
            )}
            {/* Updating indicator */}
            {loading && (
                <div className="flex items-center justify-end">
                    <span className="text-xs text-slate-500">
                        Updating analytics...
                    </span>
                </div>
            )}
            {/* KPI cards */}
            <AnalyticsKpiCards
                incomeChange={incomeChange}
                expenseChange={expenseChange}
                profitChange={profitChange}
                marginChange={marginChange}
                totalIncome={totalIncome}
                previousIncome={previousIncome}
                totalExpense={totalExpense}
                previousExpense={previousExpense}
                balance={balance}
                previousBalance={previousBalance}
                currentMargin={currentMargin}
                previousMargin={previousMargin}
                getComparisonColor={getComparisonColor}
                getComparisonIcon={getComparisonIcon}
                formatCurrency={formatCurrency}
            />
            {/* Revenue, expense, and profit trend */}
            <FinancialTrendChart
                chartData={chartData}
                chartGranularityLabel={chartGranularityLabel}
                periodConfig={periodConfig}
                formatNumber={formatNumber}
                formatCurrency={formatCurrency}
            />
            {/* Transaction activity and payment methods */}
            <AnalyticsActivity
                selectedPeriod={selectedPeriod}
                activityMetrics={activityMetrics}
                totalIncome={totalIncome}
                totalExpense={totalExpense}
                formatNumber={formatNumber}
                formatCurrency={formatCurrency}
            />
            {/* Period comparison and profit-margin trend */}
            <AnalyticsComparison
                comparisonItems={comparisonItems}
                getBarWidth={getBarWidth}
                marginData={marginData}
                marginDomain={marginDomain}
                formatCurrency={formatCurrency}
                chartGranularityLabel={chartGranularityLabel}
            />
            {/* Expense and income breakdown */}
            <AnalyticsBreakdown
                expenseBreakdown={expenseBreakdown}
                incomeBreakdown={incomeBreakdown}
                totalExpenseBreakdown={totalExpenseBreakdown}
                totalIncomeBreakdown={totalIncomeBreakdown}
                formatCurrency={formatCurrency}
            />
        </div>
    );
};
export default Analytics;
